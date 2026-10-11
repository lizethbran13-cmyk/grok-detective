/* Grok Detective - game state, co-op netcode (host-authoritative), input, UI */
(function () {
'use strict';
const GD = window.GD, GN = window.GrokNet, W = GD.W, Snd = GD.Snd, T = window.THREE;
const $ = (id) => document.getElementById(id);
const esc = GN.esc;
const IS_TOUCH = matchMedia('(pointer: coarse)').matches || (('ontouchstart' in window) && navigator.maxTouchPoints > 0);
const Q = new URLSearchParams(location.search);

/* ---------------- save ---------------- */
const SAVE_KEY = 'grokDetective_v1';
const save = { name: '', color: GN.COLORS[0], muted: false, solved: {} };
try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (s) Object.assign(save, s); } catch (e) { /* ignore */ }
if (!save.name) { const gp = GN.savedProfile(); if (gp.hasName) { save.name = gp.name; save.color = gp.color; } }
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* ignore */ } }
const PALETTE = GN.COLORS;
const prof = { name: save.name, color: GN.cleanColor(save.color) };
Snd.setMuted(!!save.muted);

/* ---------------- globals ---------------- */
const GS = { role: null, room: null, pid: GN.pid(), S: null, ui: 'title', me: { area: 'town', x: 0, z: 8, yaw: 0, sp: 0 }, pos: {}, av: {}, evSeen: 0, gidSeen: -1, panel: null, talk: null,
  lensT: 0, lensCd: 0, goal: null, dirty: false, lastSend: 0, lastPos: 0, lastPosSent: '', acc: null, bookTab: 'clues', newClue: false, connecting: false, built: false };
const S_ = () => GS.S;
const caseOf = (S) => S && S.caseId ? GD.caseById(S.caseId) : null;
let clueCache = { key: '', list: [] };
function cluesOf(S) { const k = S.gid + ':' + S.caseId + ':' + S.culprit + ':' + S.herring + ':' + (S.alibis || []).join(','); if (clueCache.key !== k) clueCache = { key: k, list: GD.caseClues(caseOf(S), S.culprit, S.herring, S.alibis) }; return clueCache.list; }
const EXo = () => GD.EX || {};
const isEx = (S) => !!(S && S.caseId === 'express');
const clueAt = (S, objId) => { for (const k in S.place) if (S.place[k] === objId) return k; return null; };
const clueById = (S, id) => cluesOf(S).find((c) => c.id === id);
const personById = (c, id) => GD.people(c).find((p) => p.id === id);
const areaName = (a) => GD.AREAS[a] ? GD.AREAS[a].name : a;
function fmtTime(ms) { const s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function myName() { return GN.cleanName(prof.name || 'Detective'); }

function newSession() { return { v: 1, phase: 'lobby', gid: 0, caseId: null, culprit: null, herring: null, place: {}, extraPos: {}, alibis: [], found: {}, searched: {}, talked: {}, marks: {}, hl: null, wrong: 0, vote: null, result: null, startT: 0, solvedT: 0, ev: [], evId: 0, players: [] }; }
function touch() { GS.dirty = true; }
function pushEv(e) { const S = S_(); S.evId++; e.id = S.evId; S.ev.push(e); if (S.ev.length > 24) S.ev.shift(); touch(); }
function playerInfo(pid) { const S = S_(); const p = S && S.players.find((q) => q.pid === pid); return p || { pid, name: pid === GS.pid ? myName() : 'Detective', color: '#ffffff' }; }

/* ======================================================================
   Host / solo authority
   ====================================================================== */
function hostPick(caseId) {
  const S = S_(), c = GD.caseById(caseId); if (!c) return;
  const st = GD.setupCase(c);
  Object.assign(S, { phase: 'play', gid: S.gid + 1, caseId, culprit: st.culprit, herring: st.herring, place: st.place, extraPos: st.extraPos, alibis: st.alibis || [], found: {}, searched: {}, talked: {}, marks: {}, hl: null, wrong: 0, vote: null, result: null, startT: Date.now(), solvedT: 0 });
  pushEv({ type: 'case' });
}
function findClue(clueId, pid) {
  const S = S_(); if (!clueId || S.found[clueId]) return false;
  const p = playerInfo(pid); S.found[clueId] = { by: p.name, pid, t: Date.now() };
  pushEv({ type: 'clue', clue: clueId, by: p.name, pid }); return true;
}
function votersOf(S) { return GS.role === 'solo' ? [GS.pid] : S.players.map((p) => p.pid); }
function checkVote() {
  const S = S_(); if (!S || !S.vote) return;
  const need = votersOf(S); if (need.every((pid) => S.vote.yes[pid])) resolveVote();
  touch();
}
function resolveVote() {
  const S = S_(), v = S.vote, c = caseOf(S); S.vote = null;
  const ev = clueById(S, v.e), ok = v.c === S.culprit && ev && ev.points && S.found[v.e];
  if (ok) {
    S.phase = 'solved'; S.solvedT = Date.now();
    S.result = { ok: true, c: v.c, e: v.e, wrong: S.wrong, time: S.solvedT - S.startT, stars: Math.max(1, 3 - S.wrong) };
    pushEv({ type: 'solved' });
  } else {
    S.wrong++;
    const hint = makeHint(S, c, v);
    S.result = { ok: false, c: v.c, e: v.e, hint, n: S.wrong };
    pushEv({ type: 'wrong', c: v.c, e: v.e, hint, by: v.name });
  }
}
function makeHint(S, c, v) {
  const sus = c.suspects.find((s) => s.id === v.c), cl = cluesOf(S);
  if (!sus) return 'Pick a suspect first.';
  if (v.c !== S.culprit) {
    for (const x of cl) {
      if (x.kind !== 'trait' || !S.found[x.id]) continue;
      const tr = c.traits.find((t) => t.k === x.trait);
      if (!!sus.t[x.trait] !== !!x.val) return 'Look again at "' + x.name + '". It shows the culprit: ' + (x.val ? tr.yes : tr.no) + '. But ' + sus.name + ': ' + (sus.t[x.trait] ? tr.yes : tr.no) + '. Talk to suspects to learn about them!';
    }
    const miss = cl.filter((x) => x.kind === 'trait' && !S.found[x.id]);
    if (miss.length) {
      const x = miss[0]; let where;
      if (x.witness) { const g = GD.clueGiver(c, x.id); where = 'Talk to ' + g.name + ' at the ' + areaName(g.area) + '.'; }
      else where = 'Search the ' + areaName(GD.objArea(c, S.place[x.id])) + ' carefully.';
      return 'There isn\u2019t enough proof against ' + sus.name + '. You\u2019re missing an important clue. ' + where;
    }
    return sus.name + ' doesn\u2019t match all the evidence. Compare each clue with what suspects told you in the casebook.';
  }
  const ev = cl.find((x) => x.id === v.e);
  return 'Good instinct about ' + sus.name + '! But "' + (ev ? ev.name : 'that clue') + '" doesn\u2019t prove it. Pick evidence that describes the culprit, like something about how they look or what they wear.';
}
function hostAct(pid, m) {
  const S = S_(); if (!S || !m) return; const isHostMe = pid === GS.pid, c = caseOf(S);
  switch (m.k) {
    case 'pick': if (isHostMe && (S.phase === 'lobby' || S.phase === 'solved') && GD.caseById(m.id) && (!GD.caseById(m.id).dlc || (EXo().owned && EXo().owned()))) hostPick(m.id); break;
    case 'mark': { if (S.phase !== 'play' || !c || !c.suspects.some((q) => q.id === m.id)) return; const v = ['o', 'x'].indexOf(m.v) >= 0 ? m.v : null; if (!S.marks) S.marks = {}; if (v) S.marks[m.id] = { v, by: playerInfo(pid).name }; else delete S.marks[m.id]; touch(); break; }
    case 'share': { if (S.phase !== 'play' || typeof m.id !== 'string' || !S.found[m.id]) return; const by = playerInfo(pid).name; S.hl = { id: m.id, by, t: Date.now() }; pushEv({ type: 'share', clue: m.id, by, pid }); break; }
    case 'tolobby': if (isHostMe) { S.phase = 'lobby'; S.vote = null; touch(); } break;
    case 'inspect': {
      if (S.phase !== 'play' || typeof m.id !== 'string') return;
      if (!S.searched[m.id]) { S.searched[m.id] = playerInfo(pid).name; touch(); }
      findClue(clueAt(S, m.id), pid); break;
    }
    case 'talk': {
      if (S.phase !== 'play' || !c) return; const p = personById(c, m.id); if (!p) return;
      if (!S.talked[p.id]) { S.talked[p.id] = 1; touch(); }
      if (p.gives) findClue(p.gives, pid); break;
    }
    case 'propose': {
      if (S.phase !== 'play' || S.vote || !c || !c.suspects.some((s) => s.id === m.c) || !S.found[m.e]) return;
      const p = playerInfo(pid); S.vote = { by: pid, name: p.name, c: m.c, e: m.e, yes: {} }; S.vote.yes[pid] = 1;
      pushEv({ type: 'propose', by: p.name, pid }); checkVote(); break;
    }
    case 'vote': {
      if (!S.vote) return;
      if (m.v) { S.vote.yes[pid] = 1; checkVote(); }
      else { const by = playerInfo(pid).name; S.vote = null; pushEv({ type: 'voteno', by, pid }); }
      break;
    }
  }
}
function doAct(m) {
  Snd.init();
  if (!GS.S) return;
  if (GS.role === 'client') { if (GS.room) GS.room.send({ t: 'act', k: m.k, id: m.id, c: m.c, e: m.e, v: m.v }); }
  else hostAct(GS.pid, m);
}

/* ======================================================================
   Sessions & networking
   ====================================================================== */
function playersFromRoom() {
  const S = S_(), r = GS.room; if (!S) return;
  S.players = r ? r.players().map((p) => ({ pid: p.pid, name: p.name, color: p.color, host: p.host })) : [{ pid: GS.pid, name: myName(), color: prof.color, host: true }];
  touch();
}
function startSolo() {
  leaveSession(true);
  GS.role = 'solo'; GS.S = newSession(); playersFromRoom(); GS.ui = 'game'; GS.evSeen = 0; GS.gidSeen = -1;
}
function hostOnline(code) {
  leaveSession(true);
  GS.role = 'host'; GS.connecting = true; GS.ui = 'online'; setOnlineMsg('Opening a room\u2026', true);
  const room = GS.room = GN.createRoom({ role: 'host', code: code || undefined, name: myName(), color: prof.color, autoCode: !code, rejoin: !!code, max: 3, pid: GS.pid });
  room.on('status', (t) => { if (GS.connecting) setOnlineMsg(t, true); });
  room.on('open', () => { if (GS.room !== room) return; GS.connecting = false; GS.S = newSession(); GS.evSeen = 0; GS.gidSeen = -1; playersFromRoom(); GS.ui = 'game'; Snd.fx('join'); });
  room.on('players', () => { if (GS.room === room) playersFromRoom(); });
  room.on('join', (p) => { if (GS.room !== room || !GS.S) return; toast(p.name + ' joined!'); Snd.fx('join'); GS.lastSend = 0; });
  room.on('leave', (p) => { if (GS.room !== room || !GS.S) return; toast(p.name + ' left', true); Snd.fx('leave'); delete GS.pos[p.pid]; playersFromRoom(); checkVote(); });
  room.on('message', (d, from) => {
    if (!d || typeof d !== 'object' || GS.room !== room) return;
    if (d.t === 'act') hostAct(from, d);
    else if (d.t === 'pos') GS.pos[from] = { a: String(d.a), x: +d.x || 0, z: +d.z || 0, r: +d.r || 0, m: d.m ? 1 : 0, d: typeof d.d === 'string' ? d.d.slice(0, 12) : '' };
  });
  room.on('error', (e) => { if (GS.room !== room) return; GS.connecting = false; if (!GS.S) { GS.ui = 'online'; setOnlineMsg(e.title + ': ' + e.message); GS.role = null; GS.room = null; } else toast(e.title, true); });
  room.start();
}
function joinOnline(code) {
  code = GN.normalizeCode(code);
  if (!GN.validCode(code)) { GS.ui = 'online'; setOnlineMsg('Enter the 5-letter room code.'); return; }
  leaveSession(true);
  GS.role = 'client'; GS.connecting = true; GS.ui = 'online'; setOnlineMsg('Joining room ' + code + '\u2026', true);
  const room = GS.room = GN.createRoom({ role: 'join', code, name: myName(), color: prof.color, pid: GS.pid, rejoin: !!GS.fromHub });
  room.on('status', (t) => { if (GS.connecting) setOnlineMsg(t, true); });
  room.on('open', () => { setOnlineMsg('Connected! Waiting for the host\u2026', true); Snd.fx('join'); });
  room.on('message', (d) => {
    if (!d || GS.room !== room) return;
    if (d.t === 'st' && d.s) applyState(d.s);
    else if (d.t === 'pp' && d.p) { for (const k in d.p) if (k !== GS.pid) GS.pos[k] = d.p[k]; for (const k in GS.pos) if (!d.p[k]) delete GS.pos[k]; }
  });
  room.on('join', (p) => { if (GS.S) { toast(p.name + ' joined!'); Snd.fx('join'); } });
  room.on('leave', (p) => { if (GS.S && !p.host) { toast(p.name + ' left', true); Snd.fx('leave'); } });
  room.on('reconnecting', () => toast('Lost the host \u2014 reconnecting\u2026', true));
  room.on('reconnected', () => toast('Reconnected!'));
  room.on('error', (e) => {
    if (GS.room !== room) return;
    GS.connecting = false;
    if (e.code === 'hostleft' && GS.S && GS.S.phase !== 'lobby') { takeOver(); return; }
    leaveSession(true); GS.ui = 'online'; setOnlineMsg(e.title + ': ' + e.message);
  });
  room.start();
}
function applyState(s) {
  const first = !GS.S;
  GS.S = s; GS.connecting = false; GS.ui = 'game';
  if (first) GS.evSeen = s.evId;
  GS.stateDirtyUI = true;
}
function takeOver() {
  const r = GS.room; GS.room = null; GS.role = 'solo'; try { if (r) r.leave(); } catch (e) { /* ignore */ }
  const S = S_(); S.vote = null; GS.pos = {}; playersFromRoom();
  toast('The host left \u2014 you can keep solving solo!', true); Snd.fx('leave');
}
function leaveSession(silent) {
  const r = GS.room; GS.room = null;
  if (r) { try { r.leave(); } catch (e) { /* ignore */ } }
  GS.S = null; GS.role = null; GS.connecting = false; GS.pos = {}; GS.goal = null; GS.gidSeen = -1; GS.disguise = ''; GS.reveal = null; Snd.train && Snd.train(false);
  closePanel(); closeTalk(); $('scrMenu').classList.add('hidden');
  for (const k in GS.av) { W.scene.remove(GS.av[k].ch.g); } GS.av = {};
  if (!silent) GS.ui = 'title';
}
function netTick(now) {
  if (!GS.room || !GS.S) return;
  if (GS.role === 'host') {
    if ((GS.dirty && now - GS.lastSend > 70) || now - GS.lastSend > 1000) { GS.room.broadcast({ t: 'st', s: GS.S }); GS.lastSend = now; GS.dirty = false; }
    if (now - GS.lastPos > 100) { GS.lastPos = now; const p = Object.assign({}, GS.pos); p[GS.pid] = myPos(); GS.room.broadcast({ t: 'pp', p }); }
  } else if (GS.role === 'client') {
    const p = myPos(), key = p.a + p.x + ',' + p.z + p.m + p.d;
    if (now - GS.lastPos > 100 && (key !== GS.lastPosSent || now - GS.lastPos > 900)) { GS.lastPos = now; GS.lastPosSent = key; GS.room.send(Object.assign({ t: 'pos' }, p)); }
  }
}
function myPos() { const m = GS.me; return { a: m.area, x: +m.x.toFixed(2), z: +m.z.toFixed(2), r: +m.yaw.toFixed(2), m: m.sp > 0.1 ? 1 : 0, d: GS.disguise || '' }; }

/* ======================================================================
   World flow
   ====================================================================== */
function enterCase() {
  const S = S_(), c = caseOf(S); if (!c) return;
  GS.gidSeen = S.gid; clueCache.key = '';
  W.buildCase(c, S.extraPos); GS.built = true;
  closePanel(); closeTalk(); GS.acc = null; GS.newClue = false; GS.bookTab = 'clues'; GS.lensT = 0; GS.lensCd = 0; GS.disguise = ''; GS.reveal = null;
  travel(c.scene, true);
  Snd.train && Snd.train(!!c.areas);
  showIntro();
  Snd.music(true);
}
function travel(area, instant, spawn) {
  const A = GD.AREAS[area]; if (!A) return;
  const go = () => {
    GS.me.area = area; const sx = spawn ? spawn[0] : A.spawn[0] + (Math.random() - 0.5) * 1.2, sz = spawn ? spawn[1] : A.spawn[1]; const sp = W.freeSpot(area, sx, sz);
    GS.me.x = sp[0]; GS.me.z = sp[1]; GS.me.yaw = spawn && spawn[2] != null ? spawn[2] : Math.PI; GS.goal = null;
    W.setArea(area); W.updateCamera(GS.me.x, GS.me.z, 0, true); GS.lastPos = 0;
  };
  if (instant) { go(); return; }
  Snd.fx('travel'); $('fade').classList.add('on');
  setTimeout(() => { go(); $('fade').classList.remove('on'); toast('\u2192 ' + A.name); }, 260);
  if (A.train) Snd.fx('door');
}

/* ======================================================================
   Interaction
   ====================================================================== */
function playing() { const S = S_(); return S && (S.phase === 'play' || S.phase === 'solved') && GS.built && GS.gidSeen === S.gid; }
function nearestHot() {
  if (!W.cur) return null; let best = null, bd = 1e9;
  for (const h of W.cur.hots) { const d = Math.hypot(h.x - GS.me.x, h.z - GS.me.z); if (d <= h.reach && d < bd) { bd = d; best = h; } }
  return best;
}
function interact(h) {
  const S = S_(); if (!S || !playing() || !h) return;
  GS.goal = null;
  if (h.kind === 'sign') { openMap(); Snd.fx('click'); return; }
  if (h.kind === 'door') { EXo().door && EXo().door(h); return; }
  if (h.kind === 'cork') { EXo().board && EXo().board(); Snd.fx('click'); return; }
  if (S.phase !== 'play') { toast('Case solved! Open the menu for the next case.'); return; }
  GS.me.yaw = Math.atan2(h.x - GS.me.x, h.z - GS.me.z);
  if (h.kind === 'obj') {
    if (isEx(S) && h.id === 'eng_whistle') Snd.fx('whistle');
    if (isEx(S) && EXo().DUST && EXo().DUST[h.id] && !S.searched[h.id]) { EXo().dust(h, () => { openInspect(h); doAct({ k: 'inspect', id: h.id }); }); return; }
    openInspect(h); doAct({ k: 'inspect', id: h.id });
  }
  else if (h.kind === 'npc') { openTalk(h.person); doAct({ k: 'talk', id: h.person.id }); }
}
function pressAct() { Snd.init(); if (GS.talk) { talkNext(); return; } if (GS.panel) return; const h = nearestHot(); if (h) interact(h); else toast('Walk up to something with a ? to search it.'); }
function lensTargets(S, c) {
  if (!W.cur) return [];
  return W.cur.hots.filter((h) => {
    if (h.kind === 'obj') { const k = clueAt(S, h.id); return k && !S.found[k]; }
    if (h.kind === 'npc') { const p = h.person; return (p.gives && !S.found[p.gives]) || (p.kind === 'suspect' && !S.talked[p.id]); }
    return false;
  });
}
function areasWithLeads(S, c) { // (case areas only)
  const out = {};
  cluesOf(S).forEach((x) => { if (S.found[x.id]) return; const a = x.witness ? GD.clueGiver(c, x.id).area : GD.objArea(c, S.place[x.id]); out[a] = (out[a] || 0) + 1; });
  c.suspects.forEach((s) => { if (!S.talked[s.id]) out[s.area] = (out[s.area] || 0) + 0.001; });
  return out;
}
function pressLens() {
  Snd.init(); const S = S_(); if (!playing() || S.phase !== 'play') return;
  if (GS.lensCd > 0) { toast('Lens recharging\u2026 ' + Math.ceil(GS.lensCd) + 's'); return; }
  GS.lensT = 8; GS.lensCd = 12; Snd.fx('lens');
  const c = caseOf(S), n = lensTargets(S, c).length;
  if (n) toast('\ud83d\udd0d The lens glows! ' + n + ' thing' + (n > 1 ? 's' : '') + ' to check here.');
  else { const L = areasWithLeads(S, c), names = Object.keys(L).filter((a) => a !== GS.me.area).map(areaName); toast(names.length ? 'Nothing hidden here. Try: ' + names.join(', ') : 'You found everything! Time to ACCUSE.'); }
}

/* ======================================================================
   Panels
   ====================================================================== */
function openPanel(name, html) { GS.panel = name; $('pnlCard').innerHTML = html; $('pnl').classList.remove('hidden'); $('pnlCard').scrollTop = 0; GS.joyReset && GS.joyReset(); }
function closePanel() { GS.panel = null; $('pnl').classList.add('hidden'); }
function head(title) { return '<div class="pnlHead"><h2>' + title + '</h2><button class="xbtn" data-a="close" aria-label="Close">\u2715</button></div>'; }
function clueCard(S, x, big) {
  const f = S.found[x.id], tag = x.kind === 'motive' ? 'MOTIVE' : x.kind === 'alibi' ? 'ALIBI' : x.witness ? 'WITNESS' : x.kind === 'trait' ? 'EVIDENCE' : 'SCENE';
  const share = S.players.length > 1 && f ? '<button class="shareBtn" data-a="share" data-v="' + x.id + '">\ud83d\udce3 SHARE</button>' : '';
  return '<div class="clue k-' + x.kind + '">' + share + '<b><span class="tag">' + tag + '</span>' + esc(x.name) + '</b><p>' + esc(x.text) + '</p>' + (f ? '<small>Found by ' + esc(f.by) + '</small>' : '') + '</div>';
}
function openInspect(h) {
  const S = S_(), k = clueAt(S, h.id), x = k && clueById(S, k);
  let html = head('\ud83d\udd0e ' + esc(h.name));
  if (x) {
    const f = S.found[x.id], mine = !f || f.pid === GS.pid;
    html += (f && !mine ? '<div class="sub">' + esc(f.by) + ' already found this clue.</div>' : '<div class="found">\u2605 CLUE FOUND! \u2605</div>') +
      '<div class="cluebig"><b>' + esc(x.name) + '</b><p>' + esc(x.text) + '</p></div><div class="sub">Added to your casebook.</div>';
    if (!f) { Snd.fx('clue'); GS.newClue = true; } else Snd.fx('search');
  } else { html += '<p class="insp">' + esc(h.text || 'Nothing interesting here.') + '</p><div class="sub">No clue here.</div>'; Snd.fx('search'); }
  html += '<div class="btnrow"><button class="btn primary" data-a="close">OK</button>' + (x ? '<button class="btn alt" data-a="book">CASEBOOK</button>' : '') + '</div>';
  openPanel('inspect', html);
}
function showIntro() {
  const S = S_(), c = caseOf(S);
  let h = '<div style="font-size:46px">' + c.icon + '</div><h2>' + esc(c.title) + '</h2><div class="intro"><p>' + esc(c.intro) + '</p></div>';
  h += '<h3>SUSPECTS</h3><div class="sRow">' + c.suspects.map((s) => '<div><img src="' + W.portrait(s.look, c.id + s.id) + '" alt="">' + esc(s.name) + '<br><small style="color:#6a5a8a">' + esc(areaName(s.area)) + '</small></div>').join('') + '</div>';
  h += '<p class="sub">Start by talking to <b>' + esc(c.victim.name) + '</b> at the ' + esc(areaName(c.victim.area)) + '. The culprit is different every game!</p>';
  h += '<button class="btn primary" data-a="close" id="bBegin">START INVESTIGATING</button>';
  openPanel('intro', h);
}
function openBook(tab) {
  const S = S_(); if (!playing()) return; const c = caseOf(S);
  GS.bookTab = tab || GS.bookTab || 'clues'; if (GS.bookTab === 'clues') GS.newClue = false;
  const cl = cluesOf(S), found = cl.filter((x) => S.found[x.id]);
  let h = head('\ud83d\udcd2 CASEBOOK') + (isEx(S) ? '<button class="btn blue small wide" data-a="board">\ud83d\udccc OPEN THE CORKBOARD</button>' : '') + '<div class="tabs">' + [['clues', 'CLUES ' + found.length + '/' + cl.length], ['sus', 'SUSPECTS'], ['leads', 'LEADS']].map((t) => '<button data-a="tab" data-v="' + t[0] + '" class="' + (GS.bookTab === t[0] ? 'on' : '') + '">' + t[1] + '</button>').join('') + '</div>';
  if (GS.bookTab === 'clues') {
    h += found.length ? found.sort((a, b) => S.found[a.id].t - S.found[b.id].t).map((x) => clueCard(S, x)).join('') : '<div class="empty">No clues yet. Search things with a <span class="mk q">?</span> and talk to people!</div>';
  } else if (GS.bookTab === 'sus') {
    h += c.suspects.map((s) => {
      const talked = S.talked[s.id], mot = S.found['m_' + s.id];
      const tr = c.traits.map((t) => talked ? '<span>' + esc(t.label) + ': <b>' + esc(s.t[t.k] ? t.yes : t.no) + '</b></span>' : '<span class="unk">' + esc(t.label) + ': ?</span>').join('');
      const cleared = S.found['a_' + s.id];
      return '<div class="sus"><img src="' + W.portrait(s.look, c.id + s.id) + '" alt=""><div><div class="nm">' + esc(s.name) + ' <span class="rl">' + esc(s.role) + ' \u00b7 ' + esc(areaName(s.area)) + '</span></div><div class="tr">' + tr + '</div>' + (talked ? '' : '<div class="rl">Not interviewed yet</div>') + (mot ? '<div class="rl" style="color:#be123c">Has a motive (see clues)</div>' : '') + (cleared ? '<div class="rl" style="color:#15803d">Alibi checks out: CLEARED</div>' : '') + '</div></div>';
    }).join('');
  } else {
    const L = {}; cl.forEach((x) => { if (S.found[x.id]) return; const a = x.witness ? GD.clueGiver(c, x.id).area : GD.objArea(c, S.place[x.id]); L[a] = (L[a] || 0) + 1; });
    h += GD.caseAreas(c).map((a) => { const n = L[a] || 0; return '<div class="lead' + (n ? '' : ' done') + '">' + GD.AREAS[a].icon + ' <b>' + esc(areaName(a)) + '</b>: ' + (n ? n + ' clue' + (n > 1 ? 's' : '') + ' still hidden' : 'nothing left \u2713') + '</div>'; }).join('');
    const nt = GD.people(c).filter((p) => (p.kind === 'suspect' && !S.talked[p.id]) || (p.gives && !S.found[p.gives]));
    if (nt.length) h += '<h3>STILL TO INTERVIEW</h3>' + nt.map((p) => '<div class="lead">\ud83d\udcac <b>' + esc(p.name) + '</b> (' + esc(p.role) + ') at the ' + esc(areaName(p.area)) + '</div>').join('');
    const trF = cl.filter((x) => x.kind === 'trait' && S.found[x.id]).length, nTr = cl.filter((x) => x.kind === 'trait').length;
    h += '<div class="hunch">\ud83d\udd75\ufe0f <b>Detective\u2019s hunch:</b> ' + (found.length === cl.length ? 'You have every clue! ' + (nTr === 3 ? 'Three' : 'Two') + ' clues describe the culprit. Find the ONE suspect who matches ' + (nTr === 3 ? 'all three' : 'both') + ', then tap ACCUSE.' : trF ? 'Some clues describe what the culprit is like. Compare them with the SUSPECTS tab. Who matches?' : 'Look for clues that describe the culprit, like footprints, threads or what a witness saw. Use the LENS if you are stuck!') + '</div>';
  }
  openPanel('book', h);
}
function openMap() {
  const S = S_(); if (!playing()) return; const c = caseOf(S);
  const others = S.players.filter((p) => p.pid !== GS.pid);
  let h = head(isEx(S) ? '\ud83d\ude82 TRAIN CARS' : '\ud83d\uddfa\ufe0f TRAVEL');
  h += GD.caseAreas(c).map((a) => {
    const A = GD.AREAS[a], here = a === GS.me.area, lock = A.staff && !(EXo().crew && EXo().crew()), who = others.filter((p) => GS.pos[p.pid] && GS.pos[p.pid].a === a).map((p) => p.name);
    const ppl = GD.people(c).filter((p) => p.area === a).map((p) => p.name);
    return '<button class="areaBtn' + (here ? ' here' : '') + '" style="--c:' + A.color + '" data-a="go" data-v="' + a + '"><span class="ai">' + A.icon + '</span><span><b>' + esc(A.name) + (here ? ' (you are here)' : '') + (lock ? ' \ud83d\udd12 STAFF ONLY' : '') + '</b><small>' + (ppl.length ? 'People: ' + esc(ppl.join(', ')) : 'Nobody around') + (who.length ? '<br>\ud83d\udd75\ufe0f ' + esc(who.join(', ')) + ' is here' : '') + '</small></span></button>';
  }).join('');
  openPanel('map', h);
}
function openAccuse() {
  const S = S_(); if (!playing()) return;
  if (S.phase !== 'play') { toast('This case is already solved!'); return; }
  if (S.vote) { toast('An accusation is already waiting for votes.'); return; }
  const c = caseOf(S); GS.acc = GS.acc || { step: 1, c: null, e: null };
  const a = GS.acc, found = cluesOf(S).filter((x) => S.found[x.id]);
  let h = head('\u2696\ufe0f ACCUSE');
  if (a.step === 1) {
    h += '<p class="sub">Who did it? Pick the culprit.</p><div class="pickGrid">' + c.suspects.map((s) => '<button class="pickBtn' + (a.c === s.id ? ' on' : '') + '" data-a="accC" data-v="' + s.id + '"><img src="' + W.portrait(s.look, c.id + s.id) + '" alt="">' + esc(s.name) + '<small>' + esc(s.role) + '</small></button>').join('') + '</div>';
    h += '<div class="btnrow"><button class="btn alt" data-a="close">NOT YET</button><button class="btn red" data-a="accNext"' + (a.c ? '' : ' disabled') + '>NEXT \u25b6</button></div>';
  } else {
    const s = c.suspects.find((q) => q.id === a.c);
    h += '<p class="sub">Which clue proves <b>' + esc(s.name) + '</b> did it?</p>';
    h += found.length ? found.map((x) => '<button class="evBtn' + (a.e === x.id ? ' on' : '') + '" data-a="accE" data-v="' + x.id + '"><b>' + esc(x.name) + '</b><small>' + esc(x.text) + '</small></button>').join('') : '<div class="empty">You haven\u2019t found any clues yet. Keep searching!</div>';
    h += '<div class="btnrow"><button class="btn alt" data-a="accBack">\u25c0 BACK</button><button class="btn red" data-a="accGo" id="bAccGo"' + (a.e ? '' : ' disabled') + '>ACCUSE ' + esc(s.name.toUpperCase()) + '!</button></div>';
    if (S.players.length > 1) h += '<p class="sub" style="margin-top:8px">Your partner' + (S.players.length > 2 ? 's' : '') + ' must agree.</p>';
  }
  openPanel('accuse', h);
}
function showResult() {
  const S = S_(), r = S.result, c = caseOf(S); if (!r) return;
  const s = c.suspects.find((q) => q.id === r.c);
  let h;
  if (r.ok) {
    const ev = clueById(S, r.e);
    h = '<div style="font-size:44px">\ud83c\udf89</div><h2>CASE SOLVED!</h2><div class="stars">' + [0, 1, 2].map((i) => '<span class="' + (i < r.stars ? '' : 'off') + '">\u2605</span>').join('') + '</div>';
    h += '<img class="bigimg" src="' + W.portrait(s.look, c.id + s.id) + '" alt=""><div class="sub"><b>' + esc(s.name) + '</b> the ' + esc(s.role) + ' did it!</div>';
    h += '<div class="quote">\u201c' + esc(s.confess) + '\u201d</div>';
    if (isEx(S)) h += '<div class="found">\ud83e\uddc0 The Golden Cheese is back in the safe! \ud83e\uddc0</div>';
    h += '<div class="sub">Key evidence: <b>' + esc(ev ? ev.name : '') + '</b><br>Time: ' + fmtTime(r.time) + ' \u00b7 Wrong guesses: ' + r.wrong + '</div>';
    h += GS.role === 'client' ? '<div class="msg ok">Waiting for the host to pick the next case\u2026</div><div class="btnrow"><button class="btn alt" data-a="close">KEEP LOOKING</button></div>'
      : '<div class="btnrow"><button class="btn primary" data-a="cases" id="bNextCase">NEXT CASE</button><button class="btn alt" data-a="close">KEEP LOOKING</button></div>';
  } else {
    h = '<div style="font-size:44px">\ud83e\udd14</div><h2>NOT QUITE!</h2><div class="sub">' + esc(s ? s.name : '?') + ' says: \u201cIt wasn\u2019t me!\u201d</div><div class="hunch">\ud83d\udca1 <b>Hint:</b> ' + esc(r.hint) + '</div><div class="btnrow"><button class="btn primary" data-a="close" id="bKeep">KEEP INVESTIGATING</button><button class="btn alt" data-a="book">CASEBOOK</button></div>';
  }
  openPanel('result', h);
}

/* ---------------- dialogue ---------------- */
function openTalk(p) {
  const S = S_(), c = caseOf(S); const lines = [];
  p.lines.forEach((l) => {
    if (l === '{clue}') { const x = clueById(S, p.gives); if (x) lines.push({ t: x.text, clue: x }); }
    else lines.push({ t: l });
  });
  if (isEx(S) && EXo().secretLine) { const sl = EXo().secretLine(p); if (sl) lines.splice(Math.max(1, lines.length - 1), 0, sl); }
  if (p.kind === 'suspect') lines.push({ t: 'Noted in your casebook: ' + c.traits.map((t) => t.label + ': ' + (p.t[t.k] ? t.yes : t.no)).join(', ') + '.', note: true });
  GS.talk = { p, lines, i: 0 }; GS.joyReset && GS.joyReset();
  $('talkImg').src = W.portrait(p.look || {}, c.id + p.id, p.kind === 'dog');
  $('talkName').innerHTML = esc(p.name) + ' <small>' + esc(p.role) + '</small>';
  $('talk').classList.remove('hidden'); renderTalk();
}
function renderTalk() {
  const t = GS.talk; if (!t) return; const L = t.lines[t.i];
  $('talkText').textContent = L.t;
  $('talkClue').classList.toggle('hidden', !L.clue && !L.note);
  if (L.clue) { const S = S_(), f = S.found[L.clue.id], mine = !f || f.pid === GS.pid; $('talkClue').textContent = mine ? '\u2605 CLUE FOUND: ' + L.clue.name : '\u2605 Clue (found by ' + f.by + '): ' + L.clue.name; if (!t.played) { t.played = 1; Snd.fx('clue'); GS.newClue = true; } }
  else if (L.note) $('talkClue').textContent = '\ud83d\udcd2 Casebook updated';
  else if (L.secret) { $('talkClue').classList.remove('hidden'); $('talkClue').textContent = '\ud83e\udd2b Overheard thanks to your waiter disguise'; }
  else Snd.fx('talk');
  $('talkNext').innerHTML = t.i >= t.lines.length - 1 ? 'DONE \u2713' : 'NEXT \u25b6';
}
function talkNext() { const t = GS.talk; if (!t) return; t.i++; if (t.i >= t.lines.length) closeTalk(); else renderTalk(); }
function closeTalk() { GS.talk = null; $('talk').classList.add('hidden'); }

/* ---------------- vote banner ---------------- */
let voteKey = '';
function renderVote() {
  const S = S_(), v = S && playing() ? S.vote : null, el = $('vote');
  if (!v) { if (voteKey) { el.classList.add('hidden'); voteKey = ''; $('toasts').style.top = ''; } return; }
  const c = caseOf(S), s = c.suspects.find((q) => q.id === v.c), x = clueById(S, v.e), voters = votersOf(S), n = voters.filter((p) => v.yes[p]).length;
  const mine = !!v.yes[GS.pid], key = v.by + v.c + v.e + n + mine + voters.length;
  if (key === voteKey) return; voteKey = key; el.classList.remove('hidden');
  el.innerHTML = '<div class="vt">\u2696\ufe0f <b>' + esc(v.name) + '</b> accuses <b>' + esc(s.name) + '</b>!<br>Evidence: <b>' + esc(x ? x.name : '?') + '</b></div><div class="vs">' + n + '/' + voters.length + ' agree</div>' +
    (mine ? '<div class="btnrow"><button class="btn alt small" data-a="voteNo">CANCEL</button></div><div class="vs">Waiting for your partner to agree\u2026</div>'
      : '<div class="btnrow"><button class="btn green small" data-a="voteYes" id="bVoteYes">AGREE</button><button class="btn alt small" data-a="voteNo" id="bVoteNo">NOT YET</button></div>');
  if (!mine) Snd.fx('vote');
  $('toasts').style.top = Math.round(el.getBoundingClientRect().bottom + 8) + 'px';
}

/* ---------------- events ---------------- */
function processEvents() {
  const S = S_(); if (!S) return;
  for (const e of S.ev) {
    if (e.id <= GS.evSeen) continue; GS.evSeen = e.id;
    if (e.type === 'clue') { const x = clueById(S, e.clue); if (e.pid !== GS.pid && x) { toast('\u2605 ' + e.by + ' found a clue: ' + x.name); Snd.fx('clue'); GS.newClue = true; } }
    else if (e.type === 'voteno') { if (e.pid !== GS.pid) toast(e.by + ' isn\u2019t sure yet. Keep investigating!', true); }
    else if (e.type === 'wrong') { if (playing()) { closeTalk(); showResult(); Snd.fx('wrong'); } }
    else if (e.type === 'solved') { if (playing()) { closeTalk(); recordSolve(); if (isEx(S) && EXo().reveal) EXo().reveal(() => { showResult(); Snd.fx('solved'); }); else { showResult(); Snd.fx('solved'); } } }
    else if (e.type === 'share') { const x = clueById(S, e.clue); if (x && e.pid !== GS.pid) { toast('\ud83d\udce3 ' + e.by + ' shared a clue: ' + x.name); Snd.fx('vote'); } if (GS.panel === 'board' && EXo().board) EXo().board(true); }
  }
}
function recordSolve() {
  const S = S_(), r = S.result; if (!r || !r.ok) return;
  const o = save.solved[S.caseId] || { stars: 0, best: 0 };
  o.stars = Math.max(o.stars, r.stars); o.best = o.best ? Math.min(o.best, r.time) : r.time; o.n = (o.n || 0) + 1;
  save.solved[S.caseId] = o; persist();
}

/* ======================================================================
   Input
   ====================================================================== */
const keys = Object.create(null);
const joy = { id: null, ox: 0, oy: 0, x: 0, y: 0 };
addEventListener('keydown', (e) => {
  if (e.target && e.target.tagName === 'INPUT') return;
  keys[e.code] = true;
  if (e.code === 'KeyM') { toggleMute(); return; }
  if (!playing()) return;
  if (e.code === 'Escape') { if (GS.talk) closeTalk(); else if (GS.panel) closePanel(); else $('scrMenu').classList.toggle('hidden'); return; }
  if (e.repeat) return;
  if (e.code === 'Space' || e.code === 'KeyE' || e.code === 'Enter') { e.preventDefault(); if (GS.panel && GS.panel !== 'result' && GS.panel !== 'inspect' && GS.panel !== 'intro') return; if (GS.panel) { closePanel(); return; } pressAct(); return; }
  if (GS.talk || $('scrMenu').classList.contains('hidden') === false) return;
  if (e.code === 'KeyQ') pressLens();
  else if (e.code === 'KeyC' || e.code === 'Tab') { e.preventDefault(); if (GS.panel === 'book') closePanel(); else openBook(); }
  else if (e.code === 'KeyV') { if (GS.panel === 'map') closePanel(); else openMap(); }
  else if (e.code === 'KeyX') { if (GS.panel === 'accuse') closePanel(); else { GS.acc = null; openAccuse(); } }
  else if (e.code === 'KeyB' && isEx(S_())) { if (GS.panel === 'board') closePanel(); else EXo().board(); }
  else if (e.code === 'KeyG' && isEx(S_())) { if (GS.panel === 'disguise') closePanel(); else EXo().disguisePanel(); }
});
addEventListener('keyup', (e) => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
(function joystick() {
  if (!IS_TOUCH) document.body.classList.add('kbd');
  const zone = $('joyzone'), base = $('joybase'), knob = $('joyknob'), R = 52;
  const home = () => { base.style.left = ''; base.style.top = ''; knob.style.transform = ''; };
  zone.addEventListener('pointerdown', (e) => {
    Snd.init(); if (joy.id !== null) return; joy.id = e.pointerId; try { zone.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
    const r = zone.getBoundingClientRect(); joy.ox = e.clientX; joy.oy = e.clientY; base.style.left = (e.clientX - r.left) + 'px'; base.style.top = (e.clientY - r.top) + 'px'; joy.x = joy.y = 0; $('joyhint').classList.add('hidden'); e.preventDefault();
  });
  zone.addEventListener('pointermove', (e) => {
    if (e.pointerId !== joy.id) return; let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy; const d = Math.hypot(dx, dy); if (d > R) { dx *= R / d; dy *= R / d; }
    joy.x = dx / R; joy.y = dy / R; if (Math.hypot(joy.x, joy.y) < 0.12) { joy.x = joy.y = 0; } knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  });
  const up = (e) => { if (e.pointerId !== joy.id) return; joy.id = null; joy.x = joy.y = 0; home(); };
  zone.addEventListener('pointerup', up); zone.addEventListener('pointercancel', up); zone.addEventListener('lostpointercapture', up);
  GS.joyReset = () => { joy.id = null; joy.x = joy.y = 0; home(); };
})();
// tap / click on the 3D view: walk there, or walk to an object and inspect it
(function taps() {
  const cv = $('c'); let down = null;
  cv.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; Snd.init(); });
  cv.addEventListener('pointerup', (e) => {
    if (!down) return; const d = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t; down = null;
    if (d < 16 && dt < 600) tapAt(e.clientX, e.clientY);
  });
})();
function tapAt(x, y) {
  if (!playing() || GS.panel || GS.talk) return;
  const r = W.pick(x, y); if (!r) return;
  if (!r.hot && W.cur) { // fat-finger assist: snap to a nearby object/person on screen
    let best = null, bd = 46;
    for (const h of W.cur.hots) { if (!h.g.visible) continue; for (const yy of [0.4, h.h * 0.55]) { const p = W.project(h.x, yy, h.z), d = Math.hypot(p.x - x, p.y - y); if (p.vis && d < bd) { bd = d; best = h; } } }
    if (best) r.hot = best;
  }
  if (r.hot) {
    const h = r.hot, d = Math.hypot(h.x - GS.me.x, h.z - GS.me.z);
    if (d <= h.reach) interact(h); else { GS.goal = { x: h.x, z: h.z, hot: h, t: 0, best: d, stuck: 0 }; W.tapMark(h.x, h.z); }
  } else if (r.point) { GS.goal = { x: r.point.x, z: r.point.z, t: 0, best: 1e9, stuck: 0 }; W.tapMark(r.point.x, r.point.z); }
}
function holdBtn(el, fn) { el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); fn(); }); }
holdBtn($('bAct'), pressAct); holdBtn($('bLens'), pressLens);
$('bBook').onclick = () => { Snd.init(); Snd.fx('click'); openBook(); };
$('bMap').onclick = () => { Snd.init(); Snd.fx('click'); openMap(); };
$('bAccuse').onclick = () => { Snd.init(); Snd.fx('click'); GS.acc = null; openAccuse(); };
$('bMenu').onclick = () => { Snd.init(); $('scrMenu').classList.remove('hidden'); };
$('bBoard').onclick = () => { Snd.init(); Snd.fx('click'); EXo().board && EXo().board(); };
$('bDisguise').onclick = () => { Snd.init(); Snd.fx('click'); EXo().disguisePanel && EXo().disguisePanel(); };
$('bMute').onclick = () => { Snd.init(); toggleMute(); };
$('talkNext').addEventListener('click', () => { Snd.init(); talkNext(); });
$('talk').addEventListener('pointerdown', (e) => { if (e.target.id === 'talkBox' || e.target.closest('#talkBox')) { e.preventDefault(); talkNext(); } });
function toggleMute() { const m = !Snd.isMuted(); Snd.setMuted(m); save.muted = m; persist(); $('bMute').style.opacity = m ? 0.45 : 1; }
$('bMute').style.opacity = Snd.isMuted() ? 0.45 : 1;

// delegated panel buttons
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-a]'); if (!b || b.disabled) return; Snd.init(); Snd.fx('click');
  const a = b.dataset.a, v = b.dataset.v;
  switch (a) {
    case 'close': closePanel(); break;
    case 'book': openBook('clues'); break;
    case 'tab': openBook(v); break;
    case 'go': closePanel(); if (v !== GS.me.area && (!EXo().gate || EXo().gate(v))) travel(v); break;
    case 'accC': GS.acc.c = v; openAccuse(); break;
    case 'accNext': if (GS.acc.c) { GS.acc.step = 2; GS.acc.e = null; openAccuse(); } break;
    case 'accBack': GS.acc.step = 1; openAccuse(); break;
    case 'accE': GS.acc.e = v; openAccuse(); break;
    case 'accGo': if (GS.acc && GS.acc.c && GS.acc.e) { doAct({ k: 'propose', c: GS.acc.c, e: GS.acc.e }); GS.acc = null; closePanel(); } break;
    case 'voteYes': doAct({ k: 'vote', v: 1 }); break;
    case 'voteNo': doAct({ k: 'vote', v: 0 }); break;
    case 'cases': closePanel(); doAct({ k: 'tolobby' }); break;
    case 'pick': { const pc = GD.caseById(v); if (pc && pc.dlc && !(EXo().owned && EXo().owned())) { EXo().lockedInfo && EXo().lockedInfo(pc); break; } doAct({ k: 'pick', id: v }); break; }
    case 'share': doAct({ k: 'share', id: v }); toast('\ud83d\udce3 Shared with your partners!'); break;
    case 'board': EXo().board && EXo().board(); break;
    default: if (EXo().click) EXo().click(a, v, b);
  }
});

/* ---------------- toasts ---------------- */
function toast(t, bad) {
  const el = document.createElement('div'); el.className = 'toast' + (bad ? ' bad' : ''); el.textContent = t;
  const box = $('toasts'); box.appendChild(el); while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => el.remove(), 3200);
}

/* ---------------- title / online / cases ---------------- */
function setOnlineMsg(t, ok) { const el = $('onlineMsg'); el.textContent = t || ''; el.classList.toggle('ok', !!ok); }
(function titleUI() {
  const ni = $('nameIn'); ni.value = prof.name;
  ni.addEventListener('input', () => { prof.name = ni.value.trim() ? GN.cleanName(ni.value) : ''; save.name = prof.name; persist(); });
  const row = $('colorRow');
  const draw = () => { row.innerHTML = PALETTE.map((c) => '<button type="button" data-c="' + c + '" style="background:' + c + '" class="' + (c === prof.color ? 'on' : '') + '" aria-label="color"></button>').join(''); };
  draw(); row.addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (!b) return; prof.color = b.dataset.c; save.color = prof.color; persist(); draw(); Snd.init(); Snd.fx('click'); });
  const need = () => { if (!prof.name) { prof.name = 'Detective'; ni.value = 'Detective'; save.name = prof.name; persist(); } GN.saveProfile(prof.name, prof.color); };
  $('bSolo').onclick = () => { Snd.init(); need(); startSolo(); };
  $('bOnline').onclick = () => { Snd.init(); need(); GS.ui = 'online'; setOnlineMsg(''); };
  $('bHow').onclick = () => $('scrHow').classList.remove('hidden');
  $('bHowBack').onclick = () => $('scrHow').classList.add('hidden');
  $('bOnlineBack').onclick = () => { leaveSession(); GS.ui = 'title'; };
  $('bHost').onclick = () => { Snd.init(); need(); hostOnline(); };
  const ci = $('codeIn'); ci.addEventListener('input', () => { ci.value = GN.normalizeCode(ci.value); });
  ci.addEventListener('keydown', (e) => { if (e.key === 'Enter') $('bJoin').click(); });
  $('bJoin').onclick = () => { Snd.init(); need(); joinOnline(ci.value); };
  $('bCasesBack').onclick = () => { leaveSession(); };
  $('bResume').onclick = () => $('scrMenu').classList.add('hidden');
  $('bMenuHow').onclick = () => { $('scrMenu').classList.add('hidden'); $('scrHow').classList.remove('hidden'); };
  $('bCaseSel').onclick = () => { $('scrMenu').classList.add('hidden'); closePanel(); closeTalk(); doAct({ k: 'tolobby' }); };
  $('bQuit').onclick = () => { leaveSession(); Snd.music(false); };
  $('arcadeLink').href = GN.hubUrl();
})();
function casesHTML(S) {
  const canPick = GS.role !== 'client';
  return GD.CASES.map((c) => {
    if (c.dlc && EXo().caseCard) return EXo().caseCard(c, save.solved[c.id], canPick, fmtTime);
    const sv = save.solved[c.id], st = sv ? '\u2605'.repeat(sv.stars) + '\u2606'.repeat(3 - sv.stars) : '';
    return '<button class="caseCard" style="--c:' + c.color + '" data-a="pick" data-v="' + c.id + '"' + (canPick ? '' : ' disabled') + '><span class="ci">' + c.icon + '</span><span><b>' + esc(c.title) + '</b><small>' + esc(c.diff) + ' \u00b7 Starts at the ' + esc(areaName(c.scene)) + (sv ? ' \u00b7 best ' + fmtTime(sv.best) : '') + '</small>' + (st ? '<span class="st">' + st + '</span>' : '<small>Not solved yet</small>') + '</span></button>';
  }).join('');
}
let lastCasesKey = '';
function renderScreens() {
  const S = S_(), ph = S ? S.phase : null;
  let scr = null;
  if (GS.ui === 'title') scr = 'scrTitle';
  else if (GS.ui === 'online') scr = 'scrOnline';
  else if (S && ph === 'lobby') scr = 'scrCases';
  ['scrTitle', 'scrOnline', 'scrCases'].forEach((id) => $(id).classList.toggle('hidden', id !== scr));
  const inGame = playing();
  $('hud').classList.toggle('hidden', !inGame);
  if (!inGame) { closeTalk(); if (GS.panel && GS.panel !== 'result') closePanel(); $('vote').classList.add('hidden'); voteKey = ''; $('toasts').style.top = ''; }
  if (scr === 'scrTitle') { const n = Object.keys(save.solved).length, own = EXo().owned && EXo().owned(); $('titleFoot').textContent = (own ? GD.CASES.length + ' mysteries' : GD.CASES.filter((c) => !c.dlc).length + ' mysteries (+1 DLC)') + ' \u00b7 ' + (own ? '5 places + the Midnight Express train' : '5 places to explore') + ' \u00b7 solo or online co-op' + (n ? ' \u00b7 solved ' + n + '/' + GD.CASES.length : ''); }
  if (scr === 'scrCases') {
    const online = GS.role !== 'solo', code = online && GS.room ? GS.room.code : '';
    const key = GS.role + code + JSON.stringify(S.players) + JSON.stringify(save.solved);
    if (key !== lastCasesKey) {
      lastCasesKey = key;
      $('roomCode').innerHTML = code ? 'ROOM CODE<b>' + esc(code) + '</b>Friends tap PLAY ONLINE CO-OP \u2192 JOIN' : ''; $('roomCode').classList.toggle('hidden', !code);
      const TC = teamColors(S); $('lobbyPlayers').innerHTML = online ? S.players.map((p) => '<div class="pchip" style="--c:' + esc(TC[p.pid] || p.color) + '"><i></i>' + esc(p.name) + (p.host ? ' \u2605' : '') + (p.pid === GS.pid ? ' (you)' : '') + '</div>').join('') + (S.players.length < 3 ? '<div class="pchip empty">' + (S.players.length < 2 ? 'Waiting for a friend\u2026' : 'Open seat') + '</div>' : '') : '';
      $('casesTitle').textContent = online ? 'CO-OP CASE FILES' : 'CHOOSE A CASE';
      $('caseList').innerHTML = casesHTML(S);
      $('casesWait').textContent = GS.role === 'client' ? 'The host picks the case\u2026' : online && S.players.length < 2 ? 'Share the code! You can also start now; friends can join any time.' : '';
      $('bCasesBack').textContent = online ? 'LEAVE ROOM' : 'BACK';
    }
  } else lastCasesKey = '';
}

/* ======================================================================
   Frame loop
   ====================================================================== */
function updateMe(dt) {
  const m = GS.me;
  let ix = 0, iz = 0;
  if (!GS.panel && !GS.talk && $('scrMenu').classList.contains('hidden')) {
    if (keys.KeyA || keys.ArrowLeft) ix -= 1; if (keys.KeyD || keys.ArrowRight) ix += 1; if (keys.KeyW || keys.ArrowUp) iz -= 1; if (keys.KeyS || keys.ArrowDown) iz += 1;
    if (joy.id !== null) { ix += joy.x; iz += joy.y; }
  } else GS.goal = null;
  let mag = Math.hypot(ix, iz);
  if (mag > 0.05) GS.goal = null;
  else if (GS.goal) {
    const g = GS.goal, dx = g.x - m.x, dz = g.z - m.z, d = Math.hypot(dx, dz);
    const stop = g.hot ? Math.max(0.6, g.hot.reach - 0.25) : 0.15;
    if (d <= stop) { const h = g.hot; GS.goal = null; if (h) interact(h); }
    else {
      ix = dx / d; iz = dz / d; mag = 1;
      g.t += dt; if (d < g.best - 0.05) { g.best = d; g.stuck = 0; } else g.stuck += dt;
      if (g.stuck > 0.5) { const h = g.hot; GS.goal = null; if (h && d <= h.reach + 0.6) interact(h); }
    }
  }
  if (mag > 1) { ix /= mag; iz /= mag; mag = 1; }
  const sp = 4.6 * mag;
  if (mag > 0.05) {
    const r = W.moveCircle(m.area, m.x, m.z, ix * sp * dt, iz * sp * dt, 0.36);
    const moved = Math.hypot(r[0] - m.x, r[1] - m.z);
    m.x = r[0]; m.z = r[1]; m.sp = moved / Math.max(dt, 1e-3);
    const ty = Math.atan2(ix, iz); let d = ty - m.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); m.yaw += d * Math.min(1, dt * 12);
  } else m.sp = 0;
}
function ensureAvatar(pid, color, name, isMe, dis) {
  let a = GS.av[pid]; dis = dis || '';
  if (a && (a.color !== color || a.dis !== dis)) { W.scene.remove(a.ch.g); a = null; }
  if (!a) {
    const ch = W.makeChar(EXo().disguiseLook ? EXo().disguiseLook(color, dis) : W.detectiveLook(color));
    W.scene.add(ch.g);
    a = GS.av[pid] = { ch, color, dis, x: 0, z: 0, yaw: 0, init: false, tag: null, name: null };
  }
  if (a.name !== name) {
    if (a.tag) a.ch.g.remove(a.tag);
    a.tag = W.textSprite(isMe ? name + ' (you)' : name, { size: 36, h: isMe ? 0.32 : 0.4, bg: 'rgba(20,16,48,.85)', border: color });
    a.tag.position.set(0, a.ch.h + 0.5, 0); a.ch.g.add(a.tag); a.name = name;
  }
  return a;
}
// co-op: two friends with the same color get distinct ones (by join order)
function teamColors(S) {
  const out = {}, used = {};
  S.players.forEach((p) => { let c = GN.cleanColor(p.pid === GS.pid ? prof.color : p.color); if (used[c]) c = PALETTE.find((q) => !used[q]) || c; used[c] = 1; out[p.pid] = c; });
  return out;
}
function updateAvatars(dt) {
  const S = S_(), TC = teamColors(S), mates = S.players.filter((p) => p.pid !== GS.pid), coop = S.players.length > 1;
  // me
  const me = ensureAvatar(GS.pid, TC[GS.pid] || prof.color, myName(), true, GS.disguise);
  me.tag.visible = coop;
  me.ch.g.position.set(GS.me.x, 0, GS.me.z); me.ch.g.rotation.y = GS.me.yaw; me.ch.g.visible = true; me.ch.anim(dt, GS.me.sp);
  const live = {}; live[GS.pid] = 1;
  mates.forEach((p) => {
    live[p.pid] = 1; const pos = GS.pos[p.pid], a = ensureAvatar(p.pid, TC[p.pid] || GN.cleanColor(p.color), p.name, false, pos && pos.d);
    if (!pos || pos.a !== GS.me.area) { a.ch.g.visible = false; a.init = false; return; }
    if (!a.init) { a.x = pos.x; a.z = pos.z; a.yaw = pos.r; a.init = true; }
    const k = 1 - Math.exp(-dt * 12), ox = a.x, oz = a.z;
    a.x += (pos.x - a.x) * k; a.z += (pos.z - a.z) * k;
    let d = pos.r - a.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); a.yaw += d * k;
    a.ch.g.visible = true; a.ch.g.position.set(a.x, 0, a.z); a.ch.g.rotation.y = a.yaw;
    a.ch.anim(dt, pos.m ? 4 : Math.hypot(a.x - ox, a.z - oz) / Math.max(dt, 1e-3));
  });
  for (const k in GS.av) if (!live[k]) { W.scene.remove(GS.av[k].ch.g); delete GS.av[k]; }
}
function updateHots(dt) {
  const S = S_(), c = caseOf(S), t = W.time;
  const lensOn = GS.lensT > 0, targets = lensOn ? lensTargets(S, c) : [];
  W.cur.hots.forEach((h) => {
    if (h.kind === 'obj') { const k = clueAt(S, h.id); W.setMarker(h, k && S.found[k] ? 'clue' : S.searched[h.id] ? 'ok' : 'q'); }
    else if (h.kind === 'npc') {
      W.setMarker(h, S.talked[h.person.id] && !(h.person.gives && !S.found[h.person.gives]) ? 'talked' : 'talk');
      const dx = GS.me.x - h.x, dz = GS.me.z - h.z, near = Math.hypot(dx, dz) < 4;
      const ty = near ? Math.atan2(dx, dz) : 0; let d = ty - h.g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); h.g.rotation.y += d * Math.min(1, dt * 5);
      h.ch.anim(dt, 0);
    }
    if (h.marker) { const bob = h.mk === 'q' || h.mk === 'talk' ? Math.sin(t * 3 + h.x) * 0.08 : 0; h.marker.position.y = h.h + 0.35 + bob; const s = h.mk === 'ok' || h.mk === 'talked' ? 0.42 : 0.62; h.marker.scale.set(s, s, 1); }
    const on = targets.indexOf(h) >= 0, pulse = 0.55 + Math.sin(t * 6) * 0.3;
    h.ring.material.opacity += ((on ? pulse : 0) - h.ring.material.opacity) * Math.min(1, dt * 8);
    h.beam.material.opacity += ((on ? 0.28 + Math.sin(t * 6) * 0.1 : 0) - h.beam.material.opacity) * Math.min(1, dt * 8);
  });
}
let promptKey = '';
function updateHUD() {
  const S = S_(), c = caseOf(S), cl = cluesOf(S), nf = cl.filter((x) => S.found[x.id]).length;
  $('cpIcon').textContent = c.icon; $('cpTitle').textContent = c.title; $('cpArea').textContent = GD.AREAS[GS.me.area].name; $('cpClues').textContent = '\ud83d\udd0e ' + nf + '/' + cl.length + ' clues';
  $('bookDot').classList.toggle('hidden', !GS.newClue);
  const h = !GS.panel && !GS.talk ? nearestHot() : null, act = $('bAct'), pr = $('prompt');
  const label = h ? (h.kind === 'npc' ? 'TALK' : h.kind === 'sign' ? 'MAP' : h.kind === 'door' ? 'GO' : h.kind === 'cork' ? 'BOARD' : (isEx(S) && EXo().DUST && EXo().DUST[h.id] && !S.searched[h.id]) ? 'DUST' : 'SEARCH') : 'LOOK';
  if ($('actT').textContent !== label) $('actT').textContent = label;
  act.className = h ? (h.kind === 'npc' ? 'talk' : '') : 'dim';
  if (h) {
    const p = W.project(h.x, h.h + 0.75, h.z);
    const k = h.id + label; if (k !== promptKey) { promptKey = k; pr.innerHTML = '<b>' + label + '</b> ' + esc(h.name); }
    pr.style.left = Math.round(p.x) + 'px'; pr.style.top = Math.round(p.y) + 'px'; pr.classList.remove('hidden');
  } else { pr.classList.add('hidden'); promptKey = ''; }
  $('bLens').classList.toggle('cd', GS.lensCd > 0 && GS.lensT <= 0); $('bLens').classList.toggle('on', GS.lensT > 0); $('lensCd').textContent = Math.ceil(GS.lensCd);
  const mates = S.players.filter((p) => p.pid !== GS.pid);
  const mk = mates.map((p) => p.pid + (GS.pos[p.pid] ? GS.pos[p.pid].a : '')).join('|');
  if (mk !== updateHUD.mk) { updateHUD.mk = mk; const TC = teamColors(S); $('mates').innerHTML = mates.map((p) => '<div class="mate" style="--c:' + esc(TC[p.pid] || p.color) + '">\ud83d\udd75\ufe0f ' + esc(p.name) + ' \u00b7 ' + esc(GS.pos[p.pid] ? areaName(GS.pos[p.pid].a) : '\u2026') + '</div>').join(''); }
  const ex = isEx(S); if (updateHUD.ex !== ex) { updateHUD.ex = ex; $('bBoard').classList.toggle('hidden', !ex); $('bDisguise').classList.toggle('hidden', !ex); }
}
let last = performance.now(), titleT = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const S = S_();
  if (S && (GS.role !== 'client' || true)) {
    if (S.phase !== 'lobby' && S.caseId && S.gid !== GS.gidSeen) enterCase();
    processEvents();
  }
  renderScreens();
  W.tick(dt);
  if (playing()) {
    GS.lensT = Math.max(0, GS.lensT - dt); GS.lensCd = Math.max(0, GS.lensCd - dt);
    updateMe(dt); updateAvatars(dt); updateHots(dt); updateHUD(); renderVote();
    if (GS.reveal && EXo().revealTick) EXo().revealTick(dt); else W.updateCamera(GS.me.x, GS.me.z, dt);
    if (S.phase === 'solved' && !GS.panel && !GS.talk && GS.lastResult !== S.gid + ':' + S.evId && 0) showResult();
  } else {
    // title backdrop: slow pan over the town square
    titleT += dt;
    if (!W.cur || W.cur.id !== 'town') { W.ensureAreas(); W.setArea('town'); }
    W.updateCamera(Math.sin(titleT * 0.15) * 6, 2 + Math.cos(titleT * 0.11) * 3, dt);
    if (Snd && S === null) Snd.music(false);
    if (Snd.train && !playing()) Snd.train(false);
  }
  netTick(now);
  W.render();
}

/* ---------------- boot ---------------- */
W.init($('c'));
W.ensureAreas(); W.setArea('town');
addEventListener('resize', () => W.resize());
requestAnimationFrame(frame);
(function fromHub() {
  const prm = GN.params(); if (!prm) return;
  GS.fromHub = true; prof.name = prm.name; prof.color = prm.color; $('nameIn').value = prm.name;
  if (prm.mode === 'host') hostOnline(prm.code); else { $('codeIn').value = prm.code; joinOnline(prm.code); }
})();

/* ---------------- context for the Midnight Express DLC (js/express-ui.js) ---------------- */
window.__gdx = { GS, S_, doAct, openPanel, closePanel, head, toast, travel, caseOf, cluesOf, clueById, esc, Snd, playing, areaName, personById, areasWithLeads, showResult, openBook, openInspect, myName, teamColors, isEx };

/* ---------------- debug / test hooks ---------------- */
window.__gd = {
  GS, W, GD, prof, save,
  state: () => GS.S, playing, nearest: () => { const h = nearestHot(); return h && h.id; },
  tp(x, z) { GS.me.x = x; GS.me.z = z; GS.goal = null; },
  go(area) { closePanel(); travel(area, true); },
  hots: () => W.cur ? W.cur.hots.map((h) => ({ id: h.id, kind: h.kind, x: h.x, z: h.z, reach: h.reach, name: h.name })) : [],
  // walk next to a hot spot (teleport to a free spot within reach) and interact like a player would
  reach(id) {
    const h = W.cur.hots.find((q) => q.id === id); if (!h) return false;
    for (let a = 0; a < 16; a++) { const ang = Math.PI / 2 + a * Math.PI / 8; for (const rr of [h.reach * 0.75, h.reach * 0.5, h.reach * 0.92]) { const x = h.x + Math.cos(ang) * rr, z = h.z + Math.sin(ang) * rr; if (W.isFree(GS.me.area, x, z) && Math.hypot(h.x - x, h.z - z) <= h.reach) { GS.me.x = x; GS.me.z = z; return true; } } }
    return false;
  },
  interact(id) { const h = W.cur.hots.find((q) => q.id === id); if (!h) return 'nohot'; if (Math.hypot(h.x - GS.me.x, h.z - GS.me.z) > h.reach) return 'far'; interact(h); return GS.panel || (GS.talk ? 'talk' : 'none'); },
  tapHot(id) { const h = W.cur.hots.find((q) => q.id === id); if (!h) return null; const p = W.project(h.x, 0.5, h.z); return p; },
  act: pressAct, lens: pressLens, book: openBook, map: openMap, accuse: openAccuse, closePanel, talkNext,
  panel: () => GS.panel, talking: () => !!GS.talk,
  netDebug: () => ({ role: GS.role, code: GS.room && GS.room.code, count: GS.room ? GS.room.count() : 1, players: GS.S ? GS.S.players.map((p) => p.name) : [], pos: GS.pos, area: GS.me.area })
};
})();
