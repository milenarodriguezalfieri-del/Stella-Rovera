import { supabase } from './supabaseClient.js?v=2';
import { STAGES, stageIconPath, stageIconWidth } from './stages.js?v=4';
import { FOOD_GROUPS } from './foodGroups.js?v=6';
import { MENU_DAYS, MENU_MEALS } from './weeklyMenu.js?v=1';

const params = new URLSearchParams(window.location.search);
const code = params.get('code');
const group = params.get('group'); // 'plan' = Plan alimentario, 'habitos' = Hábitos

const el = {
  loading: document.getElementById('loading'),
  notFound: document.getElementById('not-found'),
  diaryView: document.getElementById('diary-view'),
  greeting: document.getElementById('greeting'),
  totalProgress: document.getElementById('total-progress'),
  stageArea: document.getElementById('stage-area'),
  stageContent: document.getElementById('stage-content'),
  sectionChooser: document.getElementById('section-chooser'),
  sectionHabitos: document.getElementById('section-habitos'),
  sectionAlimentos: document.getElementById('section-alimentos'),
  sectionMenu: document.getElementById('section-menu'),
  backToChooserBtn: document.getElementById('back-to-chooser-btn'),
};

let patient = null;
let entryMap = {}; // "stage-day" -> { answer, answered_at }
let activeStage = 1;
let activeSection = null; // null = Plan alimentario chooser, 'habitos', 'alimentos', 'menu'
let foodSelections = {};
let foodNotes = {};
let menuEntries = {};
let menuNotes = '';

function show(node) {
  [el.loading, el.notFound, el.diaryView].forEach((n) => (n.style.display = 'none'));
  node.style.display = 'block';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function capitalizeWords(str) {
  return (str || '')
    .toLowerCase()
    .split(' ')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function stageIsComplete(stageNumber) {
  const stage = STAGES.find((s) => s.stage === stageNumber);
  return stage.days.every((d) => (entryMap[`${stageNumber}-${d.day}`]?.answer || '').trim().length > 0);
}

function stageIsUnlocked(stageNumber) {
  for (let s = 1; s < stageNumber; s++) {
    if (!stageIsComplete(s)) return false;
  }
  return true;
}

function hasBothSections() {
  return patient.tracking_type === 'alimentos_habitos';
}

function sectionTile({ title, description }) {
  const tile = document.createElement('div');
  tile.className = 'card stage-card';
  tile.style.cursor = 'pointer';
  tile.style.textAlign = 'center';
  tile.style.padding = '32px 20px';
  tile.style.background = 'var(--stage-bg)';
  tile.style.border = 'none';
  tile.innerHTML = `
    <div style="font-family:'Playfair Display',serif; font-weight:400; font-size:21px; line-height:1.3; color:var(--stage-text); margin-bottom:10px; min-height:2.6em; display:flex; align-items:center; justify-content:center;">${title}</div>
    <div style="font-family:'DM Sans',sans-serif; font-weight:300; font-size:14px; line-height:1.5; color:var(--stage-text); opacity:0.9;">${description}</div>
  `;
  return tile;
}

function habitosCrossLink() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn ghost no-print';
  btn.textContent = 'Ver hábitos →';
  btn.addEventListener('click', () => setActiveSection('habitos'));
  return btn;
}

function renderSectionChooser() {
  el.sectionChooser.innerHTML = '';

  const header = document.createElement('div');
  header.style.marginBottom = '20px';
  header.innerHTML = `
    <h3 style="font-family:'Playfair Display', serif; font-weight:400; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:8px;">Plan alimentario</h3>
    <p class="muted" style="margin-bottom:0;">Tu selección de alimentos y tu menú semanal, armados junto a Stella.</p>
  `;
  el.sectionChooser.appendChild(header);

  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
  grid.style.gap = '14px';
  grid.style.marginBottom = '20px';

  const alimentosTile = sectionTile({
    title: 'Selección de alimentos',
    description: 'Tu guía personalizada de alimentos, armada junto a Stella.',
  });
  alimentosTile.addEventListener('click', () => setActiveSection('alimentos'));
  grid.appendChild(alimentosTile);

  const menuTile = sectionTile({
    title: 'Menú semanal',
    description: 'Tu menú semanal personalizado, armado junto a Stella.',
  });
  menuTile.addEventListener('click', () => setActiveSection('menu'));
  grid.appendChild(menuTile);

  el.sectionChooser.appendChild(grid);

  if (hasBothSections()) {
    const navRow = document.createElement('div');
    navRow.style.marginBottom = '12px';
    navRow.appendChild(habitosCrossLink());
    el.sectionChooser.appendChild(navRow);
  }
}

function renderMenuSection() {
  el.sectionMenu.innerHTML = '';

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'btn ghost no-print';
  backBtn.textContent = '← Volver al plan alimentario';
  backBtn.addEventListener('click', () => setActiveSection(null));

  const navRow = document.createElement('div');
  
