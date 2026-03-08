'use strict';
/* ═══════════════════════════════════════════════════════
   SmartCal — app.js  (Perfectionist Edition)
═══════════════════════════════════════════════════════ */

// ─── STATE ──────────────────────────────────────────────
const state = {
  today: new Date(),
  viewYear: new Date().getFullYear(),
  viewMonth: new Date().getMonth(),
  selectedDate: null,
  tasks: {},
  filter: 'all',
  editingId: null,
  deleteTarget: null,
};

const LS = 'smartcal_v3';
function loadTasks() { try { const r = localStorage.getItem(LS); if (r) state.tasks = JSON.parse(r); } catch (_) { } }
function saveTasks() { localStorage.setItem(LS, JSON.stringify(state.tasks)); }

// ─── UTILS ──────────────────────────────────────────────
const $ = id => document.getElementById(id);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const pad = n => String(n).padStart(2, '0');
const dateKey = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const getTasks = d => state.tasks[d] || [];
function getMonthTasks() {
  const p = `${state.viewYear}-${pad(state.viewMonth + 1)}`;
  const a = [];
  Object.entries(state.tasks).forEach(([k, v]) => { if (k.startsWith(p)) a.push(...v); });
  return a;
}
function escH(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function fmtParts(str) {
  const [y, m, d] = str.split('-').map(Number), dt = new Date(y, m - 1, d);
  return { day: d, mon: dt.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(), dow: dt.toLocaleDateString('en-US', { weekday: 'short' }), full: dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) };
}
function fmtTime(t) { if (!t) return ''; const [h, m] = t.split(':').map(Number); return `${(h + 11) % 12 + 1}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`; }

// ─── PAST DATE HELPER ───────────────────────────────────
function todayKey() { return dateKey(state.today.getFullYear(), state.today.getMonth() + 1, state.today.getDate()); }
function isPast(k) { return k < todayKey(); }

// ─── PRELOADER ──────────────────────────────────────────
function runPreloader() {
  const pl = $('preloader'), app = $('app');
  setTimeout(() => {
    pl.classList.add('hidden');
    app.classList.add('app-visible');
  }, 2400);
}

// ─── STAR CANVAS ────────────────────────────────────────
function initStars() {
  const cv = $('starCanvas'), ctx = cv.getContext('2d');
  function sz() { cv.width = innerWidth; cv.height = innerHeight; }
  sz(); addEventListener('resize', sz);
  const stars = Array.from({ length: 120 }, () => ({
    x: Math.random() * innerWidth, y: Math.random() * innerHeight,
    r: Math.random() * 1.2 + .3, a: Math.random(),
    sp: Math.random() * .6 + .2, ph: Math.random() * Math.PI * 2
  }));
  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    t += .008;
    stars.forEach(s => {
      ctx.globalAlpha = s.a * (0.4 + 0.6 * Math.abs(Math.sin(t * s.sp + s.ph)));
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ─── CURSOR GLOW ────────────────────────────────────────
function initCursorGlow() {
  const el = $('cursorGlow');
  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function raf() {
    cx += (mx - cx) * .1; cy += (my - cy) * .1;
    el.style.left = cx + 'px'; el.style.top = cy + 'px';
    requestAnimationFrame(raf);
  }
  raf();
}

// ─── CONFETTI ───────────────────────────────────────────
function burst(ox, oy) {
  const cv = $('confettiCanvas'), ctx = cv.getContext('2d');
  cv.width = innerWidth; cv.height = innerHeight;
  const colors = ['#818cf8', '#38bdf8', '#34d399', '#fb923c', '#f472b6', '#fbbf24', '#a78bfa'];
  const pieces = Array.from({ length: 55 }, () => ({
    x: ox, y: oy,
    vx: (Math.random() - .5) * 14, vy: (Math.random() - 1) * 14,
    r: Math.random() * 5 + 2,
    c: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * 360, rspd: (Math.random() - .5) * 12,
    a: 1, shape: Math.random() > .5 ? 'circle' : 'rect'
  }));
  let af;
  function draw() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    let alive = false;
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += .35; p.rot += p.rspd; p.a -= .018;
      if (p.a <= 0) return; alive = true;
      ctx.save(); ctx.globalAlpha = p.a; ctx.fillStyle = p.c;
      ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
      if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill(); }
      else { ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); }
      ctx.restore();
    });
    if (alive) af = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, cv.width, cv.height);
  }
  cancelAnimationFrame(af); draw();
}

// ─── RIPPLE ─────────────────────────────────────────────
function ripple(btn, e) {
  const r = document.createElement('span');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  r.className = 'ripple-el';
  r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;position:absolute`;
  btn.style.position = 'relative'; btn.style.overflow = 'hidden';
  btn.appendChild(r);
  r.addEventListener('animationend', () => r.remove());
}

// ─── LIVE CLOCK ─────────────────────────────────────────
function initClock() {
  const clk = $('liveClock'), dt = $('liveDate');
  function tick() {
    const n = new Date();
    clk.textContent = n.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    dt.textContent = n.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }
  tick(); setInterval(tick, 1000);
}

// ─── TYPING EFFECT ──────────────────────────────────────
function initTyping() {
  const el = $('typingTag');
  const phrases = ['Task Manager Pro', 'Your Productivity Hub', 'Stay Organised', 'Get Things Done', 'Plan. Track. Win.'];
  let pi = 0, ci = 0, deleting = false;
  function tick() {
    const phrase = phrases[pi];
    if (!deleting) { el.textContent = phrase.slice(0, ci + 1); ci++; if (ci === phrase.length) { deleting = true; setTimeout(tick, 1600); return; } }
    else { el.textContent = phrase.slice(0, ci - 1); ci--; if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; } }
    setTimeout(tick, deleting ? 55 : 85);
  }
  tick();
}

// ─── ANIMATED NUMBER COUNTER ────────────────────────────
function animateNum(el, target) {
  const start = parseInt(el.textContent) || 0;
  if (start === target) return;
  const dur = 600, startT = performance.now();
  function step(now) {
    const p = Math.min((now - startT) / dur, 1);
    el.textContent = Math.round(start + (target - start) * p);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ─── DONUT RINGS ────────────────────────────────────────
const CIRC = 2 * Math.PI * 22; // r=22
function setDonut(id, pct) {
  const el = $(id); if (!el) return;
  el.style.strokeDashoffset = CIRC * (1 - Math.min(pct, 1));
}

// ─── STATS UPDATE ───────────────────────────────────────
function updateStats() {
  const all = getMonthTasks(), done = all.filter(t => t.status === 'completed').length;
  const pct = all.length ? done / all.length : 0;
  animateNum($('sTotal'), all.length);
  animateNum($('sPending'), all.length - done);
  animateNum($('sDone'), done);
  setDonut('donutAll', all.length > 0 ? 1 : 0);
  setDonut('donutPend', all.length ? (all.length - done) / all.length : 0);
  setDonut('donutDone', pct);
  const pW = Math.round(pct * 100) + '%';
  $('progFill').style.width = $('progGlow').style.width = pW;
  $('progPct').textContent = Math.round(pct * 100) + '%';
  // Header chips
  $('tbStatChips').innerHTML = `
    <div class="tsc"><span class="tsc-dot" style="background:#818cf8"></span>${all.length} tasks</div>
    <div class="tsc"><span class="tsc-dot" style="background:#34d399"></span>${done} done</div>`;
}

// ─── CALENDAR ───────────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let slideDir = '';

function renderCalendar() {
  const { viewYear: Y, viewMonth: M, today: T } = state;
  $('calTitle').textContent = `${MONTHS[M]} ${Y}`;
  const todayKey = dateKey(T.getFullYear(), T.getMonth() + 1, T.getDate());
  const first = new Date(Y, M, 1).getDay();
  const days = new Date(Y, M + 1, 0).getDate();
  const prevDays = new Date(Y, M, 0).getDate();
  let html = '';
  for (let i = first - 1; i >= 0; i--) html += `<div class="cd cd-other">${prevDays - i}</div>`;
  for (let d = 1; d <= days; d++) {
    const k = dateKey(Y, M + 1, d);
    const dayT = getTasks(k);
    let cls = 'cd';
    if (k < todayKey) cls += ' cd-past';
    if (k === todayKey) cls += ' cd-today';
    if (k === state.selectedDate) cls += ' cd-sel';
    let dots = '';
    if (dayT.length) {
      dots = '<div class="cd-dots">';
      dayT.slice(0, 3).forEach(t => { dots += `<div class="cd-dot ${t.priority}"></div>`; });
      dots += '</div>';
    }
    html += `<div class="${cls}" data-k="${k}" tabindex="0">${d}${dots}</div>`;
  }
  const total = first + days, rem = total % 7 ? 7 - total % 7 : 0;
  for (let d = 1; d <= rem; d++) html += `<div class="cd cd-other">${d}</div>`;

  const grid = $('calGrid');
  grid.innerHTML = html;
  if (slideDir) { grid.classList.add(slideDir); setTimeout(() => grid.classList.remove(slideDir), 380); slideDir = ''; }

  grid.querySelectorAll('.cd:not(.cd-other)').forEach(el => {
    el.addEventListener('click', e => { ripple(el, e); selectDate(el.dataset.k); });
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') selectDate(el.dataset.k); });
  });
  updateStats();
}

function selectDate(k) {
  state.selectedDate = k;
  const past = isPast(k);
  // Disable add buttons for past dates
  $('addBtn').disabled = past;
  $('tbNewBtn').disabled = past;
  if (past) {
    $('addBtn').title = 'Cannot add tasks to past dates';
    $('tbNewBtn').title = 'Cannot add tasks to past dates';
  } else {
    $('addBtn').title = '';
    $('tbNewBtn').title = 'New Task (Ctrl+N)';
  }
  const { day, mon, dow } = fmtParts(k);
  $('phDow').textContent = dow; $('phDay').textContent = day; $('phMon').textContent = mon;
  $('phTitle').innerHTML = `<span style="background:linear-gradient(135deg,#a78bfa,#38bdf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${dow}, ${mon} ${day}</span>`;
  renderCalendar();
  renderTasks();
}

// ─── TASKS ──────────────────────────────────────────────
function renderTasks() {
  const { selectedDate: sd, filter: f } = state;
  const list = $('taskList'), empty = $('emptyView');
  if (!sd) { list.innerHTML = ''; empty.style.display = 'flex'; $('phSub').textContent = 'Pick a day from the calendar'; return; }
  // Show past-date notice in subtitle
  const pastNote = isPast(sd) ? ' · 🔒 Past date — view only' : '';

  const all = getTasks(sd);
  let tasks = all;
  if (f === 'pending') tasks = all.filter(t => t.status !== 'completed');
  if (f === 'completed') tasks = all.filter(t => t.status === 'completed');

  $('phSub').textContent = `${all.length} task${all.length !== 1 ? 's' : ''} · Showing ${tasks.length}${pastNote}`;

  if (!tasks.length) {
    list.innerHTML = ''; empty.style.display = 'flex';
    $('emptyTitle').textContent = all.length ? 'No matching tasks' : 'No tasks yet';
    $('emptyText').textContent = all.length ? 'Try a different filter.' : 'Click "New Task" to add your first task.';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = tasks.map((t, i) => cardHTML(t, i)).join('');

  // Stagger delay
  list.querySelectorAll('.task-card').forEach((el, i) => {
    el.style.animationDelay = `${i * 55}ms`;
  });

  list.querySelectorAll('[data-act]').forEach(el => {
    el.addEventListener('click', e => {
      const { act, id } = el.dataset;
      if (act === 'toggle') toggleTask(id);
      if (act === 'edit') openEdit(id);
      if (act === 'del') confirmDel(id);
      e.stopPropagation();
    });
  });
}

function cardHTML(t, i) {
  const done = t.status === 'completed';
  const pmap = { high: 'bh', medium: 'bm', low: 'bl' };
  const tc = done ? 'done-card' : t.priority + '-card';
  const timeStr = t.time ? `<span class="tc-time"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${fmtTime(t.time)}</span>` : '';
  const desc = t.desc ? `<p class="tc-desc">${escH(t.desc)}</p>` : '';
  return `<div class="task-card ${tc}" id="card-${t.id}">
    <button class="tc-check${done ? ' is-done' : ''}" data-act="toggle" data-id="${t.id}" aria-label="Toggle">
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
    </button>
    <div class="tc-body">
      <div class="tc-header">
        <span class="tc-title">${escH(t.title)}</span>
        <span class="tc-badge ${pmap[t.priority]}">${t.priority}</span>
        ${timeStr}
      </div>
      ${desc}
      <span class="tc-status ${done ? 'st-done' : 'st-pending'}">${done ? '✅ Completed' : '⏳ Pending'}</span>
    </div>
    <div class="tc-actions">
      <button class="tc-btn edit" data-act="edit" data-id="${t.id}" title="Edit">
        <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
      <button class="tc-btn del" data-act="del" data-id="${t.id}" title="Delete">
        <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5 5v6m4-6v6"/></svg>
      </button>
    </div>
  </div>`;
}

// ─── TASK CRUD ───────────────────────────────────────────
function toggleTask(id) {
  const d = state.selectedDate, task = getTasks(d).find(t => t.id === id); if (!task) return;
  const wasDone = task.status === 'completed';
  task.status = wasDone ? 'pending' : 'completed';
  saveTasks(); renderCalendar(); renderTasks();
  if (!wasDone) {
    const card = $('card-' + id);
    const check = card?.querySelector('.tc-check');
    if (check) { check.classList.add('celebrate'); setTimeout(() => check.classList.remove('celebrate'), 500); }
    const r = card?.getBoundingClientRect();
    if (r) burst(r.left + r.width / 2, r.top + r.height / 2);
    toast('Task completed! 🎉', '✓', 'success');
  } else { toast('Marked as pending', '·', 'info'); }
}

function saveTask(data) {
  const d = state.selectedDate; if (!d) return;
  if (!state.tasks[d]) state.tasks[d] = [];
  if (state.editingId) {
    const i = state.tasks[d].findIndex(t => t.id === state.editingId);
    if (i !== -1) state.tasks[d][i] = { ...state.tasks[d][i], ...data };
    toast('Task updated ✎', '✎', 'info');
  } else {
    state.tasks[d].push({ id: uid(), ...data });
    toast('Task added! 🚀', '+', 'success');
  }
  saveTasks(); renderCalendar(); renderTasks();
}

function deleteTask() {
  const { date, id } = state.deleteTarget || {}; if (!date || !id) return;
  const card = $('card-' + id);
  const doDelete = () => {
    state.tasks[date] = (state.tasks[date] || []).filter(t => t.id !== id);
    if (!state.tasks[date].length) delete state.tasks[date];
    saveTasks(); closeDelete(); renderCalendar(); renderTasks();
    toast('Task deleted', '✕', 'danger');
  };
  if (card) { card.classList.add('card-exit'); setTimeout(doDelete, 350); }
  else doDelete();
}

// ─── MODAL ───────────────────────────────────────────────
function openAdd() {
  // Guard: never allow adding tasks to past dates
  if (state.selectedDate && isPast(state.selectedDate)) {
    toast('Cannot add tasks to past dates 🔒', '!', 'danger');
    return;
  }
  state.editingId = null;
  $('modalHeading').textContent = 'New Task';
  $('modalSubhead').textContent = 'Add a task to your day';
  $('mfSaveTxt').textContent = 'Save Task';
  $('taskForm').reset();
  $('taskId').value = '';
  document.querySelector('[name="priority"][value="medium"]').checked = true;
  $('statusGroup').style.display = 'none';
  $('timeStatusRow').classList.remove('mf-row-2');
  clearErr();
  openModal('modalVeil');
  setTimeout(() => $('fTitle').focus(), 120);
}
function openEdit(id) {
  const t = getTasks(state.selectedDate).find(x => x.id === id); if (!t) return;
  state.editingId = id;
  $('modalHeading').textContent = 'Edit Task';
  $('modalSubhead').textContent = 'Make changes to your task';
  $('mfSaveTxt').textContent = 'Update Task';
  $('taskId').value = id; $('fTitle').value = t.title; $('fDesc').value = t.desc || '';
  const r = document.querySelector(`[name="priority"][value="${t.priority}"]`); if (r) r.checked = true;
  $('fTime').value = t.time || ''; $('fStatus').value = t.status;
  $('statusGroup').style.display = 'block';
  $('timeStatusRow').classList.add('mf-row-2');
  clearErr(); openModal('modalVeil');
  setTimeout(() => $('fTitle').focus(), 120);
}
function confirmDel(id) { state.deleteTarget = { date: state.selectedDate, id }; openModal('deleteVeil'); }
function openModal(id) { $(id).classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal() { $('modalVeil').classList.remove('open'); document.body.style.overflow = ''; state.editingId = null; }
function closeDelete() { $('deleteVeil').classList.remove('open'); document.body.style.overflow = ''; state.deleteTarget = null; }
function clearErr() { $('fTitle').classList.remove('err'); $('titleErr').classList.remove('show'); }

// ─── SCROLL PROGRESS ────────────────────────────────────
function initScrollProgress() {
  const area = $('taskArea'), ring = $('scrollRing'); if (!area || !ring) return;
  const CIRC2 = 2 * Math.PI * 15;
  ring.style.strokeDasharray = CIRC2;
  ring.style.strokeDashoffset = CIRC2;
  area.addEventListener('scroll', () => {
    const pct = area.scrollTop / (area.scrollHeight - area.clientHeight || 1);
    ring.style.strokeDashoffset = CIRC2 * (1 - pct);
  });
}

// ─── TOAST ───────────────────────────────────────────────
function toast(msg, icon = '✓', type = 'success') {
  const wrap = $('toastStack');
  const el = document.createElement('div');
  el.className = `toast-item ${type}`;
  el.innerHTML = `<span class="ti-icon">${icon}</span><span>${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add('removing');
    setTimeout(() => el.remove(), 380);
  }, 3000);
}

// ─── EVENTS ──────────────────────────────────────────────
$('taskForm').addEventListener('submit', e => {
  e.preventDefault();
  const title = $('fTitle').value.trim();
  if (!title) { $('fTitle').classList.add('err'); $('titleErr').classList.add('show'); $('fTitle').focus(); return; }
  clearErr();
  const priority = document.querySelector('[name="priority"]:checked')?.value || 'medium';
  saveTask({ title, desc: $('fDesc').value.trim(), priority, time: $('fTime').value || '', status: $('fStatus').value });
  closeModal();
});
$('fTitle').addEventListener('input', () => { if ($('fTitle').value.trim()) clearErr(); });

// Modal open/close
function makeAdd(btn) { btn.addEventListener('click', e => { ripple(btn, e); openAdd(); }); }
makeAdd($('addBtn')); makeAdd($('tbNewBtn'));
$('modalX').addEventListener('click', closeModal);
$('mfCancel').addEventListener('click', closeModal);
$('modalVeil').addEventListener('click', e => { if (e.target === $('modalVeil')) closeModal(); });
$('delX').addEventListener('click', closeDelete);
$('delCancel').addEventListener('click', closeDelete);
$('delConfirm').addEventListener('click', deleteTask);
$('deleteVeil').addEventListener('click', e => { if (e.target === $('deleteVeil')) closeDelete(); });

// Calendar nav
$('prevMonth').addEventListener('click', () => { slideDir = 'slide-right'; if (state.viewMonth === 0) { state.viewMonth = 11; state.viewYear--; } else state.viewMonth--; renderCalendar(); });
$('nextMonth').addEventListener('click', () => { slideDir = 'slide-left'; if (state.viewMonth === 11) { state.viewMonth = 0; state.viewYear++; } else state.viewMonth++; renderCalendar(); });
$('goToday').addEventListener('click', () => { state.viewYear = state.today.getFullYear(); state.viewMonth = state.today.getMonth(); renderCalendar(); });

// Filter
[$('fAll'), $('fPending'), $('fCompleted')].forEach(btn => {
  btn.addEventListener('click', e => {
    ripple(btn, e);
    state.filter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks();
  });
});

// Hamburger
$('hamburger').addEventListener('click', () => {
  $('hamburger').classList.toggle('open');
  $('sidebar').classList.toggle('open');
});

// Keyboard
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeDelete(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'n' && state.selectedDate) {
    e.preventDefault();
    if (isPast(state.selectedDate)) { toast('Cannot add tasks to past dates 🔒', '!', 'danger'); return; }
    openAdd();
  }
});

// ─── INIT ────────────────────────────────────────────────
function init() {
  loadTasks();
  initStars();
  initCursorGlow();
  initClock();
  initTyping();
  runPreloader();

  const tk = todayKey();
  renderCalendar();
  selectDate(tk);
  initScrollProgress();
}

init();
