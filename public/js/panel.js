import { supabase } from './supabaseClient.js?v=2';

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
  patientSearch: document.getElementById('patient-search'),
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
    .replace(/[̀-ͯ]/g, '')
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

function normalizeText(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function applyPatientFilter() {
  const q = normalizeText(el.patientSearch.value).trim();
  const rows = el.patientList.querySelectorAll('.patient-row');
  let visible = 0;
  rows.forEach((row) => {
    const match = !q || normalizeText(row.dataset.name).includes(q);
    row.style.display = match ? '' : 'none';
    if (match) visible++;
  });
  let msg = el.patientList.querySelector('.no-results');
  if (rows.length && visible === 0) {
    if (!msg) {
      msg = document.createElement('p');
      msg.className = 'muted no-results';
      msg.textContent = 'No hay pacientes con ese nombre.';
      el.patientList.appendChild(msg);
    }
  } else if (msg) {
    msg.remove();
  }
}

el.patientSearch.addEventListener('input', applyPatientFilter);

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
    row.dataset.name = patient.name;

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

    const linksGroup = document.createElement('div');
    linksGroup.className = 'row patient-actions-links';

    const patientUrl = `${window.location.origin}${window.location.pathname.replace('panel.html', 'formulario.html')}?code=${patient.code}`;
    const firstName = capitalizeWords(patient.name).split(' ')[0];
    const contenido = patient.tracking_type === 'alimentos_habitos'
      ? 'tu plan alimentario y tus hábitos'
      : 'tu plan alimentario';
    const whatsappMessage = [
      `Hola ${firstName}, te dejo tu espacio personal de Nutrir(se):`,
      patientUrl,
      '',
      'Cómo usarlo:',
      '• Tocá el link y se abre directo, no necesitás usuario ni contraseña.',
      `• Ahí vas a encontrar ${contenido}.`,
      '• Lo que escribas se guarda solo.',
      '• Podés volver cuando quieras con el mismo link, así que guardalo.',
    ].join('\n');

    const copyLinkBtn = document.createElement('button');
    copyLinkBtn.type = 'button';
    copyLinkBtn.className = 'btn olive-link';
    copyLinkBtn.textContent = 'Copiar link';
    copyLinkBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(patientUrl);
      copyLinkBtn.textContent = 'Copiado ✓';
      setTimeout(() => (copyLinkBtn.textContent = 'Copiar link'), 1500);
    });
    linksGroup.appendChild(copyLinkBtn);

    const whatsappBtn = document.createElement('button');
    whatsappBtn.type = 'button';
    whatsappBtn.className = 'btn olive-link';
    whatsappBtn.textContent = 'Enviar por WhatsApp';
    whatsappBtn.addEventListener('click', () => {
      window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
    });
    linksGroup.appendChild(whatsappBtn);

    actions.appendChild(linksGroup);

    const editGroup = document.createElement('div');
    editGroup.className = 'row patient-actions-edit';

    const planBtn = document.createElement('button');
    planBtn.type = 'button';
    planBtn.className = 'btn secondary btn-sm';
    planBtn.textContent = 'Plan alimentario';
    planBtn.addEventListener('click', () => {
      window.location.href = `paciente.html?id=${patient.id}&section=plan`;
    });
    editGroup.appendChild(planBtn);

    if (patient.tracking_type === 'alimentos_habitos') {
      const habitosBtn = document.createElement('button');
      habitosBtn.type = 'button';
      habitosBtn.className = 'btn secondary btn-sm';
      habitosBtn.textContent = 'Hábitos';
      habitosBtn.addEventListener('click', () => {
        window.location.href = `paciente.html?id=${patient.id}&section=habitos`;
      });
      editGroup.appendChild(habitosBtn);
    }

    actions.appendChild(editGroup);

    const secondaryActions = document.createElement('div');
    secondaryActions.className = 'row';
    secondaryActions.style.gap = '6px';
    secondaryActions.style.width = '100%';

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

    if (patient.tracking_type !== 'alimentos_habitos') {
      const addHabitosBtn = document.createElement('button');
      addHabitosBtn.type = 'button';
      addHabitosBtn.className = 'btn ghost';
      addHabitosBtn.style.marginLeft = 'auto';
      addHabitosBtn.textContent = 'Agregar hábitos';
      addHabitosBtn.addEventListener('click', async () => {
        const ok = confirm(`¿Querés agregar el seguimiento de hábitos a ${capitalizeWords(patient.name)}?`);
        if (!ok) return;
        addHabitosBtn.disabled = true;
        addHabitosBtn.textContent = 'Agregando…';
        const { error } = await supabase.from('patients').update({ tracking_type: 'alimentos_habitos' }).eq('id', patient.id);
        if (error) {
          alert('No se pudo agregar hábitos. Probá de nuevo.');
          addHabitosBtn.disabled = false;
          addHabitosBtn.textContent = 'Agregar hábitos';
          return;
        }
        loadPatients();
      });
      secondaryActions.appendChild(addHabitosBtn);
    }

    row.appendChild(actions);
    row.appendChild(secondaryActions);
    el.patientList.appendChild(row);
  }
  applyPatientFilter();
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
