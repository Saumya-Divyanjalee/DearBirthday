/* ===== SECURITY: HTML ESCAPE ===== */
function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"'`]/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;'
    }[m]));
}
function safeText(el, str) { if (el) el.textContent = str || ''; }
function safePreWrap(el, str) { if (el) { el.textContent = str || ''; el.style.whiteSpace = 'pre-wrap'; } }

/* ===== PERFORMANCE DETECTION ===== */
(function () {
    const start = performance.now();
    let sum = 0;
    for (let i = 0; i < 500000; i++) sum += Math.sqrt(i);
    const dur = performance.now() - start;
    if (dur > 80 || navigator.hardwareConcurrency <= 2) {
        document.body.classList.add('perf-reduce');
        window._perfMode = true;
    }
})();

/* ===== THEME & GENDER ===== */
let gender = 'pink';
let currentTheme = 'pink';

function pickTheme(t) {
    currentTheme = t;
    document.body.className = t;
    gender = (t === 'blue') ? 'blue' : t;
    document.querySelectorAll('.theme-opt').forEach(o => {
        o.classList.toggle('active', o.dataset.theme === t);
    });
}

function setGender(g) {
    if (g === 'blue' && currentTheme === 'pink') pickTheme('blue');
    else if (g === 'pink' && currentTheme === 'blue') pickTheme('pink');
    gender = g === 'blue' ? 'blue' : currentTheme;
    clearLoader();
    document.getElementById('genderPage').style.display = 'none';
    document.getElementById('formPage').style.display = 'block';
    applyThemeDecos();
}

function applyThemeDecos() {
    const isMale = gender === 'blue';
    const d3 = document.getElementById('deco3');
    const d4 = document.getElementById('deco4');
    if (d3) d3.textContent = isMale ? '⭐' : '🌸';
    if (d4) d4.textContent = isMale ? '🎮' : '⭐';
    const ldIcon = document.getElementById('ldIcon');
    if (ldIcon) ldIcon.textContent = '🎂';
    const rvHearts = document.getElementById('rvHearts');
    if (rvHearts) rvHearts.textContent = isMale ? '⭐ \u00a0 🎂 \u00a0 ⭐' : '🌸 \u00a0 🎂 \u00a0 🌸';
}

/* ===== LOADING ===== */
function clearLoader() {
    const loader = document.getElementById('loadingScreen');
    if (loader && !loader.classList.contains('hidden')) loader.classList.add('hidden');
}
window.addEventListener('load', () => setTimeout(clearLoader, 900));
setTimeout(clearLoader, 2500);

/* ===== CHAR COUNT ===== */
const pMsg = document.getElementById('pMsg');
const charOut = document.getElementById('charOut');
const charLeft = document.getElementById('charLeft');
const charCount = document.getElementById('charCount');
const MAX_CHARS = 600;
if (pMsg) {
    pMsg.addEventListener('input', () => {
        const len = pMsg.value.length;
        const remaining = MAX_CHARS - len;
        if (charOut) charOut.textContent = len;
        if (charLeft) charLeft.textContent = remaining + ' left';
        if (charCount) {
            charCount.classList.toggle('warn', len > 400 && len <= 520);
            charCount.classList.toggle('limit', len > 520);
        }
    });
}

/* ===== IMAGE COMPRESSION ===== */
/**
 * FIX #1: Compress image before storing as photoDataURL.
 * This makes share URLs possible (smaller base64 = shorter URL).
 * Max size: 400px wide, JPEG quality 0.6
 */
function compressImage(dataURL, callback) {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_W = 400;
        const ratio = img.height / img.width;
        canvas.width = Math.min(img.width, MAX_W);
        canvas.height = canvas.width * ratio;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => callback(dataURL); // fallback: use original
    img.src = dataURL;
}

/* ===== PHOTO UPLOAD ===== */
let photoDataURL = null;
const photoInput = document.getElementById('photoInput');
const photoPreview = document.getElementById('photoPreview');
const photoImg = document.getElementById('photoImg');
const photoRemove = document.getElementById('photoRemove');
const envLetterPreview = document.getElementById('envLetterPreview');
const envLetterIcon = document.getElementById('envLetterIcon');

if (photoInput) {
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { showToast('⚠ Please choose an image file'); return; }
        if (file.size > 2 * 1024 * 1024) { showToast('⚠ Image too large — max 2 MB. Try compressing it first.'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
            // FIX #1: Compress before storing
            compressImage(ev.target.result, (compressed) => {
                photoDataURL = compressed;
                if (photoImg) photoImg.src = photoDataURL;
                if (photoPreview) photoPreview.style.display = 'block';
                const photoDrop = document.getElementById('photoDrop');
                if (photoDrop) photoDrop.style.display = 'none';
            });
        };
        reader.readAsDataURL(file);
    });
}

if (photoRemove) {
    photoRemove.addEventListener('click', () => {
        photoDataURL = null;
        if (photoImg) photoImg.src = '';
        if (photoInput) photoInput.value = '';
        if (photoPreview) photoPreview.style.display = 'none';
        const photoDrop = document.getElementById('photoDrop');
        if (photoDrop) photoDrop.style.display = 'block';
    });
}

/* ===== PETALS ===== */
const pc = document.getElementById('petalCanvas');
const px = pc ? pc.getContext('2d') : null;
let PW, PH, petals = [];

function prsz() {
    if (!pc) return;
    PW = pc.width = innerWidth;
    PH = pc.height = innerHeight;
}
if (pc) { prsz(); addEventListener('resize', prsz); }

function getTypes() {
    const t = currentTheme;
    if (t === 'blue') return ['⭐', '❄️', '✦', '🎁'];
    if (t === 'gold') return ['⭐', '✦', '🌟', '🎁'];
    if (t === 'purple') return ['✦', '💜', '🌙', '⭐'];
    if (t === 'neon') return ['✦', '💚', '⚡', '🌟'];
    if (t === 'minimal') return ['✦', '·', '◆', '○'];
    return ['🌸', '✦', '💕', '🎀'];
}

const petalCount = window._perfMode ? 20 : 38;
for (let i = 0; i < petalCount; i++) {
    petals.push({
        x: Math.random() * innerWidth, y: Math.random() * innerHeight,
        sz: Math.random() * 11 + 4, sp: Math.random() * .35 + .08,
        dx: (Math.random() - .5) * .25, rot: Math.random() * 360,
        rs: (Math.random() - .5) * .55, a: Math.random() * .15 + .03,
        ti: Math.floor(Math.random() * 4)
    });
}

function pLoop() {
    if (!px) return;
    px.clearRect(0, 0, PW, PH);
    const types = getTypes();
    petals.forEach(p => {
        px.save(); px.globalAlpha = p.a; px.translate(p.x + p.sz / 2, p.y + p.sz / 2); px.rotate(p.rot * Math.PI / 180);
        px.font = `${p.sz * 1.8}px serif`; px.textAlign = 'center'; px.textBaseline = 'middle';
        px.fillText(types[p.ti % types.length], 0, 0);
        px.restore(); p.y += p.sp; p.x += p.dx; p.rot += p.rs;
        if (p.y > PH + 30) { p.y = -30; p.x = Math.random() * PW; }
    });
    requestAnimationFrame(pLoop);
}
if (px) pLoop();

/* ===== CONFETTI ===== */
const rc2 = document.getElementById('rvCanvas');
const rx = rc2 ? rc2.getContext('2d') : null;
let RW, RH, rps = [], rActive = false, lastB = 0;

function rvsz() {
    if (!rc2) return;
    RW = rc2.width = innerWidth;
    RH = rc2.height = innerHeight;
}
if (rc2) { rvsz(); addEventListener('resize', rvsz); }

class RP {
    constructor(x, y, big) {
        const a = Math.random() * Math.PI * 2, sp = big ? (Math.random() * 15 + 5) : (Math.random() * 8 + 2);
        this.x = x; this.y = y; this.vx = Math.cos(a) * sp; this.vy = Math.sin(a) * sp - (big ? 8 : 3);
        this.g = big ? .12 : .08; this.sz = Math.random() * (big ? 26 : 14) + 4;
        this.alpha = 1; this.fade = Math.random() * .009 + .003; this.t = Math.floor(Math.random() * 3);
        const t = currentTheme;
        const colMap = {
            pink: ['#ff69b4', '#ff1493', '#ffb6d9', '#ffd700', '#ff9ec0', '#e8b030'],
            blue: ['#5ab4e8', '#7ecfff', '#1a6fd4', '#b0e6ff', '#ffd700', '#87ceeb'],
            gold: ['#ffd700', '#f0c040', '#b07800', '#ffe880', '#fff0a0', '#c8900a'],
            purple: ['#b060ff', '#7b00d4', '#d4a8ff', '#ead4ff', '#c088ff', '#ffd700'],
            neon: ['#00ff88', '#00ffcc', '#00e070', '#80ffcc', '#ffd700', '#00ff44'],
            minimal: ['#888', '#aaa', '#ccc', '#666', '#fff', '#ddd']
        };
        const cols = colMap[t] || colMap.pink;
        this.col = cols[Math.floor(Math.random() * cols.length)];
        this.rot = Math.random() * 360; this.rs = (Math.random() - .5) * 5;
    }
    step() { this.x += this.vx; this.y += this.vy; this.vy += this.g; this.alpha -= this.fade; this.rot += this.rs; }
    draw(c) {
        if (this.alpha <= 0) return;
        c.save(); c.globalAlpha = Math.max(0, this.alpha); c.translate(this.x, this.y); c.rotate(this.rot * Math.PI / 180);
        c.fillStyle = this.col;
        if (this.t === 0) {
            c.beginPath();
            for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5 - Math.PI / 2; c.lineTo(Math.cos(a) * this.sz * .5, Math.sin(a) * this.sz * .5); const b = a + Math.PI / 5; c.lineTo(Math.cos(b) * this.sz * .2, Math.sin(b) * this.sz * .2); }
            c.closePath(); c.fill();
        } else if (this.t === 1) {
            c.beginPath(); c.arc(0, 0, this.sz * .25, 0, Math.PI * 2); c.fill();
        } else {
            c.beginPath(); c.ellipse(0, 0, this.sz * .15, this.sz * .45, 0, 0, Math.PI * 2); c.fill();
        }
        c.restore();
    }
    get dead() { return this.alpha <= 0; }
}

const burstSize = window._perfMode ? 60 : 180;
const burstSmall = window._perfMode ? 12 : 35;

function burst(x, y, n, big) { for (let i = 0; i < n; i++) rps.push(new RP(x, y, big)); }

function rvLoop(ts) {
    if (!rx) return;
    if (!rActive) { rx.clearRect(0, 0, RW, RH); return; }
    rx.clearRect(0, 0, RW, RH);
    const interval = window._perfMode ? 600 : 300;
    if (ts - lastB > interval) { lastB = ts; burst(RW * .1 + Math.random() * RW * .8, Math.random() * RH * .65, burstSmall, false); }
    rps = rps.filter(p => { p.step(); p.draw(rx); return !p.dead; });
    requestAnimationFrame(rvLoop);
}

/* ===== MUSIC ===== */
let audioCtx = null, masterGain = null, isPlaying = false, melodyTimer = null;
const N = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, G3: 196, A3: 220, B3: 246.94, C3: 130.81, F3: 174.61 };
const MELODY = [[N.C4, .5, .6], [N.C4, .5, .55], [N.D4, 1, .65], [N.C4, 1, .6], [N.F4, 1, .65], [N.E4, 2, .7], [N.C4, .5, .6], [N.C4, .5, .55], [N.D4, 1, .65], [N.C4, 1, .6], [N.G4, 1, .65], [N.F4, 2, .7], [N.C4, .5, .6], [N.C4, .5, .55], [N.C5, 1, .7], [N.A4, 1, .65], [N.F4, 1, .6], [N.E4, 1, .65], [N.D4, 2, .6], [N.B4, .5, .6], [N.B4, .5, .55], [N.A4, 1, .65], [N.F4, 1, .6], [N.G4, 1, .65], [N.F4, 3, .7]];
const BASS = [[N.F3, N.C4, 4], [N.C3, N.G3, 4], [N.F3, N.A3, 4], [N.C3, N.G3, 4], [N.F3, N.C4, 4], [N.G3, N.B3, 4], [N.C3, N.G3, 8]];

/* FIX #3: AudioContext resume on first user interaction */
document.addEventListener('click', () => {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }
}, { once: false });

function initAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = audioCtx.createGain();
            const rev = audioCtx.createConvolver(), rLen = audioCtx.sampleRate * 2, rBuf = audioCtx.createBuffer(2, rLen, audioCtx.sampleRate);
            for (let c = 0; c < 2; c++) { const d = rBuf.getChannelData(c); for (let i = 0; i < rLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / rLen, 2.5); }
            rev.buffer = rBuf;
            const rg = audioCtx.createGain(); rg.gain.value = .22;
            masterGain.connect(rev); rev.connect(rg); rg.connect(audioCtx.destination); masterGain.connect(audioCtx.destination);
        } catch (e) { audioCtx = null; return false; }
    }
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return true;
}

function playNote(freq, start, dur, vol, type = 'triangle') {
    if (!audioCtx || !isPlaying) return;
    const osc = audioCtx.createOscillator(), env = audioCtx.createGain();
    osc.type = type; osc.frequency.value = freq;
    env.gain.setValueAtTime(0, start); env.gain.linearRampToValueAtTime(vol, start + .018); env.gain.exponentialRampToValueAtTime(.001, start + dur * .85);
    osc.connect(env); env.connect(masterGain); osc.start(start); osc.stop(start + dur + .08);
}

function scheduleMelody() {
    if (!audioCtx || !isPlaying) return;
    const beat = 60 / 80, now = audioCtx.currentTime + .06;
    let t = now;
    MELODY.forEach(([f, b, v]) => { playNote(f, t, b * beat * .82, v * .7); t += b * beat; });
    let tb = now;
    BASS.forEach(([r, f, b]) => { playNote(r * .5, tb, b * beat * .9, .18, 'sine'); playNote(f * .5, tb, b * beat * .9, .1, 'sine'); tb += b * beat; });
    const loopMs = MELODY.reduce((a, n) => a + n[1], 0) * beat * 1000;
    if (isPlaying) melodyTimer = setTimeout(scheduleMelody, loopMs - 250);
}

function startMusic() {
    if (isPlaying) return;
    if (!initAudio()) return;
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(.5, audioCtx.currentTime + 2);
    isPlaying = true; scheduleMelody();
}

function stopMusic() {
    isPlaying = false;
    if (melodyTimer) clearTimeout(melodyTimer);
    if (masterGain && audioCtx) {
        masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + .8);
        setTimeout(() => { if (!isPlaying && audioCtx) audioCtx.suspend().catch(() => {}); }, 900);
    }
}

function toggleMusic() {
    const btn = document.getElementById('musicBtn');
    if (!btn) return;
    const lbl = btn.querySelector('.music-label');
    if (!isPlaying) {
        startMusic();
        btn.classList.add('playing');
        if (lbl) lbl.textContent = 'Stop Music';
        btn.setAttribute('aria-label', 'Stop birthday music');
    } else {
        stopMusic();
        btn.classList.remove('playing');
        if (lbl) lbl.textContent = 'Play Music';
        btn.setAttribute('aria-label', 'Play birthday music');
    }
}

const musicBtn = document.getElementById('musicBtn');
if (musicBtn) musicBtn.addEventListener('click', toggleMusic);

/* ===== APP STATE ===== */
let sName = 'Dear Friend', sMsg = 'Happy Birthday! 🎂', sFrom = '', sRelation = 'My Dearest Friend';
let locked = false, isSharedView = false;

/* ===== SEAL BUTTON ===== */
const genBtn = document.getElementById('genBtn');
if (genBtn) {
    genBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('pName');
        if (!nameInput) return;
        const rawName = nameInput.value.trim();
        if (!rawName) {
            nameInput.classList.add('err'); nameInput.focus();
            setTimeout(() => nameInput.classList.remove('err'), 800); return;
        }
        sName = escapeHTML(rawName);
        const pFrom = document.getElementById('pFrom');
        const pRelation = document.getElementById('pRelation');
        const pMsgEl = document.getElementById('pMsg');
        sFrom = pFrom ? escapeHTML(pFrom.value.trim()) : '';
        sRelation = pRelation ? pRelation.value : 'My Dearest Friend';
        const rawMsg = pMsgEl ? pMsgEl.value.trim() : '';
        sMsg = rawMsg || 'Wishing you the most wonderful birthday!\nMay all your dreams come true. 🎂🎁✨';

        genBtn.disabled = true; genBtn.textContent = '✦ Sealing with love…';

        /* FIX #4: Photo envelope preview with onload handler */
        if (photoDataURL && envLetterPreview && envLetterIcon) {
            envLetterPreview.onload = () => {
                envLetterPreview.style.opacity = '1';
            };
            envLetterPreview.src = photoDataURL;
            envLetterPreview.style.display = 'block';
            envLetterPreview.style.opacity = '0';
            envLetterPreview.style.transition = 'opacity 0.4s';
            envLetterIcon.style.display = 'none';
        }

        setTimeout(() => {
            const formPage = document.getElementById('formPage');
            const es = document.getElementById('envScene');
            if (formPage) formPage.style.display = 'none';
            if (es) es.style.display = 'flex';
            applyThemeDecos();
            genBtn.disabled = false; genBtn.innerHTML = '🎂 &nbsp; Seal with a Wish &nbsp; 🎂';
        }, 600);
    });
}

/* ===== KEYBOARD SUPPORT ===== */
const envWrap = document.getElementById('envWrap');
const tapHint = document.getElementById('tapHint');
if (envWrap) envWrap.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnv(); } });
if (tapHint) tapHint.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnv(); } });

function openEnv() {
    if (locked) return;
    if (!envWrap) return;
    if (envWrap.classList.contains('open')) return;
    try { if (!audioCtx) initAudio(); } catch (e) {}
    locked = true; envWrap.classList.add('open');
    const hintTxt = document.getElementById('hintTxt');
    if (hintTxt) hintTxt.style.opacity = '0';
    if (tapHint) {
        tapHint.style.opacity = '0';
        tapHint.style.pointerEvents = 'none';
        tapHint.setAttribute('tabindex', '-1');
    }
    setTimeout(showReveal, 820);
}

if (envWrap) envWrap.addEventListener('click', openEnv);
if (tapHint) tapHint.addEventListener('click', openEnv);

function showReveal() {
    const rvTo = document.getElementById('rvTo');
    const rvMsg = document.getElementById('rvMsg');
    const rvBadge = document.getElementById('rvBadge');
    const rvFrom = document.getElementById('rvFrom');
    const rvPhoto = document.getElementById('rvPhoto');
    const rvIcon = document.getElementById('rvIcon');
    const rvHearts = document.getElementById('rvHearts');

    safeText(rvTo, 'Happy Birthday, ' + sName + '!');
    safePreWrap(rvMsg, sMsg);
    safeText(rvBadge, sRelation);
    safeText(rvFrom, sFrom ? '— with love, ' + sFrom + ' 🎂' : '');

    if (rvPhoto) {
        if (photoDataURL) { rvPhoto.src = photoDataURL; rvPhoto.style.display = 'block'; }
        else { rvPhoto.style.display = 'none'; }
    }

    const isMale = gender === 'blue';
    safeText(rvIcon, isMale ? '🎂 🎁 ⭐' : '🎂 🎁 🎀');
    safeText(rvHearts, isMale ? '⭐ \u00a0 🎂 \u00a0 ⭐' : '🌸 \u00a0 🎂 \u00a0 🌸');

    const rv = document.getElementById('reveal');
    if (!rv) return;
    rv.style.display = 'block'; rv.removeAttribute('aria-hidden');
    rvsz(); rActive = true; lastB = 0;
    burst(RW / 2, RH / 2, burstSize, true);
    [[0, RH * .5], [RW, RH * .5], [RW * .3, RH * .3], [RW * .7, RH * .3], [RW * .2, RH * .7], [RW * .8, RH * .7]].forEach(([x, y]) => burst(x, y, burstSmall, false));
    requestAnimationFrame(rvLoop);
    setTimeout(() => rv.classList.add('show'), 40);
    if (!isSharedView) setTimeout(() => {
        const dlArea = document.getElementById('dlArea');
        if (dlArea) dlArea.style.display = 'block';
    }, 1200);
}

/* ===== CLOSE ===== */
const closeRv = document.getElementById('closeRv');
if (closeRv) {
    closeRv.addEventListener('click', () => {
        const rv = document.getElementById('reveal');
        if (!rv) return;
        rv.classList.remove('show'); rv.setAttribute('aria-hidden', 'true');
        stopMusic();
        const mb = document.getElementById('musicBtn');
        if (mb) {
            mb.classList.remove('playing');
            const lbl = mb.querySelector('.music-label');
            if (lbl) lbl.textContent = 'Play Music';
            mb.setAttribute('aria-label', 'Play birthday music');
        }
        setTimeout(() => { rv.style.display = 'none'; rActive = false; rps = []; resetEnv(); }, 800);
    });
}

function resetEnv() {
    if (!envWrap) return;
    envWrap.classList.add('resetting'); envWrap.classList.remove('open'); locked = false;
    requestAnimationFrame(() => requestAnimationFrame(() => {
        envWrap.classList.remove('resetting');
        const hint = document.getElementById('hintTxt');
        if (hint) { hint.style.transition = 'opacity .9s'; }
        if (tapHint) {
            tapHint.style.transition = 'opacity .9s';
            tapHint.style.pointerEvents = '';
            tapHint.setAttribute('tabindex', '0');
        }
        setTimeout(() => {
            if (hint) hint.style.opacity = '1';
            if (tapHint) tapHint.style.opacity = '1';
        }, 50);
    }));
}

/* ===== DOWNLOAD (FIX #2: window.load + safe variable scope) ===== */
const dlBtn = document.getElementById('dlBtn');
if (dlBtn) {
    dlBtn.addEventListener('click', () => {
        const payload = {
            gender: gender, theme: currentTheme,
            sName: sName, sMsg: sMsg, sFrom: sFrom, sRelation: sRelation,
            photo: photoDataURL || null
        };
        const safePayload = JSON.stringify(payload);
        const docClone = document.documentElement.cloneNode(true);
        docClone.querySelectorAll('.runtime-payload-script').forEach(el => el.remove());

        /*
         * FIX #2a: Use window.load instead of DOMContentLoaded
         *          → ensures all elements (canvas, buttons, etc.) are fully ready
         * FIX #2b: Use window.__bdPayload to avoid variable scope collisions
         *          → injected script sets window.__bdPayload, main script reads it
         * FIX #2c: Re-declare local vars instead of mutating outer-scope lets
         *          → prevents "gender is not defined" crashes in standalone file
         */
        const injectScript = `<script class="runtime-payload-script">
/* Payload injected at download time — read by initScript after main JS runs */
window.__bdPayload = ${safePayload};
/* Pre-set flag so URL param parser is skipped immediately on parse */
window._skipUrlParams = true;
<\/script>`;

        const initScript = `<script class="runtime-payload-script">
window.addEventListener('load', function () {
    var p = window.__bdPayload;
    if (!p) return;

    /* These are module-level lets in dearBirthday.js — assign via window to be safe */
    try { gender = p.gender || 'pink'; } catch(e) { window.gender = p.gender || 'pink'; }
    try { currentTheme = p.theme || p.gender || 'pink'; } catch(e) { window.currentTheme = p.theme || p.gender || 'pink'; }
    try { sName = p.sName || 'Dear Friend'; } catch(e) {}
    try { sMsg = p.sMsg || ''; } catch(e) {}
    try { sFrom = p.sFrom || ''; } catch(e) {}
    try { sRelation = p.sRelation || 'My Dearest Friend'; } catch(e) {}
    try { if (p.photo) photoDataURL = p.photo; } catch(e) {}
    try { isSharedView = true; } catch(e) {}

    document.body.className = p.theme || p.gender || 'pink';

    var genderPage = document.getElementById('genderPage');
    var formPage   = document.getElementById('formPage');
    var dlArea     = document.getElementById('dlArea');
    var es         = document.getElementById('envScene');
    if (genderPage) genderPage.style.display = 'none';
    if (formPage)   formPage.style.display   = 'none';
    if (dlArea)     dlArea.style.display     = 'none';
    if (es)         es.style.display         = 'flex';

    if (typeof applyThemeDecos === 'function') applyThemeDecos();

    if (p.photo) {
        var ep = document.getElementById('envLetterPreview');
        var ei = document.getElementById('envLetterIcon');
        if (ep) {
            ep.onload = function () { ep.style.opacity = '1'; };
            ep.src = p.photo;
            ep.style.display   = 'block';
            ep.style.opacity   = '0';
            ep.style.transition = 'opacity 0.4s';
        }
        if (ei) ei.style.display = 'none';
    }
});
<\/script>`;

        /* neutralizeScript merged into injectScript (_skipUrlParams set there) */
        const html = '<!DOCTYPE html>\n' + docClone.outerHTML.replace('</body>', injectScript + initScript + '</body>');
        const b = new Blob([html], { type: 'text/html' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'BirthdayLetter_' + sName.replace(/[^a-zA-Z0-9]/g, '_') + '.html';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    });
}

/* ===== SHARE (FIX #5: compressed photo included if small enough) ===== */
const shareBtn = document.getElementById('shareBtn');
if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        try {
            /* Include compressed photo only if it fits URL budget (~6000 chars for photo) */
            const photoForShare = (photoDataURL && photoDataURL.length < 6000) ? photoDataURL : null;
            if (photoDataURL && !photoForShare) {
                showToast('📸 Photo too large for link — use Download to share with photo');
            }
            const data = JSON.stringify({
                g: gender, th: currentTheme,
                to: sName, sender: sFrom, rel: sRelation, msg: sMsg,
                photo: photoForShare
            });
            const encoded = btoa(unescape(encodeURIComponent(data)));
            const url = location.origin + location.pathname + '?d=' + encoded;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url)
                    .then(() => showToast('❖ Link copied to clipboard! ❖'))
                    .catch(() => fallbackCopy(url));
            } else {
                fallbackCopy(url);
            }
        } catch (e) { showToast('⚠ Could not generate link'); }
    });
}

function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); showToast('❖ Link copied! ❖'); }
    catch (e) { showToast('⚠ Please copy manually'); }
    document.body.removeChild(ta);
}

function showToast(msg) {
    const t = document.getElementById('copyToast');
    if (!t) return;
    safeText(t, msg);
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

/* ===== URL PARAMS (FIX #6: safer decode + photo support) ===== */
(function () {
    if (window._skipUrlParams) return;
    const up = new URLSearchParams(location.search);
    let parsed = null;

    /* FIX #6: Robust decode with proper error isolation */
    function safeDecode(str) {
        try { return JSON.parse(decodeURIComponent(escape(atob(str)))); }
        catch (e) { return null; }
    }

    if (up.has('d')) {
        parsed = safeDecode(up.get('d'));
    } else if (up.has('to') && up.has('msg')) {
        parsed = {
            g: up.get('g') || 'pink',
            th: up.get('g') || 'pink',
            to: decodeURIComponent(up.get('to')),
            msg: decodeURIComponent(up.get('msg')),
            sender: decodeURIComponent(up.get('from') || up.get('sender') || ''),
            rel: decodeURIComponent(up.get('rel') || 'My Dearest Friend')
        };
    }

    if (parsed) {
        gender = parsed.g || 'pink';
        currentTheme = parsed.th || parsed.g || 'pink';
        document.body.className = currentTheme;
        sName = escapeHTML(parsed.to || 'Dear Friend');
        sMsg = parsed.msg || '';
        sFrom = escapeHTML(parsed.sender || '');
        sRelation = escapeHTML(parsed.rel || 'My Dearest Friend');
        /* FIX #6b: Restore photo from share URL if present */
        if (parsed.photo) photoDataURL = parsed.photo;
        isSharedView = true;

        const genderPage = document.getElementById('genderPage');
        const formPage = document.getElementById('formPage');
        const dlArea = document.getElementById('dlArea');
        const es = document.getElementById('envScene');
        if (genderPage) genderPage.style.display = 'none';
        if (formPage) formPage.style.display = 'none';
        if (dlArea) dlArea.style.display = 'none';
        if (es) es.style.display = 'flex';
        applyThemeDecos();

        /* Show photo in envelope if shared with photo */
        if (parsed.photo && envLetterPreview && envLetterIcon) {
            envLetterPreview.onload = () => { envLetterPreview.style.opacity = '1'; };
            envLetterPreview.src = parsed.photo;
            envLetterPreview.style.display = 'block';
            envLetterPreview.style.opacity = '0';
            envLetterPreview.style.transition = 'opacity 0.4s';
            envLetterIcon.style.display = 'none';
        }
    }
})();

/* ===== PWA: register service worker if supported ===== */
if ('serviceWorker' in navigator) {
    const swCode = `
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => {
    if (e.request.url.includes('fonts.googleapis.com') || e.request.url.includes('fonts.gstatic.com')) {
        e.respondWith(caches.open('bl-fonts-v1').then(c => c.match(e.request).then(r => r || (fetch(e.request).then(nr => { c.put(e.request, nr.clone()); return nr; })))));
    }
});`;
    const swBlob = new Blob([swCode], { type: 'application/javascript' });
    const swURL = URL.createObjectURL(swBlob);
    navigator.serviceWorker.register(swURL).catch(() => {});
}