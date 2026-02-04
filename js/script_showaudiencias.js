const HEARINGS_KEY = 'hearings';

window.addEventListener('DOMContentLoaded', renderAudienciasList);

function readAudienciasFlat() {
  try {
    const hearingsObj = JSON.parse(localStorage.getItem(HEARINGS_KEY) || '{}');
    const result = [];

    Object.entries(hearingsObj).forEach(([date, list]) => {
      list.forEach((item, idx) => {
        result.push({
          id: `${date}-${idx}`,
          data: date || '',
          hora: item.time || '',
          defensor: item.defender || '',
          processo: item.processNumber || '',
          nucleo: item.nucleus || '',
          especie: item.species || '',
          status: item.status || ''
        });
      });
    });

    return result;
  } catch (e) {
    console.error('Erro ao ler audiências:', e);
    return [];
  }
}

function escapeHtml(input) {
  if (input == null) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function formatDateBR(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function renderAudienciasList() {
  const tbody = document.getElementById('audienciasListTbody');
  if (!tbody) return;

  const list = readAudienciasFlat();

  if (!list.length) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-muted small">Nenhum registro cadastrado.</td></tr>';
    return;
  }
  
  tbody.innerHTML = list.map(item => `
    <tr data-id="${item.id}">
    <td>${escapeHtml(item.defensor)}</td>
    <td>${escapeHtml(item.processo)}</td>
    <td>${escapeHtml(formatDateBR(item.data))}</td>
    <td>${escapeHtml(item.hora)}</td> 
     <td>${escapeHtml(item.nucleo)}</td>
     <td>${escapeHtml(item.especie)}</td>
     <td>${escapeHtml(item.status)}</td>
    </tr>
  `).join('');
}