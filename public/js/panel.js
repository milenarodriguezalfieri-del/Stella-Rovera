import { supabase } from './supabaseClient.js?v=2';
import { buildPatientMessage } from './patientMessage.js?v=1';

const el = {
  loginView: document.getElementById('login-view'),
  dashboardView: document.getElementById('dashboard-view'),
  logoutBtn: document.getElementById('logout-btn'),
  loginForm: document.getElementById('login-form'),
  loginError: document.getElementById('login-error'),
  showNewPatientBtn: document.getElementById('show-new-patient-btn'),
  cancelNewPatientBtn: document.getElementById('cancel-new-patient-btn'),
  newPatientCard: document.getElementById('new-patient-card'),
  newPatientForm: document.getElementById('new-patient-form'),
  patientList: document.getElementById('patient-list'),
};

function capitalizeWords(str) {
  return (str || '')
    .toLowerCase()
    .split(' ')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join('')
    .slice(0, 8);
}

function generateCode(name) {
  const base = slugify(name) || 'paciente';
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${base}${suffix}`;
}

async function refreshView() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    el.loginView.style.display = 'none';
    el.dashboardView.style.display = 'block';
    el.logoutBtn.style.display = 'inline-flex';
    loadPatients();
  } else {
    el.loginView.style.display = 'block';
    el.dashboardView.style.display = 'none';
    el.logoutBtn.style.display = 'none';
  }
}

async function loadPatients() {
  el.patientList.innerHTML = '<p class="muted">Cargando…</p>';
  const { data, error } = await supabase
    .from('patients')
    .select('id, name, code, created_at, tracking_type')
    .order('created_at', { ascending: false });

  if (error) {
    el.patientList.innerHTML = '<p class="muted">No se pudo cargar la lista de pacientes.</p>';
    return;
  }

  if (!data || data.length === 0) {
    el.patientList.innerHTML = `
      <div class="empty-state">
        Todavía no agregaste pacientes.<br>Usá "+ Nueva paciente" para crear la primera.
      </div>`;
    return;
  }

  const patientIds = data.map((p) => p.id);
  const { data: entriesData } = await supabase
    .from('diary_entries')
    .select('patient_id, answer')
    .in('patient_id', patientIds);

  const patientsWithAnswers = new Set(
    (entriesData || [])
      .filter((e) => (e.answer || '').trim().length > 0)
      .map((e) => e.patient_id)
  );

  el.patientList.innerHTML = '';
  for (const patient of data) {
    const row = document.createElement('div');
    row.className = 'patient-row';

    const info = document.createElement('div');
    const hasAnswers = patientsWithAnswers.has(patient.id);
    info.innerHTML = `
      <div class="patient-name">${capitalizeWords(patient.name)}</div>
      ${
        hasAnswers
          ? `<div class="pill" style="margin-top:4px;">Nueva respuesta</div>`
          : `<div class="patient-code mono">${patient.code}</div>`
      }
    `;
    row.appendChild(info);

    const actions = document.createElement('div');
    actions.className = 'row patient-actions';

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'btn secondary btn-sm';
    copyBtn.textContent = 'Copiar link paciente';
    copyBtn.addEventListener('click', () => {
      const shareUrl = `${window.location.origin}${window.location.pathname.replace('panel.html', 'formulario.html')}?code=${patient.code}`;
      navigator.clipboard.writeText(shareUrl);
      copyBtn.textContent = 'Copiado ✓';
      setTimeout(() => (copyBtn.textContent = 'Copiar link paciente'), 1500);
    });
    actions.appendChild(copyBtn);

    const copyMsgBtn = document.createElement('button');
    copyMsgBtn.type = 'button';
    copyMsgBtn.className = 'btn secondary btn-sm';
    copyMsgBtn.textContent = 'Copiar mensaje';
    copyMsgBtn.addEventListener('click', () => {
      const shareUrl = `${window.location.origin}${window.location.pathname.replace('panel.html', 'formulario.html')}?code=${patient.code}`;
      const message = buildPatientMessage(capitalizeWords(patient.name), patient.tracking_type, shareUrl);
      navigator.clipboard.writeText(message);
      copyMsgBtn.textContent = 'Copiado ✓';
      setTimeout(() => (copyMsgBtn.textContent = 'Copiar mensaje'), 1500);
    });
    actions.appendChild(copyMsgBtn);

    const alimentosBtn = document.createElement('button');
    alimentosBtn.type = 'button';
    alimentosBtn.className = 'btn secondary btn-sm';
    alimentosBtn.textContent = 'Selección de alimentos';
    alimentosBtn.addEventListener('click', () => {
      window.location.href = `paciente.html?id=${patient.id}&section=alimentos`;
    });
    actions.appendChild(alimentosBtn);

    const menuBtn = document.createElement('button');
    menuBtn.type = 'button';
    menuBtn.className = 'btn secondary btn-sm';
    menuBtn.textContent = 'Menú semanal';
    menuBtn.addEventListener('click', () => {
      window.location.href = `paciente.html?id=${patient.id}&section=menu`;
    });
    actions.appendChild(menuBtn);

    if (patient.tracking_type === 'alimentos_habitos') {
      const habitosBtn = document.createElement('button');
      habitosBtn.type = 'button';
      habitosBtn.className = 'btn secondary btn-sm';
      habitosBtn.textContent = 'Hábitos';
      habitosBtn.addEventListener('click', () => {
        window.location.href = `paciente.html?id=${patient.id}&section=habitos`;
      });
      actions.appendChild(habitosBtn);
    }

    const secondaryActions = document.createElement('div');
    secondaryActions.className = 'row';
    secondaryActions.style.gap = '6px';
    secondaryActions.style.marginTop = '10px';

    const printBtn = document.createElement('button');
    printBtn.type = 'button';
    printBtn.className = 'btn ghost';
    printBtn.textContent = 'Imprimir - PDF';
    printBtn.addEventListener('click', () => {
      window.open(`paciente.html?id=${patient.id}&print=1`, '_blank');
    });
    secondaryActions.appendChild(printBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn ghost';
    deleteBtn.style.color = 'var(--danger)';
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.addEventListener('click', async () => {
      const confirmed = confirm(`¿Seguro que querés eliminar a ${patient.name}? Se van a borrar también todas sus respuestas guardadas. Esta acción no se puede deshacer.`);
      if (!confirmed) return;

      deleteBtn.disabled = true;
      deleteBtn.textContent = 'Eliminando…';

      const { error } = await supabase.from('patients').delete().eq('id', patient.id);

      if (error) {
        alert('No se pudo eliminar la paciente. Probá de nuevo.');
        deleteBtn.disabled = false;
        deleteBtn.textContent = 'Eliminar';
        return;
      }

      loadPatients();
    });
    secondaryActions.appendChild(deleteBtn);

    row.appendChild(actions);
    row.appendChild(secondaryActions);
    el.patientList.appendChild(row);
  }
}

el.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  el.loginError.style.display = 'none';
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    el.loginError.textContent = 'Email o contraseña incorrectos.';
    el.loginError.style.display = 'block';
    return;
  }
  refreshView();
});

el.logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  refreshView();
});

el.showNewPatientBtn.addEventListener('click', () => {
  el.newPatientCard.style.display = 'block';
  document.getElementById('patient-name').focus();
});

el.cancelNewPatientBtn.addEventListener('click', () => {
  el.newPatientCard.style.display = 'none';
  el.newPatientForm.reset();
});

el.newPatientForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nameInput = document.getElementById('patient-name');
  const name = nameInput.value.trim();
  if (!name) return;

  const trackingInput = el.newPatientForm.querySelector('input[name="tracking-type"]:checked');
  const trackingType = trackingInput ? trackingInput.value : 'alimentos_habitos';

  const code = generateCode(name);
  const { error } = await supabase.from('patients').insert({ name, code, tracking_type: trackingType });

  if (error) {
    alert('No se pudo crear la paciente. Probá de nuevo.');
    return;
  }

  el.newPatientForm.reset();
  el.newPatientCard.style.display = 'none';
  loadPatients();
});

refreshView();
