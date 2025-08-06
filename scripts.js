document.addEventListener('DOMContentLoaded', () => {
  // Tabs
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.dataset.tab;
      contents.forEach(c => c.classList.toggle('active', c.id === target));
    });
  });

  // Dados locais
  function getDevolucoes() {
    return JSON.parse(localStorage.getItem('devolucoes')) || [];
  }
  function saveDevolucoes(data) {
    localStorage.setItem('devolucoes', JSON.stringify(data));
  }

  function getRupturas() {
    return JSON.parse(localStorage.getItem('rupturas')) || [];
  }
  function saveRupturas(data) {
    localStorage.setItem('rupturas', JSON.stringify(data));
  }

  // Render Devoluções
  const devolucoesBody = document.getElementById('devolucoesBody');
  const filterTipo = document.getElementById('filterTipo');
  const modalDevolucao = document.getElementById('modalDevolucao');
  const formDevolucao = document.getElementById('formDevolucao');
  const devolucaoIndexInput = document.getElementById('devolucaoIndex');

  function renderDevolucoes() {
    const filtro = filterTipo.value;
    const dados = getDevolucoes();
    let dadosFiltrados = filtro === 'todos' ? dados : dados.filter(d => d.tipo === filtro);

    devolucoesBody.innerHTML = '';
    dadosFiltrados.forEach((d, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.pedido}</td>
        <td>${d.cliente}</td>
        <td>${d.motivo}</td>
        <td>${d.tipo}</td>
        <td>${d.retorno}</td>
        <td>${d.peca}</td>
        <td>${d.conta}</td>
        <td>${d.status}</td>
        <td>
          <button class="btn-small btn-finalizar" data-index="${i}">Finalizar</button>
          <button class="btn-small btn-editar" data-index="${i}">Editar</button>
          <button class="btn-small btn-recorrer" data-index="${i}">Recorrer</button>
        </td>
      `;
      devolucoesBody.appendChild(tr);
    });
  }

  // Abrir modal Devolucao para criar/editar
  function abrirModalDevolucao(index = null) {
    if (index !== null) {
      const dados = getDevolucoes();
      const d = dados[index];
      devolucaoIndexInput.value = index;
      formDevolucao.pedido.value = d.pedido;
      formDevolucao.cliente.value = d.cliente;
      formDevolucao.motivo.value = d.motivo;
      formDevolucao.tipo.value = d.tipo;
      formDevolucao.retorno.value = d.retorno;
      formDevolucao.peca.value = d.peca;
      formDevolucao.conta.value = d.conta;
      formDevolucao.status.value = d.status;
    } else {
      devolucaoIndexInput.value = '';
      formDevolucao.reset();
    }
    modalDevolucao.classList.remove('hidden');
  }

  // Fechar modal Devolucao
  document.getElementById('btnCancelarDevolucao').addEventListener('click', () => {
    modalDevolucao.classList.add('hidden');
  });

  // Salvar devolução (novo ou editado)
  formDevolucao.addEventListener('submit', e => {
    e.preventDefault();
    const index = devolucaoIndexInput.value;
    const dados = getDevolucoes();

    const novo = {
      pedido: formDevolucao.pedido.value,
      cliente: formDevolucao.cliente.value,
      motivo: formDevolucao.motivo.value,
      tipo: formDevolucao.tipo.value,
      retorno: formDevolucao.retorno.value,
      peca: formDevolucao.peca.value,
      conta: formDevolucao.conta.value,
      status: formDevolucao.status.value
    };

    if (index !== '') {
      dados[index] = novo;
    } else {
      dados.push(novo);
    }
    saveDevolucoes(dados);
    modalDevolucao.classList.add('hidden');
    renderDevolucoes();
  });

  // Botão nova devolução
  document.getElementById('btnNovaDevolucao').addEventListener('click', () => {
    abrirModalDevolucao();
  });

  // Eventos da tabela devoluções (delegação)
  devolucoesBody.addEventListener('click', e => {
    const btn = e.target;
    if (btn.classList.contains('btn-finalizar')) {
      const index = btn.dataset.index;
      const dados = getDevolucoes();
      dados[index].status = 'Finalizado';
      saveDevolucoes(dados);
      renderDevolucoes();
    }
    if (btn.classList.contains('btn-editar')) {
      const index = btn.dataset.index;
      abrirModalDevolucao(index);
    }
    if (btn.classList.contains('btn-recorrer')) {
      const index = btn.dataset.index;
      if (confirm('Confirmar que deseja recorrer esta devolução?')) {
        const dados = getDevolucoes();
        dados[index].status = 'Recorrendo';
        saveDevolucoes(dados);
        renderDevolucoes();
      }
    }
  });

  // Render Rupturas
  const rupturasBody = document.getElementById('rupturasBody');
  const modalRuptura = document.getElementById('modalRuptura');
  const formRuptura = document.getElementById('formRuptura');
  const rupturaIndexInput = document.getElementById('rupturaIndex');
  const statusFinalSelect = document.getElementById('statusFinalRuptura');
  const motivoRupturaInput = document.getElementById('motivoRuptura');

  function renderRupturas() {
    const dados = getRupturas();
    rupturasBody.innerHTML = '';

    dados.forEach((r, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.pedido || ''}</td>
        <td>${r.conta || ''}</td>
        <td>${r.comprador || ''}</td>
        <td>${r.codigo || ''}</td>
        <td>${r.quantidade || ''}</td>
        <td>${r.situacao || ''}</td>
        <td>${r.requisicao || ''}</td>
        <td>${r.fornecedor || ''}</td>
        <td>${r.data || ''}</td>
        <td>${r.statusFinal || ''}</td>
        <td>${r.motivo || ''}</td>
        <td>${r.valor || ''}</td>
        <td>
          <button class="btn-small btn-editar-ruptura" data-index="${i}">Editar</button>
          <button class="btn-small btn-solicitar-compra">Solicitar Compra</button>
        </td>
      `;
      rupturasBody.appendChild(tr);
    });
  }

  // Mostrar/ocultar campo motivo conforme statusFinal na ruptura
  statusFinalSelect.addEventListener('change', () => {
    motivoRupturaInput.disabled = statusFinalSelect.value !== 'Cancelado';
    if (statusFinalSelect.value !== 'Cancelado') motivoRupturaInput.value = '';
  });

  // Abrir modal ruptura para criar/editar
  function abrirModalRuptura(index = null) {
    if (index !== null) {
      const dados = getRupturas();
      const r = dados[index];
      rupturaIndexInput.value = index;
      formRuptura.pedido.value = r.pedido || '';
      formRuptura.conta.value = r.conta || '';
      formRuptura.comprador.value = r.comprador || '';
      formRuptura.codigo.value = r.codigo || '';
      formRuptura.quantidade.value = r.quantidade || '';
      formRuptura.situacao.value = r.situacao || '';
      formRuptura.requisicao.value = r.requisicao || '';
      formRuptura.fornecedor.value = r.fornecedor || '';
      formRuptura.data.value = r.data || '';
      formRuptura.statusFinal.value = r.statusFinal || '';
      formRuptura.motivo.value = r.motivo || '';
      formRuptura.valor.value = r.valor || '';
      motivoRupturaInput.disabled = r.statusFinal !== 'Cancelado';
    } else {
      rupturaIndexInput.value = '';
      formRuptura.reset();
      motivoRupturaInput.disabled = true;
    }
    modalRuptura.classList.remove('hidden');
  }

  // Fechar modal ruptura
  document.getElementById('btnCancelarRuptura').addEventListener('click', () => {
    modalRuptura.classList.add('hidden');
  });

  // Salvar ruptura
  formRuptura.addEventListener('submit', e => {
    e.preventDefault();
    const index = rupturaIndexInput.value;
    const dados = getRupturas();

    const novo = {
      pedido: formRuptura.pedido.value,
      conta: formRuptura.conta.value,
      comprador: formRuptura.comprador.value,
      codigo: formRuptura.codigo.value,
      quantidade: formRuptura.quantidade.value,
      situacao: formRuptura.situacao.value,
      requisicao: formRuptura.requisicao.value,
      fornecedor: formRuptura.fornecedor.value,
      data: formRuptura.data.value,
      statusFinal: formRuptura.statusFinal.value,
      motivo: formRuptura.motivo.value,
      valor: formRuptura.valor.value
    };

    if (index !== '') {
      dados[index] = novo;
    } else {
      dados.push(novo);
    }

    saveRupturas(dados);
    modalRuptura.classList.add('hidden');
    renderRupturas();
  });

  // Botão nova ruptura
  document.getElementById('btnNovaRuptura').addEventListener('click', () => {
    abrirModalRuptura();
  });

  // Delegação ações tabela rupturas
  rupturasBody.addEventListener('click', e => {
    const btn = e.target;
    if (btn.classList.contains('btn-editar-ruptura')) {
      abrirModalRuptura(btn.dataset.index);
    }
    if (btn.classList.contains('btn-solicitar-compra')) {
      window.open('https://192.168.0.170:5000/', '_blank');
    }
  });

  // Inicializar renderizações
  renderDevolucoes();
  renderRupturas();
});
