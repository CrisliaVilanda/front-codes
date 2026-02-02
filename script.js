// Basic Calendar Logic

const calendarGrid = document.getElementById('calendarGrid');
const calendarGrid2 = document.getElementById('calendarGrid2');
const currentMonthYear = document.getElementById('currentMonthYear');
const currentMonthYear2 = document.getElementById('currentMonthYear2');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const prevMonthBtn2 = document.getElementById('prevMonth2');
const nextMonthBtn2 = document.getElementById('nextMonth2');

let currentDate = new Date();
let currentDate2 = new Date();
currentDate2.setMonth(currentDate2.getMonth() + 1); // Segunda agenda começa um mês à frente
let schedules = JSON.parse(localStorage.getItem('schedules')) || {};
let activities = JSON.parse(localStorage.getItem('activities')) || {};
let notes = JSON.parse(localStorage.getItem('notes')) || {};
// Audiências (dados separados das atividades)
let hearings = JSON.parse(localStorage.getItem('hearings')) || {}; 

// Modal elements - Agendamento
const newScheduleBtn = document.getElementById('newScheduleBtn');
const saveScheduleBtn = document.getElementById('saveScheduleBtn');
const scheduleModal = new bootstrap.Modal(document.getElementById('scheduleModal'));
const scheduleForm = document.getElementById('scheduleForm');
const scheduleDate = document.getElementById('scheduleDate');
const scheduleTime = document.getElementById('scheduleTime');
const defenderName = document.getElementById('defenderName');
const assistedSelect = document.getElementById('assistedSelect');
const scheduleProcess = document.getElementById('scheduleProcess');

// Modal elements - Atividade Extrajudicial
const activityModal = new bootstrap.Modal(document.getElementById('activityModal'));
const saveActivityBtn = document.getElementById('saveActivityBtn');
const activityForm = document.getElementById('activityForm');
const activitySpecies = document.getElementById('activitySpecies');
const activityTitularity = document.getElementById('activityTitularity');
const activityNucleo = document.getElementById('activityNucleo');
const activityDate = document.getElementById('activityDate');
const activityDescription = document.getElementById('activityDescription');

// Modal elements - Audiência
const newHearingBtn = document.getElementById('newHearingBtn');
const hearingModal = new bootstrap.Modal(document.getElementById('hearingModal'));
const saveHearingBtn = document.getElementById('saveHearingBtn');
const hearingForm = document.getElementById('hearingForm');
const hearingDate = document.getElementById('hearingDate');
const hearingTime = document.getElementById('hearingTime');
const hearingDefender = document.getElementById('hearingDefender');
const hearingProcess = document.getElementById('hearingProcess');
const hearingDescription = document.getElementById('hearingDescription');

// Modal elements - Notas / Observações
const noteModal = new bootstrap.Modal(document.getElementById('noteModal'));
const saveNoteBtn = document.getElementById('saveNoteBtn');
const noteForm = document.getElementById('noteForm');
const noteTitle = document.getElementById('noteTitle');
const noteDate = document.getElementById('noteDate');
const noteTime = document.getElementById('noteTime');
const noteDescription = document.getElementById('noteDescription');

// Event listeners for modal
newScheduleBtn.addEventListener('click', () => {
  scheduleForm.reset();
  scheduleDate.valueAsDate = new Date();
  document.getElementById('scheduleModal').querySelector('.modal-header').classList.add('bg-success');
  scheduleModal.show();
});

saveScheduleBtn.addEventListener('click', () => {
  if (scheduleForm.checkValidity() === false) {
    scheduleForm.classList.add('was-validated');
    return;
  }

  const date = scheduleDate.value;
  const time = scheduleTime.value;
  const defender = defenderName.value;
  const assisted = assistedSelect.value;
  const processNumber = (scheduleProcess && scheduleProcess.value) ? scheduleProcess.value.trim() : '';

  if (!schedules[date]) {
    schedules[date] = [];
  }

  // salva o agendamento com status padrão 'agendado' e campo opcional processNumber
  schedules[date].push({
    time: time,
    defender: defender,
    assisted: assisted,
    processNumber: processNumber,
    status: 'agendado'
  });

  localStorage.setItem('schedules', JSON.stringify(schedules));
  scheduleForm.classList.remove('was-validated');
  scheduleModal.hide();
  renderCalendar(currentDate, calendarGrid, currentMonthYear);
  renderCalendar(currentDate2, calendarGrid2, currentMonthYear2);
});

function renderCalendar(date, gridElement, monthYearElement) {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Set header text
  const options = { month: 'long', year: 'numeric' };
  monthYearElement.textContent = new Intl.DateTimeFormat('pt-BR', options).format(date);

  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  // Last day of previous month
  const prevLastDay = new Date(year, month, 0);

  // Day of week for the first day (0-6)
  const firstDayIndex = firstDay.getDay();
  // Last day date
  const lastDate = lastDay.getDate();
  // Next days required to fill the grid (42 days total for 6 rows standard, or just dynamic)
  // Let's do a 6-week grid to cover all possibilities (max 42 days)

  let days = "";

  // Previous month days
  for (let x = firstDayIndex; x > 0; x--) {
    days += `<div class="calendar-day other-month"><span class="day-number">${prevLastDay.getDate() - x + 1}</span></div>`;
  }

  // Current month days
  for (let i = 1; i <= lastDate; i++) {
    const isToday = i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const daySchedules = schedules[dateStr] || [];
    const dayActivities = activities[dateStr] || [];
    // só carregar audiências quando estivermos renderizando a segunda grade ("Minhas audiências")
    const showHearings = (gridElement === calendarGrid2);
    const dayHearings = showHearings ? (hearings[dateStr] || []) : [];

    // notas sempre serão exibidas em ambas as grades
    const dayNotes = notes[dateStr] || [];
    let noteHTML = dayNotes.map((n, idx) =>
      `<div class="note-badge" data-type="note" data-date="${dateStr}" data-index="${idx}" role="button" tabindex="0" title="${n.description}" aria-label="Nota ${n.title}"><i class="bi bi-pin-angle-fill"></i> ${n.time ? n.time + ' - ' : ''}${n.title}</div>`
    ).join('');

    // Quando for a grade de Audiências mostramos APENAS audiências + observações
    if (showHearings) {
      let hearingHTML = dayHearings.map((h, idx) =>
        `<div class="hearing-badge${h.status === 'realizada' ? ' hearing-done' : ''}" data-type="hearing" data-date="${dateStr}" data-index="${idx}" role="button" tabindex="0" title="${h.description || ''} - status: ${h.status || 'a realizar'}" aria-label="Audiência ${h.processNumber || ''}"><i class="bi bi-gavel"></i> ${h.time ? h.time + ' - ' : ''}${h.defender ? h.defender + ' - ' : ''}${h.processNumber || ''}${h.status ? ` <small class="badge bg-light text-dark ms-1" aria-hidden="true">${h.status}</small>` : ''}</div>`
      ).join('');

      const hearingsContainerHTML = hearingHTML ? `<div class="hearings-container">${hearingHTML}</div>` : '';

      days += `<div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateStr}">
        <span class="day-number">${i}</span>
        ${hearingsContainerHTML}
        <div class="notes-container">${noteHTML}</div>
      </div>`;

    } else {
      // comportamento original para a grade de Atendimentos (esquerda)
      // contagens por status para resumo diário
      const scheduledCount = daySchedules.filter(s => s.status === 'agendado').length;
      const realizedCount = daySchedules.filter(s => s.status === 'realizado').length;

      let scheduleSummaryHTML = '';
      if (scheduledCount) scheduleSummaryHTML += `<div class="schedule-summary schedule-agendado" aria-hidden="true">Atendimento(s) agendados: ${scheduledCount}</div>`;
      if (realizedCount) scheduleSummaryHTML += `<div class="schedule-summary schedule-realizado" aria-hidden="true">Atendimento(s) Realizados: ${realizedCount}</div>`;

      let scheduleHTML = daySchedules.map((schedule, idx) => 
        `<div class="schedule-badge" data-type="schedule" data-date="${dateStr}" data-index="${idx}" role="button" tabindex="0" aria-label="Agendamento ${schedule.time} ${schedule.defender} ${schedule.processNumber || ''}"><i class="bi bi-calendar-check"></i> ${schedule.time} - ${schedule.defender}${schedule.processNumber ? ` - ${schedule.processNumber}` : ''}${schedule.status ? ` <small class="badge bg-light text-dark ms-1" aria-hidden="true">${schedule.status}</small>` : ''}</div>`
      ).join('');

      let activityHTML = dayActivities.map((activity, idx) =>
        `<div class="activity-badge${activity.status === 'realizada' ? ' activity-done' : ''}" data-type="activity" data-date="${dateStr}" data-index="${idx}" role="button" tabindex="0" title="${activity.description} - status: ${activity.status || 'a realizar'}" aria-label="Atividade ${activity.species} ${activity.nucleo}"><i class="bi bi-file-earmark-text"></i> ${activity.species} - ${activity.nucleo}${activity.status ? ` <small class="badge bg-light text-dark ms-1" aria-hidden="true">${activity.status}</small>` : ''}</div>`
      ).join('');

      days += `<div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateStr}">
        <span class="day-number">${i}</span>
        <div class="schedules-container">${scheduleHTML}</div>
        <div class="notes-container">${noteHTML}</div>
        <div class="activities-container">${activityHTML}</div>
      </div>`;
    } 
  }

  // Next month days
  // Calculate how many squares are left to fill a 35 (5 rows) or 42 (6 rows) grid
  // We already added firstDayIndex + lastDate cells
  const totalCells = firstDayIndex + lastDate;
  const nextDays = (totalCells <= 35) ? 35 - totalCells : 42 - totalCells;

  for (let j = 1; j <= nextDays; j++) {
    days += `<div class="calendar-day other-month"><span class="day-number">${j}</span></div>`;
  }

  gridElement.innerHTML = days;
}

prevMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate, calendarGrid, currentMonthYear);
});

nextMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate, calendarGrid, currentMonthYear);
});

prevMonthBtn2.addEventListener('click', () => {
  currentDate2.setMonth(currentDate2.getMonth() - 1);
  renderCalendar(currentDate2, calendarGrid2, currentMonthYear2);
});

nextMonthBtn2.addEventListener('click', () => {
  currentDate2.setMonth(currentDate2.getMonth() + 1);
  renderCalendar(currentDate2, calendarGrid2, currentMonthYear2);
});

// Dropdown event listeners
document.getElementById('newEventSimple').addEventListener('click', (e) => {
  e.preventDefault();
  activityForm.reset();
  activityDate.valueAsDate = new Date();
  activityModal.show();
});

document.getElementById('newEventDetailed').addEventListener('click', (e) => {
  e.preventDefault();
  noteForm.reset();
  // garantir que abrimos em modo "criar" (não editar)
  editingNote = null;
  noteDate.valueAsDate = new Date();
  noteModal.show();
});

// Novo: abrir modal de Cadastrar Audiência
newHearingBtn.addEventListener('click', (e) => {
  e.preventDefault();
  hearingForm.reset();
  hearingDate.valueAsDate = new Date();
  hearingModal.show();
});

// Salvar Nota / Observação (suporta criar e editar)
saveNoteBtn.addEventListener('click', () => {
  if (noteForm.checkValidity() === false) {
    noteForm.classList.add('was-validated');
    return;
  }

  const d = noteDate.value;
  const t = noteTime.value || '';
  const title = noteTitle.value;
  const desc = noteDescription.value || '';

  // --- CRIAR ---
  if (!editingNote) {
    if (!notes[d]) notes[d] = [];
    notes[d].push({ title: title, time: t, description: desc });

    localStorage.setItem('notes', JSON.stringify(notes));
    noteForm.classList.remove('was-validated');
    noteModal.hide();
    renderCalendar(currentDate, calendarGrid, currentMonthYear);
    renderCalendar(currentDate2, calendarGrid2, currentMonthYear2);
    return;
  }

  // --- EDITAR (pode alterar a data, então movemos se necessário) ---
  const { date: oldDate, idx } = editingNote;
  if (!notes[oldDate] || !notes[oldDate][idx]) {
    // item ausente — abortar
    editingNote = null;
    noteModal.hide();
    return;
  }

  // se a data não mudou, substituímos o objeto no lugar
  if (oldDate === d) {
    notes[oldDate][idx] = Object.assign({}, notes[oldDate][idx], { title: title, time: t, description: desc });
    localStorage.setItem('notes', JSON.stringify(notes));
    noteForm.classList.remove('was-validated');
    noteModal.hide();
    renderCalendar(currentDate, calendarGrid, currentMonthYear);
    renderCalendar(currentDate2, calendarGrid2, currentMonthYear2);
    showEventDetails('note', d, idx);
    editingNote = null;

    const alertEl = document.createElement('div');
    alertEl.className = 'alert alert-success mt-2 mb-0 py-1';
    alertEl.role = 'status';
    alertEl.textContent = 'Nota atualizada.';
    eventDetailsBody.prepend(alertEl);
    setTimeout(() => alertEl.remove(), 1600);
    return;
  }

  // se a data mudou, removemos da data antiga e adicionamos na nova
  const movingItem = Object.assign({}, notes[oldDate][idx], { title: title, time: t, description: desc });
  notes[oldDate].splice(idx, 1);
  if (notes[oldDate].length === 0) delete notes[oldDate];
  if (!notes[d]) notes[d] = [];
  notes[d].push(movingItem);
  localStorage.setItem('notes', JSON.stringify(notes));
  noteForm.classList.remove('was-validated');
  noteModal.hide();
  renderCalendar(currentDate, calendarGrid, currentMonthYear);
  renderCalendar(currentDate2, calendarGrid2, currentMonthYear2);
  showEventDetails('note', d, notes[d].length - 1);
  editingNote = null;
});

// Preenche o modal de nota para edição
function populateNoteForm(date, idx) {
  const item = (notes[date] || [])[idx];
  if (!item) return;
  noteForm.classList.remove('was-validated');
  noteTitle.value = item.title || '';
  noteDate.value = date;
  noteTime.value = item.time || '';
  noteDescription.value = item.description || '';
  editingNote = { date, idx };
  noteModal.show();
  setTimeout(() => noteTitle.focus(), 50);
}

// limpar estado de edição se o modal for fechado sem salvar
document.getElementById('noteModal').addEventListener('hidden.bs.modal', () => { editingNote = null; noteForm.classList.remove('was-validated'); });

// Salvar Audiência (novo)
saveHearingBtn.addEventListener('click', () => {
  if (hearingForm.checkValidity() === false) {
    hearingForm.classList.add('was-validated');
    return;
  }

  const date = hearingDate.value;
  const time = hearingTime.value || '';
  const defender = hearingDefender.value || '';
  const processNumber = hearingProcess.value || '';
  const description = hearingDescription.value || '';
  // O status não é editável no modal — audiências sempre são criadas como 'a realizar'
  const status = 'a realizar';

  if (!hearings[date]) hearings[date] = [];
  hearings[date].push({ time, defender, processNumber, description, status });
  localStorage.setItem('hearings', JSON.stringify(hearings));
  hearingForm.classList.remove('was-validated');
  hearingModal.hide();
  renderCalendar(currentDate, calendarGrid, currentMonthYear);
  renderCalendar(currentDate2, calendarGrid2, currentMonthYear2);
});

// status no modal removido — audiências são criadas com status padrão 'a realizar'.

// Salvar Atividade Extrajudicial
saveActivityBtn.addEventListener('click', () => {
  if (activityForm.checkValidity() === false) {
    activityForm.classList.add('was-validated');
    return;
  }

  const date = activityDate.value;
  const species = activitySpecies.value;
  const titularity = activityTitularity.value;
  const nucleo = activityNucleo.value;
  const description = activityDescription.value;

  if (!activities[date]) {
    activities[date] = [];
  }

  activities[date].push({
    species: species,
    titularity: titularity,
    nucleo: nucleo,
    description: description,
    status: 'a realizar'
  });

  localStorage.setItem('activities', JSON.stringify(activities));
  activityForm.classList.remove('was-validated');
  activityModal.hide();
  renderCalendar(currentDate, calendarGrid, currentMonthYear);
  renderCalendar(currentDate2, calendarGrid2, currentMonthYear2);
});

// --- Painel de detalhes: seleção, visualização e exclusão de eventos ---
const eventDetails = document.getElementById('eventDetails');
const eventDetailsTitle = document.getElementById('eventDetailsTitle');
const eventDetailsDate = document.getElementById('eventDetailsDate');
const eventDetailsBody = document.getElementById('eventDetailsBody');
const closeDetailsBtn = document.getElementById('closeDetailsBtn');
const deleteEventBtn = document.getElementById('deleteEventBtn');
const saveStatusBtn = document.getElementById('saveStatusBtn');

let currentDetail = null; // { type, date, index }
let editingNote = null; // { date, idx } — usado quando estamos editando uma nota existente

function showActivityStatusControl(item) {
  // retorna HTML do select (usado apenas para atividades)
  const status = item && item.status ? item.status : 'a realizar';
  return `
    <div class="mb-3 status-control">
      <label for="activityStatusSelect" class="form-label">Status</label>
      <div class="d-flex gap-2 align-items-center">
        <select id="activityStatusSelect" class="form-select form-select-sm" style="max-width:200px">
          <option value="a realizar" ${status === 'a realizar' ? 'selected' : ''}>a realizar</option>
          <option value="realizada" ${status === 'realizada' ? 'selected' : ''}>realizada</option>
        </select>
        <small class="text-muted">Atualize e clique em "Salvar status"</small>
      </div>
    </div>
  `;
}

function saveActivityStatus() {
  if (!currentDetail || currentDetail.type !== 'activity') return;
  const sel = document.getElementById('activityStatusSelect');
  if (!sel) return;
  const newStatus = sel.value;
  const { date, idx } = currentDetail;
  const item = (activities[date] || [])[idx];
  if (!item) return;
  item.status = newStatus;
  localStorage.setItem('activities', JSON.stringify(activities));
  // re-renderiza e atualiza o painel
  renderCalendar(currentDate, calendarGrid, currentMonthYear);
  renderCalendar(currentDate2, calendarGrid2, currentMonthYear2);
  showEventDetails('activity', date, idx);
  // feedback rápido
  const alertEl = document.createElement('div');
  alertEl.className = 'alert alert-success mt-2 mb-0 py-1';
  alertEl.role = 'status';
  alertEl.textContent = 'Status atualizado.';
  eventDetailsBody.prepend(alertEl);
  setTimeout(() => alertEl.remove(), 1800);
}

// atualiza showEventDetails (branch 'activity') para incluir o controle de status e mostrar o botão
function showEventDetails(type, date, idx) {
  currentDetail = { type, date, idx };
  eventDetailsTitle.textContent = (type === 'schedule') ? 'Agendamento' : (type === 'activity') ? 'Atividade' : 'Nota';
  eventDetailsDate.textContent = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(date));

  let html = '';
  if (type === 'schedule') {
    const item = (schedules[date] || [])[idx];
    if (!item) { html = '<div class="text-muted">Agendamento não encontrado.</div>'; }
    else {
      html = `
        <div class="d-flex justify-content-between align-items-start">
          <div style="min-width:0; flex:1;">
            <div class="mb-2"><strong>Hora:</strong> ${item.time || '-'} </div>
            <div class="mb-2"><strong>Defensor:</strong> ${item.defender || '-'} </div>
            <div class="mb-2"><strong>Assistido:</strong> ${item.assisted || '-'} </div>
            <div class="mb-2"><strong>Número do processo:</strong> ${item.processNumber || '-'} </div>
          </div>
          <div class="ms-3 text-end">
            <a href="#" id="viewScheduleLink" class="btn btn-link btn-sm" aria-label="Visualizar agendamento">Visualizar</a>
          </div>
        </div>
        <div class="mt-2"><strong>Status atual:</strong> ${item.status || '-'}</div>
      `;
    }
    // esconde controle de status quando não for atividade
    saveStatusBtn.classList.add('d-none');
    saveStatusBtn.setAttribute('aria-hidden', 'true');
  } else if (type === 'activity') {
    const item = (activities[date] || [])[idx];
    if (!item) { html = '<div class="text-muted">Atividade não encontrada.</div>'; }
    else {
      // conteúdo com botão 'Visualizar' alinhado ao lado oposto
      html = `
        <div class="d-flex justify-content-between align-items-start">
          <div style="min-width:0; flex:1;">
            ${showActivityStatusControl(item)}
            <div class="mb-2"><strong>Espécie:</strong> ${item.species || '-'} </div>
            <div class="mb-2"><strong>Titularidade:</strong> ${item.titularity || '-'} </div>
            <div class="mb-2"><strong>Núcleo:</strong> ${item.nucleo || '-'} </div>
            <div class="mb-2"><strong>Descrição:</strong> ${item.description || '-'} </div>
          </div>
          <div class="ms-3 text-end">
            <a href="#" id="viewActivityLink" class="btn btn-link btn-sm view-activity-link" aria-label="Visualizar atividade">Visualizar</a>
          </div>
        </div>
        <div class="mt-2"><strong>Status atual:</strong> ${item.status || '-' }</div>
      `;
    }
    // mostra botão de salvar status apenas para atividades
    saveStatusBtn.classList.remove('d-none');
    saveStatusBtn.removeAttribute('aria-hidden');
  } else if (type === 'hearing') {
    const item = (hearings[date] || [])[idx];
    if (!item) { html = '<div class="text-muted">Audiência não encontrada.</div>'; }
    else {
      html = `
        <div class="mb-2"><strong>Hora:</strong> ${item.time || '-'} </div>
        <div class="mb-2"><strong>Defensor:</strong> ${item.defender || '-'} </div>
        <div class="mb-2"><strong>Número do processo:</strong> ${item.processNumber || '-'} </div>
        <div class="mb-2"><strong>Status:</strong> ${item.status || '-'} </div>
        <div class="mb-2"><strong>Descrição:</strong> ${item.description || '-'} </div>
      `;
    }
    // esconder controle de status para audiências (não aplicável)
    saveStatusBtn.classList.add('d-none');
    saveStatusBtn.setAttribute('aria-hidden', 'true');
  } else if (type === 'note') {
    const item = (notes[date] || [])[idx];
    if (!item) { html = '<div class="text-muted">Nota não encontrada.</div>'; }
    else {
      html = `
        <div class="d-flex justify-content-between align-items-start">
          <div style="min-width:0; flex:1;">
            <div class="mb-2"><strong>Hora:</strong> ${item.time || '-'} </div>
            <div class="mb-2"><strong>Título:</strong> ${item.title || '-'} </div>
            <div class="mb-2"><strong>Descrição:</strong> ${item.description || '-'} </div>
          </div>
          <div class="ms-3 text-end">
            <a href="#" id="editNoteLink" class="btn btn-link btn-sm" aria-label="Editar nota">Editar</a>
          </div>
        </div>
      `;
    }
    saveStatusBtn.classList.add('d-none');
    saveStatusBtn.setAttribute('aria-hidden', 'true');
  }

  eventDetailsBody.innerHTML = html;

  // vincula listener ao botão 'Visualizar' — usa alerta simples conforme solicitado
  const viewLink = document.getElementById('viewActivityLink');
  if (viewLink) {
    viewLink.addEventListener('click', (ev) => {
      ev.preventDefault();
      alert('menu de atividades extrajudiciais');
    });
  }

  const viewScheduleLink = document.getElementById('viewScheduleLink');
  if (viewScheduleLink) {
    viewScheduleLink.addEventListener('click', (ev) => {
      ev.preventDefault();
      alert('acessando tela do processo');
    });
  }

  const editNoteLink = document.getElementById('editNoteLink');
  if (editNoteLink) {
    editNoteLink.addEventListener('click', (ev) => {
      ev.preventDefault();
      populateNoteForm(date, idx);
    });
  }

  eventDetails.classList.remove('d-none');
  eventDetails.scrollIntoView({ behavior: 'smooth', block: 'start' });
} 



function hideEventDetails() {
  currentDetail = null;
  eventDetails.classList.add('d-none');
}

function deleteCurrentEvent() {
  if (!currentDetail) return;
  const { type, date, idx } = currentDetail;
  if (!confirm('Confirma exclusão deste evento?')) return;

  if (type === 'schedule') {
    if (!schedules[date]) return;
    schedules[date].splice(idx, 1);
    if (schedules[date].length === 0) delete schedules[date];
    localStorage.setItem('schedules', JSON.stringify(schedules));
  } else if (type === 'activity') {
    if (!activities[date]) return;
    activities[date].splice(idx, 1);
    if (activities[date].length === 0) delete activities[date];
    localStorage.setItem('activities', JSON.stringify(activities));
  } else if (type === 'hearing') {
    if (!hearings[date]) return;
    hearings[date].splice(idx, 1);
    if (hearings[date].length === 0) delete hearings[date];
    localStorage.setItem('hearings', JSON.stringify(hearings));
  } else if (type === 'note') {
    if (!notes[date]) return;
    notes[date].splice(idx, 1);
    if (notes[date].length === 0) delete notes[date];
    localStorage.setItem('notes', JSON.stringify(notes));
  }

  renderCalendar(currentDate, calendarGrid, currentMonthYear);
  renderCalendar(currentDate2, calendarGrid2, currentMonthYear2);
  hideEventDetails();
}

// Delegation: abrir painel ao clicar em qualquer badge
document.addEventListener('click', (e) => {
  const sched = e.target.closest('.schedule-badge');
  if (sched) { showEventDetails('schedule', sched.dataset.date, Number(sched.dataset.index)); return; }
  const act = e.target.closest('.activity-badge');
  if (act) { showEventDetails('activity', act.dataset.date, Number(act.dataset.index)); return; }
  const hearing = e.target.closest('.hearing-badge');
  if (hearing) { showEventDetails('hearing', hearing.dataset.date, Number(hearing.dataset.index)); return; }
  const note = e.target.closest('.note-badge');
  if (note) { showEventDetails('note', note.dataset.date, Number(note.dataset.index)); return; }
});

// Keyboard accessibility (Enter / Space)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    const focused = document.activeElement;
    if (focused && (focused.classList.contains('schedule-badge') || focused.classList.contains('activity-badge') || focused.classList.contains('note-badge'))) {
      focused.click();
      e.preventDefault();
    }
  }
});

closeDetailsBtn.addEventListener('click', () => {
  hideEventDetails();
  // garante que o botão de salvar status volte a estado oculto
  saveStatusBtn.classList.add('d-none');
  saveStatusBtn.setAttribute('aria-hidden', 'true');
});
deleteEventBtn.addEventListener('click', deleteCurrentEvent);
saveStatusBtn.addEventListener('click', saveActivityStatus);

// Initial render
renderCalendar(currentDate, calendarGrid, currentMonthYear);
renderCalendar(currentDate2, calendarGrid2, currentMonthYear2);
