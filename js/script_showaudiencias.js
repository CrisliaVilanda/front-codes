// tabela para mostrar todas as audiências cadastradas
    // audienciasListTbody
    function renderAudienciasList() {
      const tbody = document.getElementById('audienciasListTbody');
      const list = readAudiencias();
      if(!list.length){
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted small">Nenhum registro cadastrado.</td></tr>';
        return;
      }
      tbody.innerHTML = list.map(item => {
        return `
          <tr data-id="${item.id}">
          <td class="text-truncate" style="max-width:260px">${escapeHtml(item.tipo)}</td>
          <td>${escapeHtml(item.data)}</td>
          <td>${escapeHtml(item.local)}</td>
          <td class="text-end">
            <div class="btn-group btn-group-sm" role="group" aria-label="Ações">
              <button class="btn btn-sm btn-outline-primary btn-view-audiencia" data-id="${item.id}" title="Ver"><i class="bi bi-eye" aria-hidden="true"></i><span class="visually-hidden"> Ver</span></button>
              <button class="btn btn-sm btn-outline-danger btn-delete-audiencia ms-2" data-id="${item.id}" title="Excluir"><i class="bi bi-trash" aria-hidden="true"></i><span class="visually-hidden"> Excluir</span></button>
            </div>
          </td>
          </tr>`;
      }).join('');
      
    }