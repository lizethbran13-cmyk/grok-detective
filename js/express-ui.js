/* Midnight Express DLC - gameplay UI: car doors, DISGUISE mode, fingerprint dusting, clue corkboard (co-op), the big reveal */
(function () {
'use strict';
const GD = window.GD, T = window.THREE, W = GD.W, EX = GD.EX, X = window.__gdx;
if (!EX || !X) return;
const $ = (id) => document.getElementById(id), esc = X.esc, GS = X.GS;
const disById = (id) => EX.DISGUISES.find((d) => d.id === id);
EX.crew = () => { const d = disById(GS.disguise); return !!(d && d.crew); };
EX.disguiseLook = function (color, dis) {
  const base = W.detectiveLook(color), d = disById(dis);
  if (!d) return base;
  const L = Object.assign({}, base, { hat: null, hs2: null }, d.look, { scarf: color });
  return L;
};
/* ---------------- doors + staff gate ---------------- */
EX.gate = function (to) {
  const A = GD.AREAS[to]; if (!A || !A.staff || EX.crew()) return true;
  X.toast('\ud83d\udd12 STAFF ONLY! Put on a crew DISGUISE first.', true); X.Snd.fx('lock'); GS.pendingDoor = { to }; EX.disguisePanel(true); return false;
};
EX.door = function (h) {
  if (!EX.gate(h.to)) { GS.pendingDoor = { to: h.to, side: h.side }; return; }
  goDoor(h.to, h.side);
};
function goDoor(to, side) {
  const A = GD.AREAS[to], dz = A.doorZ || 0;
  const spawn = side === 'w' ? [10.1, dz, -Math.PI / 2] : side === 'e' ? [-10.1, dz, Math.PI / 2] : null;
  X.travel(to, false, spawn);
}
/* ---------------- disguise mode ---------------- */
EX.disguisePanel = function (gated) {
  const S = X.S_(); if (!X.playing() || !X.isEx(S)) return;
  const col = (X.teamColors(S)[GS.pid]) || '#ffd23f';
  let h = X.head('\ud83c\udfa9 DISGUISE');
  h += '<p class="sub">' + (gated ? '<b>STAFF ONLY!</b> Dress up as crew and nobody will stop you.' : 'Dress up as train crew. Crew can go into the <b>Luggage Car</b> and the <b>Engine</b>. Suspects whisper secrets to <b>waiters</b>!') + '</p><div class="disGrid">';
  EX.DISGUISES.concat([{ id: '', name: 'Detective', icon: '\ud83d\udd75\ufe0f', tip: 'Your normal detective coat. Not crew.' }]).forEach((d) => {
    const on = (GS.disguise || '') === d.id;
    h += '<button class="disBtn' + (on ? ' on' : '') + '" data-a="dis" data-v="' + d.id + '"><img src="' + W.portrait(EX.disguiseLook(col, d.id), 'dis_' + d.id + col) + '" alt=""><b>' + d.icon + ' ' + esc(d.name) + '</b><small>' + esc(d.tip) + '</small>' + (on ? '<em>WEARING</em>' : '') + '</button>';
  });
  h += '</div>';
  X.openPanel('disguise', h);
};
function wear(id) {
  GS.disguise = id || ''; X.Snd.fx('swap'); X.closePanel();
  const d = disById(GS.disguise);
  X.toast(d ? d.icon + ' You look just like a ' + d.name.toLowerCase() + '! Fake mustache included.' : '\ud83d\udd75\ufe0f Back in your detective coat.');
  const pd = GS.pendingDoor; GS.pendingDoor = null;
  if (pd && EX.crew()) goDoor(pd.to, pd.side);
}
/* waiters overhear things: a real, useful tip pointing at a car that still hides clues */
const GOSSIP = { gloria: 'Darling waiter, between us...', mozz: 'Psst, waiter! A magician never tells, but...', pierre: 'Ah, a fellow kitchen worker! Listen...', edna: 'Hey, crew buddy, keep this quiet...', feta: 'Shh! Scientific observation, waiter...', lou: 'Lean in close, pal...' };
EX.secretLine = function (p) {
  if (GS.disguise !== 'waiter' || p.kind !== 'suspect') return null;
  const S = X.S_(), c = X.caseOf(S), L = X.areasWithLeads(S, c);
  const areas = Object.keys(L).filter((a) => L[a] >= 1).sort((a, b) => (a === GS.me.area) - (b === GS.me.area) || L[b] - L[a]);
  const tip = areas.length ? 'I saw somebody sneaking around the ' + X.areaName(areas[0]) + ' after the tunnel. There\'s something hidden there, I just know it!' : 'I think the detective already has every clue. I bet they\'ll catch the thief soon!';
  return { t: (GOSSIP[p.id] || 'Psst, waiter...') + ' ' + tip, secret: true };
};
/* ---------------- fingerprint dusting ---------------- */
let dustSt = null;
EX.dust = function (h, done) {
  const S = X.S_(), c = X.caseOf(S);
  let k = null; for (const q in S.place) if (S.place[q] === h.id) k = q;
  const kind = k === 'tA' ? (c.suspects.find((s) => s.id === S.culprit).t.ring ? 'ring' : 'plain') : 'smudge';
  let html = X.head('\ud83e\udde4 DUST FOR FINGERPRINTS') + '<p class="sub">Rub the brush over the <b>' + esc(h.name) + '</b> to sprinkle fingerprint powder.</p>';
  html += '<div class="dustWrap"><canvas id="dustCv" width="320" height="220"></canvas><div id="dustBrush">\ud83d\udd8c\ufe0f</div></div><div class="dustBar"><i id="dustFill"></i></div><div id="dustMsg" class="sub">Rub, rub, rub!</div>';
  html += '<div class="btnrow"><button class="btn alt small" data-a="dustAuto" id="bDustAuto">AUTO-DUST</button><button class="btn primary hidden" data-a="dustDone" id="bDustDone">LOOK CLOSER \u25b6</button></div>';
  X.openPanel('dust', html);
  const cv = $('dustCv'), g = cv.getContext('2d'), Wd = cv.width, Hd = cv.height;
  const bg = h.id === 'lug_safe' ? ['#6b7280', '#4b5563'] : h.id === 'din_bar' ? ['#6b3a1d', '#4a2814'] : h.id === 'obs_telescope' ? ['#d4a017', '#a67c00'] : ['#bfe3f5', '#8cc4e0'];
  const drawBg = (q) => { const gr = q.createLinearGradient(0, 0, Wd, Hd); gr.addColorStop(0, bg[0]); gr.addColorStop(1, bg[1]); q.fillStyle = gr; q.fillRect(0, 0, Wd, Hd); q.fillStyle = 'rgba(255,255,255,.18)'; q.beginPath(); q.moveTo(20, 0); q.lineTo(70, 0); q.lineTo(10, Hd); q.lineTo(-40, Hd); q.fill(); };
  drawBg(g);
  const R = document.createElement('canvas'); R.width = Wd; R.height = Hd; const r = R.getContext('2d'); drawBg(r);
  for (let i = 0; i < 900; i++) { r.fillStyle = 'rgba(40,40,52,' + (0.08 + Math.random() * 0.12) + ')'; r.fillRect(Math.random() * Wd, Math.random() * Hd, 2, 2); }
  const targets = [];
  function print(cx, cy, ang, ring) {
    r.save(); r.translate(cx, cy); r.rotate(ang); r.beginPath(); r.ellipse(0, 0, 30, 42, 0, 0, Math.PI * 2); r.clip();
    r.strokeStyle = 'rgba(25,22,35,.85)'; r.lineWidth = 2.4;
    for (let i = 0; i < 12; i++) { r.beginPath(); r.ellipse(Math.sin(i) * 1.5, 4 - i * 0.6, 4 + i * 3.1, 6 + i * 3.9, 0, 0, Math.PI * 2); r.stroke(); }
    if (ring) { r.fillStyle = bg[0]; r.fillRect(-40, 14, 80, 13); r.strokeStyle = 'rgba(25,22,35,.95)'; r.lineWidth = 3; r.beginPath(); r.moveTo(-40, 14); r.lineTo(40, 14); r.moveTo(-40, 27); r.lineTo(40, 27); r.stroke(); r.fillStyle = 'rgba(255,215,64,.55)'; r.fillRect(-40, 16, 80, 9); }
    r.restore(); targets.push([cx, cy]);
  }
  if (kind === 'smudge') { for (let i = 0; i < 4; i++) { const cx = 60 + i * 66, cy = 80 + (i % 2) * 60; r.fillStyle = 'rgba(30,28,40,.35)'; r.beginPath(); r.ellipse(cx, cy, 26, 18, i, 0, Math.PI * 2); r.fill(); targets.push([cx, cy]); } }
  else { print(70, 120, -0.35, false); print(135, 82, -0.12, false); print(200, 72, 0.05, kind === 'ring'); print(262, 100, 0.25, false); }
  // coverage grid near the prints
  const cells = []; for (let y = 6; y < Hd; y += 12) for (let x = 6; x < Wd; x += 12) if (targets.some((t) => Math.hypot(t[0] - x, (t[1] - y) * 0.75) < 34)) cells.push({ x, y, on: false });
  dustSt = { done, cv, g, R, cells, n: 0, fin: false, kind, last: 0 };
  const brush = $('dustBrush');
  const paint = (e) => {
    const b = cv.getBoundingClientRect(), x = (e.clientX - b.left) * Wd / b.width, y = (e.clientY - b.top) * Hd / b.height;
    brush.style.left = (e.clientX - b.left) + 'px'; brush.style.top = (e.clientY - b.top) + 'px';
    dab(x, y, 22);
  };
  let down = false;
  cv.addEventListener('pointerdown', (e) => { down = true; try { cv.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ } paint(e); e.preventDefault(); });
  cv.addEventListener('pointermove', (e) => { if (down || e.pointerType === 'mouse') paint(e); });
  ['pointerup', 'pointercancel'].forEach((ev) => cv.addEventListener(ev, () => { down = false; }));
};
function dab(x, y, rad) {
  const d = dustSt; if (!d || d.fin) return;
  d.g.save(); d.g.beginPath(); d.g.arc(x, y, rad, 0, Math.PI * 2); d.g.clip(); d.g.drawImage(d.R, 0, 0); d.g.restore();
  d.cells.forEach((c) => { if (!c.on && Math.hypot(c.x - x, c.y - y) < rad) { c.on = true; d.n++; } });
  const now = performance.now(); if (now - d.last > 60) { d.last = now; X.Snd.fx('dust'); }
  const p = d.n / Math.max(1, d.cells.length); $('dustFill').style.width = Math.min(100, Math.round(p / 0.72 * 100)) + '%';
  if (p >= 0.72) finishDust();
}
function finishDust() {
  const d = dustSt; if (!d || d.fin) return; d.fin = true;
  d.g.drawImage(d.R, 0, 0);
  $('dustFill').style.width = '100%';
  $('dustMsg').innerHTML = d.kind === 'smudge' ? 'Just smudgy marks from the cleaning crew. Nothing useful.' : d.kind === 'ring' ? '<b>Prints lifted!</b> Look at the middle-right print...' : '<b>Prints lifted!</b> Four clear fingerprints.';
  $('bDustDone').classList.remove('hidden'); $('bDustAuto').classList.add('hidden'); X.Snd.fx('search');
}
EX.dustAll = function () { const d = dustSt; if (!d) return; d.cells.forEach((c) => dab(c.x, c.y, 26)); finishDust(); };
/* ---------------- clue corkboard (shared in co-op) ---------------- */
let boardKey = '';
function bKey(S) { return JSON.stringify([S.found, S.talked, S.marks, S.hl && S.hl.t, S.players.length]); }
EX.board = function (refresh) {
  const S = X.S_(); if (!X.playing() || !X.isEx(S)) return;
  if (refresh && X.GS.panel !== 'board') return;
  const c = X.caseOf(S), cl = X.cluesOf(S), found = cl.filter((x) => S.found[x.id]).sort((a, b) => S.found[a.id].t - S.found[b.id].t);
  const traitsFound = found.filter((x) => x.kind === 'trait'), nTr = cl.filter((x) => x.kind === 'trait').length;
  const coop = S.players.length > 1, marks = S.marks || {};
  const scroll = refresh && $('pnlCard') ? $('pnlCard').scrollTop : 0;
  let possible = 0;
  let h = X.head('\ud83d\udccc CLUE CORKBOARD');
  h += '<p class="sub">Talk to suspects to learn about them. Red string = matches a clue. Tap a photo to mark it \u2b55 or \u274c' + (coop ? '. Your partners see your marks!' : '.') + '</p>';
  h += '<div class="cork" id="corkWrap"><svg id="corkSvg"></svg><div class="polRow">';
  c.suspects.forEach((s) => {
    const talked = !!S.talked[s.id], cleared = !!S.found['a_' + s.id], mot = !!S.found['m_' + s.id];
    const bad = talked && traitsFound.some((x) => !!s.t[x.trait] !== !!x.val);
    if (!cleared && !bad) possible++;
    const chips = c.traits.map((t) => { if (!talked) return '<span class="chip unk">' + esc(t.label) + ' ?</span>'; const tc = traitsFound.find((x) => x.trait === t.k), v = !!s.t[t.k]; return '<span class="chip' + (tc ? (v === !!tc.val ? ' ok' : ' no') : '') + '">' + esc(v ? t.yes : t.no) + '</span>'; }).join('');
    const mk = marks[s.id];
    h += '<button class="pol' + (cleared || bad ? ' out' : '') + '" id="pol_' + s.id + '" data-a="mark" data-v="' + s.id + '"><i class="pin"></i><img src="' + W.portrait(s.look, c.id + s.id) + '" alt=""><b>' + esc(s.name) + '</b><div class="chips">' + chips + '</div>' +
      (cleared ? '<em class="stamp g">CLEARED</em>' : bad ? '<em class="stamp r">NO MATCH</em>' : mot ? '<em class="stamp m">MOTIVE</em>' : '') +
      (mk ? '<span class="mk ' + mk.v + '">' + (mk.v === 'o' ? '\u2b55' : '\u274c') + '</span>' + (coop ? '<small class="mby">' + esc(mk.by) + '</small>' : '') : '') + '</button>';
  });
  h += '</div><div class="noteRow">';
  const hl = S.hl && Date.now() - S.hl.t < 20000 ? S.hl.id : null;
  found.forEach((x, i) => {
    const tag = x.kind === 'motive' ? 'MOTIVE' : x.kind === 'alibi' ? 'ALIBI' : x.kind === 'trait' ? 'EVIDENCE' : x.witness ? 'WITNESS' : 'SCENE';
    h += '<div class="note k-' + x.kind + (hl === x.id ? ' hl' : '') + '" id="note_' + x.id + '" style="--r:' + (((i * 37) % 7) - 3) + 'deg"><i class="pin"></i><span class="tag">' + tag + '</span><b>' + esc(x.name) + '</b><p>' + esc(x.text) + '</p>' + (coop ? '<button class="shareBtn" data-a="share" data-v="' + x.id + '">\ud83d\udce3 SHARE</button>' : '') + '</div>';
  });
  if (!found.length) h += '<div class="empty">No clues pinned yet. Search the train!</div>';
  h += '</div></div>';
  const allTr = traitsFound.length === nTr;
  h += '<div class="hunch">\ud83d\udd75\ufe0f ' + (allTr && possible === 1 ? '<b>Only ONE suspect still fits every clue!</b> Time to ACCUSE.' : allTr ? 'You have all ' + nTr + ' clues about the thief. Interview everyone to see who matches!' : 'Clues about the thief: <b>' + traitsFound.length + '/' + nTr + '</b>. Suspects still possible: <b>' + possible + '</b>.') + '</div>';
  h += '<div class="btnrow"><button class="btn alt" data-a="close">CLOSE</button><button class="btn" data-a="book">CASEBOOK</button>' + (allTr && possible === 1 ? '<button class="btn red" data-a="boardAccuse">ACCUSE</button>' : '') + '</div>';
  X.openPanel('board', h); boardKey = bKey(S);
  if (scroll) $('pnlCard').scrollTop = scroll;
  requestAnimationFrame(() => strings(S, c, found));
};
function strings(S, c, found) {
  const wrap = $('corkWrap'), svg = $('corkSvg'); if (!wrap || !svg) return;
  const wb = wrap.getBoundingClientRect(); svg.setAttribute('width', wb.width); svg.setAttribute('height', wb.height);
  const ctr = (el, top) => { const b = el.getBoundingClientRect(); return [b.left - wb.left + b.width / 2, top ? b.top - wb.top + 8 : b.bottom - wb.top - 6]; };
  let out = '';
  found.forEach((x) => {
    const n = $('note_' + x.id); if (!n) return; const a = ctr(n, true);
    let to = [], col = '#dc2626', dash = '';
    const tf = found.filter((q) => q.kind === 'trait');
    if (x.kind === 'trait') to = c.suspects.filter((s) => S.talked[s.id] && !S.found['a_' + s.id] && tf.every((q) => !!s.t[q.trait] === !!q.val)).map((s) => s.id);
    else if (x.kind === 'motive') { to = [x.about]; col = '#7c3aed'; dash = '6 4'; }
    else if (x.kind === 'alibi') { to = [x.about]; col = '#16a34a'; dash = '3 4'; }
    to.forEach((sid) => { const p = $('pol_' + sid); if (!p) return; const b = ctr(p, false); const my = (a[1] + b[1]) / 2 + 18; out += '<path d="M' + a[0] + ' ' + a[1] + ' Q' + ((a[0] + b[0]) / 2) + ' ' + my + ' ' + b[0] + ' ' + b[1] + '" stroke="' + col + '" stroke-width="2.6" fill="none" stroke-dasharray="' + dash + '" opacity=".85"/>'; });
  });
  svg.innerHTML = out;
}
setInterval(() => { const S = X.S_(); if (S && X.GS.panel === 'board' && bKey(S) !== boardKey) EX.board(true); }, 400);
/* ---------------- the big reveal ---------------- */
EX.reveal = function (cb) {
  const S = X.S_(), c = X.caseOf(S), sus = c.suspects.find((s) => s.id === S.culprit);
  const a = W.areas[sus.area], hot = a && a.npcs.find((n) => n.pid === sus.id);
  if (!hot) { cb(); return; }
  X.closePanel(); GS.goal = null; GS.joyReset && GS.joyReset();
  W.setArea(sus.area);
  const grp = new T.Group(); W.scene.add(grp);
  const cone = new T.Mesh(new T.ConeGeometry(1.6, 7, 24, 1, true), new T.MeshBasicMaterial({ color: '#fff1a8', transparent: true, opacity: 0.0, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide }));
  cone.position.set(hot.x, 3.5, hot.z); grp.add(cone);
  const cheese = new T.Group(); grp.add(cheese);
  const cm = new T.MeshLambertMaterial({ color: '#ffcf3a', emissive: '#7a5200' });
  const wedge = new T.Mesh(new T.CylinderGeometry(0.55, 0.55, 0.42, 20, 1, false, 0, Math.PI * 0.6), cm); cheese.add(wedge);
  for (let i = 0; i < 4; i++) { const hol = new T.Mesh(W.G.sph, W.M('#c98d00')); hol.scale.set(0.06, 0.06, 0.02); hol.position.set(Math.sin(i * 0.4 + 0.3) * 0.3, -0.1 + (i % 2) * 0.18, Math.cos(i * 0.4 + 0.3) * 0.3); cheese.add(hol); }
  const cg = new T.Sprite(new T.SpriteMaterial({ map: W.glowTex, color: '#ffd23f', transparent: true, opacity: 0.9, depthWrite: false, blending: T.AdditiveBlending })); cg.scale.set(2.4, 2.4, 1); cheese.add(cg);
  cheese.visible = false;
  const conf = []; const cols = ['#f43f5e', '#facc15', '#22d3ee', '#a3e635', '#c084fc', '#fb923c'];
  for (let i = 0; i < 60; i++) { const m = new T.Mesh(W.G.plane, new T.MeshBasicMaterial({ color: cols[i % 6], side: T.DoubleSide })); m.scale.set(0.12, 0.08, 1); m.visible = false; grp.add(m); conf.push({ m, vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 3, vz: (Math.random() - 0.5) * 3, s: Math.random() * 8 }); }
  let ov = $('revealUI'); if (!ov) { ov = document.createElement('div'); ov.id = 'revealUI'; document.body.appendChild(ov); }
  ov.innerHTML = '<div class="rvTop">THE THIEF IS...</div><div class="rvName"></div><button class="btn alt small" id="bRevealSkip" data-a="revealSkip">SKIP</button>'; ov.className = 'on';
  document.body.classList.add('revealing');
  X.Snd.fx('reveal');
  const tags = []; W.cur.hots.forEach((x) => { if (x.g && x.kind === 'npc') x.g.traverse((o) => { if (o.isSprite && o.visible) { o.visible = false; tags.push(o); } }); }); hot.g.traverse((o) => { if (o.isSprite && o.visible) { o.visible = false; tags.push(o); } });
  GS.reveal = { t: 0, cb, hot, sus, grp, cone, cheese, conf, ov, stage: 0, tags };
};
EX.revealTick = function (dt) {
  const r = GS.reveal; if (!r) return; r.t += dt; const t = r.t, h = r.hot, cam = W.camera;
  W.cur.hots.forEach((x) => { [x.marker, x.ring, x.beam].forEach((m) => { if (m && m.visible) { m.visible = false; if (r.tags.indexOf(m) < 0) r.tags.push(m); } }); });
  const ang = -0.5 + t * 0.3, R = Math.max(4.8, 7.5 - t * 1.3);
  cam.position.set(h.x + Math.sin(ang) * R, 2.1 + Math.max(0, 2.4 - t), h.z + Math.cos(ang) * R); cam.lookAt(h.x, 1.25, h.z);
  h.g.rotation.y = Math.atan2(cam.position.x - h.x, cam.position.z - h.z);
  r.cone.material.opacity = Math.min(0.32, t * 0.4);
  if (t > 1.5 && r.stage === 0) { r.stage = 1; r.ov.querySelector('.rvName').textContent = r.sus.name.toUpperCase() + '!'; r.ov.classList.add('named'); X.Snd.fx('whistle'); r.cheese.visible = true; r.conf.forEach((c) => { c.m.visible = true; c.m.position.set(h.x, 2.6, h.z); }); }
  if (r.stage >= 1) {
    const k = Math.min(1, (t - 1.5) / 1.2); r.cheese.position.set(h.x + 0.9, 0.9 + k * 1.5, h.z + 0.4); r.cheese.rotation.y = t * 3; r.cheese.rotation.x = 0.4;
    r.conf.forEach((c) => { c.vy -= 5 * dt; c.m.position.x += c.vx * dt; c.m.position.y = Math.max(0.05, c.m.position.y + c.vy * dt); c.m.position.z += c.vz * dt; c.m.rotation.x += c.s * dt; c.m.rotation.y += c.s * 0.7 * dt; });
  }
  if (t > 4.6) EX.endReveal();
};
EX.endReveal = function () {
  const r = GS.reveal; if (!r) return; GS.reveal = null;
  W.scene.remove(r.grp); r.ov.className = ''; r.tags.forEach((o) => { o.visible = true; }); document.body.classList.remove('revealing');
  W.setArea(GS.me.area); W.updateCamera(GS.me.x, GS.me.z, 0, true);
  r.cb && r.cb();
};
/* ---------------- case select card + locked info ---------------- */
EX.caseCard = function (c, sv, canPick, fmtTime) {
  const own = EX.owned();
  if (!own) return '<button class="caseCard dlcCard locked" style="--c:' + c.color + '" data-a="pick" data-v="' + c.id + '"' + (canPick ? '' : ' disabled') + '><span class="ci">\ud83d\udd12</span><span><b>' + esc(c.title) + ' <span class="dlcTag">DLC</span></b><small>Expansion \u00b7 a mystery on a fancy overnight train</small><small>Unlock it in the Grok Arcade DLC Shop (75 \ud83c\udf9f\ufe0f)</small></span></button>';
  const st = sv ? '\u2605'.repeat(sv.stars) + '\u2606'.repeat(3 - sv.stars) : '';
  return '<button class="caseCard dlcCard" style="--c:' + c.color + '" data-a="pick" data-v="' + c.id + '"' + (canPick ? '' : ' disabled') + '><span class="ci">' + c.icon + '</span><span><b>' + esc(c.title) + ' <span class="dlcTag">NEW DLC</span></b><small>' + esc(c.diff) + ' \u00b7 5 train cars' + (sv ? ' \u00b7 best ' + fmtTime(sv.best) : '') + '</small>' + (st ? '<span class="st">' + st + '</span>' : '<small>Not solved yet</small>') + '</span></button>';
};
EX.lockedInfo = function () {
  let el = $('lockBox'); if (!el) { el = document.createElement('div'); el.id = 'lockBox'; el.className = 'screen top'; document.body.appendChild(el); }
  el.innerHTML = '<div class="card"><div style="font-size:46px">\ud83d\ude82\ud83e\uddc0</div><h2>MIDNIGHT EXPRESS</h2><p class="sub">Who stole the Golden Cheese? A brand-new mystery aboard a fancy overnight train: walk through 5 train cars, interview 6 suspects (and Torty!), dust for fingerprints, wear disguises and pin clues on the corkboard.</p><p class="sub"><b>Unlock it in the Grok Arcade DLC Shop for 75 tickets.</b><br>Co-op: if your host owns it, you can play it with them.</p><div class="btnrow"><a class="btn primary" href="' + esc(window.GrokNet.hubUrl()) + '">GO TO THE ARCADE</a><button class="btn alt" data-a="lockClose">BACK</button></div></div>';
  el.classList.remove('hidden'); X.Snd.fx('lock');
};
EX.click = function (a, v) {
  if (a === 'dis') wear(v);
  else if (a === 'mark') { const S = X.S_(), cur = S.marks && S.marks[v] ? S.marks[v].v : null; X.doAct({ k: 'mark', id: v, v: cur === null ? 'o' : cur === 'o' ? 'x' : '' }); X.Snd.fx('click'); setTimeout(() => EX.board(true), 60); }
  else if (a === 'dustAuto') EX.dustAll();
  else if (a === 'dustDone') { const d = dustSt; dustSt = null; X.closePanel(); if (d && d.done) d.done(); }
  else if (a === 'revealSkip') EX.endReveal();
  else if (a === 'lockClose') { const el = $('lockBox'); if (el) el.classList.add('hidden'); }
  else if (a === 'boardAccuse') { X.closePanel(); document.getElementById('bAccuse').click(); }
};
})();
