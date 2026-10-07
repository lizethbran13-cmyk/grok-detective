/* Grok Detective - 3D world: areas, props, characters, camera, picking */
(function () {
'use strict';
const GD = window.GD, T = window.THREE;
const W = GD.W = {};
const TAU = Math.PI * 2;
const matCache = {};
function M(col) { const k = String(col); if (!matCache[k]) matCache[k] = new T.MeshLambertMaterial({ color: col }); return matCache[k]; }
function MB(col, op) { return new T.MeshBasicMaterial({ color: col, transparent: op != null, opacity: op == null ? 1 : op }); }
const G = { box: new T.BoxGeometry(1, 1, 1), cyl: new T.CylinderGeometry(1, 1, 1, 14), cyl8: new T.CylinderGeometry(1, 1, 1, 8), sph: new T.SphereGeometry(1, 14, 10), cone: new T.ConeGeometry(1, 1, 12), plane: new T.PlaneGeometry(1, 1), torus: new T.TorusGeometry(1, 0.12, 6, 24) };
function add(geo, mat, x, y, z, sx, sy, sz, p) { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); (p || W.scene).add(m); return m; }
function B(w, h, d, col, x, y, z, p) { return add(G.box, typeof col === 'object' ? col : M(col), x, y + h / 2, z, w, h, d, p); }
function C(r, h, col, x, y, z, p, seg8) { return add(seg8 ? G.cyl8 : G.cyl, typeof col === 'object' ? col : M(col), x, y + h / 2, z, r, h, r, p); }
function S(r, col, x, y, z, p) { return add(G.sph, typeof col === 'object' ? col : M(col), x, y, z, r, r, r, p); }
function CN(r, h, col, x, y, z, p) { return add(G.cone, M(col), x, y + h / 2, z, r, h, r, p); }
W.M = M; W.B = B; W.C = C; W.S = S;

/* ---------------- canvas helpers ---------------- */
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.anisotropy = 4; return t; }
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
W.rr = rr;
function textSprite(text, opts) {
  opts = opts || {};
  const fs = opts.size || 44, pad = 14, c = document.createElement('canvas'), g = c.getContext('2d');
  g.font = '800 ' + fs + 'px "Trebuchet MS",system-ui,sans-serif';
  const tw = Math.ceil(g.measureText(text).width) + pad * 2; c.width = tw; c.height = fs + pad * 1.6;
  g.font = '800 ' + fs + 'px "Trebuchet MS",system-ui,sans-serif';
  rr(g, 3, 3, c.width - 6, c.height - 6, c.height / 2 - 3); g.fillStyle = opts.bg || 'rgba(20,16,48,.82)'; g.fill();
  g.lineWidth = 5; g.strokeStyle = opts.border || '#fff'; g.stroke();
  g.fillStyle = opts.color || '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, c.width / 2, c.height / 2 + 2);
  const tex = new T.CanvasTexture(c); tex.minFilter = T.LinearFilter;
  const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  const hh = opts.h || 0.42; sp.scale.set(hh * c.width / c.height, hh, 1); sp.renderOrder = 20; return sp;
}
W.textSprite = textSprite;
const markTex = {};
function markerTex(kind) {
  if (markTex[kind]) return markTex[kind];
  const t = canvasTex(128, 128, (g) => {
    const col = { q: '#ffd23f', ok: '#9ca3af', clue: '#ffb000', talk: '#ffffff', talked: '#9ca3af', sign: '#38bdf8' }[kind];
    g.beginPath(); g.arc(64, 60, 50, 0, TAU); g.fillStyle = col; g.fill(); g.lineWidth = 9; g.strokeStyle = kind === 'talk' ? '#1b1440' : '#fff'; g.stroke();
    if (kind === 'talk' || kind === 'talked') { g.beginPath(); g.moveTo(50, 104); g.lineTo(40, 124); g.lineTo(72, 106); g.fillStyle = col; g.fill(); }
    g.fillStyle = kind === 'q' || kind === 'clue' ? '#3a2400' : kind === 'talk' ? '#1b1440' : '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '900 70px "Trebuchet MS",sans-serif';
    g.fillText({ q: '?', ok: '\u2713', clue: '\u2605', talk: '\u2026', talked: '\u2713', sign: '\u2794' }[kind], 64, kind === 'talk' ? 50 : 64);
  });
  t.minFilter = T.LinearFilter; markTex[kind] = t; return t;
}

/* ---------------- renderer ---------------- */
W.init = function (canvas) {
  const r = W.renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  r.outputEncoding = T.sRGBEncoding;
  const sc = W.scene = new T.Scene(); sc.background = new T.Color('#9fdcff');
  W.camera = new T.PerspectiveCamera(48, 1, 0.5, 200);
  const hemi = new T.HemisphereLight(0xffffff, 0x8c7a6a, 0.75); sc.add(hemi);
  const sun = new T.DirectionalLight(0xffffff, 0.75); sun.position.set(6, 14, 8); sc.add(sun);
  W.areas = {}; W.cur = null; W.remotes = {}; W.ray = new T.Raycaster(); W.time = 0;
  glowTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
  W.resize();
};
let glowTex;
W.resize = function () {
  const w = innerWidth, h = innerHeight; W.renderer.setSize(w, h, false); W.camera.aspect = w / h; W.camera.updateProjectionMatrix();
};

/* ---------------- characters ---------------- */
// look: skin hair hs shirt pants hat hs2 glasses scarf gloves boots tall beard dress
W.makeChar = function (look, opts) {
  opts = opts || {};
  const g = new T.Group(), s = look.tall ? 1.16 : 1, body = new T.Group(); g.add(body); body.scale.set(1, s, 1);
  const shoe = look.boots ? '#1f2937' : '#f8fafc';
  const legL = new T.Group(), legR = new T.Group(); legL.position.set(-0.13, 0.62, 0); legR.position.set(0.13, 0.62, 0); body.add(legL, legR);
  [legL, legR].forEach((l) => { B(0.18, 0.5, 0.2, look.pants, 0, -0.55, 0, l); B(0.22, look.boots ? 0.26 : 0.12, 0.3, shoe, 0, -0.62, 0.04, l); });
  if (look.dress) { const sk = add(G.cone, M(look.shirt), 0, 0.68, 0, 0.36, 0.5, 0.36, body); sk.rotation.y = 0.3; }
  B(0.5, 0.5, 0.3, look.shirt, 0, 0.62, 0, body);
  const armL = new T.Group(), armR = new T.Group(); armL.position.set(-0.32, 1.08, 0); armR.position.set(0.32, 1.08, 0); body.add(armL, armR);
  [armL, armR].forEach((a) => { B(0.13, 0.42, 0.15, look.shirt, 0, -0.42, 0, a); B(0.14, 0.12, 0.16, look.gloves || look.skin, 0, -0.5, 0, a); });
  const head = new T.Group(); head.position.set(0, 1.42, 0); g.add(head); head.position.y = 1.12 * s + 0.3;
  S(0.3, look.skin, 0, 0, 0, head).scale.set(0.3, 0.32, 0.3);
  // eyes
  B(0.06, 0.08, 0.02, '#111', -0.1, 0.02, 0.29, head); B(0.06, 0.08, 0.02, '#111', 0.1, 0.02, 0.29, head);
  B(0.12, 0.03, 0.02, '#a8483a', 0, -0.12, 0.29, head);
  if (look.glasses) { const gm = M('#111'); add(G.torus, gm, -0.11, 0.06, 0.3, 0.075, 0.075, 0.5, head); add(G.torus, gm, 0.11, 0.06, 0.3, 0.075, 0.075, 0.5, head); B(0.06, 0.02, 0.02, gm, 0, 0.0, 0.3, head).position.y = 0.06; }
  if (look.beard) { B(0.42, 0.16, 0.12, look.hair === '#cfcfcf' ? '#ddd' : look.hair, 0, -0.2, 0.22, head); }
  const hs = look.hs || 'short';
  if (hs !== 'bald') {
    S(0.31, look.hair, 0, 0.08, -0.03, head).scale.set(0.315, 0.29, 0.31);
    if (hs === 'long') B(0.6, 0.55, 0.2, look.hair, 0, -0.22, -0.16, head);
    if (hs === 'bun') S(0.14, look.hair, 0, 0.3, -0.18, head);
    if (hs === 'spiky') for (let i = 0; i < 5; i++) { const cn = CN(0.08, 0.22, look.hair, -0.2 + i * 0.1, 0.22, -0.02, head); cn.rotation.z = (i - 2) * -0.25; }
  } else S(0.1, '#9ca3af', 0, -0.02, -0.28, head).scale.set(0.3, 0.12, 0.05);
  if (look.hat) {
    const h2 = look.hs2 || 'cap', hc = look.hat;
    if (h2 === 'cap') { C(0.32, 0.16, hc, 0, 0.18, 0, head); B(0.36, 0.04, 0.22, hc, 0, 0.18, 0.3, head); }
    else if (h2 === 'top') { C(0.42, 0.04, hc, 0, 0.2, 0, head); C(0.26, 0.42, hc, 0, 0.22, 0, head); C(0.27, 0.08, '#dc2626', 0, 0.24, 0, head); }
    else if (h2 === 'floppy') { C(0.52, 0.05, hc, 0, 0.16, 0, head); C(0.28, 0.2, hc, 0, 0.18, 0, head); }
    else if (h2 === 'beanie') { S(0.33, hc, 0, 0.12, 0, head).scale.set(0.33, 0.25, 0.33); S(0.08, '#fff', 0, 0.38, 0, head); }
    else if (h2 === 'chef') { C(0.3, 0.3, hc, 0, 0.18, 0, head); S(0.32, hc, 0, 0.52, 0, head).scale.set(0.34, 0.2, 0.34); }
    else if (h2 === 'beret') { const b = S(0.34, hc, 0.04, 0.24, 0, head); b.scale.set(0.36, 0.1, 0.34); b.rotation.z = -0.2; }
    else if (h2 === 'captain') { C(0.33, 0.14, hc, 0, 0.18, 0, head); B(0.36, 0.04, 0.2, '#111', 0, 0.18, 0.3, head); C(0.06, 0.02, '#facc15', 0, 0.26, 0.3, head).rotation.x = Math.PI / 2; }
    else if (h2 === 'deer') { S(0.34, hc, 0, 0.14, 0, head).scale.set(0.34, 0.22, 0.36); B(0.3, 0.04, 0.2, hc, 0, 0.12, 0.34, head); B(0.3, 0.04, 0.2, hc, 0, 0.12, -0.34, head); }
  }
  if (look.scarf) { const sm = add(G.torus, M(look.scarf), 0, 1.12 * s + 0.05, 0, 0.24, 0.24, 1.8, g); sm.rotation.x = Math.PI / 2; B(0.12, 0.34, 0.06, look.scarf, 0.12, 1.12 * s - 0.25, 0.2, g); }
  if (look.coat) { B(0.56, 0.62, 0.36, look.coat, 0, 0.42, 0, body); B(0.14, 0.44, 0.17, look.coat, 0, -0.38, 0, armL); B(0.14, 0.44, 0.17, look.coat, 0, -0.38, 0, armR); }
  const ch = { g, body, head, legL, legR, armL, armR, ph: Math.random() * 6, h: 1.12 * s + 0.65 };
  ch.anim = function (dt, sp) {
    ch.ph += dt * (sp > 0.1 ? 11 : 2);
    const a = sp > 0.1 ? Math.sin(ch.ph) * 0.7 : 0;
    legL.rotation.x = a; legR.rotation.x = -a; armL.rotation.x = -a * 0.8; armR.rotation.x = a * 0.8;
    body.position.y = sp > 0.1 ? Math.abs(Math.sin(ch.ph)) * 0.06 : Math.sin(ch.ph) * 0.015;
  };
  return ch;
};
W.makeDog = function () {
  const g = new T.Group(), grey = '#8b9099', light = '#e5e7eb';
  B(0.8, 0.4, 0.36, grey, 0, 0.35, 0, g).rotation.y = Math.PI / 2;
  const head = new T.Group(); head.position.set(0, 0.85, 0.42); g.add(head);
  B(0.34, 0.32, 0.34, grey, 0, -0.16, 0, head); B(0.26, 0.2, 0.3, light, 0, -0.26, 0.24, head); B(0.1, 0.08, 0.06, '#111', 0, -0.12, 0.4, head);
  B(0.06, 0.06, 0.02, '#111', -0.09, 0.0, 0.18, head); B(0.06, 0.06, 0.02, '#111', 0.09, 0.0, 0.18, head);
  B(0.3, 0.06, 0.08, light, 0, 0.04, 0.16, head);
  B(0.1, 0.16, 0.06, '#4b5563', -0.15, 0.14, -0.04, head); B(0.1, 0.16, 0.06, '#4b5563', 0.15, 0.14, -0.04, head);
  const legs = []; [[-0.12, 0.25], [0.12, 0.25], [-0.12, -0.25], [0.12, -0.25]].forEach((p) => { const l = new T.Group(); l.position.set(p[0], 0.35, p[1]); g.add(l); B(0.1, 0.35, 0.1, light, 0, -0.35, 0, l); legs.push(l); });
  const tail = B(0.06, 0.24, 0.06, grey, 0, 0.5, -0.42, g); tail.rotation.x = -0.6;
  C(0.2, 0.06, '#ec4899', 0, 0.62, 0.36, g);
  const ch = { g, head, ph: 0, h: 1.1, legs, tail };
  ch.anim = function (dt, sp) { ch.ph += dt * (sp > 0.1 ? 14 : 6); tail.rotation.z = Math.sin(ch.ph * 1.6) * 0.6; const a = sp > 0.1 ? Math.sin(ch.ph) * 0.6 : 0; legs.forEach((l, i) => { l.rotation.x = (i % 2 ? a : -a); }); };
  return ch;
};
W.detectiveLook = function (color) { return { skin: '#f2c6a0', hair: '#3b2414', hs: 'short', shirt: '#f8fafc', pants: '#334155', coat: color, hat: '#8b5a2b', hs2: 'deer', boots: false }; };

/* ---------------- 2D portraits (UI) ---------------- */
const portraitCache = {};
W.portrait = function (look, key, dog) {
  if (portraitCache[key]) return portraitCache[key];
  const c = document.createElement('canvas'); c.width = c.height = 160; const g = c.getContext('2d');
  g.fillStyle = '#ffeec2'; g.beginPath(); g.arc(80, 80, 78, 0, TAU); g.fill();
  g.save(); g.beginPath(); g.arc(80, 80, 78, 0, TAU); g.clip();
  if (dog) {
    g.fillStyle = '#8b9099'; rr(g, 38, 40, 84, 90, 26); g.fill(); g.fillStyle = '#4b5563'; rr(g, 30, 38, 22, 44, 10); g.fill(); rr(g, 108, 38, 22, 44, 10); g.fill();
    g.fillStyle = '#e5e7eb'; rr(g, 50, 92, 60, 44, 18); g.fill(); rr(g, 48, 62, 64, 10, 5); g.fill();
    g.fillStyle = '#111'; g.fillRect(58, 76, 10, 10); g.fillRect(92, 76, 10, 10); rr(g, 70, 96, 20, 14, 6); g.fill();
    g.fillStyle = '#ec4899'; g.fillRect(40, 140, 80, 14);
  } else {
    g.fillStyle = look.coat || look.shirt; rr(g, 26, 122, 108, 60, 26); g.fill();
    if (look.scarf) { g.fillStyle = look.scarf; rr(g, 46, 112, 68, 20, 10); g.fill(); g.fillRect(84, 120, 16, 34); }
    const hs = look.hs || 'short';
    g.fillStyle = look.hair;
    if (hs === 'long') { rr(g, 32, 50, 96, 86, 30); g.fill(); }
    g.fillStyle = look.skin; g.beginPath(); g.ellipse(80, 78, 40, 44, 0, 0, TAU); g.fill();
    g.fillStyle = look.hair;
    if (hs !== 'bald') { g.beginPath(); g.ellipse(80, 54, 42, 24, 0, Math.PI, TAU); g.fill(); g.fillRect(38, 50, 84, 8); }
    if (hs === 'bun') { g.beginPath(); g.arc(80, 26, 16, 0, TAU); g.fill(); }
    if (hs === 'spiky') for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(44 + i * 18, 44); g.lineTo(53 + i * 18, 20); g.lineTo(62 + i * 18, 44); g.fill(); }
    if (look.beard) { g.fillStyle = look.hair === '#cfcfcf' ? '#ddd' : look.hair; g.beginPath(); g.ellipse(80, 108, 30, 16, 0, 0, Math.PI); g.fill(); }
    g.fillStyle = '#111'; g.fillRect(62, 74, 8, 11); g.fillRect(90, 74, 8, 11);
    g.strokeStyle = '#a8483a'; g.lineWidth = 4; g.beginPath(); g.arc(80, 94, 10, 0.2, Math.PI - 0.2); g.stroke();
    if (look.glasses) { g.strokeStyle = '#111'; g.lineWidth = 4; g.beginPath(); g.arc(66, 80, 12, 0, TAU); g.moveTo(106, 80); g.arc(94, 80, 12, 0, TAU); g.moveTo(78, 80); g.lineTo(82, 80); g.stroke(); }
    if (look.hat) {
      const h2 = look.hs2 || 'cap'; g.fillStyle = look.hat;
      if (h2 === 'cap') { rr(g, 40, 22, 80, 30, 14); g.fill(); rr(g, 70, 44, 62, 10, 5); g.fill(); }
      else if (h2 === 'top') { g.fillRect(52, 2, 56, 44); g.fillRect(34, 40, 92, 10); g.fillStyle = '#dc2626'; g.fillRect(52, 32, 56, 8); }
      else if (h2 === 'floppy') { g.beginPath(); g.ellipse(80, 44, 66, 14, 0, 0, TAU); g.fill(); rr(g, 50, 16, 60, 32, 14); g.fill(); }
      else if (h2 === 'beanie') { g.beginPath(); g.ellipse(80, 46, 44, 32, 0, Math.PI, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(80, 12, 9, 0, TAU); g.fill(); }
      else if (h2 === 'chef') { g.fillRect(48, 22, 64, 28); g.beginPath(); g.arc(60, 18, 18, 0, TAU); g.arc(80, 12, 20, 0, TAU); g.arc(100, 18, 18, 0, TAU); g.fill(); }
      else if (h2 === 'beret') { g.beginPath(); g.ellipse(86, 36, 48, 16, -0.2, 0, TAU); g.fill(); }
      else if (h2 === 'captain') { rr(g, 40, 18, 80, 32, 10); g.fill(); g.fillStyle = '#111'; rr(g, 44, 44, 72, 9, 4); g.fill(); g.fillStyle = '#facc15'; g.beginPath(); g.arc(80, 32, 7, 0, TAU); g.fill(); }
      else if (h2 === 'deer') { g.beginPath(); g.ellipse(80, 42, 50, 24, 0, Math.PI, TAU); g.fill(); g.fillRect(30, 40, 100, 9); }
    }
    if (look.gloves) { g.fillStyle = look.gloves; g.beginPath(); g.arc(30, 150, 13, 0, TAU); g.arc(130, 150, 13, 0, TAU); g.fill(); }
  }
  g.restore(); g.lineWidth = 5; g.strokeStyle = '#1b1440'; g.beginPath(); g.arc(80, 80, 76, 0, TAU); g.stroke();
  return (portraitCache[key] = c.toDataURL());
};

/* ---------------- props ---------------- */
// each builder draws at local origin and returns a collider {w,d} | {r} | null
const WOOD = '#a0673a', DWOOD = '#6b4226';
const P = {
  board(g) { B(0.15, 1.6, 0.15, DWOOD, -0.9, 0, 0, g); B(0.15, 1.6, 0.15, DWOOD, 0.9, 0, 0, g); B(2.1, 1.1, 0.12, '#8b5a2b', 0, 0.8, 0, g); B(1.9, 0.9, 0.14, '#e8c590', 0, 0.9, 0, g); ['#fde047', '#93c5fd', '#fca5a5'].forEach((c, i) => B(0.45, 0.55, 0.16, c, -0.6 + i * 0.6, 1.05, 0, g)); return { w: 2.2, d: 0.5 }; },
  mailbox(g) { B(0.2, 0.8, 0.2, '#334155', 0, 0, 0, g); B(0.7, 0.9, 0.6, '#2563eb', 0, 0.8, 0, g); C(0.35, 0.6, '#2563eb', 0, 1.4, 0, g).rotation.z = Math.PI / 2; B(0.4, 0.06, 0.02, '#111', 0, 1.4, 0.31, g); return { w: 0.8, d: 0.7 }; },
  stall(g) { B(2.8, 1, 1.2, '#f5d0a9', 0, 0, 0, g); B(0.12, 2.3, 0.12, '#fff', -1.35, 0, 0.5, g); B(0.12, 2.3, 0.12, '#fff', 1.35, 0, 0.5, g); for (let i = 0; i < 6; i++) B(0.5, 0.12, 1.5, i % 2 ? '#fff' : '#ef4444', -1.25 + i * 0.5, 2.3, 0.2, g); for (let i = 0; i < 4; i++) S(0.16, '#d97706', -0.9 + i * 0.6, 1.1, 0.1, g); return { w: 2.9, d: 1.4 }; },
  phone(g) { B(1, 2.4, 1, '#dc2626', 0, 0, 0, g); B(0.8, 1.6, 0.05, '#bfdbfe', 0, 0.5, 0.5, g); B(1.1, 0.2, 1.1, '#b91c1c', 0, 2.4, 0, g); return { w: 1.1, d: 1.1 }; },
  bench(g) { B(2, 0.12, 0.6, WOOD, 0, 0.45, 0, g); B(2, 0.5, 0.1, WOOD, 0, 0.6, -0.28, g); B(0.1, 0.45, 0.5, '#334155', -0.85, 0, 0, g); B(0.1, 0.45, 0.5, '#334155', 0.85, 0, 0, g); return { w: 2, d: 0.7 }; },
  cart(g) { B(1.8, 0.6, 1, '#16a34a', 0, 0.45, 0, g); C(0.35, 0.1, '#111', -0.7, 0.35, 0.52, g).rotation.x = Math.PI / 2; C(0.35, 0.1, '#111', 0.7, 0.35, 0.52, g).rotation.x = Math.PI / 2; ['#f43f5e', '#facc15', '#a855f7', '#fb923c', '#f472b6', '#fde047'].forEach((c, i) => S(0.17, c, -0.65 + (i % 3) * 0.65, 1.2 + (i > 2 ? 0.12 : 0), i > 2 ? 0.2 : -0.2, g)); return { w: 1.9, d: 1.1 }; },
  trash(g) { C(0.38, 0.9, '#64748b', 0, 0, 0, g); C(0.42, 0.08, '#475569', 0, 0.9, 0, g); return { r: 0.45 }; },
  fountain(g) { C(2.2, 0.6, '#cbd5e1', 0, 0, 0, g); C(1.9, 0.08, '#38bdf8', 0, 0.56, 0, g).material = MB('#4cc3ff'); C(0.35, 1.4, '#cbd5e1', 0, 0.5, 0, g); C(0.8, 0.15, '#cbd5e1', 0, 1.8, 0, g); S(0.3, MB('#bfe9ff'), 0, 2.15, 0, g); return { r: 2.25 }; },
  lamp(g) { C(0.1, 3.2, '#1f2937', 0, 0, 0, g); S(0.3, MB('#fff7c2'), 0, 3.35, 0, g); C(0.3, 0.12, '#1f2937', 0, 3.6, 0, g); return { r: 0.25 }; },
  bush(g) { S(0.8, '#15803d', -0.6, 0.6, 0, g); S(0.9, '#16a34a', 0.3, 0.7, 0, g); S(0.7, '#22c55e', 1, 0.55, 0.1, g); return { w: 2.8, d: 1.4 }; },
  clock(g) { B(0.8, 2.4, 0.5, DWOOD, 0, 0, 0, g); C(0.28, 0.04, '#fef3c7', 0, 1.9, 0.26, g).rotation.x = Math.PI / 2; B(0.2, 0.6, 0.04, '#d4a017', 0, 0.8, 0.26, g); return { w: 0.9, d: 0.6 }; },
  fireplace(g) { B(2.4, 1.8, 0.7, '#9ca3af', 0, 0, 0, g); B(1.4, 1.0, 0.1, '#1f2937', 0, 0.1, 0.32, g); S(0.3, MB('#fb923c'), 0, 0.3, 0.3, g); S(0.2, MB('#fde047'), 0.15, 0.35, 0.35, g); B(2.6, 0.14, 0.8, '#6b7280', 0, 1.8, 0, g); return { w: 2.5, d: 0.8 }; },
  painting(g) { B(1.8, 1.3, 0.08, '#d4a017', 0, 1.3, 0, g); B(1.55, 1.05, 0.1, '#7dd3fc', 0, 1.42, 0, g); S(0.25, '#facc15', 0.3, 2.05, 0.05, g); B(1.5, 0.3, 0.1, '#65a30d', 0, 1.42, 0.02, g); return null; },
  wardrobe(g) { B(0.8, 2.3, 1.6, '#7c4a2a', 0, 0, 0, g); B(0.05, 2.0, 0.02, '#4a2c18', 0.41, 0.15, 0, g).scale.set(0.05, 2, 0.02); S(0.05, '#fbbf24', 0.42, 1.2, 0.15, g); S(0.05, '#fbbf24', 0.42, 1.2, -0.15, g); return { w: 0.9, d: 1.7 }; },
  piano(g) { B(1.8, 1.1, 0.8, '#111827', 0, 0, 0, g); B(1.7, 0.08, 0.3, '#f8fafc', 0, 0.78, 0.5, g); for (let i = 0; i < 8; i++) B(0.08, 0.05, 0.18, '#111', -0.7 + i * 0.2, 0.84, 0.45, g); return { w: 1.9, d: 1.1 }; },
  rug(g) { B(3.4, 0.03, 2.2, '#7c3aed', 0, 0.01, 0, g); B(2.8, 0.035, 1.6, '#fbbf24', 0, 0.01, 0, g); return null; },
  bookshelf(g) { B(2.4, 2.4, 0.5, DWOOD, 0, 0, 0, g); const cs = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316']; for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) B(0.18, 0.5, 0.36, cs[(i + r * 2) % 6], -1 + i * 0.24, 0.25 + r * 0.72, 0.1, g); return { w: 2.5, d: 0.6 }; },
  desk(g) { B(2, 0.1, 1, WOOD, 0, 0.8, 0, g); B(0.6, 0.8, 0.9, DWOOD, -0.65, 0, 0, g); B(0.1, 0.8, 0.9, DWOOD, 0.9, 0, 0, g); B(0.4, 0.04, 0.3, '#fff', 0.3, 0.9, 0.1, g); B(0.5, 0.6, 0.08, '#1f2937', 0.2, 0.9, -0.3, g); return { w: 2.1, d: 1.1 }; },
  fridge(g) { B(1, 2.2, 0.9, '#e2e8f0', 0, 0, 0, g); B(0.04, 0.5, 0.06, '#64748b', -0.35, 1.3, 0.46, g); B(1, 0.03, 0.92, '#94a3b8', 0, 1.4, 0, g); return { w: 1.1, d: 1 }; },
  counter(g) { B(3.4, 0.95, 0.8, '#f1f5f9', 0, 0, 0, g); B(3.5, 0.08, 0.9, '#94a3b8', 0, 0.95, 0, g); C(0.3, 0.2, '#f472b6', -0.8, 1.02, 0, g); C(0.06, 0.6, '#d6a46b', 0.6, 1.08, 0, g).rotation.z = Math.PI / 2; return { w: 3.5, d: 0.9 }; },
  window(g) { B(0.1, 1.2, 1.6, '#f8fafc', 0, 1.1, 0, g); B(0.12, 1.0, 1.4, MB('#bae6fd'), 0, 1.2, 0, g); B(0.14, 0.06, 1.4, '#f8fafc', 0, 1.7, 0, g); return null; },
  display(g) { B(1.2, 1.0, 1.2, '#7c3aed', 0, 0, 0, g); B(1.0, 0.1, 1.0, '#dc2626', 0, 1.0, 0, g); const gl = B(1.1, 0.9, 1.1, MB('#bfe9ff', 0.3), 0, 1.0, 0, g); gl.renderOrder = 3; B(0.4, 0.06, 0.06, MB('#bfe9ff'), 0.3, 1.5, 0.56, g); return { w: 1.3, d: 1.3 }; },
  dino(g) { const bone = '#f5f5dc'; B(3, 0.25, 0.35, bone, 0, 2.0, 0, g); for (let i = 0; i < 6; i++) B(0.08, 0.6, 0.6, bone, -1 + i * 0.4, 1.6, 0, g); B(0.9, 0.6, 0.5, bone, 1.8, 2.3, 0, g); B(0.8, 0.15, 0.4, bone, 1.9, 2.0, 0, g); B(0.18, 2.0, 0.18, bone, -0.4, 0, -0.3, g); B(0.18, 2.0, 0.18, bone, -0.4, 0, 0.3, g); B(1.6, 0.15, 0.2, bone, -2.2, 1.7, 0, g).rotation.z = -0.4; B(3.6, 0.2, 2, '#57534e', 0, 0, 0, g); return { w: 3.8, d: 2.1 }; },
  statue(g) { B(1.1, 1.0, 1.1, '#9ca3af', 0, 0, 0, g); const m = M('#e5e7eb'); B(0.6, 0.9, 0.4, m, 0, 1.0, 0, g); S(0.28, m, 0, 2.2, 0, g); B(0.5, 0.15, 0.5, m, 0, 2.45, 0, g); B(0.15, 0.5, 0.15, m, 0.3, 1.6, 0.2, g).rotation.x = -0.8; return { w: 1.2, d: 1.2 }; },
  vase(g) { C(0.5, 0.8, '#78716c', 0, 0, 0, g); S(0.42, '#c2410c', 0, 1.2, 0, g); C(0.2, 0.4, '#c2410c', 0, 1.45, 0, g); B(0.86, 0.08, 0.1, '#111', 0, 1.15, 0.36, g); return { r: 0.55 }; },
  plant(g) { C(0.4, 0.6, '#b45309', 0, 0, 0, g); for (let i = 0; i < 6; i++) { const l = CN(0.15, 1.1, '#16a34a', Math.cos(i) * 0.2, 0.5, Math.sin(i) * 0.2, g); l.rotation.set(Math.sin(i) * 0.5, 0, Math.cos(i) * 0.5); } return { r: 0.45 }; },
  guarddesk(g) { B(2.4, 1, 0.9, '#475569', 0, 0, 0, g); B(2.5, 0.08, 1, '#334155', 0, 1, 0, g); B(0.7, 0.5, 0.1, '#111', -0.5, 1.08, -0.2, g); B(0.6, 0.4, 0.02, MB('#22d3ee'), -0.5, 1.13, -0.14, g); C(0.08, 0.16, '#fff', 0.6, 1.08, 0.1, g); return { w: 2.5, d: 1 }; },
  bin(g) { B(0.7, 0.9, 0.6, '#2563eb', 0, 0, 0, g); B(0.72, 0.06, 0.62, '#1d4ed8', 0, 0.9, 0, g); return { w: 0.8, d: 0.7 }; },
  shelf(g) { B(2.6, 1.6, 0.6, '#f59e0b', 0, 0, 0, g); for (let i = 0; i < 5; i++) { S(0.16, ['#4ade80', '#f472b6', '#38bdf8', '#facc15', '#a78bfa'][i], -1 + i * 0.5, 1.8, 0, g); B(0.3, 0.4, 0.1, '#fff', -1 + i * 0.5, 0.6, 0.3, g); } return { w: 2.7, d: 0.7 }; },
  crate(g) { B(1.3, 1.2, 1.3, '#c08a4a', 0, 0, 0, g); B(1.34, 0.12, 1.34, '#8b5a2b', 0, 0.55, 0, g); return { w: 1.4, d: 1.4 }; },
  crates(g) { B(1.2, 1.1, 1.2, '#c08a4a', -0.65, 0, 0, g); B(1.2, 1.1, 1.2, '#b07a3a', 0.65, 0, 0, g); B(1.1, 1.0, 1.1, '#d09a5a', 0, 1.1, 0, g); return { w: 2.6, d: 1.3 }; },
  net(g) { B(1.8, 0.3, 1.2, '#a3e635', 0, 0, 0, g).material = MB('#9bd14a'); S(0.4, '#65a30d', -0.4, 0.3, 0, g).scale.set(0.6, 0.3, 0.5); S(0.12, '#fda4af', 0.5, 0.35, 0.2, g); S(0.12, '#fef3c7', 0.2, 0.32, -0.2, g); return { w: 1.8, d: 1.2 }; },
  rowboat(g) { B(1.4, 0.5, 3, '#dc2626', 0, -0.1, 0, g); B(1.1, 0.1, 2.6, '#7c2d12', 0, 0.3, 0, g); B(1.2, 0.08, 0.3, WOOD, 0, 0.42, 0, g); B(0.08, 0.06, 2, '#d6a46b', 0.5, 0.5, 0, g).rotation.y = 0.3; return null; },
  barrel(g) { C(0.45, 1.0, '#92400e', -0.5, 0, 0, g); C(0.45, 1.0, '#a3540f', 0.5, 0, 0, g); C(0.45, 1.0, '#92400e', 0, 0, 0.75, g); C(0.47, 0.06, '#334155', -0.5, 0.5, 0, g); C(0.47, 0.06, '#334155', 0.5, 0.5, 0, g); return { w: 2, d: 2 }; },
  officedesk(g) { B(2.2, 0.9, 1, '#0e7490', 0, 0, 0, g); B(2.3, 0.08, 1.1, '#155e75', 0, 0.9, 0, g); B(0.5, 0.06, 0.4, '#fff', -0.4, 0.98, 0, g); B(0.5, 0.06, 0.4, '#fde68a', 0.3, 0.98, 0.1, g); B(3, 2.8, 0.2, '#f1f5f9', 0, 0, -1.4, g); B(3.4, 0.2, 2.2, '#0891b2', 0, 2.8, -0.6, g); return { w: 2.3, d: 1.1 }; },
  post(g) { C(0.22, 1.4, '#6b4226', 0, 0, 0, g); add(G.torus, M('#d6a46b'), 0, 0.9, 0, 0.26, 0.26, 1.5, g).rotation.x = Math.PI / 2; return { r: 0.3 }; },
  rope(g) { for (let i = 0; i < 4; i++) add(G.torus, M('#d6a46b'), 0, 0.08 + i * 0.12, 0, 0.5 - i * 0.04, 0.5 - i * 0.04, 1.6, g).rotation.x = Math.PI / 2; return { r: 0.55 }; },
  bucket(g) { C(0.3, 0.5, '#3b82f6', 0, 0, 0, g); C(0.26, 0.04, '#78350f', 0, 0.48, 0, g); return { r: 0.35 }; },
  door(g) { B(1.2, 2, 0.15, '#7c2d12', 0, 0, 0, g); S(0.07, '#fbbf24', 0.4, 1, 0.1, g); return null; },
  anchor(g) { const m = M('#475569'); B(0.2, 1.6, 0.2, m, 0, 0, 0, g); B(1.0, 0.18, 0.2, m, 0, 1.2, 0, g); add(G.torus, m, 0, 0.35, 0, 0.5, 0.5, 1.4, g).rotation.z = 0; add(G.torus, m, 0, 1.75, 0, 0.16, 0.16, 1, g); return { r: 0.6 }; },
  stump(g) { C(0.7, 0.6, '#92400e', 0, 0, 0, g); C(0.6, 0.04, '#fcd9a8', 0, 0.6, 0, g); return { r: 0.75 }; },
  campfire(g) { for (let i = 0; i < 8; i++) S(0.18, '#78716c', Math.cos(i / 8 * TAU) * 0.7, 0.1, Math.sin(i / 8 * TAU) * 0.7, g); B(0.9, 0.12, 0.12, DWOOD, 0, 0.1, 0, g).rotation.y = 0.6; B(0.9, 0.12, 0.12, DWOOD, 0, 0.1, 0, g).rotation.y = -0.6; S(0.2, '#9ca3af', 0, 0.2, 0, g); return { r: 0.85 }; },
  log(g) { const l = C(0.45, 2.2, '#7c4a2a', 0, 0, 0, g); l.rotation.z = Math.PI / 2; l.position.y = 0.45; const h = C(0.3, 2.22, '#2a1a10', 0, 0, 0, g); h.rotation.z = Math.PI / 2; h.position.y = 0.45; return { w: 2.2, d: 0.9 }; },
  well(g) { C(0.9, 0.8, '#9ca3af', 0, 0, 0, g); C(0.7, 0.82, '#1e293b', 0, 0, 0, g); B(0.12, 1.6, 0.12, DWOOD, -0.8, 0.8, 0, g); B(0.12, 1.6, 0.12, DWOOD, 0.8, 0.8, 0, g); const r = B(2, 0.12, 1.2, '#b91c1c', 0, 2.4, 0, g); r.rotation.x = 0; return { r: 0.95 }; },
  woodpile(g) { for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) { const l = C(0.18, 1.4, i % 2 ? '#a16207' : '#92400e', 0, 0, 0, g); l.rotation.x = Math.PI / 2; l.position.set(0, 0.18 + r * 0.32, -0.5 + i * 0.36 + r * 0.18); } return { w: 1.4, d: 1.6 }; },
  tent(g) { const t = CN(1.6, 1.8, '#f97316', 0, 0, 0, g); t.geometry = new T.ConeGeometry(1, 1, 4); t.rotation.y = Math.PI / 4; B(0.5, 0.9, 0.05, '#7c2d12', 0, 0, 1.13, g); return { r: 1.3 }; },
  stove(g) { B(1, 1, 0.8, '#1f2937', 0, 0, 0, g); C(0.12, 1.6, '#374151', 0.3, 1, -0.2, g); C(0.2, 0.2, '#ef4444', -0.2, 1, 0.1, g); return { w: 1.1, d: 0.9 }; },
  chest(g) { B(1.3, 0.7, 0.8, '#92400e', 0, 0, 0, g); B(1.34, 0.2, 0.84, '#78350f', 0, 0.7, 0, g); B(0.2, 0.25, 0.05, '#fbbf24', 0, 0.55, 0.42, g); return { w: 1.4, d: 0.9 }; },
  table(g) { B(1.8, 0.1, 1.2, WOOD, 0, 0.75, 0, g); [[-0.8, -0.5], [0.8, -0.5], [-0.8, 0.5], [0.8, 0.5]].forEach((p) => B(0.1, 0.75, 0.1, DWOOD, p[0], 0, p[1], g)); C(0.08, 0.15, '#fff', -0.4, 0.85, 0, g); B(0.5, 0.03, 0.5, '#111', 0.3, 0.85, 0, g); return { w: 1.9, d: 1.3 }; },
  bed(g) { B(1.4, 0.5, 2.2, DWOOD, 0, 0, 0, g); B(1.3, 0.2, 1.6, '#ef4444', 0, 0.5, 0.25, g); B(1.0, 0.2, 0.4, '#fff', 0, 0.55, -0.75, g); return { w: 1.5, d: 2.3 }; },
  trophyshelf(g) { B(0.5, 0.1, 1.8, WOOD, 0, 1.2, 0, g); B(0.5, 0.1, 1.8, WOOD, 0, 0.6, 0, g); B(0.5, 1.4, 0.1, DWOOD, 0, 0, 0.9, g); B(0.5, 1.4, 0.1, DWOOD, 0, 0, -0.9, g); B(0.1, 0.4, 0.3, '#3b82f6', 0, 1.3, -0.5, g); B(0.1, 0.3, 0.3, '#ef4444', 0, 0.7, 0.4, g); return { w: 0.6, d: 1.9 }; },
  prints(g) { for (let i = 0; i < 6; i++) { const f = B(0.2, 0.02, 0.34, '#5b3a1f', (i % 2 ? 0.18 : -0.18), 0.01, -i * 0.55 + 1.2, g); f.rotation.y = 0.2; } return null; },
  box(g) { B(1.2, 0.9, 0.7, '#e2e8f0', 0, 0, 0, g); B(0.5, 0.35, 0.4, '#f9a8d4', 0, 0.9, 0, g); B(0.52, 0.06, 0.42, '#db2777', 0, 1.25, 0, g); return { w: 1.2, d: 0.8 }; },
  hook(g) { B(0.15, 2.2, 0.15, DWOOD, 0, 0, 0, g); B(0.7, 0.12, 0.12, DWOOD, -0.3, 2.1, 0, g); add(G.torus, M('#9ca3af'), -0.6, 1.95, 0, 0.1, 0.1, 1, g); return { r: 0.3 }; },
  sign(g) { B(0.14, 1.6, 0.14, DWOOD, 0, 0, 0, g); const a = B(1.3, 0.45, 0.1, '#38bdf8', 0.25, 1.25, 0, g); B(1.0, 0.35, 0.1, '#0ea5e9', -0.1, 0.75, 0, g).rotation.y = Math.PI; return { r: 0.35 }; }
};
function tree(x, z, p, s) { s = s || 1; C(0.25 * s, 1.4 * s, '#7c4a2a', x, 0, z, p, true); CN(1.3 * s, 2.2 * s, '#15803d', x, 1.1 * s, z, p); CN(1.0 * s, 1.8 * s, '#16a34a', x, 2.2 * s, z, p); }
function house(x, z, w, col, roof, p, label) {
  B(w, 3.2, 3, col, x, 0, z, p); const r = B(w + 0.4, 0.5, 3.4, roof, x, 3.2, z, p);
  const tri = add(G.cone, M(roof), x, 4.2, z, w * 0.62, 1.4, 1.9, p); tri.geometry = new T.ConeGeometry(1, 1, 4); tri.rotation.y = Math.PI / 4;
  B(0.9, 1.6, 0.1, '#7c2d12', x, 0, z + 1.52, p); B(0.8, 0.7, 0.1, '#bae6fd', x - w / 3, 1.6, z + 1.52, p); B(0.8, 0.7, 0.1, '#bae6fd', x + w / 3, 1.6, z + 1.52, p);
  if (label) { const s = textSprite(label, { size: 40, h: 0.55, bg: 'rgba(255,255,255,.92)', color: '#1b1440', border: '#1b1440' }); s.position.set(x, 2.7, z + 1.7); s.material.depthTest = true; p.add(s); }
}
function floorTex(kind) {
  if (kind === 'checker') return canvasTex(256, 256, (g) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? '#f8fafc' : '#93c5fd'; g.fillRect(i * 32, j * 32, 32, 32); } });
  if (kind === 'cobble') return canvasTex(256, 256, (g) => { g.fillStyle = '#d6cfc4'; g.fillRect(0, 0, 256, 256); for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { g.fillStyle = ['#e7e1d6', '#cfc7ba', '#ddd5c8'][(i * 7 + j * 3) % 3]; rr(g, i * 32 + (j % 2) * 16 + 2, j * 32 + 2, 28, 28, 7); g.fill(); } });
  if (kind === 'planks') return canvasTex(256, 256, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#b07a45' : '#a06a3a'; g.fillRect(0, i * 32, 256, 32); g.fillStyle = '#7a4a24'; g.fillRect(0, i * 32, 256, 2); g.fillRect((i * 97) % 256, i * 32, 3, 32); } });
  if (kind === 'grass') return canvasTex(256, 256, (g) => { g.fillStyle = '#6cc35a'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 260; i++) { g.fillStyle = ['#5fb34e', '#79cf63', '#64bb52'][i % 3]; g.fillRect((i * 73) % 256, (i * 151) % 256, 6, 10); } });
  if (kind === 'sand') return canvasTex(256, 256, (g) => { g.fillStyle = '#f2dca4'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 300; i++) { g.fillStyle = i % 2 ? '#e8cf8f' : '#f8e6b8'; g.fillRect((i * 73) % 256, (i * 151) % 256, 4, 4); } });
  if (kind === 'marble') return canvasTex(256, 256, (g) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#f3ead8' : '#e2d6bd'; g.fillRect(i * 64, j * 64, 64, 64); } g.strokeStyle = '#cbbd9e'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.moveTo(0, i * 64); g.lineTo(256, i * 64); g.stroke(); } });
  if (kind === 'wood') return canvasTex(256, 256, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#c99a6b' : '#bd8c5c'; g.fillRect(i * 32, 0, 32, 256); g.fillStyle = '#9a6b3e'; g.fillRect(i * 32, 0, 2, 256); g.fillRect(i * 32, (i * 77) % 256, 32, 2); } });
  return null;
}
function ground(p, x0, x1, z0, z1, col, rep, y) {
  const m = new T.Mesh(G.plane, null); m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y || 0, (z0 + z1) / 2); m.scale.set(x1 - x0, z1 - z0, 1);
  const tx = floorTex(col);
  if (tx) { tx.wrapS = tx.wrapT = T.RepeatWrapping; tx.repeat.set((x1 - x0) / (rep || 4), (z1 - z0) / (rep || 4)); tx.encoding = T.sRGBEncoding; m.material = new T.MeshLambertMaterial({ map: tx }); }
  else m.material = M(col);
  m.userData.ground = true; p.add(m); return m;
}

/* ---------------- areas ---------------- */
function buildArea(id) {
  const A = GD.AREAS[id], g = new T.Group(), cols = [], hw = A.w / 2, hd = A.d / 2;
  g.visible = false; W.scene.add(g);
  const box = (x0, x1, z0, z1) => cols.push({ x0, x1, z0, z1 });
  if (id === 'town') {
    ground(g, -40, 40, -30, 30, 'grass', 4, -0.02); ground(g, -hw, hw, -hd + 1.5, hd, 'cobble', 3);
    house(-10, -12.2, 5, '#fca5a5', '#b91c1c', g, 'MANSION \u2192'); house(-3.5, -12.2, 5, '#fde68a', '#d97706', g, 'BAKERY'); house(3.5, -12.2, 5, '#bfdbfe', '#1d4ed8', g, 'MUSEUM \u2192'); house(10, -12.2, 5, '#bbf7d0', '#15803d', g, 'DOCKS \u2192');
    box(-hw, hw, -15, -10.4);
    [[-13, 9], [13, 9], [-13.5, -8], [13.5, -8], [13.4, 4.5]].forEach((t) => { tree(t[0], t[1], g); cols.push({ c: 1, x: t[0], z: t[1], r: 0.5 }); });
  } else if (id === 'docks') {
    const water = ground(g, -60, 60, -40, 0.2, '#38bdf8', 4, -0.35); water.material = new T.MeshLambertMaterial({ color: '#3ab4f2' }); W.water = water;
    ground(g, -40, 40, 0, 30, 'sand', 3, -0.02); ground(g, -hw, hw, 0, 5.5, 'planks', 2, 0.01);
    ground(g, -2, 2, -10, 0.2, 'planks', 2, 0.05); ground(g, 7, 10, -6, 0.2, 'planks', 2, 0.05);
    for (let z = -10; z <= 0; z += 2.5) { C(0.15, 1.2, DWOOD, -2, -0.9, z, g); C(0.15, 1.2, DWOOD, 2, -0.9, z, g); }
    // ferry
    const f = new T.Group(); f.position.set(-5.2, 0, -6); g.add(f);
    B(3.2, 1.2, 8, '#f8fafc', 0, -0.6, 0, f); B(3.3, 0.3, 8.1, '#1e3a8a', 0, 0.3, 0, f); B(2.2, 1.6, 3, '#fde68a', 0, 0.6, 0.5, f); B(2.4, 0.2, 3.2, '#dc2626', 0, 2.2, 0.5, f); C(0.25, 1.4, '#111', 0, 2.4, 1, f);
    const t = textSprite('FERRY', { size: 40, h: 0.5, bg: '#1e3a8a', border: '#fff' }); t.position.set(0, 3.2, 0.5); t.material.depthTest = true; f.add(t);
    // lighthouse + shack
    const lh = new T.Group(); lh.position.set(-11, 0, 2.6); g.add(lh);
    for (let i = 0; i < 5; i++) C(1.9 - i * 0.12, 1.3, i % 2 ? '#dc2626' : '#f8fafc', 0, i * 1.3, 0, lh);
    C(1.0, 1, MB('#fff7c2'), 0, 6.5, 0, lh); CN(1.2, 1, '#dc2626', 0, 7.5, 0, lh);
    cols.push({ c: 1, x: -11, z: 2.6, r: 2.0 });
    house(9.5, 10.4, 5, '#fde68a', '#0e7490', g, 'BAIT SHOP'); box(6.8, 12.2, 8.8, 13);
    [[-13, 10.8], [13, 7.6]].forEach((tt) => { tree(tt[0], tt[1], g); cols.push({ c: 1, x: tt[0], z: tt[1], r: 0.5 }); });
  } else if (id === 'forest') {
    ground(g, -40, 40, -30, 30, 'grass', 4, -0.02);
    const path = ground(g, -2.5, 1.5, -2, 12, '#d9b77e', 4, 0.005); path.material = M('#d9b77e');
    const cb = A.cabin; // x0 x1 z0 z1 doorX0 doorX1
    ground(g, cb[0], cb[1], cb[2], cb[3], 'wood', 2, 0.01);
    const wh = 1.5, wc = '#8b5a2b', wt = 0.3;
    B(cb[1] - cb[0], 2.6, wt, wc, (cb[0] + cb[1]) / 2, 0, cb[2], g); box(cb[0], cb[1], cb[2] - wt, cb[2] + wt / 2);
    B(wt, wh, cb[3] - cb[2], wc, cb[0], 0, (cb[2] + cb[3]) / 2, g); box(cb[0] - wt / 2, cb[0] + wt / 2, cb[2], cb[3]);
    B(wt, wh, cb[3] - cb[2], wc, cb[1], 0, (cb[2] + cb[3]) / 2, g); box(cb[1] - wt / 2, cb[1] + wt / 2, cb[2], cb[3]);
    B(cb[4] - cb[0], 0.7, wt, wc, (cb[0] + cb[4]) / 2, 0, cb[3], g); box(cb[0], cb[4], cb[3] - wt / 2, cb[3] + wt / 2);
    B(cb[1] - cb[5], 0.7, wt, wc, (cb[5] + cb[1]) / 2, 0, cb[3], g); box(cb[5], cb[1], cb[3] - wt / 2, cb[3] + wt / 2);
    [cb[0], cb[1]].forEach((x) => { [cb[2], cb[3]].forEach((z) => B(0.4, 2.8, 0.4, '#5b3a1f', x, 0, z, g)); });
    const s = textSprite('CABIN', { size: 40, h: 0.5, bg: '#8b5a2b', border: '#fff' }); s.position.set((cb[0] + cb[1]) / 2, 3.1, cb[2]); g.add(s);
    A.trees.forEach((t, i) => { tree(t[0], t[1], g, 0.9 + (i % 3) * 0.15); cols.push({ c: 1, x: t[0], z: t[1], r: 0.45 }); });
    for (let i = 0; i < 14; i++) { const a = i * 2.3; S(0.4, '#22c55e', Math.cos(a) * 15.5, 0.2, Math.sin(a) * 13, g); }
  } else {
    // interiors
    (A.floors || []).forEach((f) => ground(g, f[0], f[1], f[2], f[3], f[4] === 'checker' ? 'checker' : f[4] === '#e8dcc4' ? 'marble' : f[4], 2, 0.0));
    ground(g, -40, 40, -30, 30, id === 'museum' ? '#7c6a55' : '#4a3360', 4, -0.05);
    const wc = id === 'museum' ? '#f5e6c8' : '#e9d5ff', trim = id === 'museum' ? '#b8a07a' : '#7e22ce';
    B(A.w + 0.6, 3.2, 0.4, wc, 0, 0, -hd - 0.2, g); B(A.w + 0.6, 0.3, 0.44, trim, 0, 3.0, -hd - 0.2, g);
    B(0.4, 3.2, A.d, wc, -hw - 0.2, 0, 0, g); B(0.4, 3.2, A.d, wc, hw + 0.2, 0, 0, g);
    B(A.w + 0.6, 0.6, 0.4, trim, 0, 0, hd + 0.2, g);
    (A.walls || []).forEach((w) => { B(w[1] - w[0], 1.6, w[3] - w[2], wc, (w[0] + w[1]) / 2, 0, (w[2] + w[3]) / 2, g); B(w[1] - w[0] + 0.04, 0.12, w[3] - w[2] + 0.04, trim, (w[0] + w[1]) / 2, 1.6, (w[2] + w[3]) / 2, g); box(w[0], w[1], w[2], w[3]); });
    if (id === 'museum') { [[-7, -7], [7, -7], [-10, 6.5], [10, -6.5]].forEach((p) => { C(0.3, 3.2, '#f8fafc', p[0], 0, p[1], g); cols.push({ c: 1, x: p[0], z: p[1], r: 0.35 }); });
      const ban = textSprite('GROK CITY MUSEUM', { size: 40, h: 0.6, bg: '#b45309', border: '#fde68a' }); ban.position.set(0, 3.0, -7.8); ban.material.depthTest = true; g.add(ban); }
    else { const ch = S(0.6, MB('#fff7c2'), -4.5, 3.4, 0.5, g); ch.scale.set(0.6, 0.3, 0.6);
      [['HALL', -4.5, 7.3], ['STUDY', 6.5, -0.8], ['KITCHEN', 6.5, 1.0]].forEach((l) => { const s = textSprite(l[0], { size: 34, h: 0.4, bg: 'rgba(126,34,206,.85)' }); s.position.set(l[1], 0.2, l[2]); s.material.depthTest = true; g.add(s); }); }
  }
  // shared objects
  const hots = [];
  A.objs.forEach((o) => hots.push(placeObj(o, g, cols, id)));
  // travel sign
  const sg = new T.Group(); sg.position.set(A.sign[0], 0, A.sign[1]); g.add(sg); P.sign(sg); cols.push({ c: 1, x: A.sign[0], z: A.sign[1], r: 0.35 });
  const sh = { id: 'sign', name: 'Travel Map', kind: 'sign', x: A.sign[0], z: A.sign[1], reach: 1.6, g: sg, h: 2.2 }; tagHot(sh); addMarker(sh, 'sign', g); hots.push(sh);
  const caseG = new T.Group(); g.add(caseG);
  W.areas[id] = { id, g, cols, baseCols: cols.length, hots, baseHots: hots.length, caseG, npcs: [] };
}
function placeObj(o, g, cols, areaId) {
  const og = new T.Group(); og.position.set(o.x, 0, o.z); g.add(og);
  const A = GD.AREAS[areaId];
  og.rotation.y = o.kind === 'window' && o.rotN ? Math.PI / 2 : 0;
  const cl = (P[o.kind] || P.crate)(og);
  if (cl) { if (cl.r) cols.push({ c: 1, x: o.x, z: o.z, r: cl.r }); else { const sw = Math.abs(Math.sin(og.rotation.y)) > 0.5; const w = sw ? cl.d : cl.w, d = sw ? cl.w : cl.d; cols.push({ x0: o.x - w / 2, x1: o.x + w / 2, z0: o.z - d / 2, z1: o.z + d / 2 }); } }
  const ext = cl ? (cl.r || Math.max(cl.w, cl.d) / 2) : (o.kind === 'rug' ? 1.2 : 0.6);
  const h = { id: o.id, name: o.name, kind: 'obj', x: o.x, z: o.z, reach: o.r || Math.min(2.2, ext + 1.1), g: og, h: o.kind === 'rug' || o.kind === 'prints' ? 0.9 : o.kind === 'dino' ? 3.3 : 2.4, text: o.text, extra: o.extra };
  if (A.outdoor === false && o.z < -A.d / 2 + 1.2) h.h = Math.max(h.h, 2.6);
  tagHot(h); addMarker(h, 'q', g); return h;
}
function tagHot(h) { h.g.traverse((m) => { if (m.isMesh) m.userData.hot = h; }); }
function addMarker(h, kind, p) {
  const sp = new T.Sprite(new T.SpriteMaterial({ map: markerTex(kind), depthTest: false, transparent: true })); sp.renderOrder = 18; sp.scale.set(0.62, 0.62, 1);
  sp.position.set(h.x, h.h + 0.35, h.z); p.add(sp); h.marker = sp; h.mk = kind;
  // lens glow ring
  const ring = new T.Mesh(G.plane, new T.MeshBasicMaterial({ map: glowTex, color: '#ffd23f', transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(h.x, 0.06, h.z); const rs = Math.max(2.2, h.reach * 1.6); ring.scale.set(rs, rs, 1); ring.renderOrder = 4; p.add(ring); h.ring = ring;
  const beam = new T.Mesh(G.cyl, new T.MeshBasicMaterial({ color: '#ffe36b', transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
  beam.position.set(h.x, 2.5, h.z); beam.scale.set(0.18, 5, 0.18); beam.renderOrder = 5; p.add(beam); h.beam = beam;
}
W.setMarker = function (h, kind) { if (!h.marker || h.mk === kind) return; h.mk = kind; h.marker.material.map = markerTex(kind); h.marker.material.needsUpdate = true; };

/* build per-case content: extras + NPCs */
W.ensureAreas = function () { GD.AREA_ORDER.forEach((id) => { if (!W.areas[id]) buildArea(id); }); };
W.buildCase = function (c, extraPos) {
  W.ensureAreas();
  for (const id in W.areas) {
    const a = W.areas[id];
    a.g.remove(a.caseG); a.caseG = new T.Group(); a.g.add(a.caseG);
    a.cols.length = a.baseCols; a.hots.length = a.baseHots; a.npcs = [];
  }
  GD.extraObjs(c, extraPos).forEach((o) => { const a = W.areas[o.area]; a.hots.push(placeObj(o, a.caseG, a.cols, o.area)); });
  GD.people(c).forEach((p) => {
    const a = W.areas[p.area], sp = GD.AREAS[p.area].npc[p.spot];
    const ch = p.kind === 'dog' ? W.makeDog() : W.makeChar(p.look);
    ch.g.position.set(sp[0], 0, sp[1]); ch.g.rotation.y = 0; a.caseG.add(ch.g);
    const tag = textSprite(p.name, { size: 36, h: 0.36, bg: p.kind === 'suspect' ? 'rgba(190,18,60,.88)' : p.kind === 'victim' ? 'rgba(37,99,235,.9)' : 'rgba(22,163,74,.9)' });
    tag.position.set(0, ch.h + 0.45, 0); ch.g.add(tag);
    a.cols.push({ c: 1, x: sp[0], z: sp[1], r: 0.42, npc: 1 });
    const h = { id: 'npc:' + p.id, pid: p.id, name: p.name, kind: 'npc', x: sp[0], z: sp[1], reach: 1.9, g: ch.g, h: ch.h + 0.95, ch, person: p, baseYaw: 0 };
    tagHot(h); addMarker(h, 'talk', a.caseG); a.hots.push(h); a.npcs.push(h);
  });
};
W.setArea = function (id) {
  for (const k in W.areas) W.areas[k].g.visible = k === id;
  W.cur = W.areas[id]; const A = GD.AREAS[id];
  W.scene.background = new T.Color(A.outdoor ? (id === 'forest' ? '#a7e3a0' : '#9fdcff') : '#2a1d46');
};

/* ---------------- collisions ---------------- */
function inWalk(A, x, z, r) { return A.walk.some((w) => x >= w[0] + r * 0.3 && x <= w[1] - r * 0.3 && z >= w[2] + r * 0.3 && z <= w[3] - r * 0.3); }
W.moveCircle = function (areaId, x, z, dx, dz, r) {
  const A = GD.AREAS[areaId], a = W.areas[areaId];
  const tryP = (nx, nz) => {
    if (!inWalk(A, nx, nz, r)) return null;
    for (let k = 0; k < 2; k++) for (const c of a.cols) {
      if (c.c) { const ddx = nx - c.x, ddz = nz - c.z, d = Math.hypot(ddx, ddz), m = c.r + r; if (d < m) { if (d < 1e-4) { nx += m; continue; } nx = c.x + ddx / d * m; nz = c.z + ddz / d * m; } }
      else if (nx > c.x0 - r && nx < c.x1 + r && nz > c.z0 - r && nz < c.z1 + r) {
        const px = Math.min(nx - (c.x0 - r), (c.x1 + r) - nx), pz = Math.min(nz - (c.z0 - r), (c.z1 + r) - nz);
        if (px < pz) nx = (nx - (c.x0 - r) < (c.x1 + r) - nx) ? c.x0 - r : c.x1 + r; else nz = (nz - (c.z0 - r) < (c.z1 + r) - nz) ? c.z0 - r : c.z1 + r;
      }
    }
    return inWalk(A, nx, nz, r) ? [nx, nz] : null;
  };
  return tryP(x + dx, z + dz) || tryP(x + dx, z) || tryP(x, z + dz) || [x, z];
};
W.isFree = function (areaId, x, z, r) {
  r = r || 0.36; const A = GD.AREAS[areaId], a = W.areas[areaId];
  if (!inWalk(A, x, z, r)) return false;
  return !a.cols.some((c) => c.c ? Math.hypot(x - c.x, z - c.z) < c.r + r - 1e-6 : (x > c.x0 - r + 1e-6 && x < c.x1 + r - 1e-6 && z > c.z0 - r + 1e-6 && z < c.z1 + r - 1e-6));
};
W.freeSpot = function (areaId, x, z) { return W.moveCircle(areaId, x, z, 0, 0, 0.36); };

/* ---------------- camera ---------------- */
W.cam = { x: 0, z: 0, init: false };
W.updateCamera = function (tx, tz, dt, snap) {
  const cam = W.camera, asp = cam.aspect, portrait = asp < 0.85;
  const A = W.cur ? GD.AREAS[W.cur.id] : null;
  // keep ~11 world units visible across the narrow side
  const halfW = portrait ? 4.5 : 8;
  const hf = Math.tan(cam.fov * Math.PI / 360) * Math.max(asp, 0.3);
  let dist = portrait ? halfW / hf : 19; dist = Math.max(13, Math.min(portrait ? 30 : 22, dist));
  const pitch = portrait ? 1.0 : 0.95;
  if (A) { const mx = Math.max(0, A.w / 2 - halfW + 0.5); tx = Math.max(-mx, Math.min(mx, tx)); tz = Math.max(-A.d / 2 + (portrait ? 4 : 3), Math.min(A.d / 2 - (portrait ? 2.5 : 3), tz)); }
  const k = snap || !W.cam.init ? 1 : 1 - Math.exp(-dt * 6);
  W.cam.x += (tx - W.cam.x) * k; W.cam.z += (tz - W.cam.z) * k; W.cam.init = true;
  const lookZ = W.cam.z - (portrait ? 1.2 : 0.6);
  cam.position.set(W.cam.x, Math.sin(pitch) * dist, lookZ + Math.cos(pitch) * dist);
  cam.lookAt(W.cam.x, 0.6, lookZ);
};

/* ---------------- picking ---------------- */
W.pick = function (cx, cy) {
  const v = new T.Vector2((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1);
  W.ray.setFromCamera(v, W.camera);
  const hits = W.ray.intersectObjects(W.cur.g.children, true);
  for (const h of hits) { if (!h.object.visible) continue; if (h.object.userData.hot) return { hot: h.object.userData.hot, point: h.point }; if (h.object.userData.ground) return { point: h.point }; }
  // fall back to y=0 plane
  const pl = new T.Plane(new T.Vector3(0, 1, 0), 0), pt = new T.Vector3();
  if (W.ray.ray.intersectPlane(pl, pt)) return { point: pt };
  return null;
};
W.project = function (x, y, z) { const v = new T.Vector3(x, y, z).project(W.camera); return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight, vis: v.z < 1 }; };

W.tapMark = function (x, z) {
  if (!W.tapRing) { W.tapRing = new T.Mesh(G.torus, new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false })); W.tapRing.rotation.x = -Math.PI / 2; W.scene.add(W.tapRing); W.tapRing.renderOrder = 6; }
  W.tapRing.position.set(x, 0.08, z); W.tapT = 0.6;
};
W.tick = function (dt) {
  W.time += dt;
  if (W.tapRing) { W.tapT = Math.max(0, (W.tapT || 0) - dt); const k = W.tapT / 0.6; W.tapRing.material.opacity = k * 0.9; const s = 0.25 + (1 - k) * 0.35; W.tapRing.scale.set(s, s, s); }
  if (W.water) W.water.position.y = -0.35 + Math.sin(W.time * 1.3) * 0.04;
};
W.render = function () { W.renderer.render(W.scene, W.camera); };
})();
