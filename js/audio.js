/* Grok Detective - tiny WebAudio sfx + mystery music loop */
(function () {
'use strict';
const GD = window.GD;
GD.Snd = (() => {
  let ctx = null, master = null, sfx = null, mus = null, muted = false, musOn = false, nextBar = 0, bar = 0, timer = 0;
  const mf = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { ctx = new AC(); } catch (e) { ctx = null; return; }
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.7; master.connect(ctx.destination);
    sfx = ctx.createGain(); sfx.gain.value = 0.9; sfx.connect(master);
    mus = ctx.createGain(); mus.gain.value = 0.16; mus.connect(master);
  }
  function tone(f, dur, type, vol, delay, bus, f2) {
    if (!ctx) return;
    const t = ctx.currentTime + (delay || 0), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus || sfx); o.start(t); o.stop(t + dur + 0.05);
  }
  const FX = {
    click() { tone(880, 0.05, 'square', 0.05); },
    step() { tone(140, 0.04, 'triangle', 0.03); },
    search() { tone(520, 0.07, 'triangle', 0.08); tone(660, 0.07, 'triangle', 0.08, 0.07); },
    clue() { [72, 76, 79, 84].forEach((m, i) => tone(mf(m), 0.22, 'square', 0.08, i * 0.08)); tone(mf(91), 0.4, 'triangle', 0.08, 0.34); },
    talk() { tone(mf(67 + Math.floor(Math.random() * 5)), 0.06, 'square', 0.045); },
    lens() { tone(400, 0.4, 'sine', 0.1, 0, null, 1200); },
    wrong() { tone(220, 0.25, 'sawtooth', 0.08); tone(160, 0.35, 'sawtooth', 0.08, 0.2); },
    solved() { [60, 64, 67, 72, 67, 72, 76, 79].forEach((m, i) => tone(mf(m + 12), 0.25, 'square', 0.08, i * 0.11)); tone(mf(84), 0.8, 'triangle', 0.1, 0.9); },
    join() { tone(mf(76), 0.1, 'square', 0.07); tone(mf(83), 0.15, 'square', 0.07, 0.1); },
    leave() { tone(mf(70), 0.12, 'square', 0.06); tone(mf(63), 0.2, 'square', 0.06, 0.12); },
    vote() { tone(mf(79), 0.12, 'triangle', 0.1); tone(mf(79), 0.12, 'triangle', 0.1, 0.18); },
    travel() { tone(300, 0.3, 'sine', 0.08, 0, null, 700); },
    door() { tone(180, 0.18, 'sawtooth', 0.04, 0, null, 90); tone(900, 0.12, 'triangle', 0.03, 0.12, null, 1300); },
    whistle() { [0, 0.5].forEach((d) => { tone(mf(83), 0.42, 'sine', 0.09, d); tone(mf(88), 0.42, 'sine', 0.06, d); tone(mf(79), 0.42, 'triangle', 0.05, d); }); },
    dust() { tone(1800 + Math.random() * 1400, 0.05, 'triangle', 0.018); },
    reveal() { [48, 51, 55, 58].forEach((m, i) => tone(mf(m), 0.5, 'sawtooth', 0.05, i * 0.18)); tone(mf(72), 1.0, 'triangle', 0.09, 0.9); tone(mf(79), 1.0, 'triangle', 0.07, 0.9); },
    lock() { tone(160, 0.12, 'square', 0.06); tone(120, 0.18, 'square', 0.06, 0.1); },
    swap() { [72, 79, 84].forEach((m, i) => tone(mf(m), 0.1, 'triangle', 0.07, i * 0.06)); }
  };
  // sneaky detective bass line + sparse melody
  const BASS = [45, 48, 50, 51, 52, 51, 50, 48], MEL = [[69, 0], [72, 2], [71, 3], [69, 5], [64, 6]];
  function schedule() {
    if (!ctx || !musOn) return;
    while (nextBar < ctx.currentTime + 0.6) {
      const bt = 0.25;
      for (let i = 0; i < 8; i++) { const t = nextBar + i * bt - ctx.currentTime; if (t >= 0) tone(mf(BASS[i] - (bar % 4 === 3 ? 2 : 0)), bt * 0.9, 'triangle', 0.5, t, mus); }
      if (bar % 2 === 1) MEL.forEach((n) => { const t = nextBar + n[1] * bt - ctx.currentTime; if (t >= 0) tone(mf(n[0] + (bar % 4 === 3 ? -2 : 0)), bt * 1.4, 'square', 0.12, t, mus); });
      nextBar += 8 * 0.25; bar++;
    }
  }
  // clickety-clack of the rails (Midnight Express)
  let trainOn = false, trainTimer = 0, clackN = 0;
  function clack() { if (!ctx || muted || !trainOn) return; const k = clackN++ % 4; const d = k === 1 ? 0.12 : 0; tone(95 + (k % 2) * 12, 0.07, 'triangle', 0.11, d); tone(1400, 0.02, 'square', 0.012, d); }
  return {
    train(on) { on = !!on; if (on === trainOn) return; trainOn = on; clearInterval(trainTimer); if (on) trainTimer = setInterval(clack, 520); },
    init, fx(n) { if (FX[n] && ctx && !muted) FX[n](); },
    music(on) { musOn = on; if (on && ctx) { if (nextBar < ctx.currentTime) nextBar = ctx.currentTime + 0.1; clearInterval(timer); timer = setInterval(schedule, 200); } else clearInterval(timer); },
    setMuted(m) { muted = m; if (master) master.gain.value = m ? 0 : 0.7; }, isMuted: () => muted
  };
})();
})();
