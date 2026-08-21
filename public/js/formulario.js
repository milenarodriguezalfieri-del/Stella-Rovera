import { supabase } from './supabaseClient.js?v=2';
import { STAGES } from './stages.js?v=2';

const params = new URLSearchParams(window.location.search);
const code = params.get('code');

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
  backToChooserBtn: document.getElementById('back-to-chooser-btn'),
};

let patient = null;
let entryMap = {}; // "stage-day" -> { answer, answered_at }
let activeStage = 1;
let activeSection = null; // null = chooser, 'habitos', 'alimentos'

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
    <div style="font-family:'Playfair Display',serif; font-weight:400; font-size:21px; color:var(--stage-text); margin-bottom:10px;">${title}</div>
    <div style="font-family:'DM Sans',sans-serif; font-weight:300; font-size:14px; line-height:1.5; color:var(--stage-text); opacity:0.9;">${description}</div>
  `;
  return tile;
}

function renderSectionChooser() {
  el.sectionChooser.innerHTML = '';

  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = hasBothSections() ? 'repeat(2, 1fr)' : '1fr';
  grid.style.gap = '14px';
  grid.style.marginBottom = '32px';

  const alimentosTile = sectionTile({
    title: 'Selección de alimentos',
    description: 'Tu guía personalizada de alimentos, armada junto a Stella.',
  });
  alimentosTile.addEventListener('click', () => setActiveSection('alimentos'));
  grid.appendChild(alimentosTile);

  if (hasBothSections()) {
    const habitosTile = sectionTile({
      title: 'Hábitos',
      description: 'Tu diario de 21 días para reconocer y transformar tu relación con la comida.',
    });
    habitosTile.addEventListener('click', () => setActiveSection('habitos'));
    grid.appendChild(habitosTile);
  }

  el.sectionChooser.appendChild(grid);
}

function renderAlimentosSection() {
  el.sectionAlimentos.innerHTML = `
    ${hasBothSections() ? '<button type="button" class="btn ghost no-print" id="back-to-chooser-btn-alimentos" style="margin-bottom: 20px;">← Volver a las secciones</button>' : ''}
    <div class="card empty-state">
      <h3 style="margin-bottom: 10px;">Selección de alimentos</h3>
      <p class="muted">Esta sección está en construcción. Pronto vas a poder ver acá tu selección de alimentos personalizada.</p>
    </div>
  `;
  const backBtn = document.getElementById('back-to-chooser-btn-alimentos');
  if (backBtn) backBtn.addEventListener('click', () => setActiveSection(null));
}

function setActiveSection(section) {
  activeSection = section;
  el.sectionChooser.style.display = section === null ? 'block' : 'none';
  el.sectionHabitos.style.display = section === 'habitos' ? 'block' : 'none';
  el.sectionAlimentos.style.display = section === 'alimentos' ? 'block' : 'none';

  if (section === 'habitos') {
    el.backToChooserBtn.style.display = hasBothSections() ? 'inline-flex' : 'none';
  }

  if (section !== null) {
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
}

function renderStageCards() {
  el.stageArea.querySelectorAll('.stage-select-card, .stage-headline').forEach((node) => node.remove());

  for (const stage of STAGES) {
    const answeredCount = stage.days.filter((d) => (entryMap[`${stage.stage}-${d.day}`]?.answer || '').trim().length > 0).length;
    const unlocked = stageIsUnlocked(stage.stage);

    const card = document.createElement('div');
    card.className = 'card stage-select-card' + (unlocked ? ' stage-card' : '') + (stage.stage === activeStage ? ' active-stage-card' : '');
    card.style.cursor = unlocked ? 'pointer' : 'not-allowed';
    card.style.opacity = unlocked ? '1' : '0.5';
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
      <div style="display:flex; justify-content:center; align-items:center; height:28px; margin-bottom:12px;">${answeredCount === 7 ? `<span style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:var(--rosa); color:var(--paper);"><svg width="14" height="14" viewBox="0 0 14 14"><polyline points="2,7 6,11 12,3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/></svg></span>` : ''}</div>
      <div style="font-family:'Playfair Display',serif; font-weight:400; font-size:17px; line-height:1.5; color:var(--stage-text); flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">${unlocked ? `${stage.titleRegular.trim()}<br><em style="font-size:19px; font-style:italic; font-weight:400;">${stage.titleItalic}</em>` : stage.title}</div>
      <span class="stage-progress" style="color:var(--stage-text); font-weight:400; font-size:15px; margin-top:12px;">${unlocked ? `${answeredCount}/7 días` : 'Bloqueada'}</span>
    `;
    card.addEventListener('click', () => {
      if (!unlocked) return;
      activeStage = stage.stage;
      renderStageCards();
      renderStage();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const y = el.stageContent.getBoundingClientRect().top + window.scrollY - 12;
          window.scrollTo({ top: y, behavior: 'smooth' });
        });
      });
    });
    el.stageArea.insertBefore(card, el.stageContent);
  }

  const activeStageData = STAGES.find((s) => s.stage === activeStage);
  const headlineEl = document.createElement('div');
  headlineEl.className = 'stage-headline';
  headlineEl.style.marginTop = '10px';
  headlineEl.style.marginBottom = '24px';
  headlineEl.style.fontSize = '19px';
  headlineEl.style.color = 'var(--sage-deep)';
  headlineEl.innerHTML = `<span style="font-style: italic; font-weight: 400;">${activeStageData.headline}</span>${activeStageData.stageIntro ? `<div style="font-family:'DM Sans',sans-serif; font-style:normal; font-size:16px; font-weight:300; line-height:1.6; color:var(--ink-soft); margin-top:14px;">${activeStageData.stageIntro}</div>` : ''}`;
  el.stageArea.insertBefore(headlineEl, el.stageContent);
}

function showCompletionModal(stage) {
  document.querySelectorAll('.completion-modal-overlay').forEach((node) => node.remove());

  const nextStage = STAGES.find((s) => s.stage === stage.stage + 1);

  const overlay = document.createElement('div');
  overlay.className = 'completion-modal-overlay';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(46, 43, 36, 0.55)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.padding = '20px';
  overlay.style.zIndex = '1000';

  const card = document.createElement('div');
  card.style.background = 'var(--paper-raised)';
  card.style.color = 'var(--olive)';
  card.style.borderRadius = 'var(--radius)';
  card.style.padding = '32px 28px';
  card.style.maxWidth = '420px';
  card.style.textAlign = 'center';

  const msg = document.createElement('p');
  msg.style.fontFamily = "'DM Sans', sans-serif";
  msg.style.fontSize = '16px';
  msg.style.lineHeight = '1.6';
  msg.style.margin = '0 0 22px';
  msg.textContent = stage.completionMessage;
  card.appendChild(msg);

  const btnRow = document.createElement('div');
  btnRow.style.display = 'flex';
  btnRow.style.gap = '10px';
  btnRow.style.justifyContent = 'center';
  btnRow.style.flexWrap = 'wrap';

  if (nextStage) {
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn';
    nextBtn.style.background = 'var(--olive)';
    nextBtn.style.borderColor = 'var(--olive)';
    nextBtn.style.color = 'var(--beige-text)';
    nextBtn.textContent = 'Continuar a la siguiente etapa';
    nextBtn.addEventListener('click', () => {
      overlay.remove();
      document.querySelectorAll('.completion-modal-overlay').forEach((node) => node.remove());
      activeStage = nextStage.stage;
      renderStageCards();
      renderStage();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const y = el.stageContent.getBoundingClientRect().top + window.scrollY - 12;
          window.scrollTo({ top: y, behavior: 'smooth' });
        });
      });
    });
    btnRow.appendChild(nextBtn);
  }

  if (!nextStage) {
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn secondary';
    closeBtn.style.background = 'transparent';
    closeBtn.style.borderColor = 'var(--olive)';
    closeBtn.style.color = 'var(--olive)';
    closeBtn.textContent = 'Cerrar';
    closeBtn.addEventListener('click', () => {
      document.querySelectorAll('.completion-modal-overlay').forEach((node) => node.remove());
    });
    btnRow.appendChild(closeBtn);
  }

  card.appendChild(btnRow);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

async function autoSaveDay(stage, day, answer, indicatorEl, labelEl) {
  if (!answer) return;

  const existing = entryMap[`${stage.stage}-${day}`];
  if (existing && existing.answer === answer) return;

  const wasComplete = stageIsComplete(stage.stage);
  const answeredAt = new Date().toISOString();

  if (indicatorEl) indicatorEl.textContent = 'Guardando…';

  const { error } = await supabase.from('diary_entries').upsert(
    [{ patient_id: patient.id, stage: stage.stage, day, answer, answered_at: answeredAt }],
    { onConflict: 'patient_id,stage,day' }
  );

  if (error) {
    if (indicatorEl) indicatorEl.textContent = 'No se pudo guardar. Probá de nuevo.';
    return;
  }

  entryMap[`${stage.stage}-${day}`] = { answer, answered_at: answeredAt };
  if (indicatorEl) {
    indicatorEl.textContent = 'Guardado ✓';
    setTimeout(() => {
      if (indicatorEl.textContent === 'Guardado ✓') indicatorEl.textContent = '';
    }, 2000);
  }
  if (labelEl) {
    labelEl.innerHTML = `<span><span style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:var(--rosa); color:var(--paper); font-size:15px; margin-right:8px; vertical-align:middle;"><svg width="14" height="14" viewBox="0 0 14 14"><polyline points="2,7 6,11 12,3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/></svg></span>Día ${day}</span><span class="muted" style="font-weight:400; font-style:italic; font-size:13px;">${formatDate(answeredAt)}</span>`;
  }

  renderStageCards();

  const nowComplete = stageIsComplete(stage.stage);
  if (!wasComplete && nowComplete) {
    setTimeout(() => showCompletionModal(stage), 400);
  }
}

function renderStage() {
  const stage = STAGES.find((s) => s.stage === activeStage);
  el.stageContent.innerHTML = '';
  el.stageContent.classList.remove('fade-in');
  void el.stageContent.offsetWidth;
  el.stageContent.classList.add('fade-in');

  if (!stageIsUnlocked(stage.stage)) {
    const lockedMsg = document.createElement('div');
    lockedMsg.className = 'card empty-state';
    lockedMsg.textContent = 'Completá todas las respuestas de la etapa anterior para poder avanzar a esta.';
    el.stageContent.appendChild(lockedMsg);
    return;
  }

  const title = document.createElement('h3');
  title.style.marginBottom = '20px';
  title.style.fontFamily = "'Playfair Display', serif";
  title.style.fontWeight = '400';
  title.style.textTransform = 'uppercase';
  title.style.letterSpacing = '0.05em';
  title.textContent = `Etapa ${stage.stageRoman}`;
  el.stageContent.appendChild(title);

  const form = document.createElement('form');
  form.id = 'stage-form';

  for (const d of stage.days) {
    const existing = entryMap[`${stage.stage}-${d.day}`];

    const wrap = document.createElement('div');
    wrap.className = 'question';

    const label = document.createElement('div');
    label.className = 'question-text';
    label.style.display = 'flex';
    label.style.justifyContent = 'space-between';
    label.innerHTML = `<span>${existing?.answered_at ? `<span style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:var(--rosa); color:var(--paper); font-size:15px; margin-right:8px; vertical-align:middle;"><svg width="14" height="14" viewBox="0 0 14 14"><polyline points="2,7 6,11 12,3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/></svg></span>` : ''}Día ${d.day}</span>${existing?.answered_at ? `<span class="muted" style="font-weight:400; font-style:italic; font-size:13px;">${formatDate(existing.answered_at)}</span>` : ''}`;
    wrap.appendChild(label);

    if (d.intro) {
      const intro = document.createElement('div');
      intro.style.fontSize = '17px';
      intro.style.fontStyle = 'italic';
      intro.style.lineHeight = '1.6';
      intro.style.color = '#9C9488';
      intro.style.marginBottom = '16px';
      intro.innerHTML = d.intro;
      wrap.appendChild(intro);
    }

    const hint = document.createElement('div');
    hint.className = 'question-hint';
    hint.textContent = d.prompt;
    wrap.appendChild(hint);

    if (d.hint) {
      const subHint = document.createElement('div');
      subHint.className = 'muted';
      subHint.style.fontSize = '13px';
      subHint.style.fontStyle = 'italic';
      subHint.style.marginTop = '-8px';
      subHint.style.marginBottom = '10px';
      subHint.textContent = d.hint;
      wrap.appendChild(subHint);
    }

    const textarea = document.createElement('textarea');
    textarea.dataset.day = d.day;
    textarea.rows = 3;
    textarea.value = existing?.answer || '';
    wrap.appendChild(textarea);

    const saveIndicator = document.createElement('div');
    saveIndicator.style.fontSize = '12px';
    saveIndicator.style.color = 'var(--sage-deep)';
    saveIndicator.style.marginTop = '4px';
    saveIndicator.style.minHeight = '16px';
    wrap.appendChild(saveIndicator);

    textarea.addEventListener('blur', () => {
      autoSaveDay(stage, d.day, textarea.value.trim(), saveIndicator, label);
    });

    form.appendChild(wrap);

    const divider = document.createElement('hr');
    divider.className = 'section-divider';
    divider.style.borderTop = '1px solid var(--beige-border)';
    divider.style.margin = '20px 0';
    form.appendChild(divider);
  }

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn';
  submitBtn.textContent = 'Guardar respuestas de esta etapa';
  form.appendChild(submitBtn);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando…';

    const textareas = form.querySelectorAll('textarea');
    const rows = Array.from(textareas)
      .map((t) => ({ day: Number(t.dataset.day), answer: t.value.trim() }))
      .filter((r) => r.answer.length > 0)
      .map((r) => ({
        patient_id: patient.id,
        stage: activeStage,
        day: r.day,
        answer: r.answer,
        answered_at: new Date().toISOString(),
      }));

    if (rows.length === 0) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Guardar respuestas de esta etapa';
      return;
    }

    const wasComplete = stageIsComplete(activeStage);

    const { error } = await supabase
      .from('diary_entries')
      .upsert(rows, { onConflict: 'patient_id,stage,day' });

    submitBtn.disabled = false;
    submitBtn.textContent = 'Guardar respuestas de esta etapa';

    if (error) {
      alert('Hubo un problema al guardar. Probá de nuevo en un momento.');
      return;
    }

    for (const r of rows) {
      entryMap[`${r.stage}-${r.day}`] = { answer: r.answer, answered_at: r.answered_at };
    }
    const stage = STAGES.find((s) => s.stage === activeStage);
    const nowComplete = stageIsComplete(activeStage);
    renderStageCards();
    renderStage();

    if (!wasComplete && nowComplete) {
      setTimeout(() => showCompletionModal(stage), 400);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = 'Respuestas guardadas';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  });

  el.stageContent.appendChild(form);
}

async function init() {
  if (!code) {
    show(el.notFound);
    return;
  }

  const { data: patientRows, error: patientError } = await supabase.rpc('get_patient_by_code', { p_code: code });
  if (patientError || !patientRows || patientRows.length === 0) {
    show(el.notFound);
    return;
  }
  patient = patientRows[0];

  const { data: entries } = await supabase.rpc('get_patient_entries', { p_code: code });
  entryMap = {};
  for (const e of entries || []) {
    entryMap[`${e.stage}-${e.day}`] = { answer: e.answer, answered_at: e.answered_at };
  }

  activeStage = STAGES.find((s) => !stageIsComplete(s.stage) && stageIsUnlocked(s.stage))?.stage || 1;

  el.greeting.textContent = `Hola ${capitalizeWords(patient.name)}, este espacio es solo tuyo.`;
  const totalAnswered = STAGES.reduce((sum, s) => sum + s.days.filter((d) => (entryMap[`${s.stage}-${d.day}`]?.answer || '').trim().length > 0).length, 0);
  el.totalProgress.textContent = `${totalAnswered} de 21 días completados`;

  el.backToChooserBtn.addEventListener('click', () => setActiveSection(null));

  renderSectionChooser();
  renderAlimentosSection();
  renderStageCards();
  renderStage();
  setActiveSection(null);

  show(el.diaryView);
}

init();
