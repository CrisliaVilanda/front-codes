const REALIZADOS_KEY = 'realizados';

document.addEventListener('DOMContentLoaded', renderRealizados);

function renderRealizados() {
  const tbody = document.getElementById('realizadosTbody');
  if (!tbody) return;

  const realizados = [];

  // atividades
  const activities = JSON.parse(localStorage.getItem('activities') || '{}');
  Object.entries(activities).forEach(([date, list]) => {
    list.forEach(item => {
      if (item.status === 'realizado') {
        realizados.push({
          data: date,
          tipo: 'Atividade',
          processo: item.processNumber || 'Não possui processo',
          descricao: item.description || '-',
          status: item.status
        });
      }
    });
  });

  // agendamentos
  const schedules = JSON.parse(localStorage.getItem('schedules') || '{}');
  Object.entries(schedules).forEach(([date, list]) => {
    list.forEach(item => {
      if (item.status === 'realizado') {
        realizados.push({
          data: date,
          tipo: 'Agendamento',
          processo: item.processNumber || '-',
          descricao: `${item.defender || ''} ${item.processNumber || ''}`,
          status: item.status
        });
      }
    });
  });

  //audiências
  const hearings = JSON.parse(localStorage.getItem('hearings') || '{}');
  Object.entries(hearings).forEach(([date, list]) => {
    list.forEach(item => {
      if (item.status === 'realizado') {
        realizados.push({
          data: date,
          tipo: 'Audiência',
          processo: item.processNumber || '-',
          descricao: `${item.defender || ''} ${item.processNumber || ''}`,
          status: item.status
        });
      }
    });
  });

  if (!realizados.length) {
    tbody.innerHTML =
      `<tr><td colspan="4" class="text-muted">Nenhum registro realizado.</td></tr>`;
    return;
  }
  console.log(realizados);

  tbody.innerHTML = realizados.map(r => `
    <tr>
      <td>${formatDateBR(r.data)}</td>
      <td>${r.tipo}</td>
      <td>${r.processo || '-'}</td>
      <td>${escapeHtml(r.descricao)}</td>
      <td><span class="badge bg-success">Realizado</span></td>
    </tr>
  `).join('');
}

/* helpers */
function formatDateBR(d) {
  return new Date(d).toLocaleDateString('pt-BR');
}

function escapeHtml(t) {
  return t ? t.replace(/[&<>"']/g, m =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])
  ) : '';
}