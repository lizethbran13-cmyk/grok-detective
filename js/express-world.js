/* Midnight Express DLC - 3D train cars: shells, props, moving night scenery, doors */
(function () {
'use strict';
const GD = window.GD, T = window.THREE, W = GD.W, EX = GD.EX;
const { B, C, S, CN, add, G, M, MB } = W;
const TAU = Math.PI * 2;
const WOOD = '#7a4524', DWOOD = '#4a2814', BRASS = '#d4a017', VELVET = '#9f1239', CREAM = '#f5e6c8';
const EXA = EX.A = {};
function glow(p, x, y, z, s, col, op) { const m = new T.Sprite(new T.SpriteMaterial({ map: W.glowTex, color: col || '#ffd27a', transparent: true, opacity: op == null ? 0.8 : op, depthWrite: false, blending: T.AdditiveBlending })); m.position.set(x, y, z); m.scale.set(s, s, 1); p.add(m); return m; }
function tex(w, h, draw, rx, ry) { const t = W.canvasTex(w, h, draw); t.encoding = T.sRGBEncoding; if (rx) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry || rx); } return t; }
function plane(p, w, d, mat, x, y, z) { const m = new T.Mesh(G.plane, mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.scale.set(w, d, 1); p.add(m); return m; }
const TX = {};
function T_(k) {
  if (TX[k]) return TX[k];
  const mk = {
    carpet: () => tex(128, 128, (g) => { g.fillStyle = '#8c1d3a'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#a3264a'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.save(); g.translate(16 + i * 32, 16 + j * 32); g.rotate(Math.PI / 4); g.fillRect(-8, -8, 16, 16); g.restore(); } g.fillStyle = '#e8b64c'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.beginPath(); g.arc(i * 32, j * 32, 3, 0, TAU); g.fill(); } }),
    runner: () => tex(128, 128, (g) => { g.fillStyle = '#1e3a5f'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#d4a017'; g.fillRect(0, 8, 128, 5); g.fillRect(0, 115, 128, 5); g.fillStyle = '#2b4f7e'; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(i * 32 + 16, 30); g.lineTo(i * 32 + 30, 64); g.lineTo(i * 32 + 16, 98); g.lineTo(i * 32 + 2, 64); g.closePath(); g.fill(); } }),
    parquet: () => tex(128, 128, (g) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#a26a3c' : '#8f5a30'; g.fillRect(i * 16, j * 32 + (i % 2) * 16, 16, 32); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(i * 16, j * 32 + (i % 2) * 16, 1, 32); } }),
    planks: () => tex(128, 128, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#9a7048' : '#8a6240'; g.fillRect(0, i * 16, 128, 16); g.fillStyle = '#5a3a20'; g.fillRect(0, i * 16, 128, 1.5); g.fillRect((i * 53) % 128, i * 16, 2, 16); } }),
    steel: () => tex(128, 128, (g) => { g.fillStyle = '#4b5563'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#5b6574'; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) g.fillRect(i * 16 + 3, j * 16 + 6, 10, 3); }),
    grass: () => tex(128, 128, (g) => { g.fillStyle = '#1d3b33'; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 160; i++) { g.fillStyle = ['#244a3e', '#183229', '#2a5546'][i % 3]; g.fillRect((i * 73) % 128, (i * 151) % 128, 4, 7); } }),
    gravel: () => tex(128, 128, (g) => { g.fillStyle = '#34333d'; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 260; i++) { g.fillStyle = ['#44434e', '#2a2932', '#4f4e5a'][i % 3]; g.fillRect((i * 37) % 128, (i * 91) % 128, 5, 4); } }),
    ballast: () => tex(128, 128, (g) => { g.fillStyle = '#3b3a44'; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 220; i++) { g.fillStyle = ['#4a4954', '#2e2d36', '#55545f'][i % 3]; g.fillRect((i * 37) % 128, (i * 91) % 128, 5, 4); } g.fillStyle = '#5a3a22'; for (let i = 0; i < 4; i++) g.fillRect(i * 32 + 4, 0, 14, 128); g.fillStyle = '#b8c0cc'; g.fillRect(0, 40, 128, 5); g.fillRect(0, 84, 128, 5); }),
    panel: () => tex(128, 64, (g) => { g.fillStyle = '#6b3a1d'; g.fillRect(0, 0, 128, 64); g.strokeStyle = '#4a2814'; g.lineWidth = 3; for (let i = 0; i < 4; i++) g.strokeRect(i * 32 + 4, 6, 24, 52); g.fillStyle = 'rgba(255,220,160,.12)'; for (let i = 0; i < 4; i++) g.fillRect(i * 32 + 6, 8, 6, 48); }),
    cork: () => tex(128, 96, (g) => { g.fillStyle = '#c8955a'; g.fillRect(0, 0, 128, 96); for (let i = 0; i < 300; i++) { g.fillStyle = i % 2 ? '#b07c45' : '#d8a86c'; g.fillRect((i * 37) % 128, (i * 59) % 96, 2, 2); } const notes = [['#fde047', 10, 10], ['#f9a8d4', 50, 14], ['#93c5fd', 88, 8], ['#fff', 22, 54], ['#bbf7d0', 70, 56]]; notes.forEach((n) => { g.fillStyle = n[0]; g.fillRect(n[1], n[2], 28, 24); g.fillStyle = '#dc2626'; g.beginPath(); g.arc(n[1] + 14, n[2] + 3, 3, 0, TAU); g.fill(); }); g.strokeStyle = '#dc2626'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(24, 13); g.lineTo(64, 17); g.lineTo(102, 11); g.moveTo(64, 17); g.lineTo(36, 57); g.lineTo(84, 59); g.stroke(); }),
    gauge: () => tex(64, 64, (g) => { g.fillStyle = '#fef3c7'; g.beginPath(); g.arc(32, 32, 30, 0, TAU); g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2; for (let i = 0; i < 9; i++) { const a = Math.PI * 0.8 + i / 8 * Math.PI * 1.4; g.beginPath(); g.moveTo(32 + Math.cos(a) * 22, 32 + Math.sin(a) * 22); g.lineTo(32 + Math.cos(a) * 28, 32 + Math.sin(a) * 28); g.stroke(); } g.fillStyle = '#dc2626'; g.fillRect(44, 40, 12, 8); g.strokeStyle = '#b91c1c'; g.lineWidth = 3; g.beginPath(); g.moveTo(32, 32); g.lineTo(50, 18); g.stroke(); }),
    map: () => tex(128, 96, (g) => { g.fillStyle = '#fef3c7'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#86efac'; g.beginPath(); g.ellipse(40, 60, 30, 20, 0, 0, TAU); g.fill(); g.fillStyle = '#93c5fd'; g.beginPath(); g.ellipse(96, 30, 20, 12, 0, 0, TAU); g.fill(); g.strokeStyle = '#111'; g.lineWidth = 3; g.setLineDash([6, 4]); g.beginPath(); g.moveTo(10, 80); g.bezierCurveTo(40, 20, 80, 90, 118, 16); g.stroke(); g.setLineDash([]); g.fillStyle = '#111'; g.fillRect(52, 46, 16, 10); g.fillStyle = '#dc2626'; g.beginPath(); g.arc(118, 16, 6, 0, TAU); g.fill(); g.fillStyle = '#f59e0b'; g.beginPath(); g.arc(10, 80, 5, 0, TAU); g.fill(); })
  };
  return (TX[k] = mk[k]());
}
function TM(k, rx, ry) { const t = T_(k).clone(); t.needsUpdate = true; if (rx) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry || rx); } return new T.MeshLambertMaterial({ map: t }); }

/* ---------------- props ---------------- */
const P = W.P;
Object.assign(P, {
  booth(g) {
    [-1.1, 1.1].forEach((x) => { B(0.62, 0.45, 1.5, VELVET, x, 0, 0, g); B(0.2, 0.7, 1.5, '#7f1030', x + Math.sign(x) * 0.28, 0.45, 0, g); B(0.24, 0.07, 1.54, BRASS, x + Math.sign(x) * 0.28, 1.15, 0, g); for (let k = -1; k <= 1; k++) S(0.04, BRASS, x + Math.sign(x) * 0.17, 0.85, k * 0.45, g); });
    C(0.1, 0.75, '#3a2a1a', 0, 0, 0, g); B(1.3, 0.06, 1.4, '#fff', 0, 0.75, 0, g); B(1.34, 0.22, 1.44, '#f8fafc', 0, 0.58, 0, g);
    C(0.18, 0.03, '#e2e8f0', -0.3, 0.81, 0.35, g); C(0.18, 0.03, '#e2e8f0', 0.3, 0.81, -0.3, g); C(0.12, 0.08, '#fde68a', -0.3, 0.84, 0.35, g); C(0.12, 0.06, '#fca5a5', 0.3, 0.84, -0.3, g);
    C(0.05, 0.3, BRASS, 0, 0.81, -0.45, g); S(0.11, MB('#ffe9a8'), 0, 1.16, -0.45, g); glow(g, 0, 1.18, -0.45, 1.1, '#ffcf70', 0.7);
    return { w: 3.0, d: 1.5 };
  },
  bar(g) {
    B(4.6, 1.0, 0.85, WOOD, 0, 0, 0, g); B(4.7, 0.08, 0.95, '#2b1408', 0, 1.0, 0, g); B(4.6, 0.06, 0.06, BRASS, 0, 0.2, 0.46, g);
    for (let i = 0; i < 5; i++) B(0.6, 0.7, 0.04, '#5a2f16', -1.8 + i * 0.9, 0.15, 0.43, g);
    B(4.4, 0.06, 0.3, DWOOD, 0, 1.6, -0.75, g); B(4.4, 0.06, 0.3, DWOOD, 0, 2.15, -0.75, g);
    const cs = ['#ec4899', '#f59e0b', '#22d3ee', '#a3e635', '#f43f5e', '#c084fc'];
    for (let r = 0; r < 2; r++) for (let i = 0; i < 10; i++) { C(0.07, 0.34, MB(cs[(i + r) % 6]), -2 + i * 0.44, 1.66 + r * 0.55, -0.75, g); }
    C(0.22, 0.4, '#e2e8f0', -1.2, 1.08, 0, g); C(0.08, 0.3, BRASS, 1.3, 1.08, 0.1, g); C(0.08, 0.3, BRASS, 1.6, 1.08, 0.1, g);
    return { w: 4.6, d: 0.85 };
  },
  galley(g) {
    B(1.1, 0.95, 2.1, '#cbd5e1', 0, 0, 0, g); B(1.14, 0.06, 2.14, '#111827', 0, 0.95, 0, g); B(0.9, 0.5, 0.04, '#111', -0.56, 0.2, 0.4, g).rotation.y = Math.PI / 2;
    C(0.28, 0.35, '#94a3b8', 0, 1.0, -0.5, g); C(0.24, 0.28, '#b45309', 0, 1.0, 0.45, g); C(0.2, 0.02, MB('#fde047'), 0, 1.29, 0.45, g);
    const st = []; for (let i = 0; i < 3; i++) { const s = glow(g, 0, 1.5, -0.5, 0.5, '#ffffff', 0.25); st.push(s); } g.userData.steam = st;
    for (let i = 0; i < 3; i++) { const pan = C(0.16, 0.04, '#c2410c', 0.45, 1.8, -0.7 + i * 0.6, g); pan.rotation.z = Math.PI / 2; }
    return { w: 1.2, d: 2.2 };
  },
  trolley(g) {
    B(1.0, 0.05, 0.6, BRASS, 0, 0.45, 0, g); B(1.0, 0.05, 0.6, BRASS, 0, 0.95, 0, g); [[-0.48, -0.28], [0.48, -0.28], [-0.48, 0.28], [0.48, 0.28]].forEach((p) => C(0.025, 0.95, BRASS, p[0], 0.05, p[1], g));
    [[-0.3, '#f9a8d4'], [0, '#fde68a'], [0.3, '#c4b5fd']].forEach((c) => { C(0.12, 0.14, '#fff', c[0], 1.0, 0, g); C(0.13, 0.05, c[1], c[0], 1.14, 0, g); S(0.035, '#dc2626', c[0], 1.22, 0, g); });
    const jel = S(0.16, MB('#22c55e', 0.8), 0.2, 0.62, 0, g); jel.scale.set(0.16, 0.14, 0.16); g.userData.jelly = jel;
    return { r: 0.6 };
  },
  coatrack(g) { C(0.05, 1.9, DWOOD, 0, 0, 0, g); C(0.25, 0.05, DWOOD, 0, 0, 0, g); for (let i = 0; i < 4; i++) { const a = i / 4 * TAU; B(0.25, 0.03, 0.03, BRASS, Math.cos(a) * 0.12, 1.75, Math.sin(a) * 0.12, g).rotation.y = -a; } B(0.42, 0.8, 0.14, '#334155', 0.15, 0.9, 0.12, g); const boa = add(G.torus, M('#f472b6'), 0, 1.6, 0, 0.18, 0.18, 2.6, g); boa.rotation.x = Math.PI / 2; C(0.16, 0.2, '#111', -0.12, 1.85, 0, g); return { r: 0.35 }; },
  bunk(g) {
    B(2.2, 0.4, 1.0, DWOOD, 0, 0, 0, g); B(2.1, 0.16, 0.92, '#e2e8f0', 0, 0.4, 0, g); B(1.4, 0.06, 0.94, '#2563eb', 0.3, 0.5, 0, g); B(0.45, 0.14, 0.6, '#fff', -0.8, 0.56, 0, g);
    B(2.2, 0.12, 1.0, DWOOD, 0, 1.45, 0, g); B(2.1, 0.12, 0.92, '#e2e8f0', 0, 1.57, 0, g); B(1.4, 0.05, 0.94, '#9f1239', 0.3, 1.65, 0, g);
    B(0.08, 1.9, 0.08, DWOOD, -1.06, 0, 0.46, g); B(0.08, 1.9, 0.08, DWOOD, 1.06, 0, 0.46, g); for (let i = 0; i < 4; i++) B(0.04, 0.04, 0.3, BRASS, 1.12, 0.35 + i * 0.35, 0.3, g);
    return { w: 2.2, d: 1.0 };
  },
  vanity(g) { B(1.1, 0.75, 0.5, '#fbcfe8', 0, 0, 0, g); B(1.12, 0.05, 0.54, '#be185d', 0, 0.75, 0, g); B(0.7, 0.8, 0.05, BRASS, 0, 0.8, -0.2, g); B(0.6, 0.7, 0.06, MB('#dbeafe'), 0, 0.85, -0.19, g); C(0.05, 0.14, MB('#f0abfc'), 0.35, 0.8, 0.1, g); C(0.05, 0.1, MB('#fde047'), 0.2, 0.8, 0.1, g); return { w: 1.1, d: 0.6 }; },
  suitcase(g) { [['#b45309', 0, 1.0], ['#0f766e', 0.4, 0.8], ['#9f1239', 0.72, 0.6]].forEach((s, i) => { B(s[2], 0.34, 0.55, s[0], 0.05 * i, s[1], 0, g); B(0.3, 0.06, 0.06, '#111', 0.05 * i, s[1] + 0.34, 0, g); B(0.16, 0.12, 0.01, ['#fde047', '#f9a8d4', '#93c5fd'][i], 0.05 * i - 0.2, s[1] + 0.12, 0.28, g); }); return { w: 1.0, d: 0.6 }; },
  trunk(g) { B(1.2, 0.6, 0.7, '#1e3a8a', 0, 0, 0, g); B(1.24, 0.06, 0.74, BRASS, 0, 0.3, 0, g); const lid = B(1.2, 0.1, 0.7, '#1e40af', 0, 0.6, -0.3, g); lid.rotation.x = -1.1; C(0.2, 0.18, '#f472b6', -0.3, 0.6, 0.05, g); C(0.3, 0.03, '#f472b6', -0.3, 0.6, 0.05, g); return { w: 1.2, d: 0.7 }; },
  writingdesk(g) { B(1.4, 0.06, 0.7, WOOD, 0, 0.75, 0, g); B(0.08, 0.75, 0.6, DWOOD, -0.62, 0, 0, g); B(0.08, 0.75, 0.6, DWOOD, 0.62, 0, 0, g); B(0.3, 0.02, 0.2, '#fff', -0.2, 0.81, 0.05, g); C(0.06, 0.3, BRASS, 0.45, 0.81, -0.15, g); S(0.1, MB('#ffe9a8'), 0.45, 1.15, -0.15, g); glow(g, 0.45, 1.15, -0.15, 0.9, '#ffcf70', 0.6); return { w: 1.4, d: 0.7 }; },
  linen(g) { B(1.2, 0.08, 0.7, '#cbd5e1', 0, 0.3, 0, g); B(1.2, 0.08, 0.7, '#cbd5e1', 0, 0.85, 0, g); [[-0.4, 0.38], [0.4, 0.38], [-0.4, 0.93], [0.4, 0.93]].forEach((p, i) => B(0.5, 0.22, 0.5, ['#fff', '#bfdbfe', '#fbcfe8', '#fff'][i], p[0], p[1], 0, g)); [[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]].forEach((p) => C(0.06, 0.06, '#111', p[0], 0, p[1], g)); return { w: 1.2, d: 0.7 }; },
  safe(g) {
    B(1.5, 1.8, 1.1, '#475569', 0, 0, 0, g); B(1.3, 1.6, 0.1, '#1f2937', 0, 0.1, 0.5, g); B(1.1, 0.06, 0.9, '#9f1239', 0, 0.8, 0.0, g);
    const door = new T.Group(); door.position.set(0.65, 0, 0.55); g.add(door); door.rotation.y = -1.9; B(1.3, 1.6, 0.14, '#64748b', -0.65, 0.1, 0.07, door); C(0.16, 0.06, '#e5e7eb', -0.65, 0.9, 0.17, door).rotation.x = Math.PI / 2; for (let i = 0; i < 3; i++) C(0.04, 0.4, '#cbd5e1', -1.0 + i * 0.35, 0.7, 0.17, door).rotation.z = Math.PI / 2;
    B(1.56, 0.1, 1.16, '#334155', 0, 1.8, 0, g); return { w: 1.5, d: 1.1 };
  },
  trunks(g) { [['#7c2d12', -0.6, 0, 1.2], ['#365314', 0.65, 0, 1.1], ['#1e3a8a', 0, 0.75, 1.3], ['#9a3412', 0.2, 1.4, 0.9]].forEach((t) => { B(t[3], 0.75, 1.2, t[0], t[1], t[2], 0, g); B(t[3] + 0.04, 0.08, 1.24, BRASS, t[1], t[2] + 0.36, 0, g); }); return { w: 2.6, d: 1.3 }; },
  mailbags(g) { for (let i = 0; i < 5; i++) { const x = -0.9 + (i % 3) * 0.9 + (i > 2 ? 0.45 : 0), y = i > 2 ? 0.95 : 0.42; const s = S(0.5, i % 2 ? '#b89a6a' : '#a88a5c', x, y, (i > 2 ? -0.15 : 0.05), g); s.scale.set(0.42, 0.45, 0.4); s.rotation.z = (i - 2) * 0.2; C(0.12, 0.14, '#7a5c34', x, y + 0.38, (i > 2 ? -0.15 : 0.05), g); } B(0.3, 0.12, 0.02, '#1d4ed8', -0.9, 0.45, 0.53, g); return { w: 2.4, d: 1.2 }; },
  cage(g) {
    C(0.08, 1.1, DWOOD, 0, 0, 0, g); C(0.4, 0.06, BRASS, 0, 1.1, 0, g); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; C(0.012, 0.9, BRASS, Math.cos(a) * 0.38, 1.15, Math.sin(a) * 0.38, g, true); }
    const dome = add(new T.SphereGeometry(1, 12, 6, 0, TAU, 0, Math.PI / 2), M(BRASS), 0, 2.05, 0, 0.4, 0.25, 0.4, g); dome.material.side = T.DoubleSide;
    const par = new T.Group(); par.position.set(0, 1.45, 0); g.add(par); S(0.13, '#16a34a', 0, 0.1, 0, par).scale.set(0.12, 0.17, 0.12); S(0.1, '#dc2626', 0, 0.3, 0.02, par); CN(0.04, 0.1, '#fde047', 0, 0.26, 0.12, par).rotation.x = Math.PI / 2; B(0.1, 0.2, 0.04, '#2563eb', 0, -0.05, -0.1, par); g.userData.parrot = par;
    return { r: 0.6 };
  },
  hatbox(g) { [[0.42, 0.4, '#f472b6'], [0.36, 0.34, '#38bdf8'], [0.28, 0.3, '#fde047']].reduce((y, h) => { C(h[0], h[1], h[2], 0, y, 0, g); C(h[0] + 0.02, 0.05, '#fff', 0, y + h[1] - 0.05, 0, g); return y + h[1]; }, 0); return { r: 0.5 }; },
  bike(g) { [-0.6, 0.6].forEach((x) => { const w = add(G.torus, M('#111'), x, 0.38, 0, 0.36, 0.36, 1.4, g); C(0.03, 0.05, '#cbd5e1', x, 0.36, 0, g).rotation.x = Math.PI / 2; g.userData.w = (g.userData.w || []).concat(w); }); B(1.1, 0.06, 0.06, '#dc2626', 0, 0.62, 0, g).rotation.z = 0.15; B(0.06, 0.5, 0.06, '#dc2626', -0.3, 0.38, 0, g); B(0.06, 0.55, 0.06, '#dc2626', 0.5, 0.45, 0, g); B(0.25, 0.05, 0.12, '#111', -0.3, 0.88, 0, g); B(0.05, 0.05, 0.5, '#cbd5e1', 0.5, 1.0, 0, g); return { w: 1.9, d: 0.5 }; },
  parcelshelf(g) { B(2.4, 0.06, 0.7, WOOD, 0, 0.6, 0, g); B(2.4, 0.06, 0.7, WOOD, 0, 1.3, 0, g); [-1.15, 1.15].forEach((x) => B(0.08, 1.6, 0.7, DWOOD, x, 0, 0, g)); for (let i = 0; i < 6; i++) { const c = ['#d6a46b', '#c08a4a', '#e8c590'][i % 3]; B(0.5, 0.35 + (i % 2) * 0.15, 0.5, c, -0.8 + (i % 3) * 0.8, i < 3 ? 0.66 : 1.36, 0, g); } return { w: 2.4, d: 0.7 }; },
  dome(g) { C(0.3, 0.5, BRASS, 0, 0, 0, g); C(0.34, 0.06, '#9f1239', 0, 0.5, 0, g); const d = add(new T.SphereGeometry(1, 16, 8, 0, TAU, 0, Math.PI / 2), MB('#cfefff', 0.32), 0.62, 0.32, 0.2, 0.36, 0.42, 0.36, g); d.rotation.z = -1.4; d.material.side = T.DoubleSide; d.renderOrder = 3; for (let i = 0; i < 6; i++) S(0.025, MB('#ffd23f'), -0.3 + i * 0.12, 0.02, 0.35 + Math.sin(i) * 0.1, g); return { r: 0.55 }; },
  coal(g) { const geo = new T.IcosahedronGeometry(1, 0), cm = [M('#16171d'), M('#23252e'), M('#0f1014')]; for (let i = 0; i < 70; i++) { const fx = ((i * 37) % 70) / 70, fz = ((i * 53) % 70) / 70, x = -2.7 + fx * 5.4, z = -1.45 + fz * 2.9, hgt = 0.55 + (1 - Math.abs(x) / 3) * 0.55 * (1 - Math.abs(z) / 1.6); const s = add(geo, cm[i % 3], x, hgt, z, 0.22 + (i % 4) * 0.05, 0.18 + (i % 3) * 0.05, 0.22, g); s.rotation.set(i, i * 0.7, i * 1.3); } B(6, 0.5, 3.4, '#14151a', 0, 0, 0, g); const sh = B(0.08, 1.2, 0.08, '#78350f', 2.4, 0.6, 1.3, g); sh.rotation.z = 0.5; B(0.36, 0.04, 0.4, '#6b7280', 2.75, 0.45, 1.3, g); return { w: 6, d: 3.4 }; },
  toolbox(g) { B(1.0, 0.45, 0.5, '#dc2626', 0, 0, 0, g); B(0.6, 0.06, 0.06, '#111', 0, 0.55, 0, g); B(0.06, 0.1, 0.06, '#111', -0.3, 0.45, 0, g); B(0.06, 0.1, 0.06, '#111', 0.3, 0.45, 0, g); C(0.06, 0.3, '#94a3b8', 0.6, 0, 0.1, g); return { w: 1.0, d: 0.5 }; },
  whistle(g) { B(0.08, 3.0, 0.08, '#374151', 0, 0, 0, g); B(0.06, 0.06, 1.8, '#374151', 0, 2.95, 0.8, g); const cord = B(0.02, 1.4, 0.02, '#fde68a', 0, 1.55, 1.6, g); C(0.06, 0.12, '#dc2626', 0, 1.45, 1.6, g); C(0.12, 0.4, BRASS, 0, 2.6, 0, g); g.userData.cord = cord; return { r: 0.3 }; },
  gauges(g) { B(1.0, 1.6, 0.3, '#1f2937', 0, 0.6, 0, g); const gm = new T.MeshBasicMaterial({ map: T_('gauge') }); [[-0.25, 1.75], [0.25, 1.75], [0, 1.2]].forEach((p) => { C(0.2, 0.06, BRASS, p[0], p[1], 0.16, g).rotation.x = Math.PI / 2; const f = add(G.plane, gm, p[0], p[1], 0.2, 0.34, 0.34, 1, g); }); return { w: 1.0, d: 0.4 }; },
  firebox(g) {
    B(1.0, 2.6, 2.6, '#111827', 0, 0, 0, g); const fire = B(0.06, 0.6, 0.9, MB('#ff7a18'), -0.52, 0.5, 0, g); B(0.1, 0.8, 1.1, '#374151', -0.5, 0.4, 0, g).position.y = 0.8; fire.position.y = 0.8;
    const fg = glow(g, -0.7, 0.85, 0, 2.2, '#ff8a2a', 0.9); g.userData.fire = [fire, fg];
    for (let i = 0; i < 4; i++) { const p = C(0.05, 1.8, BRASS, -0.55, 0.9, -1.0 + i * 0.66, g); }
    B(0.12, 0.12, 2.4, BRASS, -0.55, 2.0, 0, g);
    return { w: 1.0, d: 2.6 };
  },
  levers(g) { B(1.2, 0.8, 0.7, '#374151', 0, 0, 0, g); [-0.3, 0.1, 0.4].forEach((x, i) => { const l = B(0.06, 0.9, 0.06, i === 1 ? '#dc2626' : BRASS, x, 0.8, 0, g); l.rotation.z = (i - 1) * 0.3; S(0.08, i === 1 ? '#dc2626' : '#111', x + Math.sin((i - 1) * 0.3) * -0.9, 1.7, 0, g); }); const wh = add(G.torus, M(BRASS), -0.55, 1.1, 0, 0.3, 0.3, 1, g); wh.rotation.y = Math.PI / 2; return { w: 1.2, d: 0.7 }; },
  telescope(g) { [0, 2.1, 4.2].forEach((a) => { const l = B(0.05, 1.2, 0.05, DWOOD, Math.cos(a) * 0.25, 0, Math.sin(a) * 0.25, g); l.rotation.set(Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25); }); const tb = C(0.1, 1.2, BRASS, 0, 0, 0, g); tb.position.set(0.1, 1.45, -0.1); tb.rotation.set(0.6, 0, -0.9); C(0.14, 0.12, '#111', 0, 0, 0, g).position.set(0.58, 1.78, -0.4); return { r: 0.45 }; },
  sofa(g) { B(2.8, 0.45, 0.95, '#6d28d9', 0, 0, 0, g); B(2.8, 0.75, 0.25, '#5b21b6', 0, 0.45, -0.36, g); B(0.25, 0.65, 0.95, '#5b21b6', -1.3, 0.2, 0, g); B(0.25, 0.65, 0.95, '#5b21b6', 1.3, 0.2, 0, g); B(0.5, 0.4, 0.15, '#fde047', -0.7, 0.55, -0.15, g).rotation.z = 0.2; B(0.5, 0.4, 0.15, '#f9a8d4', 0.7, 0.55, -0.15, g).rotation.z = -0.2; return { w: 2.8, d: 0.95 }; },
  armchair(g) { B(1.0, 0.45, 0.95, '#be123c', 0, 0, 0, g); B(1.0, 0.8, 0.25, '#9f1239', 0, 0.45, -0.36, g); B(0.2, 0.55, 0.95, '#9f1239', -0.45, 0.25, 0, g); B(0.2, 0.55, 0.95, '#9f1239', 0.45, 0.25, 0, g); B(0.7, 0.04, 0.6, '#fde68a', 0, 0.47, 0.1, g); return { w: 1.0, d: 0.95 }; },
  coffeetable(g) { C(0.6, 0.06, WOOD, 0, 0.45, 0, g); C(0.08, 0.45, DWOOD, 0, 0, 0, g); C(0.12, 0.14, '#fff', -0.2, 0.51, 0, g); C(0.07, 0.06, '#fff', 0.15, 0.51, 0.2, g); B(0.4, 0.02, 0.3, '#93c5fd', 0.2, 0.51, -0.15, g); return { r: 0.65 }; },
  gramophone(g) { B(0.6, 0.6, 0.6, WOOD, 0, 0, 0, g); C(0.26, 0.03, '#111', 0, 0.6, 0, g); const h = CN(0.35, 0.7, BRASS, 0.15, 0.7, -0.1, g); h.rotation.z = -0.9; h.position.set(0.35, 1.0, -0.1); B(0.04, 0.4, 0.04, BRASS, 0.12, 0.6, -0.1, g); return { r: 0.45 }; },
  routemap(g) { B(0.06, 1.6, 0.06, DWOOD, -0.45, 0, 0, g); B(0.06, 1.6, 0.06, DWOOD, 0.45, 0, 0, g); add(G.box, new T.MeshLambertMaterial({ map: T_('map') }), 0, 1.45, 0.04, 1.2, 0.9, 0.04, g); B(1.28, 0.98, 0.03, BRASS, 0, 1.45, 0.01, g); return { w: 1.2, d: 0.4 }; }
});

/* ---------------- shells ---------------- */
function windowsWall(g, z, opts) {
  // north wall with a row of windows (frames + glass + curtains); opts.low = lower panel height
  const low = opts.low || 1.0, top = opts.top || 2.3, H = opts.h || 3.0, n = opts.n || 8, ww = opts.ww || 2.1, x0 = -12, span = 24;
  const pm = opts.mat || TM('panel', 6, 1);
  add(G.box, pm, 0, low / 2, z, span, low, 0.3, g); add(G.box, M(opts.upper || '#5a2f16'), 0, top + (H - top) / 2, z, span, H - top, 0.3, g);
  B(span, 0.07, 0.36, BRASS, 0, low, z, g); B(span, 0.07, 0.36, BRASS, 0, H, z, g);
  const step = span / n, glass = MB('#7fa8d8', 0.18);
  for (let i = 0; i <= n; i++) { const x = x0 + i * step; B(step - ww, top - low, 0.32, opts.upper || '#5a2f16', Math.max(-12 + (step - ww) / 2, Math.min(12 - (step - ww) / 2, x)), low, z, g); }
  for (let i = 0; i < n; i++) {
    const cx = x0 + step / 2 + i * step;
    const gl = add(G.box, glass, cx, (low + top) / 2, z, ww, top - low, 0.04, g); gl.renderOrder = 2;
    if (opts.curtain) { B(0.32, top - low + 0.1, 0.1, opts.curtain, cx - ww / 2 + 0.14, low - 0.05, z + 0.2, g); B(0.32, top - low + 0.1, 0.1, opts.curtain, cx + ww / 2 - 0.14, low - 0.05, z + 0.2, g); B(ww, 0.16, 0.1, opts.curtain, cx, top - 0.12, z + 0.2, g); }
    if (opts.sconce && i % 2 === 1) { const sx = cx + step / 2; B(0.1, 0.3, 0.12, BRASS, sx, 1.75, z + 0.2, g); S(0.11, MB('#fff1c4'), sx, 2.02, z + 0.26, g); glow(g, sx, 2.02, z + 0.35, 1.5, '#ffc46b', 0.75); }
  }
}
function endWalls(g, A, col) {
  const dz = A.doorZ || 0, H = 3.0;
  [-12.15, 12.15].forEach((x) => {
    const side = x < 0 ? 'w' : 'e', open = A.doors && A.doors[side];
    const z0 = -4.15, z1 = 4.15;
    if (!open) { B(0.3, H, z1 - z0, col, x, 0, 0, g); return; }
    B(0.3, H, dz - 0.85 - z0, col, x, 0, (z0 + dz - 0.85) / 2, g); B(0.3, H, z1 - (dz + 0.85), col, x, 0, (dz + 0.85 + z1) / 2, g); B(0.3, 0.6, 1.7, col, x, 2.4, dz, g);
    B(0.36, 0.1, 1.9, BRASS, x, 2.4, dz, g); B(0.36, 2.4, 0.1, BRASS, x, 0, dz - 0.9, g); B(0.36, 2.4, 0.1, BRASS, x, 0, dz + 0.9, g);
    const dr = B(0.08, 2.35, 0.95, '#3f2a1a', x + (x < 0 ? -0.08 : 0.08), 0, dz - 1.25, g); B(0.1, 0.8, 0.6, MB('#7fa8d8', 0.4), x + (x < 0 ? -0.08 : 0.08), 1.2, dz - 1.25, g);
  });
}
function exterior(g, A, id, body) {
  // car underside, wheels on the camera side, couplings, moving night scenery
  const ex = EXA[id] = { scen: [], tex: [], wheels: [], t: Math.random() * 10 };
  B(24.6, 0.25, 8.6, '#1f1a24', 0, -0.25, 0, g);
  B(24.6, 0.9, 0.18, body, 0, -1.0, 4.25, g); B(24.6, 0.12, 0.2, BRASS, 0, -0.32, 4.27, g);
  [-8.2, -6.6, 6.6, 8.2].forEach((x) => { const w = new T.Group(); w.position.set(x, -0.95, 4.42); g.add(w); const r = C(0.62, 0.16, '#2b2b33', 0, -0.08, 0, w); r.rotation.x = Math.PI / 2; const hub = C(0.2, 0.2, '#9ca3af', 0, -0.1, 0.02, w); hub.rotation.x = Math.PI / 2; const sp = B(1.1, 0.12, 0.06, '#9ca3af', 0, -0.06, 0.1, w); ex.wheels.push(w); });
  B(17.2, 0.1, 0.08, '#9ca3af', 0, -0.95, 4.56, g);
  // ground + ballast (scrolling textures)
  const gm = TM('grass', 18, 9); gm.color = new T.Color('#b8c8ff'); const gr = plane(g, 140, 70, gm, 0, -1.5, 0); ex.tex.push([gm.map, 140 / 18]);
  const bm = TM('gravel', 40, 1); plane(g, 140, 2.6, bm, 0, -1.46, 5.3); ex.tex.push([bm.map, 140 / 40]);
  const bm3 = TM('gravel', 40, 1); plane(g, 140, 2.6, bm3, 0, -1.46, -5.3); ex.tex.push([bm3.map, 140 / 40]);
  const bm2 = TM('ballast', 40, 1); plane(g, 140, 3.4, bm2, 0, -1.45, -12.5); ex.tex.push([bm2.map, 140 / 40]);
  // scenery that rushes by
  const sc = new T.Group(); sc.position.y = -1.5; g.add(sc);
  const treeM1 = M('#14532d'), treeM2 = M('#166534'), trunk = M('#3f2a1a'), pole = M('#3b2a20');
  for (let i = 0; i < 26; i++) {
    const o = new T.Group(), north = i % 2 === 0, z = north ? -(10 + (i * 7) % 18) : (10.5 + (i * 5) % 12), x = -50 + i * 3.9 + ((i * 13) % 5);
    o.position.set(x, 0, z); sc.add(o);
    const k = i % 5;
    if (k === 0 || k === 2) { C(0.25, 1.2, trunk, 0, 0, 0, o, true); CN(1.4, 2.4, '#14532d', 0, 1.0, 0, o); CN(1.05, 2.0, '#166534', 0, 2.2, 0, o); }
    else if (k === 1) { S(1.1, '#1e4d3a', 0, 0.6, 0, o).scale.set(1.3, 0.8, 1.1); S(0.8, '#245c45', 0.9, 0.5, 0.3, o); }
    else if (k === 3) { B(2.4, 1.8, 2, '#3b3355', 0, 0, 0, o); const rf = add(G.cone, M('#6b2140'), 0, 2.5, 0, 1.9, 1.4, 1.6, o); rf.geometry = new T.ConeGeometry(1, 1, 4); rf.rotation.y = Math.PI / 4; B(0.5, 0.5, 0.05, MB('#ffd27a'), -0.5, 0.8, 1.02, o); B(0.5, 0.5, 0.05, MB('#ffd27a'), 0.5, 0.8, 1.02, o); glow(o, 0, 1.0, 1.6, 2.6, '#ffb84d', 0.45); }
    else { S(0.6, '#4b5563', 0, 0.25, 0, o).scale.set(0.8, 0.45, 0.7); S(0.4, '#6b7280', 0.6, 0.2, 0.2, o); }
    ex.scen.push(o);
  }
  for (let i = 0; i < 9; i++) { const o = new T.Group(); o.position.set(-45 + i * 10, 0, -6.8); sc.add(o); C(0.09, 4.2, pole, 0, 0, 0, o, true); B(1.4, 0.1, 0.1, pole, 0, 3.9, 0, o); ex.scen.push(o); }
  for (let i = 0; i < 9; i++) { const f = glow(sc, -45 + i * 10.5, 1 + (i % 3) * 0.5, (i % 2 ? 9 : -9) + (i % 3), 0.5, '#d9ff6b', 0.8); f.userData.ff = i; ex.scen.push(f); }
  ex.body = g;
  return ex;
}
function floor(g, k, rx, ry) { const m = TM(k, rx, ry); const f = plane(g, 24, 8, m, 0, 0.0, 0); f.userData.ground = true; return f; }
function strip(g, k, x0, x1, z0, z1, rx, ry) { const m = TM(k, rx, ry); const f = plane(g, x1 - x0, z1 - z0, m, (x0 + x1) / 2, 0.012, (z0 + z1) / 2); f.userData.ground = true; return f; }
function lowSouth(g, col) { B(24.3, 0.55, 0.3, col, 0, 0, 4.15, g); B(24.3, 0.06, 0.34, BRASS, 0, 0.55, 4.15, g); }
function sign(g, text, x, y, z, bg) { const s = W.textSprite(text, { size: 34, h: 0.42, bg: bg || 'rgba(74,40,20,.92)', border: '#d4a017' }); s.position.set(x, y, z); s.material.depthTest = true; g.add(s); return s; }

W.buildTrain = function (id, g, cols, box) {
  const A = GD.AREAS[id];
  if (id === 'tr_dining') {
    floor(g, 'carpet', 12, 4); strip(g, 'runner', -11.6, 11.6, -1.6, 0.6, 12, 1);
    windowsWall(g, -4.15, { curtain: '#be123c', sconce: true }); endWalls(g, A, '#5a2f16'); lowSouth(g, '#5a2f16'); exterior(g, A, id, '#7f1d1d');
    sign(g, 'DINING CAR', 0, 3.25, -4.0);
    for (let i = 0; i < 3; i++) { const x = -6 + i * 6; B(0.6, 0.04, 0.6, BRASS, x, 3.0, -1.2, g); }
  } else if (id === 'tr_sleeper') {
    floor(g, 'parquet', 8, 3); strip(g, 'runner', -11.6, 11.6, 0.6, 2.9, 12, 1);
    windowsWall(g, -4.15, { curtain: '#1e40af', sconce: false, n: 8 }); endWalls(g, A, '#3f2a1a'); lowSouth(g, '#3f2a1a'); exterior(g, A, id, '#1e3a8a');
    (A.walls || []).forEach((w) => { const tall = w[3] - w[2] > 1; const h = tall ? 2.4 : 1.0; B(w[1] - w[0], h, w[3] - w[2], tall ? '#5a3a22' : '#6b4226', (w[0] + w[1]) / 2, 0, (w[2] + w[3]) / 2, g); B(w[1] - w[0] + 0.04, 0.06, w[3] - w[2] + 0.04, BRASS, (w[0] + w[1]) / 2, h, (w[2] + w[3]) / 2, g); if (!tall) { const gl = add(G.box, MB('#9cc3ee', 0.16), (w[0] + w[1]) / 2, 1.6, (w[2] + w[3]) / 2, w[1] - w[0], 1.2, 0.04, g); gl.renderOrder = 2; } box(w[0], w[1], w[2], w[3]); });
    [-9, -3, 3, 9].forEach((cx, i) => { sign(g, 'CABIN ' + (i + 1), cx, 0.25, 0.6, 'rgba(30,58,138,.9)'); S(0.12, MB('#fff1c4'), cx + 1.6, 2.3, -3.8, g); glow(g, cx + 1.6, 2.3, -3.6, 1.6, '#ffc46b', 0.7); });
    sign(g, 'SLEEPER CAR', 0, 3.25, -4.0);
  } else if (id === 'tr_luggage') {
    floor(g, 'planks', 10, 3);
    windowsWall(g, -4.15, { low: 1.7, top: 2.4, n: 6, ww: 1.2, mat: TM('planks', 8, 1), upper: '#6b4a2a' }); endWalls(g, A, '#6b4a2a'); lowSouth(g, '#6b4a2a'); exterior(g, A, id, '#78350f');
    B(3.2, 2.4, 0.1, '#5a3a20', -0.2, 0.0, -3.98, g); for (let i = 0; i < 3; i++) B(3.2, 0.08, 0.14, '#3a2414', -0.2, 0.4 + i * 0.8, -3.94, g);
    [-6, 0, 6].forEach((x) => { S(0.16, MB('#fff1c4'), x, 2.85, -1.0, g); glow(g, x, 2.85, -1.0, 2.6, '#ffd27a', 0.55); C(0.02, 0.4, '#111', x, 2.9, -1.0, g); });
    sign(g, 'LUGGAGE CAR \u00b7 STAFF ONLY', 0, 3.25, -4.0, 'rgba(153,27,27,.92)');
  } else if (id === 'tr_engine') {
    floor(g, 'steel', 10, 3);
    // tender sides + cab walls
    B(9, 1.3, 0.3, '#1f2937', -7.5, 0, -4.15, g); B(9, 0.1, 0.36, '#dc2626', -7.5, 1.3, -4.15, g);
    B(10, 2.9, 0.3, '#1f2937', 2, 0, -4.15, g); B(1.5, 1.0, 0.32, MB('#ffb35a', 0.5), 0, 1.4, -4.15, g); B(1.5, 1.0, 0.32, MB('#7fa8d8', 0.3), 4.0, 1.4, -4.15, g);
    B(10, 0.12, 0.36, '#dc2626', 2, 2.9, -4.15, g);
    B(0.3, 3.0, 8.3, '#1f2937', 7.1, 0, 0, g);
    endWalls(g, A, '#1f2937'); lowSouth(g, '#1f2937'); exterior(g, A, id, '#111827');
    // the boiler outside the cab, with smokestack + puffs
    const bo = C(2.2, 8, '#1f2937', 11.4, 0.6, 0, g); bo.rotation.z = Math.PI / 2; bo.position.set(11.4, 2.0, 0);
    for (let i = 0; i < 4; i++) { const band = C(2.24, 0.14, BRASS, 8.4 + i * 2, 2.0, 0, g); band.rotation.z = Math.PI / 2; band.position.set(8.4 + i * 2, 2.0, 0); }
    C(0.55, 1.6, '#111', 12.2, 4.0, 0, g); C(0.75, 0.3, '#111', 12.2, 5.5, 0, g); S(0.6, BRASS, 9.6, 4.25, 0, g).scale.set(0.6, 0.45, 0.6);
    B(2.6, 0.5, 4.6, '#dc2626', 15.2, -0.6, 0, g); S(0.4, MB('#fff7c2'), 15.6, 2.0, 0, g); glow(g, 16.0, 2.0, 0, 3.4, '#fff1a8', 0.8);
    const ex = EXA[id]; ex.smoke = []; for (let i = 0; i < 8; i++) { const s = S(0.5, MB('#cbd5e1', 0.55), 12.2, 6, 0, g); s.userData.ph = i / 8; ex.smoke.push(s); }
    S(0.13, MB('#fff1c4'), -1.0, 2.6, -3.7, g); glow(g, -1.0, 2.6, -3.5, 2.0, '#ffc46b', 0.7);
    sign(g, 'ENGINE \u00b7 STAFF ONLY', 1.5, 3.3, -4.0, 'rgba(153,27,27,.92)');
  } else if (id === 'tr_obs') {
    floor(g, 'carpet', 12, 4); strip(g, 'planks', -12, -9, -4, 4, 2, 3);
    windowsWall(g, -4.15, { low: 0.7, top: 2.8, h: 3.0, n: 6, ww: 3.4, curtain: null, upper: '#3b1d5a', mat: M('#4c1d95') });
    B(24.3, 0.7, 0.3, '#3b1d5a', 0, 0, 4.15, g); B(24.3, 0.06, 0.34, BRASS, 0, 0.7, 4.15, g);
    endWalls(g, A, '#3b1d5a'); exterior(g, A, id, '#4c1d95');
    // rear balcony railing + glass door wall
    B(0.12, 1.0, 8.3, BRASS, -12.25, 0, 0, g); for (let z = -3.8; z <= 3.8; z += 0.6) C(0.03, 1.0, BRASS, -12.25, 0, z, g, true);
    B(0.12, 2.6, 3.2, MB('#9cc3ee', 0.18), -9, 0, -2.4, g); B(0.12, 2.6, 3.2, MB('#9cc3ee', 0.18), -9, 0, 2.4, g); B(0.16, 0.08, 8.0, BRASS, -9, 2.6, 0, g);
    box(-9.08, -8.92, -4, -0.8); box(-9.08, -8.92, 0.8, 4);
    [-6, 0, 6].forEach((x) => { S(0.14, MB('#e9d5ff'), x, 2.8, 0, g); glow(g, x, 2.8, 0, 2.2, '#c4b5fd', 0.6); });
    sign(g, 'OBSERVATION CAR', 1.5, 3.3, -4.0, 'rgba(76,29,149,.92)');
    // moon low over the hills, seen through the glass
    const moon = S(1.6, MB('#fff6d6'), -2, 2.5, -16, g); glow(g, -2, 2.5, -15.6, 9, '#fff1c4', 0.5);
  }
};

/* doors between cars + the corkboard */
W.trainDoors = function (id, g, cols, hots) {
  const A = GD.AREAS[id], dz = A.doorZ || 0;
  ['w', 'e'].forEach((side) => {
    const to = A.doors[side]; if (!to) return;
    const x = side === 'w' ? -11.35 : 11.35, dg = new T.Group(); dg.position.set(x, 0, dz); g.add(dg);
    const mat = new T.MeshBasicMaterial({ color: '#ffe9a8', transparent: true, opacity: 0.0 }); add(G.box, mat, 0, 1.2, 0, 0.6, 2.4, 1.5, dg);
    const T2 = GD.AREAS[to], lbl = (side === 'w' ? '\u2190 ' : '') + T2.short + (side === 'e' ? ' \u2192' : '');
    sign(g, lbl, x + (side === 'w' ? 0.5 : -0.5), 2.85, dz, T2.staff ? 'rgba(153,27,27,.92)' : 'rgba(30,58,138,.92)');
    const h = { id: 'door_' + side, name: 'Door to the ' + T2.name, kind: 'door', to, side, x, z: dz, reach: 1.8, g: dg, h: 2.4 };
    W.tagHot(h); W.addMarker(h, 'sign', g); hots.push(h);
  });
  if (id === 'tr_dining') {
    const cg = new T.Group(); cg.position.set(4.7, 0, -3.45); g.add(cg);
    B(0.08, 1.9, 0.08, DWOOD, -0.6, 0, 0.1, cg); B(0.08, 1.9, 0.08, DWOOD, 0.6, 0, 0.1, cg);
    add(G.box, new T.MeshLambertMaterial({ map: T_('cork') }), 0, 1.45, 0.14, 1.5, 1.1, 0.06, cg); B(1.6, 1.2, 0.05, DWOOD, 0, 0.85, 0.1, cg);
    cols.push({ c: 1, x: 4.7, z: -3.45, r: 0.5 });
    const h = { id: 'corkboard', name: 'Clue Corkboard', kind: 'cork', x: 4.7, z: -3.45, reach: 1.9, g: cg, h: 2.4 };
    W.tagHot(h); W.addMarker(h, 'sign', g); hots.push(h);
  }
};

/* per-frame: scenery rushing by, wheels, sway, fire, smoke, steam */
const SPEED = 13;
W.trainTick = function (dt, a) {
  const ex = EXA[a.id]; if (!ex) return; ex.t += dt; const t = ex.t;
  ex.scen.forEach((o) => { o.position.x -= SPEED * dt; if (o.position.x < -50) o.position.x += 100; if (o.userData.ff != null) o.position.y = 1 + Math.sin(t * 2 + o.userData.ff) * 0.4; });
  ex.tex.forEach((p) => { p[0].offset.x = (p[0].offset.x + SPEED * dt / p[1]) % 1; });
  ex.wheels.forEach((w) => { w.rotation.z -= dt * SPEED / 0.62; });
  a.g.rotation.z = Math.sin(t * 1.6) * 0.0025; a.g.position.y = Math.abs(Math.sin(t * 2.9)) * 0.012;
  if (ex.smoke) ex.smoke.forEach((s) => { const p = (s.userData.ph + t * 0.45) % 1; s.position.set(12.2 - p * 7, 5.6 + p * 3, Math.sin(p * 6 + s.userData.ph * 9) * 0.6); const k = 0.4 + p * 1.4; s.scale.set(k, k, k); s.material.opacity = 0.55 * (1 - p); });
  a.hots.forEach((h) => {
    const u = h.g && h.g.userData; if (!u) return;
    if (u.fire) { const f = 0.75 + Math.sin(t * 17) * 0.12 + Math.sin(t * 7.3) * 0.1; u.fire[1].material.opacity = f; u.fire[1].scale.set(2.2 * f, 2.2 * f, 1); }
    if (u.steam) u.steam.forEach((s, i) => { const p = (t * 0.6 + i / 3) % 1; s.position.y = 1.4 + p * 1.2; s.material.opacity = 0.3 * (1 - p); const k = 0.4 + p * 0.6; s.scale.set(k, k, 1); });
    if (u.jelly) { const k = 1 + Math.sin(t * 9) * 0.06; u.jelly.scale.set(0.16 * k, 0.14 / k, 0.16 * k); }
    if (u.parrot) { u.parrot.rotation.y = Math.sin(t * 0.9) * 0.8; u.parrot.position.y = 1.45 + Math.abs(Math.sin(t * 2.2)) * 0.04; }
    if (u.cord) u.cord.rotation.x = Math.sin(t * 2.4) * 0.05;
  });
};
})();
