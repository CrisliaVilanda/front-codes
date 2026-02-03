// Quill editor + minimal save/load/clear (no API key required)
    const quill = new Quill('#quillEditor', {
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link', 'image'],
          ['clean']
        ]
      }
    });

    const STORAGE_KEY = 'observacoes_content';

    function showStatus(text, timeout = 1600) {
      const el = document.getElementById('saveStatus');
      el.textContent = text;
      if (timeout) setTimeout(() => { if (el.textContent === text) el.textContent = ''; }, timeout);
    }

    // small, safe HTML escaper used for list rendering
    function escapeHtml(input) {
      if (input == null) return '';
      return String(input)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // format timestamp to readable string (used in preview)
    function formatDateTime(ts) {
      try {
        const d = new Date(Number(ts));
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleString('pt-BR', {
          year: 'numeric', month: 'short', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        });
      } catch (e) { return ''; }
    }

    // helper: persist only the editor canonical content (not used for session add)
    function saveEditorContent() {
      try {
        const content = quill.root.innerHTML || '';
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ content, updatedAt: Date.now() }));
        showStatus('Conteúdo do editor salvo (canônico)');
      } catch (err) {
        console.error(err);
        showStatus('Erro ao salvar conteúdo');
      }
    }

    function loadObservacoes() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) { showStatus('Nenhum conteúdo salvo'); return; }
        const obj = JSON.parse(raw);
        const html = obj?.content ?? raw;
        quill.root.innerHTML = html || '';
        showStatus('Conteúdo carregado');
      } catch (err) {
        console.error(err);
        showStatus('Falha ao carregar');
      }
    }

    function clearObservacoes() {
      if (!confirm('Limpar conteúdo do editor?')) return;
      quill.setContents([{ insert: '\n' }]);
      localStorage.removeItem(STORAGE_KEY);
      showStatus('Conteúdo removido');
    }

    // Metadata storage (session list shown below editor)
    const META_KEY = 'observacoes_meta';

    function readMeta() {
      try { return JSON.parse(localStorage.getItem(META_KEY) || '[]'); } catch (e) { return []; }
    }
    function writeMeta(arr) { localStorage.setItem(META_KEY, JSON.stringify(arr)); }

    function renderMetaList() {
      const tbody = document.getElementById('observacoesListTbody');
      const list = readMeta();
      if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted small">Nenhum registro cadastrado.</td></tr>';
        return;
      }
      tbody.innerHTML = list.map(item => {
        return `
          <tr data-id="${item.id}">
            <td class="text-truncate" style="max-width:260px">${escapeHtml(item.nome)}</td>
            <td>${escapeHtml(item.papel)}</td>
            <td>${item.sigiloso ? 'Sim' : 'Não'}</td>
            <td class="text-end">
              <div class="btn-group btn-group-sm" role="group" aria-label="Ações">
                <button class="btn btn-sm btn-outline-primary btn-view-ob" data-id="${item.id}" title="Ver"><i class="bi bi-eye" aria-hidden="true"></i><span class="visually-hidden"> Ver</span></button>
                <button class="btn btn-sm btn-outline-danger btn-delete-ob ms-2" data-id="${item.id}" title="Excluir"><i class="bi bi-trash" aria-hidden="true"></i><span class="visually-hidden"> Excluir</span></button>
              </div>
            </td>
          </tr>`;
      }).join('');
    }

    function addMetaEntry({ nome, papel, sigiloso, content }) {
      const arr = readMeta();
      const entry = {
        id: Date.now(),
        nome,
        papel,
        sigiloso: !!sigiloso,
        createdAt: Date.now(),
        content: content || '',
        snippet: (content || '').replace(/<[^>]+>/g,'').slice(0,160)
      };
      arr.unshift(entry);
      writeMeta(arr);
      renderMetaList();
      return entry;
    }

    // delegate: view/delete buttons — view shows preview, delete removes the record from the session
    document.addEventListener('click', (ev) => {
      const viewBtn = ev.target.closest('.btn-view-ob');
      if (viewBtn) {
        ev.preventDefault();
        alert('acessando página com informações');
        const id = Number(viewBtn.dataset.id);
        const entry = readMeta().find(x => x.id === id);
        if (entry) {
          document.getElementById('previewTitle').textContent = (entry.nome ? escapeHtml(entry.nome) : 'Anotação') + (entry.papel ? (' — ' + escapeHtml(entry.papel)) : '');

          const meta = `
            <div class="mb-3 small text-muted">
              <div><strong>Criado por:</strong> ${escapeHtml(entry.nome)}</div>
              <div><strong>Papel:</strong> ${escapeHtml(entry.papel)}</div>
              <div><strong>Sigiloso:</strong> ${entry.sigiloso ? 'Sim' : 'Não'}</div>
              <div><strong>Criado:</strong> ${escapeHtml(formatDateTime(entry.createdAt))}</div>
            </div>`;

          const sigBadge = entry.sigiloso ? '<div class="mb-2"><strong class="text-danger">SIGILOSO</strong></div>' : '';
          const contentHtml = entry.content ? entry.content : '<div class="text-muted">(vazio)</div>';

          document.getElementById('previewBody').innerHTML = sigBadge + meta + '<hr/>' + contentHtml;
          new bootstrap.Modal(document.getElementById('previewModal')).show();
        }
        return;
      }

      const delBtn = ev.target.closest('.btn-delete-ob');
      if (delBtn) {
        ev.preventDefault();
        const id = Number(delBtn.dataset.id);
        if (!confirm('Confirma exclusão desta anotação da sessão?')) return;
        const list = readMeta();
        const idx = list.findIndex(x => x.id === id);
        if (idx === -1) { showStatus('Registro não encontrado'); return; }
        const [removed] = list.splice(idx, 1);
        writeMeta(list);
        renderMetaList();
        showStatus('Registro removido');
        console.debug('observacoes: removed', removed);
        return;
      }
    });

    // save: adicionar ANOTAÇÃO à sessão de anotações (metadados + conteúdo)
    function saveObservacoes() {
      const nomeEl = document.getElementById('obsNome');
      const papelEl = document.getElementById('obsPapel');
      const nomeErr = document.getElementById('obsNomeError');
      const papelErr = document.getElementById('obsPapelError');

      // reset inline errors
      nomeErr.classList.add('visually-hidden');
      papelErr.classList.add('visually-hidden');
      nomeErr.textContent = '';
      papelErr.textContent = '';

      const nome = nomeEl.value.trim();
      const papel = papelEl.value.trim();
      const sigiloso = document.getElementById('obsSigiloso').checked;

      if (!nome) {
        nomeErr.textContent = 'Informe o nome do usuário.';
        nomeErr.classList.remove('visually-hidden');
        nomeEl.focus();
        return;
      }
      if (!papel) {
        papelErr.textContent = 'Selecione o papel.';
        papelErr.classList.remove('visually-hidden');
        papelEl.focus();
        return;
      }

      try {
        const content = quill.root.innerHTML || '';
        // ONLY add to the session list (observacoes_meta)
        const entry = addMetaEntry({ nome, papel, sigiloso, content });

        showStatus('Anotação adicionada na sessão');

        // limpar apenas os campos de metadados (mantém o conteúdo no editor)
        nomeEl.value = '';
        papelEl.value = '';
        document.getElementById('obsSigiloso').checked = false;
        nomeEl.focus();

        // destacar novo registro e rolar até ele
        const row = document.querySelector(`tr[data-id="${entry.id}"]`);
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          row.classList.add('table-success');
          setTimeout(() => row.classList.remove('table-success'), 900);
        }
        console.debug('saveObservacoes: entry saved', entry);
        return entry;
      } catch (err) {
        console.error('saveObservacoes failed:', err);
        showStatus('Erro ao adicionar anotação');
        alert('Erro ao adicionar anotação — veja o console para detalhes.');
      }
    }

    // wire buttons
    document.getElementById('saveObsBtn').addEventListener('click', saveObservacoes);
    document.getElementById('loadObsBtn').addEventListener('click', loadObservacoes);
    document.getElementById('clearObsBtn').addEventListener('click', clearObservacoes);

    // auto-load on open
    window.addEventListener('DOMContentLoaded', () => { loadObservacoes(); renderMetaList(); try { document.getElementById('obsNome')?.focus(); } catch (e) {} });

    