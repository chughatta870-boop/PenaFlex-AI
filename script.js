/* ============================================================
   PenaFlex AI — Banner / Signboard Generator
   Author: M Ijaz  (GHS 124/NB)
   Vanilla JS PWA — no build step.
   ============================================================ */
'use strict';

/* ---------------------------------------------------------
   0. CONSTANTS
   --------------------------------------------------------- */
const WATERMARK_TEXT = 'M Ijaz';

const FONTS = [
  { id: 'poppins',  label: 'Poppins (Bold Display)', css: "'Poppins', sans-serif", weight: 800 },
  { id: 'inter',    label: 'Inter (Clean)',          css: "'Inter', sans-serif",   weight: 700 },
  { id: 'georgia',  label: 'Georgia (Classic Serif)',css: "Georgia, 'Times New Roman', serif", weight: 700 },
  { id: 'impact',   label: 'Impact (Bold Poster)',   css: "Impact, 'Arial Narrow', sans-serif", weight: 400 },
  { id: 'courier',  label: 'Courier (Typewriter)',   css: "'Courier New', monospace", weight: 700 },
  { id: 'comic',    label: 'Comic (Playful)',        css: "'Comic Sans MS', cursive", weight: 700 },
  { id: 'nastaliq', label: 'Nastaliq (Urdu style)',  css: "'Noto Nastaliq Urdu', 'Poppins', sans-serif", weight: 600 }
];

/* Theme keyword -> color palette. First match wins (checked in order). */
const THEME_RULES = [
  { keys: ['eid','ramzan','ramadan','chand raat'], theme: { bg1:'#0B5D3B', bg2:'#0F7A4D', accent:'#D4A017', text:'#FFFFFF', sub:'#F3E3A8', name:'Eid Green & Gold' } },
  { keys: ['sale','discount','off','off%','clearance','offer'], theme: { bg1:'#B3131A', bg2:'#7A1F2B', accent:'#FFD447', text:'#FFFFFF', sub:'#FFE9A8', name:'Sale Red & Gold' } },
  { keys: ['school','admission','academy','college','education','exam'], theme: { bg1:'#0B3D66', bg2:'#124E85', accent:'#F2C230', text:'#FFFFFF', sub:'#CFE3F7', name:'Education Blue' } },
  { keys: ['wedding','shadi','baraat','walima','nikah','mehndi'], theme: { bg1:'#7A1F4A', bg2:'#A83368', accent:'#F2C230', text:'#FFFFFF', sub:'#F6D9E6', name:'Wedding Pink & Gold' } },
  { keys: ['restaurant','food','hotel','biryani','cafe','dhaba','bbq'], theme: { bg1:'#C1440E', bg2:'#8A2E0A', accent:'#FFD166', text:'#FFFFFF', sub:'#FFE3C2', name:'Restaurant Orange' } },
  { keys: ['birthday','celebration','anniversary','party'], theme: { bg1:'#5B2C91', bg2:'#7E3FC0', accent:'#FFD447', text:'#FFFFFF', sub:'#E9D8FF', name:'Party Purple' } },
  { keys: ['welcome','back to school','opening','open'], theme: { bg1:'#0F5C5C', bg2:'#0B7A75', accent:'#F2C230', text:'#FFFFFF', sub:'#CFF3EE', name:'Teal Welcome' } },
  { keys: ['condolence','sad demise','inteqal','death'], theme: { bg1:'#1A1A1A', bg2:'#3A3A3A', accent:'#D4A017', text:'#FFFFFF', sub:'#D9D9D9', name:'Condolence Black' } },
  { keys: ['independence','pakistan zindabad','14 august','azadi'], theme: { bg1:'#014421', bg2:'#0A6E33', accent:'#FFFFFF', text:'#FFFFFF', sub:'#E9F7EF', name:'Pakistan Green' } },
  { keys: ['job','vacancy','hiring','required staff','recruitment'], theme: { bg1:'#0B3D66', bg2:'#B3131A', accent:'#FFD447', text:'#FFFFFF', sub:'#EFEFEF', name:'Hiring Bold' } }
];

/* Explicit color-word overrides — used when user names a color directly */
const COLOR_WORDS = {
  red:    { bg1:'#B3131A', bg2:'#7A1F2B', accent:'#FFD447' },
  maroon: { bg1:'#7A1F2B', bg2:'#54121B', accent:'#D4A017' },
  green:  { bg1:'#0B5D3B', bg2:'#0F7A4D', accent:'#D4A017' },
  blue:   { bg1:'#0B3D66', bg2:'#124E85', accent:'#F2C230' },
  gold:   { bg1:'#8A6A00', bg2:'#5C4600', accent:'#FFE9A8' },
  yellow: { bg1:'#E8A800', bg2:'#B37E00', accent:'#1A1A1A' },
  pink:   { bg1:'#A83368', bg2:'#7A1F4A', accent:'#F2C230' },
  purple: { bg1:'#5B2C91', bg2:'#3E1D66', accent:'#FFD447' },
  orange: { bg1:'#C1440E', bg2:'#8A2E0A', accent:'#FFD166' },
  black:  { bg1:'#1A1A1A', bg2:'#000000', accent:'#D4A017' },
  white:  { bg1:'#F7F1E1', bg2:'#E4DCC8', accent:'#7A1F2B', text:'#1A1A1A', sub:'#54121B' },
  teal:   { bg1:'#0F5C5C', bg2:'#0B7A75', accent:'#F2C230' },
  navy:   { bg1:'#0B2545', bg2:'#123163', accent:'#F2C230' }
};

const DEFAULT_THEME = { bg1:'#7A1F2B', bg2:'#54121B', accent:'#D4A017', text:'#FFFFFF', sub:'#F3E3A8', name:'Classic Maroon & Gold' };

const SWATCHES = ['#7A1F2B','#B3131A','#0B5D3B','#0B3D66','#5B2C91','#C1440E','#A83368','#0F5C5C',
                   '#1A1A1A','#F7F1E1','#D4A017','#FFFFFF','#0B2545','#8A6A00','#014421','#3E1D66'];

/* ---------------------------------------------------------
   1. STATE
   --------------------------------------------------------- */
const state = {
  boardW: 1200,
  boardH: 600,
  bg: { type: 'gradient', color1: '#7A1F2B', color2: '#54121B', angle: 135, image: null },
  elements: [],      // {id,type:'text'|'image'|'shape', ...}
  selectedId: null,
  editMode: false,
  history: [],
  historyIndex: -1,
  currentDesignId: null,  // gallery id if loaded from saved design
  rbgResultDataUrl: null, // cutout PNG (transparent bg) from remove-bg flow
  rbgBgChoice: null       // {type:'color'|'image', value}
};

let elIdCounter = 1;
function newId(){ return 'el' + (elIdCounter++) + '_' + Date.now().toString(36); }

/* ---------------------------------------------------------
   2. DOM SHORTCUTS
   --------------------------------------------------------- */
const $ = (sel) => document.querySelector(sel);
const canvas = $('#board');
const ctx = canvas.getContext('2d');
const overlayLayer = $('#overlayLayer');
const canvasWrap = $('#canvasWrap');

/* ---------------------------------------------------------
   3. UTILITIES
   --------------------------------------------------------- */
function toast(msg, ms = 2200){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => t.classList.add('hidden'), ms);
}

function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

function hexToRgba(hex, alpha){
  const h = hex.replace('#','');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
  const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function fontCss(fontId){
  const f = FONTS.find(x => x.id === fontId) || FONTS[0];
  return f;
}

function wrapText(context, text, maxWidth){
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words){
    const test = line ? line + ' ' + w : w;
    if (context.measureText(test).width > maxWidth && line){
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function debounce(fn, wait){
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

/* ---------------------------------------------------------
   4. COMMAND PARSER  (AI-style auto generate from free text)
   --------------------------------------------------------- */
function detectTheme(commandLower){
  // 1) explicit color word wins if present
  for (const word in COLOR_WORDS){
    if (new RegExp('\\b' + word + '\\b').test(commandLower)){
      return Object.assign({}, DEFAULT_THEME, COLOR_WORDS[word], { name: word[0].toUpperCase()+word.slice(1)+' Theme' });
    }
  }
  // 2) keyword rules
  for (const rule of THEME_RULES){
    for (const k of rule.keys){
      if (commandLower.includes(k)) return rule.theme;
    }
  }
  return DEFAULT_THEME;
}

function splitCommandIntoLines(raw){
  // Split on explicit separators the user is likely to use.
  let parts = raw
    .split(/,|\n|\u2014|-{2,}|\|/g)
    .map(s => s.trim())
    .filter(Boolean);

  // strip theme/color instruction fragments like "red theme", "blue and gold theme"
  parts = parts.filter(p => !/\b(theme|colou?r)\b/i.test(p) || p.split(' ').length > 4);

  if (parts.length === 0) parts = [raw.trim()];
  return parts;
}

function toTitleCase(s){
  return s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

function parseCommand(raw){
  const commandLower = raw.toLowerCase();
  const theme = detectTheme(commandLower);
  const lines = splitCommandIntoLines(raw);

  const title = toTitleCase(lines[0] || 'Your Heading Here');
  const subtitle = lines[1] ? toTitleCase(lines[1]) : '';
  const extra = lines.slice(2, 4); // up to 2 more supporting lines

  // Detect a phone number / contact if present anywhere in the raw text
  const phoneMatch = raw.match(/(\+?\d[\d\s-]{8,}\d)/);
  const contact = phoneMatch ? phoneMatch[0].trim() : '';

  return { title, subtitle, extra, theme, contact, raw };
}

/* ---------------------------------------------------------
   5. DESIGN GENERATOR — builds an elements[] layout
   --------------------------------------------------------- */
function generateDesign(raw){
  const parsed = parseCommand(raw);
  const [bw, bh] = [state.boardW, state.boardH];

  state.bg = { type: 'gradient', color1: parsed.theme.bg1, color2: parsed.theme.bg2, angle: 135, image: null };
  state.elements = [];

  const textColor = parsed.theme.text || '#FFFFFF';
  const subColor = parsed.theme.sub || '#F3E3A8';
  const accent = parsed.theme.accent || '#D4A017';

  // Decorative accent ribbon shape (signature element)
  state.elements.push({
    id: newId(), type: 'shape', shape: 'ribbon',
    x: 0, y: bh * 0.06, w: bw, h: bh * 0.02,
    color: accent, rotation: 0
  });

  // Title
  const titleSize = Math.round(bh * (parsed.title.length > 22 ? 0.11 : 0.16));
  state.elements.push({
    id: newId(), type: 'text', text: parsed.title,
    x: bw * 0.08, y: bh * 0.30, w: bw * 0.84,
    size: titleSize, color: textColor, font: 'poppins', align: 'center', bold: true
  });

  // Subtitle
  if (parsed.subtitle){
    state.elements.push({
      id: newId(), type: 'text', text: parsed.subtitle,
      x: bw * 0.10, y: bh * 0.52, w: bw * 0.80,
      size: Math.round(bh * 0.075), color: accent, font: 'inter', align: 'center', bold: true
    });
  }

  // Extra lines (small print / details)
  parsed.extra.forEach((line, i) => {
    state.elements.push({
      id: newId(), type: 'text', text: line,
      x: bw * 0.12, y: bh * (0.66 + i * 0.09), w: bw * 0.76,
      size: Math.round(bh * 0.045), color: subColor, font: 'inter', align: 'center', bold: false
    });
  });

  // Contact line pinned near bottom
  if (parsed.contact){
    state.elements.push({
      id: newId(), type: 'text', text: '\u260E ' + parsed.contact,
      x: bw * 0.10, y: bh * 0.88, w: bw * 0.80,
      size: Math.round(bh * 0.042), color: textColor, font: 'inter', align: 'center', bold: true
    });
  }

  // bottom accent ribbon
  state.elements.push({
    id: newId(), type: 'shape', shape: 'ribbon',
    x: 0, y: bh * 0.92, w: bw, h: bh * 0.02,
    color: accent, rotation: 0
  });

  state.currentDesignId = null;
  pushHistory();
  renderBoard();
  renderOverlay();
  $('#stageStatus').textContent = `Generated: "${parsed.theme.name}" — tap any text to edit it, or use the tools below to add photos.`;
}

/* ---------------------------------------------------------
   6. RENDERING
   --------------------------------------------------------- */
function setCanvasResolution(){
  canvas.width = state.boardW;
  canvas.height = state.boardH;
}

function drawBackground(context, w, h){
  if (state.bg.type === 'image' && state.bg.imageObj){
    // cover-fit the background image
    const iw = state.bg.imageObj.width, ih = state.bg.imageObj.height;
    const scale = Math.max(w / iw, h / ih);
    const dw = iw * scale, dh = ih * scale;
    context.drawImage(state.bg.imageObj, (w - dw) / 2, (h - dh) / 2, dw, dh);
    context.fillStyle = 'rgba(0,0,0,0.28)';
    context.fillRect(0, 0, w, h);
  } else if (state.bg.type === 'solid'){
    context.fillStyle = state.bg.color1;
    context.fillRect(0, 0, w, h);
  } else {
    const rad = (state.bg.angle || 135) * Math.PI / 180;
    const x1 = w/2 - Math.cos(rad) * w/2, y1 = h/2 - Math.sin(rad) * h/2;
    const x2 = w/2 + Math.cos(rad) * w/2, y2 = h/2 + Math.sin(rad) * h/2;
    const grad = context.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, state.bg.color1);
    grad.addColorStop(1, state.bg.color2 || state.bg.color1);
    context.fillStyle = grad;
    context.fillRect(0, 0, w, h);
  }
}

function drawGrommets(context, w, h){
  const r = Math.max(4, w * 0.008);
  const margin = Math.max(18, w * 0.025);
  const pts = [[margin,margin],[w-margin,margin],[margin,h-margin],[w-margin,h-margin]];
  context.save();
  for (const [cx, cy] of pts){
    context.beginPath();
    context.arc(cx, cy, r, 0, Math.PI*2);
    context.fillStyle = 'rgba(0,0,0,0.35)';
    context.fill();
    context.beginPath();
    context.arc(cx, cy, r*0.55, 0, Math.PI*2);
    context.fillStyle = 'rgba(255,255,255,0.55)';
    context.fill();
  }
  context.restore();
}

function drawShapeEl(context, el){
  context.save();
  if (el.shape === 'ribbon'){
    context.fillStyle = el.color;
    context.fillRect(el.x, el.y, el.w, el.h);
  } else if (el.shape === 'rect'){
    context.fillStyle = el.color;
    context.fillRect(el.x, el.y, el.w, el.h);
  } else if (el.shape === 'circle'){
    context.fillStyle = el.color;
    context.beginPath();
    context.ellipse(el.x + el.w/2, el.y + el.h/2, el.w/2, el.h/2, 0, 0, Math.PI*2);
    context.fill();
  } else if (el.shape === 'star'){
    drawStar(context, el.x + el.w/2, el.y + el.h/2, 5, el.w/2, el.w/4, el.color);
  }
  context.restore();
}

function drawStar(context, cx, cy, spikes, outerR, innerR, color){
  let rot = Math.PI / 2 * 3;
  let x = cx, y = cy;
  const step = Math.PI / spikes;
  context.beginPath();
  context.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++){
    x = cx + Math.cos(rot) * outerR; y = cy + Math.sin(rot) * outerR;
    context.lineTo(x, y); rot += step;
    x = cx + Math.cos(rot) * innerR; y = cy + Math.sin(rot) * innerR;
    context.lineTo(x, y); rot += step;
  }
  context.lineTo(cx, cy - outerR);
  context.closePath();
  context.fillStyle = color;
  context.fill();
}

function drawTextEl(context, el){
  const f = fontCss(el.font);
  context.save();
  context.textAlign = el.align || 'center';
  context.textBaseline = 'top';
  context.font = `${el.bold ? '800' : '500'} ${el.size}px ${f.css}`;
  context.fillStyle = el.color;
  context.shadowColor = 'rgba(0,0,0,0.35)';
  context.shadowBlur = Math.max(2, el.size * 0.06);
  context.shadowOffsetY = Math.max(1, el.size * 0.03);

  const lines = wrapText(context, el.text, el.w);
  const lineHeight = el.size * 1.18;
  const drawX = el.align === 'left' ? el.x : el.align === 'right' ? el.x + el.w : el.x + el.w / 2;
  lines.forEach((line, i) => {
    context.fillText(line, drawX, el.y + i * lineHeight);
  });
  el._renderedH = lines.length * lineHeight; // cache for overlay sizing
  context.restore();
}

function drawImageEl(context, el){
  if (!el.imageObj) return;
  context.save();
  context.translate(el.x + el.w/2, el.y + el.h/2);
  context.rotate((el.rotation || 0) * Math.PI / 180);
  context.drawImage(el.imageObj, -el.w/2, -el.h/2, el.w, el.h);
  context.restore();
}

function drawWatermark(context, w, h){
  context.save();
  context.font = `600 ${Math.max(12, w * 0.018)}px 'Inter', sans-serif`;
  context.textAlign = 'right';
  context.textBaseline = 'bottom';
  context.fillStyle = 'rgba(255,255,255,0.55)';
  context.shadowColor = 'rgba(0,0,0,0.5)';
  context.shadowBlur = 3;
  context.fillText(WATERMARK_TEXT, w - w*0.02, h - h*0.02);
  context.restore();
}

function renderBoard(){
  setCanvasResolution();
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  drawBackground(ctx, w, h);
  for (const el of state.elements){
    if (el.type === 'shape') drawShapeEl(ctx, el);
    else if (el.type === 'text') drawTextEl(ctx, el);
    else if (el.type === 'image') drawImageEl(ctx, el);
  }
  drawGrommets(ctx, w, h);
  drawWatermark(ctx, w, h);
}

/* ---------------------------------------------------------
   7. OVERLAY (drag / select / delete handles)
   --------------------------------------------------------- */
function canvasToDisplayScale(){
  const rect = canvas.getBoundingClientRect();
  return { sx: rect.width / canvas.width, sy: rect.height / canvas.height, rect };
}

function renderOverlay(){
  overlayLayer.innerHTML = '';
  if (!state.editMode) return;
  const { sx, sy } = canvasToDisplayScale();

  state.elements.forEach(el => {
    const h = document.createElement('div');
    h.className = 'el-handle' + (state.selectedId === el.id ? ' selected' : '');
    const w = el.type === 'text' ? el.w : el.w;
    const hh = el.type === 'text' ? (el._renderedH || el.size * 1.3) : el.h;
    h.style.left = (el.x * sx) + 'px';
    h.style.top = (el.y * sy) + 'px';
    h.style.width = (w * sx) + 'px';
    h.style.height = (hh * sy) + 'px';
    h.dataset.id = el.id;

    if (state.selectedId === el.id){
      const del = document.createElement('div');
      del.className = 'el-delete-badge';
      del.textContent = '✕';
      del.addEventListener('pointerdown', (e) => { e.stopPropagation(); deleteElement(el.id); });
      h.appendChild(del);
    }

    attachDragHandlers(h, el);
    overlayLayer.appendChild(h);
  });
}

function attachDragHandlers(handleEl, el){
  let dragging = false;
  let startX = 0, startY = 0, origX = 0, origY = 0;

  handleEl.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    selectElement(el.id);
    dragging = true;
    const { sx, sy } = canvasToDisplayScale();
    startX = e.clientX; startY = e.clientY;
    origX = el.x; origY = el.y;
    handleEl.setPointerCapture(e.pointerId);
    handleEl._sx = sx; handleEl._sy = sy;
  });
  handleEl.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = (e.clientX - startX) / handleEl._sx;
    const dy = (e.clientY - startY) / handleEl._sy;
    el.x = clamp(origX + dx, -el.w * 0.4, state.boardW - el.w * 0.6);
    el.y = clamp(origY + dy, -20, state.boardH - 20);
    renderBoard();
    renderOverlay();
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    pushHistory();
  };
  handleEl.addEventListener('pointerup', endDrag);
  handleEl.addEventListener('pointercancel', endDrag);
}

function selectElement(id){
  state.selectedId = id;
  renderOverlay();
  const el = state.elements.find(e => e.id === id);
  const editTools = $('#editTools');
  if (el && el.type === 'text'){
    editTools.classList.remove('hidden');
    $('#editTextValue').value = el.text;
    $('#editTextColor').value = el.color;
    $('#editTextSize').value = el.size;
  } else if (el){
    editTools.classList.remove('hidden');
    $('#textEditRow').style.display = 'none';
  }
  if (el && el.type === 'text') $('#textEditRow').style.display = 'flex';
}

function deselect(){
  state.selectedId = null;
  $('#editTools').classList.add('hidden');
  renderOverlay();
}

function deleteElement(id){
  state.elements = state.elements.filter(e => e.id !== id);
  if (state.selectedId === id) deselect();
  renderBoard();
  renderOverlay();
  pushHistory();
  toast('Element deleted');
}

canvasWrap.addEventListener('pointerdown', (e) => {
  if (!state.editMode) return;
  if (e.target === canvas || e.target === overlayLayer) deselect();
});

/* ---------------------------------------------------------
   8. HISTORY (undo / redo)
   --------------------------------------------------------- */
function snapshotState(){
  // imageObj (HTMLImageElement) is not JSON-safe; store src separately.
  const elements = state.elements.map(el => {
    const copy = Object.assign({}, el);
    delete copy.imageObj;
    if (el.type === 'image') copy._src = el.imageObj ? el.imageObj.src : el._src;
    return copy;
  });
  return JSON.stringify({ elements, bg: Object.assign({}, state.bg, { imageObj: undefined }) });
}

function pushHistory(){
  const snap = snapshotState();
  state.history = state.history.slice(0, state.historyIndex + 1);
  state.history.push(snap);
  if (state.history.length > 40) state.history.shift();
  state.historyIndex = state.history.length - 1;
}

function restoreSnapshot(snapStr, cb){
  const data = JSON.parse(snapStr);
  const loaders = [];
  data.elements.forEach(el => {
    if (el.type === 'image' && el._src){
      const img = new Image();
      loaders.push(new Promise(res => { img.onload = res; img.src = el._src; }));
      el.imageObj = img;
    }
  });
  const bg = data.bg;
  if (bg.type === 'image' && bg.image){
    const img = new Image();
    loaders.push(new Promise(res => { img.onload = res; img.src = bg.image; }));
    bg.imageObj = img;
  }
  Promise.all(loaders).then(() => {
    state.elements = data.elements;
    state.bg = bg;
    renderBoard();
    renderOverlay();
    if (cb) cb();
  });
}

function undo(){
  if (state.historyIndex <= 0){ toast('Nothing to undo'); return; }
  state.historyIndex--;
  restoreSnapshot(state.history[state.historyIndex]);
}
function redo(){
  if (state.historyIndex >= state.history.length - 1){ toast('Nothing to redo'); return; }
  state.historyIndex++;
  restoreSnapshot(state.history[state.historyIndex]);
}

/* ---------------------------------------------------------
   9. ADD / EDIT TOOLS
   --------------------------------------------------------- */
function addTextElement(){
  const el = {
    id: newId(), type: 'text', text: 'Double tap to edit',
    x: state.boardW * 0.15, y: state.boardH * 0.42, w: state.boardW * 0.7,
    size: Math.round(state.boardH * 0.08), color: '#FFFFFF', font: 'poppins', align: 'center', bold: true
  };
  state.elements.push(el);
  state.editMode = true;
  renderBoard();
  renderOverlay();
  selectElement(el.id);
  pushHistory();
}

function addShapeElement(shape){
  const size = state.boardW * 0.18;
  const el = {
    id: newId(), type: 'shape', shape,
    x: state.boardW * 0.42, y: state.boardH * 0.4, w: size, h: shape === 'ribbon' ? size * 0.15 : size,
    color: '#D4A017', rotation: 0
  };
  state.elements.push(el);
  state.editMode = true;
  renderBoard();
  renderOverlay();
  selectElement(el.id);
  pushHistory();
}

function addImageElementFromDataUrl(dataUrl){
  const img = new Image();
  img.onload = () => {
    const maxW = state.boardW * 0.5;
    const scale = Math.min(1, maxW / img.width);
    const w = img.width * scale, h = img.height * scale;
    const el = {
      id: newId(), type: 'image', imageObj: img, _src: dataUrl,
      x: (state.boardW - w) / 2, y: (state.boardH - h) / 2, w, h, rotation: 0
    };
    state.elements.push(el);
    state.editMode = true;
    renderBoard();
    renderOverlay();
    selectElement(el.id);
    pushHistory();
  };
  img.src = dataUrl;
}

function readFileAsDataUrl(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* Text edit-tool wiring */
$('#editTextValue').addEventListener('input', (e) => {
  const el = state.elements.find(x => x.id === state.selectedId);
  if (!el) return;
  el.text = e.target.value;
  renderBoard(); renderOverlay();
});
$('#editTextValue').addEventListener('change', pushHistory);

$('#editTextColor').addEventListener('input', (e) => {
  const el = state.elements.find(x => x.id === state.selectedId);
  if (!el) return;
  el.color = e.target.value;
  renderBoard(); renderOverlay();
});
$('#editTextColor').addEventListener('change', pushHistory);

$('#editTextSize').addEventListener('input', (e) => {
  const el = state.elements.find(x => x.id === state.selectedId);
  if (!el) return;
  el.size = Number(e.target.value);
  renderBoard(); renderOverlay();
});
$('#editTextSize').addEventListener('change', pushHistory);

$('#deleteElBtn').addEventListener('click', () => {
  if (state.selectedId) deleteElement(state.selectedId);
});

/* ---------------------------------------------------------
   10. BACKGROUND SHEET
   --------------------------------------------------------- */
function buildSwatchGrid(container, onPick){
  container.innerHTML = '';
  SWATCHES.forEach(color => {
    const sw = document.createElement('button');
    sw.className = 'swatch';
    sw.style.background = color;
    sw.type = 'button';
    sw.addEventListener('click', () => onPick(color));
    container.appendChild(sw);
  });
}

function openSheet(id){ $(id).classList.remove('hidden'); }
function closeSheet(id){ $(id).classList.add('hidden'); }

$('#bgTool').addEventListener('click', () => {
  buildSwatchGrid($('#swatchGrid'), (color) => {
    state.bg = { type: 'solid', color1: color };
    renderBoard();
    pushHistory();
    toast('Background updated');
  });
  openSheet('#bgSheetBackdrop');
});
$('#bgCloseBtn').addEventListener('click', () => closeSheet('#bgSheetBackdrop'));
$('#bgGradientBtn').addEventListener('click', () => {
  const theme = detectTheme(($('#commandInput').value || '').toLowerCase());
  state.bg = { type: 'gradient', color1: theme.bg1, color2: theme.bg2, angle: 135 };
  renderBoard(); pushHistory();
  toast('Gradient applied');
});
$('#bgPhotoBtn').addEventListener('click', () => $('#bgFileInput').click());
$('#bgFileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const dataUrl = await readFileAsDataUrl(file);
  const img = new Image();
  img.onload = () => {
    state.bg = { type: 'image', image: dataUrl, imageObj: img };
    renderBoard();
    pushHistory();
    closeSheet('#bgSheetBackdrop');
    toast('Photo background set');
  };
  img.src = dataUrl;
  e.target.value = '';
});

/* ---------------------------------------------------------
   11. FONT SHEET
   --------------------------------------------------------- */
function buildFontList(){
  const list = $('#fontList');
  list.innerHTML = '';
  FONTS.forEach(f => {
    const btn = document.createElement('button');
    btn.className = 'font-option';
    btn.style.fontFamily = f.css;
    btn.textContent = f.label;
    btn.addEventListener('click', () => {
      const el = state.elements.find(x => x.id === state.selectedId);
      if (el){ el.font = f.id; renderBoard(); renderOverlay(); pushHistory(); }
      closeSheet('#fontSheetBackdrop');
    });
    list.appendChild(btn);
  });
}
$('#editFontBtn').addEventListener('click', () => { buildFontList(); openSheet('#fontSheetBackdrop'); });
$('#fontCloseBtn').addEventListener('click', () => closeSheet('#fontSheetBackdrop'));

/* ---------------------------------------------------------
   12. REMOVE / REPLACE BACKGROUND (MediaPipe Selfie Segmentation)
   --------------------------------------------------------- */
let selfieSegmentation = null;
let rbgSourceImg = null;      // original uploaded photo (Image)
let rbgCutoutCanvas = null;   // offscreen canvas holding the transparent cutout

function getSelfieSegmentation(){
  if (selfieSegmentation) return selfieSegmentation;
  if (typeof SelfieSegmentation === 'undefined') return null;
  selfieSegmentation = new SelfieSegmentation({
    locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${f}`
  });
  selfieSegmentation.setOptions({ modelSelection: 1 });
  return selfieSegmentation;
}

function runSegmentation(imgEl){
  return new Promise((resolve, reject) => {
    const seg = getSelfieSegmentation();
    if (!seg){ reject(new Error('Segmentation model unavailable (check internet connection).')); return; }
    seg.onResults((results) => resolve(results));
    seg.send({ image: imgEl }).catch(reject);
  });
}

async function removeBackgroundFromImage(imgEl){
  const results = await runSegmentation(imgEl);
  const w = imgEl.naturalWidth || imgEl.width;
  const h = imgEl.naturalHeight || imgEl.height;

  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  const octx = out.getContext('2d');

  // draw the segmentation mask, then use it to keep only the foreground
  octx.drawImage(results.segmentationMask, 0, 0, w, h);
  octx.globalCompositeOperation = 'source-in';
  octx.drawImage(imgEl, 0, 0, w, h);
  octx.globalCompositeOperation = 'source-over';

  return out;
}

function paintRbgPreview(bgFill){
  const prevCanvas = $('#rbgPreview');
  const w = rbgCutoutCanvas.width, h = rbgCutoutCanvas.height;
  prevCanvas.width = w; prevCanvas.height = h;
  const pctx = prevCanvas.getContext('2d');
  pctx.clearRect(0,0,w,h);
  if (bgFill && bgFill.type === 'color'){
    pctx.fillStyle = bgFill.value;
    pctx.fillRect(0,0,w,h);
  } else if (bgFill && bgFill.type === 'image' && bgFill.imgObj){
    const iw = bgFill.imgObj.width, ih = bgFill.imgObj.height;
    const scale = Math.max(w/iw, h/ih);
    const dw = iw*scale, dh = ih*scale;
    pctx.drawImage(bgFill.imgObj, (w-dw)/2, (h-dh)/2, dw, dh);
  }
  pctx.drawImage(rbgCutoutCanvas, 0, 0);
}

$('#removeBgTool').addEventListener('click', () => {
  state.rbgResultDataUrl = null;
  state.rbgBgChoice = null;
  rbgCutoutCanvas = null;
  $('#rbgPreview').getContext('2d').clearRect(0,0,9999,9999);
  buildSwatchGrid($('#rbgSwatchGrid'), async (color) => {
    if (!rbgCutoutCanvas) { toast('Choose a photo first'); return; }
    state.rbgBgChoice = { type: 'color', value: color };
    paintRbgPreview(state.rbgBgChoice);
  });
  openSheet('#removeBgSheetBackdrop');
});
$('#rbgCloseBtn').addEventListener('click', () => closeSheet('#removeBgSheetBackdrop'));

$('#rbgChooseBtn').addEventListener('click', () => $('#removeBgFileInput').click());
$('#removeBgFileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const dataUrl = await readFileAsDataUrl(file);
  const img = new Image();
  img.onload = async () => {
    rbgSourceImg = img;
    $('#rbgLoading').classList.remove('hidden');
    try {
      rbgCutoutCanvas = await removeBackgroundFromImage(img);
      state.rbgBgChoice = { type: 'color', value: '#F7F1E1' };
      paintRbgPreview(state.rbgBgChoice);
      toast('Background removed! Pick a new background below.');
    } catch (err){
      toast(err.message || 'Could not remove background');
    } finally {
      $('#rbgLoading').classList.add('hidden');
    }
  };
  img.src = dataUrl;
  e.target.value = '';
});

$('#rbgPhotoAsBgBtn').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file || !rbgCutoutCanvas) return;
    const dataUrl = await readFileAsDataUrl(file);
    const img = new Image();
    img.onload = () => {
      state.rbgBgChoice = { type: 'image', imgObj: img };
      paintRbgPreview(state.rbgBgChoice);
    };
    img.src = dataUrl;
  });
  input.click();
});

$('#rbgInsertBtn').addEventListener('click', () => {
  if (!rbgCutoutCanvas){ toast('Choose and process a photo first'); return; }
  const w = rbgCutoutCanvas.width, h = rbgCutoutCanvas.height;
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = w; finalCanvas.height = h;
  const fctx = finalCanvas.getContext('2d');
  if (state.rbgBgChoice && state.rbgBgChoice.type === 'color'){
    fctx.fillStyle = state.rbgBgChoice.value;
    fctx.fillRect(0,0,w,h);
  } else if (state.rbgBgChoice && state.rbgBgChoice.type === 'image'){
    const io = state.rbgBgChoice.imgObj;
    const scale = Math.max(w/io.width, h/io.height);
    const dw = io.width*scale, dh = io.height*scale;
    fctx.drawImage(io, (w-dw)/2, (h-dh)/2, dw, dh);
  }
  fctx.drawImage(rbgCutoutCanvas, 0, 0);
  const dataUrl = finalCanvas.toDataURL('image/png');
  addImageElementFromDataUrl(dataUrl);
  closeSheet('#removeBgSheetBackdrop');
  toast('Inserted into board — drag to position');
});

/* ---------------------------------------------------------
   13. SHAPE / IMAGE TOOL BUTTONS
   --------------------------------------------------------- */
const SHAPE_CYCLE = ['rect', 'circle', 'star', 'ribbon'];
let shapeCycleIndex = 0;
$('#shapeTool').addEventListener('click', () => {
  const shape = SHAPE_CYCLE[shapeCycleIndex % SHAPE_CYCLE.length];
  shapeCycleIndex++;
  addShapeElement(shape);
  toast(`Added shape: ${shape} (tap again for another)`);
});

$('#addTextTool').addEventListener('click', addTextElement);
$('#addImageTool').addEventListener('click', () => $('#imageFileInput').click());
$('#imageFileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const dataUrl = await readFileAsDataUrl(file);
  addImageElementFromDataUrl(dataUrl);
  e.target.value = '';
});

/* ---------------------------------------------------------
   14. SIZE SELECT / UNDO / REDO / CLEAR / EDIT MODE
   --------------------------------------------------------- */
$('#sizeSelect').addEventListener('change', (e) => {
  const [w, h] = e.target.value.split('x').map(Number);
  state.boardW = w; state.boardH = h;
  renderBoard();
  renderOverlay();
  pushHistory();
});

$('#undoBtn').addEventListener('click', undo);
$('#redoBtn').addEventListener('click', redo);
$('#clearBtn').addEventListener('click', () => {
  if (!confirm('Clear the whole board?')) return;
  state.elements = [];
  state.bg = { type: 'gradient', color1: DEFAULT_THEME.bg1, color2: DEFAULT_THEME.bg2, angle: 135 };
  deselect();
  renderBoard();
  pushHistory();
  toast('Board cleared');
});

$('#editModeBtn').addEventListener('click', () => {
  state.editMode = !state.editMode;
  $('#editModeBtn').style.opacity = state.editMode ? '1' : '0.55';
  if (!state.editMode) deselect();
  renderOverlay();
  toast(state.editMode ? 'Edit mode ON — tap elements to move/edit' : 'Edit mode off');
});

/* ---------------------------------------------------------
   15. GENERATE BUTTON + QUICK CHIPS
   --------------------------------------------------------- */
$('#generateBtn').addEventListener('click', () => {
  const raw = $('#commandInput').value.trim();
  if (!raw){ toast('Type a command first, e.g. "Shop Opening Sale red theme"'); return; }
  generateDesign(raw);
});
$('#quickChips').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  $('#commandInput').value = chip.dataset.cmd;
  generateDesign(chip.dataset.cmd);
});

/* ---------------------------------------------------------
   16. EXPORT — DOWNLOAD / SHARE (high resolution)
   --------------------------------------------------------- */
function renderExportCanvas(scale = 2){
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = state.boardW * scale;
  exportCanvas.height = state.boardH * scale;
  const ectx = exportCanvas.getContext('2d');
  ectx.scale(scale, scale);
  drawBackground(ectx, state.boardW, state.boardH);
  for (const el of state.elements){
    if (el.type === 'shape') drawShapeEl(ectx, el);
    else if (el.type === 'text') drawTextEl(ectx, el);
    else if (el.type === 'image') drawImageEl(ectx, el);
  }
  drawGrommets(ectx, state.boardW, state.boardH);
  drawWatermark(ectx, state.boardW, state.boardH);
  return exportCanvas;
}

function exportFileName(){
  const stamp = new Date().toISOString().slice(0,10);
  return `penaflex_${stamp}_${Date.now().toString(36)}.png`;
}

$('#downloadBtn').addEventListener('click', () => {
  if (state.elements.length === 0){ toast('Generate or add something first'); return; }
  const exportCanvas = renderExportCanvas(2);
  const link = document.createElement('a');
  link.download = exportFileName();
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
  toast('Downloaded ✓');
});

$('#shareBtn').addEventListener('click', async () => {
  if (state.elements.length === 0){ toast('Generate or add something first'); return; }
  const exportCanvas = renderExportCanvas(2);
  exportCanvas.toBlob(async (blob) => {
    const file = new File([blob], exportFileName(), { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })){
      try {
        await navigator.share({ files: [file], title: 'PenaFlex Design', text: 'Made with PenaFlex AI by M Ijaz' });
      } catch (err){ /* user cancelled */ }
    } else {
      const link = document.createElement('a');
      link.download = exportFileName();
      link.href = URL.createObjectURL(blob);
      link.click();
      toast('Sharing not supported here — downloaded instead');
    }
  }, 'image/png');
});

/* ---------------------------------------------------------
   17. SAVE / GALLERY (localStorage)
   --------------------------------------------------------- */
const GALLERY_KEY = 'penaflex_gallery_v1';

function loadGallery(){
  try { return JSON.parse(localStorage.getItem(GALLERY_KEY)) || []; }
  catch (e){ return []; }
}
function persistGallery(list){
  try { localStorage.setItem(GALLERY_KEY, JSON.stringify(list)); }
  catch (e){ toast('Storage full — delete some saved designs'); }
}

$('#saveBtn').addEventListener('click', () => {
  if (state.elements.length === 0){ toast('Nothing to save yet'); return; }
  const thumbCanvas = renderExportCanvas(0.5);
  const thumb = thumbCanvas.toDataURL('image/jpeg', 0.7);
  const gallery = loadGallery();

  const record = {
    id: state.currentDesignId || newId(),
    name: ($('#commandInput').value || 'Untitled Design').slice(0, 40) || 'Untitled Design',
    thumb,
    boardW: state.boardW, boardH: state.boardH,
    bg: Object.assign({}, state.bg, { imageObj: undefined }),
    elements: state.elements.map(el => {
      const copy = Object.assign({}, el);
      delete copy.imageObj;
      if (el.type === 'image') copy._src = el.imageObj ? el.imageObj.src : el._src;
      return copy;
    }),
    savedAt: Date.now()
  };

  const idx = gallery.findIndex(g => g.id === record.id);
  if (idx >= 0) gallery[idx] = record; else gallery.unshift(record);
  persistGallery(gallery);
  state.currentDesignId = record.id;
  toast('Saved to My Designs ✓');
});

function renderGallery(){
  const grid = $('#galleryGrid');
  const gallery = loadGallery();
  grid.innerHTML = '';
  if (gallery.length === 0){
    grid.innerHTML = '<div class="gallery-empty">No saved designs yet.<br>Generate one and tap Save!</div>';
    return;
  }
  gallery.forEach(item => {
    const card = document.createElement('div');
    card.className = 'gallery-item';
    card.innerHTML = `
      <img src="${item.thumb}" alt="${item.name}" />
      <div class="gallery-item-info">
        <span class="gname">${item.name}</span>
        <div class="gallery-item-actions">
          <button data-act="edit">Edit</button>
          <button data-act="download">⬇️</button>
          <button data-act="delete" class="danger">Delete</button>
        </div>
      </div>`;
    card.querySelector('[data-act="edit"]').addEventListener('click', () => loadDesignIntoBoard(item));
    card.querySelector('[data-act="download"]').addEventListener('click', () => downloadGalleryItem(item));
    card.querySelector('[data-act="delete"]').addEventListener('click', () => {
      if (!confirm('Delete this design?')) return;
      const remaining = loadGallery().filter(g => g.id !== item.id);
      persistGallery(remaining);
      renderGallery();
      toast('Deleted');
    });
    grid.appendChild(card);
  });
}

function loadDesignIntoBoard(item){
  const loaders = [];
  const elements = item.elements.map(el => {
    const copy = Object.assign({}, el);
    if (copy.type === 'image' && copy._src){
      const img = new Image();
      loaders.push(new Promise(res => { img.onload = res; img.src = copy._src; }));
      copy.imageObj = img;
    }
    return copy;
  });
  const bg = Object.assign({}, item.bg);
  if (bg.type === 'image' && bg.image){
    const img = new Image();
    loaders.push(new Promise(res => { img.onload = res; img.src = bg.image; }));
    bg.imageObj = img;
  }
  Promise.all(loaders).then(() => {
    state.boardW = item.boardW; state.boardH = item.boardH;
    state.elements = elements;
    state.bg = bg;
    state.currentDesignId = item.id;
    $('#sizeSelect').value = `${item.boardW}x${item.boardH}`;
    deselect();
    renderBoard();
    renderOverlay();
    pushHistory();
    closeSheet('#galleryBackdrop');
    toast('Design loaded — tap Edit Mode to modify');
  });
}

function downloadGalleryItem(item){
  const link = document.createElement('a');
  link.download = `penaflex_${item.name.replace(/\s+/g,'_')}.jpg`;
  link.href = item.thumb;
  link.click();
}

$('#galleryBtn').addEventListener('click', () => { renderGallery(); openSheet('#galleryBackdrop'); });
$('#galleryCloseBtn').addEventListener('click', () => closeSheet('#galleryBackdrop'));

/* ---------------------------------------------------------
   18. PWA INSTALL PROMPT + SERVICE WORKER
   --------------------------------------------------------- */
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  $('#installBtn').classList.remove('hidden');
});
$('#installBtn').addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  $('#installBtn').classList.add('hidden');
});
window.addEventListener('appinstalled', () => toast('PenaFlex AI installed ✓'));

if ('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

/* ---------------------------------------------------------
   19. RESIZE HANDLING + INIT
   --------------------------------------------------------- */
window.addEventListener('resize', debounce(() => renderOverlay(), 120));

function init(){
  setCanvasResolution();
  renderBoard();
  pushHistory();
  $('#editModeBtn').style.opacity = '0.55';
}
init();
