// Basic Calendar Logic

const calendarGrid = document.getElementById('calendarGrid');
const currentMonthYear = document.getElementById('currentMonthYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

let currentDate = new Date();
let schedules = JSON.parse(localStorage.getItem('schedules')) || {};
let activities = JSON.parse(localStorage.getItem('activities')) || {};
let notes = JSON.parse(localStorage.getItem('notes')) || {};

// Modal elements - Agendamento
const newScheduleBtn = document.getElementById('newScheduleBtn');
const saveScheduleBtn = document.getElementById('saveScheduleBtn');
const scheduleModal = new bootstrap.Modal(document.getElementById('scheduleModal'));
const scheduleForm = document.getElementById('scheduleForm');
const scheduleDate = document.getElementById('scheduleDate');
const scheduleTime = document.getElementById('scheduleTime');
const defenderName = document.getElementById('defenderName');
const assistedSelect = document.getElementById('assistedSelect');

// Modal elements - Atividade Extrajudicial
const activityModal = new bootstrap.Modal(document.getElementById('activityModal'));
const saveActivityBtn = document.getElementById('saveActivityBtn');
const activityForm = document.getElementById('activityForm');
const activitySpecies = document.getElementById('activitySpecies');
const activityTitularity = document.getElementById('activityTitularity');
const activityNucleo = document.getElementById('activityNucleo');
const activityDate = document.getElementById('activityDate');
const activityDescription = document.getElementById('activityDescription');

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

  if (!schedules[date]) {
    schedules[date] = [];
  }

  schedules[date].push({
    time: time,
    defender: defender,
    assisted: assisted
  });

  localStorage.setItem('schedules', JSON.stringify(schedules));
  scheduleForm.classList.remove('was-validated');
  scheduleModal.hide();
  renderCalendar(currentDate);
});

function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Set header text
  const options = { month: 'long', year: 'numeric' };
  currentMonthYear.textContent = new Intl.DateTimeFormat('pt-BR', options).format(date);

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
    
    let scheduleHTML = daySchedules.map(schedule => 
      `<div class="schedule-badge"><i class="bi bi-calendar-check"></i> ${schedule.time} - ${schedule.defender}</div>`
    ).join('');

    let activityHTML = dayActivities.map(activity =>
      `<div class="activity-badge" title="${activity.description}"><i class="bi bi-file-earmark-text"></i> ${activity.species} - ${activity.nucleo}</div>`
    ).join('');

    const dayNotes = notes[dateStr] || [];
    let noteHTML = dayNotes.map(n =>
      `<div class="note-badge" title="${n.description}"><i class="bi bi-pin-angle-fill"></i> ${n.time ? n.time + ' - ' : ''}${n.title}</div>`
    ).join('');

    days += `<div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateStr}">
      <span class="day-number">${i}</span>
      <div class="schedules-container">${scheduleHTML}</div>
      <div class="notes-container">${noteHTML}</div>
      <div class="activities-container">${activityHTML}</div>
    </div>`;
  }

  // Next month days
  // Calculate how many squares are left to fill a 35 (5 rows) or 42 (6 rows) grid
  // We already added firstDayIndex + lastDate cells
  const totalCells = firstDayIndex + lastDate;
  const nextDays = (totalCells <= 35) ? 35 - totalCells : 42 - totalCells;

  for (let j = 1; j <= nextDays; j++) {
    days += `<div class="calendar-day other-month"><span class="day-number">${j}</span></div>`;
  }

  calendarGrid.innerHTML = days;
}

prevMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

nextMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
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
  noteDate.valueAsDate = new Date();
  noteModal.show();
});

// Salvar Nota / Observação
saveNoteBtn.addEventListener('click', () => {
  if (noteForm.checkValidity() === false) {
    noteForm.classList.add('was-validated');
    return;
  }

  const d = noteDate.value;
  const t = noteTime.value || '';
  const title = noteTitle.value;
  const desc = noteDescription.value || '';

  if (!notes[d]) notes[d] = [];

  notes[d].push({
    title: title,
    time: t,
    description: desc
  });

  localStorage.setItem('notes', JSON.stringify(notes));
  noteForm.classList.remove('was-validated');
  noteModal.hide();
  renderCalendar(currentDate);
});

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
  renderCalendar(currentDate);
});

// Initial render
renderCalendar(currentDate);
