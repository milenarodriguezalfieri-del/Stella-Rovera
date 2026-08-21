import { supabase } from './supabaseClient.js?v=2';
import { STAGES } from './stages.js?v=2';
import { FOOD_GROUPS } from './foodGroups.js?v=1';

const params = new URLSearchParams(window.location.search);
const patientId = params.get('id');
const printMode = params.get('print') === '1';
const requestedSection = params.get('section');

const el = {
  loading: document.getElementById('loading'),
  content: document.getElementById('content'),
  patientLabel: document.getElementById('patient-label'),
  patientSince: document.getElementById('patient-since'),
  totalProgress: document.getElementById('total-progress'),
  stageArea: document.getElementById('stage-area'),
  stageDetail: document.getElementById('stage-detail'),
  sectionTabs: document.getElementById('section-tabs'),
  sectionHabitos: document.getElementById('section-habitos'),
  sectionAlimentos: document.getElementById('section-alimentos'),
};

let entryMap = {};
let activeStage = 1;
let patientTrackingType = 'alimentos_habitos';
let activeSection = 'habitos';
let foodSelections = {};
let foodNotes = {};
let patientCreatedAtLabel = '';

function capitalizeWords(str) {
  return (str || '')
    .toLowerCase()
    .split(' ')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function requireSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = 'panel.html';
    return false;
  }
  return true;
}

function answeredCountFor(stageNumber) {
  const stage = STAGES.find((s) => s.stage === stageNumber);
  return stage.days.filter((d) => entryMap[`${stageNumber}-${d.day}`]?.answer).length;
}

function renderSectionTabs() {
  el.sectionTabs.innerHTML = '';

  const habitosBtn = document.createElement('button');
  habitosBtn.type = 'button';
  habitosBtn.className = 'btn' + (activeSection === 'habitos' ? '' : ' secondary');
  habitosBtn.textContent = 'Hábitos';
  habitosBtn.disabled = patientTrackingType !== 'alimentos_habitos';
  habitosBtn.addEventListener('click', () => setActiveSection('habitos'));
  el.sectionTabs.appendChild(habitosBtn);

  const alimentosBtn = document.createElement('button');
  alimentosBtn.type = 'button';
  alimentosBtn.className = 'btn' + (activeSection === 'alimentos' ? '' : ' secondary');
  alimentosBtn.textContent = 'Selección de alimentos';
  alimentosBtn.addEventListener('click', () => setActiveSection('alimentos'));
  el.sectionTabs.appendChild(alimentosBtn);
}

async function saveFoodPlan() {
  const { error } = await supabase.from('patient_food_plan').upsert(
    [{ patient_id: patientId, selections: foodSelections, notes: foodNotes, updated_at: new Date().toISOString() }],
    { onConflict: 'patient_id' }
  );
  return !error;
}

function renderAlimentosSection() {
  el.sectionAlimentos.innerHTML = '';

  const header = document.createElement('div');
  header.style.marginBottom = '28px';
  header.innerHTML = `
    <h3 style="font-family:'Playfair Display', serif; font-weight:400; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:10px;">Selección de alimentos</h3>
    <p class="muted" style="margin-bottom:16px;">Fecha de creación: ${patientCreatedAtLabel}</p>
    <p style="font-style: italic; font-weight: 400; color: var(--sage-deep); font-size: 19px; margin-bottom: 6px;">Alimentos que componen el plan de alimentación</p>
    <p style="font-family:'DM Sans',sans-serif; font-style:normal; font-size:16px; font-weight:300; line-height:1.6; color:var(--ink-soft);">Cantidad total por día y formas de preparación:</p>
  `;
  el.sectionAlimentos.appendChild(header);

  const saveStatus = document.createElement('div');
  saveStatus.id = 'food-save-status';
  saveStatus.className = 'muted';
  saveStatus.style.fontSize = '13px';
  saveStatus.style.marginBottom = '20px';
  saveStatus.style.minHeight = '18px';
  el.sectionAlimentos.appendChild(saveStatus);

  const flagSaving = () => { saveStatus.textContent = 'Guardando…'; };
  const flagSaved = async () => {
    const ok = await saveFoodPlan();
    saveStatus.textContent = ok ? 'Cambios guardados ✓' : 'No se pudo guardar. Probá de nuevo.';
    if (ok) setTimeout(() => { if (saveStatus.textContent === 'Cambios guardados ✓') saveStatus.textContent = ''; }, 2000);
  };

  for (const group of FOOD_GROUPS) {
    const groupCard = document.createElement('div');
    groupCard.className = 'card';
    groupCard.style.marginBottom = '20px';

    const groupTitle = document.createElement('div');
    groupTitle.style.fontFamily = "'DM Sans', sans-serif";
    groupTitle.style.fontWeight = '700';
    groupTitle.style.fontSize = '18px';
    groupTitle.style.marginBottom = '4px';
    groupTitle.textContent = group.name;
    groupCard.appendChild(groupTitle);

    if (group.note) {
      const noteEl = document.createElement('p');
      noteEl.className = 'muted';
      noteEl.style.fontSize = '13px';
      noteEl.style.fontStyle = 'italic';
      noteEl.style.marginBottom = '12px';
      noteEl.textContent = group.note;
      groupCard.appendChild(noteEl);
    }

    for (const item of group.items) {
      const itemBlock = document.createElement('div');
      itemBlock.style.marginBottom = '16px';

      const itemLabel = document.createElement('div');
      itemLabel.style.fontWeight = '500';
      itemLabel.style.marginBottom = '6px';
      itemLabel.textContent = item.name;
      itemBlock.appendChild(itemLabel);

      const optionsWrap = document.createElement('div');
      optionsWrap.style.display = 'flex';
      optionsWrap.style.flexWrap = 'wrap';
      optionsWrap.style.gap = '8px 16px';

      for (const option of item.options) {
        const optLabel = document.createElement('label');
        optLabel.style.display = 'flex';
        optLabel.style.alignItems = 'center';
        optLabel.style.gap = '6px';
        optLabel.style.fontSize = '14px';
        optLabel.style.marginBottom = '0';
        optLabel.style.cursor = 'pointer';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = (foodSelections[item.id] || []).includes(option);
        checkbox.addEventListener('change', () => {
          const current = new Set(foodSelections[item.id] || []);
          if (checkbox.checked) current.add(option); else current.delete(option);
          foodSelections[item.id] = Array.from(current);
          flagSaving();
          flagSaved();
        });

        optLabel.appendChild(checkbox);
        optLabel.appendChild(document.createTextNode(option));
        optionsWrap.appendChild(optLabel);
      }

      itemBlock.appendChild(optionsWrap);
      groupCard.appendChild(itemBlock);
    }

    const notesLabel = document.createElement('label');
    notesLabel.style.marginTop = '10px';
    notesLabel.textContent = 'Cantidad total por día y notas de preparación';
    groupCard.appendChild(notesLabel);

    const notesArea = document.createElement('textarea');
    notesArea.rows = 2;
    notesArea.value = foodNotes[group.id] || '';
    notesArea.addEventListener('blur', () => {
      foodNotes[group.id] = notesArea.value.trim();
      flagSaving();
      flagSaved();
    });
    groupCard.appendChild(notesArea);

    el.sectionAlimentos.appendChild(groupCard);
  }
}

function setActiveSection(section) {
  activeSection = section;
  el.sectionHabitos.style.display = section === 'habitos' ? 'block' : 'none';
  el.sectionAlimentos.style.display = section === 'alimentos' ? 'block' : 'none';
  renderSectionTabs();

  const url = new URL(window.location.href);
  url.searchParams.set('section', section);
  window.history.replaceState({}, '', url);
}

function renderStageCards() {
  el.stageArea.querySelectorAll('.stage-select-card, .stage-headline').forEach((node) => node.remove());

  for (const stage of STAGES) {
    const count = answeredCountFor(stage.stage);
    const card = document.createElement('div');
    card.className = 'card stage-card stage-select-card' + (stage.stage === activeStage ? ' active-stage-card' : '');
    card.style.cursor = 'pointer';
    card.style.textAlign = 'center';
    card.style.padding = '28px 12px';
    card.style.background = 'var(--stage-bg)';
    card.style.border = 'none';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.minHeight = '190px';
    if (stage.stage === activeStage) {
      card.style.boxShadow = '0 0 0 2px var(--sage-deep)';
    }
    card.innerHTML = `
      <div style="font-family:'Playfair Display',serif; text-transform:uppercase; letter-spacing:0.05em; font-size:19px; font-weight:400; color:var(--stage-text); margin-bottom:12px;">Etapa ${stage.stageRoman}</div>
      <div style="display:flex; justify-content:center; align-items:center; height:28px; margin-bottom:12px;">${count === 7 ? `<span style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:var(--rosa); color:var(--paper);"><svg width="14" height="14" viewBox="0 0 14 14"><polyline points="2,7 6,11 12,3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/></svg></span>` : ''}</div>
      <div style="font-family:'Playfair Display',serif; font-weight:400; font-size:17px; line-height:1.5; color:var(--stage-text); flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">${stage.titleRegular.trim()}<br><em style="font-size:19px; font-style:italic; font-weight:400;">${stage.titleItalic}</em></div>
      <span class="stage-progress" style="color:var(--stage-text); font-weight:400; font-size:15px; margin-top:12px;">${count}/7 días</span>
    `;
    card.addEventListener('click', () => {
      activeStage = stage.stage;
      renderStageCards();
      renderStageDetail();
    });
    el.stageArea.insertBefore(card, el.stageDetail);
  }

  const activeStageData = STAGES.find((s) => s.stage === activeStage);
  const headlineEl = document.createElement('div');
  headlineEl.className = 'stage-headline';
  headlineEl.style.marginTop = '10px';
  headlineEl.style.fontSize = '19px';
  headlineEl.style.color = 'var(--sage-deep)';
  headlineEl.innerHTML = `<span style="font-style: italic; font-weight: 400;">${activeStageData.headline}</span>${activeStageData.stageIntro ? `<div style="font-family:'DM Sans',sans-serif; font-style:normal; font-size:16px; font-weight:300; line-height:1.6; color:var(--ink-soft); margin-top:14px;">${activeStageData.stageIntro}</div>` : ''}`;
  el.stageArea.insertBefore(headlineEl, el.stageDetail);
}

function renderStageDetail() {
  const stage = STAGES.find((s) => s.stage === activeStage);
  el.stageDetail.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card fade-in';
  card.style.background = 'var(--paper)';

  const header = document.createElement('h3');
  header.style.marginBottom = '16px';
  header.style.fontFamily = "'Playfair Display', serif";
  header.style.fontWeight = '400';
  header.style.textTransform = 'uppercase';
  header.style.letterSpacing = '0.05em';
  header.textContent = `Etapa ${stage.stageRoman}`;
  card.appendChild(header);

  for (const d of stage.days) {
    const entry = entryMap[`${stage.stage}-${d.day}`];
    const row = document.createElement('div');
    row.className = 'question';
    row.style.marginBottom = '14px';

    const label = document.createElement('div');
    label.className = 'question-text';
    label.style.display = 'flex';
    label.style.justifyContent = 'space-between';
    label.innerHTML = `<span>${entry?.answered_at ? `<span style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:var(--rosa); color:var(--paper); font-size:15px; margin-right:8px; vertical-align:middle;"><svg width="14" height="14" viewBox="0 0 14 14"><polyline points="2,7 6,11 12,3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/></svg></span>` : ''}Día ${d.day}</span>${entry?.answered_at ? `<span class="muted" style="font-weight:400; font-style:italic; font-size:12px;">${formatDate(entry.answered_at)}</span>` : ''}`;
    row.appendChild(label);

    if (d.intro) {
      const intro = document.createElement('div');
      intro.style.fontSize = '17px';
      intro.style.fontStyle = 'italic';
      intro.style.lineHeight = '1.6';
      intro.style.color = '#9C9488';
      intro.style.marginBottom = '14px';
      intro.innerHTML = d.intro;
      row.appendChild(intro);
    }

    const hint = document.createElement('div');
    hint.className = 'question-hint';
    hint.textContent = d.prompt;
    row.appendChild(hint);

    if (d.hint) {
      const subHint = document.createElement('div');
      subHint.className = 'muted';
      subHint.style.fontSize = '12px';
      subHint.style.fontStyle = 'italic';
      subHint.style.marginTop = '-8px';
      subHint.style.marginBottom = '10px';
      subHint.textContent = d.hint;
      row.appendChild(subHint);
    }

    const answerBox = document.createElement('div');
    if (entry?.answer) {
      answerBox.textContent = entry.answer;
      answerBox.style.padding = '10px 12px';
      answerBox.style.background = 'var(--paper)';
      answerBox.style.border = '1px solid var(--line)';
      answerBox.style.borderRadius = 'var(--radius)';
    } else {
      answerBox.textContent = 'Todavía no respondió este día.';
      answerBox.className = 'muted';
    }
    row.appendChild(answerBox);

    card.appendChild(row);

    const divider = document.createElement('hr');
    divider.className = 'section-divider';
    divider.style.borderTop = '1px solid var(--beige-border)';
    divider.style.margin = '20px 0';
    card.appendChild(divider);
  }

  el.stageDetail.appendChild(card);
}

async function init() {
  if (!(await requireSession())) return;

  if (!patientId) {
    el.loading.textContent = 'No se especificó una paciente.';
    return;
  }

  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('id, name, code, created_at, tracking_type')
    .eq('id', patientId)
    .single();

  if (patientError || !patient) {
    el.loading.textContent = 'No se encontró esta paciente.';
    return;
  }

  patientTrackingType = patient.tracking_type || 'alimentos_habitos';
  patientCreatedAtLabel = formatDate(patient.created_at);

  el.patientLabel.textContent = `Paciente ${capitalizeWords(patient.name)}`;
  el.patientSince.textContent = `Paciente desde ${formatDate(patient.created_at)}`;

  const { data: foodPlan } = await supabase
    .from('patient_food_plan')
    .select('selections, notes')
    .eq('patient_id', patientId)
    .maybeSingle();

  foodSelections = foodPlan?.selections || {};
  foodNotes = foodPlan?.notes || {};

  const { data: entries, error: entriesError } = await supabase
    .from('diary_entries')
    .select('stage, day, answer, answered_at')
    .eq('patient_id', patientId);

  entryMap = {};
  for (const e of entriesError ? [] : entries) {
    entryMap[`${e.stage}-${e.day}`] = e;
  }

  activeStage = STAGES.find((s) => answeredCountFor(s.stage) < 7)?.stage || 1;

  const totalAnswered = STAGES.reduce((sum, s) => sum + answeredCountFor(s.stage), 0);
  el.totalProgress.textContent = `${totalAnswered} de 21 días completados`;

  renderStageCards();
  renderStageDetail();
  renderAlimentosSection();

  const initialSection = requestedSection === 'alimentos' || patientTrackingType !== 'alimentos_habitos'
    ? 'alimentos'
    : 'habitos';
  setActiveSection(initialSection);

  el.loading.style.display = 'none';
  el.content.style.display = 'block';

  if (printMode) {
    setTimeout(() => window.print(), 400);
  }
}

init();
