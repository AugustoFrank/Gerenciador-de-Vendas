document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const currentTheme = localStorage.getItem('tema-willy');

    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        atualizarIconeDark(true);
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            localStorage.setItem('tema-willy', isDark ? 'dark' : 'light');
            atualizarIconeDark(isDark);
        });
    }

    function atualizarIconeDark(isDark) {
        const icon = darkModeToggle?.querySelector('i');
        if (icon) {
            icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    const btnAdicionar = document.getElementById('btn-adc');
    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', (e) => {
            e.stopPropagation();
            abrirModalAdicionar();
        });
    }

    const searchInput = document.getElementById('search-produto');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const termo = this.value.toLowerCase().trim();
            document.querySelectorAll('#tabela-produtos-corpo tr.produto-item').forEach(linha => {
                linha.style.display = linha.innerText.toLowerCase().includes(termo) ? '' : 'none';
            });
        });
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('repor_sku')) {
        const sku   = params.get('repor_sku');
        const linha = document.querySelector(`tr[data-sku="${sku}"]`) ||
                      [...document.querySelectorAll('#tabela-produtos-corpo tr.produto-item')]
                        .find(r => r.cells[0].innerText.replace('#','').trim() === sku);
        if (linha) {
            abrirModalEditar(linha);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    document.querySelector('table')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-edit-table');
        if (btn) {
            const linha = btn.closest('tr');
            abrirModalEditar(linha);
        }
    });

    document.getElementById('btn-cancelar-modal')?.addEventListener('click', fecharModalAdicionar);
    document.getElementById('btn-cancelar-editar')?.addEventListener('click', fecharModalEditar);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModalAdicionar();
            fecharModalEditar();
        }
    });

    document.getElementById('modalAdicionar')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalAdicionar')) fecharModalAdicionar();
    });
    document.getElementById('modalEditar')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalEditar')) fecharModalEditar();
    });

    ['modal-compra', 'modal-imposto', 'modal-varejo', 'modal-atacado'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', calcularPreview);
    });

    ['editar-compra', 'editar-imposto', 'editar-varejo', 'editar-atacado'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', calcularPreviewEditar);
    });
});

window.abrirModalAdicionar = function () {
    const modal = document.getElementById('modalAdicionar');
    if (!modal) return;

    document.getElementById('modal-sku').value          = Math.floor(10000 + Math.random() * 90000).toString();
    document.getElementById('modal-nome').value         = '';
    document.getElementsByName('quantidade')[0].value   = 0;
    document.getElementById('modal-compra').value       = '';
    document.getElementById('modal-imposto').value      = '';
    document.getElementById('modal-varejo').value       = '';
    document.getElementById('modal-atacado').value      = '';
    document.getElementById('valor-saldo-atual').innerText = '0';

    const chkPromo = document.getElementById('modal-adicionar-promocao');
    if (chkPromo) chkPromo.checked = false;

    const preview = document.getElementById('preview-precificacao');

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.abrirModalEditar = function (linha) {
    const modal = document.getElementById('modalEditar');
    if (!modal) return;

    const sku      = linha.cells[1].innerText.replace('#', '').trim();
    const nome     = linha.querySelector('.produto-nome').innerText;
    const saldoRaw = linha.cells[3].innerText.replace(/[^\d]/g, '').trim() || '0';
    const compra   = linha.getAttribute('data-compra')   || '';
    const imposto  = linha.getAttribute('data-imposto')  || '';
    const varejo   = linha.getAttribute('data-varejo')   || '';
    const atacado  = linha.getAttribute('data-atacado')  || '';
    const promocao = linha.getAttribute('data-promocao') === 'true';

    document.getElementById('editar-sku').value             = sku;
    document.getElementById('editar-nome').value            = nome;
    document.getElementById('editar-saldo-atual').innerText = saldoRaw;
    document.getElementById('editar-compra').value          = compra.replace('.', ',');
    document.getElementById('editar-imposto').value         = imposto;
    document.getElementById('editar-varejo').value          = varejo;
    document.getElementById('editar-atacado').value         = atacado;

    const chkPromo = document.getElementById('editar-promocao');
    if (chkPromo) chkPromo.checked = promocao;

    const previewEditar = document.getElementById('preview-precificacao-editar');
    setTimeout(calcularPreviewEditar, 100);

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.fecharModalAdicionar = function () {
    const modal = document.getElementById('modalAdicionar');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    const inputQtd = modal.querySelector('[name="quantidade"]');
    if (inputQtd) inputQtd.value = 0;
};

window.fecharModalEditar = function () {
    const modal = document.getElementById('modalEditar');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
};

window.fecharModal = window.fecharModalAdicionar;

let ordemCrescente = true;

function ordenarTabela(tipo) {
    const tabela = document.getElementById('tabela-produtos-corpo');
    const linhas = Array.from(tabela.querySelectorAll('tr.produto-item'));
    const icone  = document.getElementById('icon-estoque');

    linhas.sort((a, b) => {
        const valorA = parseInt(a.querySelector('.badge-status').innerText);
        const valorB = parseInt(b.querySelector('.badge-status').innerText);
        return ordemCrescente ? valorA - valorB : valorB - valorA;
    });

    ordemCrescente = !ordemCrescente;
    if (icone) icone.className = ordemCrescente ? 'fas fa-sort-amount-up' : 'fas fa-sort-amount-down';
    linhas.forEach(linha => tabela.appendChild(linha));
}

function brl(v) {
    return 'R$ ' + v.toFixed(2).replace('.', ',');
}

function calcularPreview() {
    const custo = parseFloat(document.getElementById('modal-compra')?.value?.replace(',', '.')) || 0;
    const pImp  = parseFloat(document.getElementById('modal-imposto')?.value?.replace(',', '.')) || 0;
    const pVar  = parseFloat(document.getElementById('modal-varejo')?.value?.replace(',', '.')) || 0;
    const pAtac = parseFloat(document.getElementById('modal-atacado')?.value?.replace(',', '.')) || 0;
    const card  = document.getElementById('preview-precificacao');

    if (!card) return;
    if (custo <= 0) { card.style.display = 'none'; return; }

    card.style.display = 'block';

    const valImp = custo * (pImp  / 100);
    const base   = custo + valImp;
    const mVar   = custo * (pVar  / 100);
    const mAtac  = custo * (pAtac / 100);
    const totalV = base + mVar;
    const totalA = base + mAtac;

    document.getElementById('prev-base').textContent     = brl(base);
    document.getElementById('prev-varejo').textContent   = brl(totalV);
    document.getElementById('prev-atacado').textContent  = brl(totalA);
    document.getElementById('prev-d-custo').textContent  = brl(custo);
    document.getElementById('prev-d-imp').textContent    = brl(valImp);
    document.getElementById('prev-d-mv').textContent     = brl(mVar);
    document.getElementById('prev-d-ma').textContent     = brl(mAtac);
    document.getElementById('prev-total-v').textContent  = brl(totalV);
    document.getElementById('prev-total-a').textContent  = brl(totalA);
    document.getElementById('prev-pill-imp').textContent = pImp.toFixed(2).replace('.', ',') + '%';
    document.getElementById('prev-pill-v').textContent   = pVar.toFixed(2).replace('.', ',') + '%';
    document.getElementById('prev-pill-a').textContent   = pAtac.toFixed(2).replace('.', ',') + '%';
}

function calcularPreviewEditar() {
    const custo = parseFloat(document.getElementById('editar-compra')?.value?.replace(',', '.')) || 0;
    const pImp  = parseFloat(document.getElementById('editar-imposto')?.value?.replace(',', '.')) || 0;
    const pVar  = parseFloat(document.getElementById('editar-varejo')?.value?.replace(',', '.')) || 0;
    const pAtac = parseFloat(document.getElementById('editar-atacado')?.value?.replace(',', '.')) || 0;
    const card  = document.getElementById('preview-precificacao-editar');

    if (!card) return;
    if (custo <= 0) { card.style.display = 'none'; return; }

    card.style.display = 'block';

    const valImp = custo * (pImp  / 100);
    const base   = custo + valImp;
    const mVar   = custo * (pVar  / 100);
    const mAtac  = custo * (pAtac / 100);
    const totalV = base + mVar;
    const totalA = base + mAtac;

    document.getElementById('ep-base').textContent     = brl(base);
    document.getElementById('ep-varejo').textContent   = brl(totalV);
    document.getElementById('ep-atacado').textContent  = brl(totalA);
    document.getElementById('ep-d-custo').textContent  = brl(custo);
    document.getElementById('ep-d-imp').textContent    = brl(valImp);
    document.getElementById('ep-d-mv').textContent     = brl(mVar);
    document.getElementById('ep-d-ma').textContent     = brl(mAtac);
    document.getElementById('ep-total-v').textContent  = brl(totalV);
    document.getElementById('ep-total-a').textContent  = brl(totalA);
    document.getElementById('ep-pill-imp').textContent = pImp.toFixed(2).replace('.', ',') + '%';
    document.getElementById('ep-pill-v').textContent   = pVar.toFixed(2).replace('.', ',') + '%';
    document.getElementById('ep-pill-a').textContent   = pAtac.toFixed(2).replace('.', ',') + '%';
}

(function () {
    const LIMIAR_ESTOQUE_BAIXO = 10;

    const btnTodos      = document.getElementById('filtro-todos');
    const btnPromo      = document.getElementById('filtro-promocao');
    const btnBaixo      = document.getElementById('filtro-baixo');
    const btnZerado     = document.getElementById('filtro-zerado');
    const btnExcluidos  = document.getElementById('filtro-excluidos');
    const contagem      = document.getElementById('filtro-contagem');
    const searchInput   = document.getElementById('search-produto');
    const checkTodos    = document.getElementById('check-todos');
    const btnExcluir    = document.getElementById('btn-excluir');

    if (!btnTodos) return;

    let filtroAtivo = 'todos';
    let termoBusca  = '';

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            termoBusca = this.value.toLowerCase().trim();
            aplicarFiltros();
        });
    }

    const todosOsBotoes = [btnTodos, btnPromo, btnBaixo, btnZerado, btnExcluidos].filter(Boolean);

    btnTodos.addEventListener('click',     () => ativarFiltro('todos',      btnTodos));
    btnPromo.addEventListener('click',     () => ativarFiltro('promocao',   btnPromo));
    btnBaixo.addEventListener('click',     () => ativarFiltro('baixo',      btnBaixo));
    btnZerado.addEventListener('click',    () => ativarFiltro('zerado',     btnZerado));
    btnExcluidos?.addEventListener('click',() => ativarFiltro('excluidos',  btnExcluidos));

    function ativarFiltro(filtro, btn) {
        filtroAtivo = filtro;
        todosOsBotoes.forEach(b => {
            b.classList.remove('ativo', 'ativo-amarelo', 'ativo-vermelho');
        });
        if (filtro === 'todos')     btn.classList.add('ativo');
        if (filtro === 'promocao')  btn.classList.add('ativo-amarelo');
        if (filtro === 'baixo')     btn.classList.add('ativo-amarelo');
        if (filtro === 'zerado')    btn.classList.add('ativo-vermelho');
        if (filtro === 'excluidos') btn.classList.add('ativo-vermelho');
        aplicarFiltros();
    }

    function aplicarFiltros() {
        const linhas = document.querySelectorAll('#tabela-produtos-corpo tr.produto-item');
        let visiveis = 0;

        linhas.forEach(linha => {
            const texto    = linha.innerText.toLowerCase();
            const estoque  = parseInt(linha.querySelector('td:nth-child(4)')?.innerText || '0');
            const promocao = linha.getAttribute('data-promocao') === 'true';
            const excluido = linha.getAttribute('data-excluido') === 'true';

            const passaBusca = !termoBusca || texto.includes(termoBusca);

            let passaFiltro = true;
            if (filtroAtivo === 'todos')     passaFiltro = !excluido;
            if (filtroAtivo === 'promocao')  passaFiltro = promocao && !excluido;
            if (filtroAtivo === 'baixo')     passaFiltro = estoque > 0 && estoque < LIMIAR_ESTOQUE_BAIXO && !excluido;
            if (filtroAtivo === 'zerado')    passaFiltro = estoque <= 0 && !excluido;
            if (filtroAtivo === 'excluidos') passaFiltro = excluido;

            const visivel = passaBusca && passaFiltro;
            linha.style.display = visivel ? '' : 'none';
            if (visivel) visiveis++;
        });

        if (contagem) {
            contagem.textContent = `${visiveis} produto${visiveis !== 1 ? 's' : ''} encontrado${visiveis !== 1 ? 's' : ''}`;
        }
    }

    aplicarFiltros();

    // ── Checkboxes e Exclusão ─────────────────────────────────────
    function getSelecionados() {
        return [...document.querySelectorAll('.check-produto:checked')].map(c => c.value);
    }

    function atualizarBtnExcluir() {
        if (btnExcluir) {
            btnExcluir.style.display = getSelecionados().length > 0 ? 'inline-flex' : 'none';
        }
    }

    checkTodos?.addEventListener('change', function () {
        document.querySelectorAll('#tabela-produtos-corpo tr.produto-item:not([style*="display: none"]) .check-produto').forEach(c => {
            c.checked = this.checked;
        });
        atualizarBtnExcluir();
    });

    document.addEventListener('change', function (e) {
        if (e.target.classList.contains('check-produto')) {
            atualizarBtnExcluir();
            const visiveis = document.querySelectorAll('#tabela-produtos-corpo tr.produto-item:not([style*="display: none"]) .check-produto');
            const marcados = document.querySelectorAll('#tabela-produtos-corpo tr.produto-item:not([style*="display: none"]) .check-produto:checked');
            if (checkTodos) checkTodos.checked = visiveis.length === marcados.length && visiveis.length > 0;
        }
    });

    btnExcluir?.addEventListener('click', async function () {
        const ids = getSelecionados();
        if (ids.length === 0) return;
        if (!confirm(`Excluir ${ids.length} produto(s)? Eles sairão do estoque mas permanecerão no histórico.`)) return;

        const csrf = document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';
        try {
            const res = await fetch('/admin/excluir-produtos/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
                body: JSON.stringify({ ids }),
            });
            const data = await res.json();
            if (data.sucesso) {
                ids.forEach(id => {
                    const checkbox = document.querySelector(`.check-produto[value="${id}"]`);
                    const linha = checkbox?.closest('tr');
                    if (linha) {
                        linha.setAttribute('data-excluido', 'true');
                        checkbox.checked = false;
                    }
                });
                btnExcluir.style.display = 'none';
                if (checkTodos) checkTodos.checked = false;
                aplicarFiltros();
            }
        } catch (e) {
            console.error(e);
            alert('Erro ao excluir produtos.');
        }
    });
})();
// Accordion Preview de Precificação
document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('preview-header');
    if (!header) return;
    header.addEventListener('click', function() {
        const body = document.getElementById('preview-body');
        const chevron = document.getElementById('preview-chevron');
        const aberto = body.style.display === 'block';
        body.style.display = aberto ? 'none' : 'block';
        chevron.style.transform = aberto ? 'rotate(0deg)' : 'rotate(180deg)';
    });
});

// Accordion Preview Editar
document.addEventListener('DOMContentLoaded', function() {
    const headerEditar = document.getElementById('preview-header-editar');
    if (!headerEditar) return;
    headerEditar.addEventListener('click', function() {
        const body = document.getElementById('preview-body-editar');
        const chevron = document.getElementById('preview-chevron-editar');
        const aberto = body.style.display === 'block';
        body.style.display = aberto ? 'none' : 'block';
        chevron.style.transform = aberto ? 'rotate(0deg)' : 'rotate(180deg)';
    });
});

// Accordion Preview Editar
document.addEventListener('DOMContentLoaded', function() {
    const headerEditar = document.getElementById('preview-header-editar');
    if (!headerEditar) return;
    headerEditar.addEventListener('click', function() {
        const body = document.getElementById('preview-body-editar');
        const chevron = document.getElementById('preview-chevron-editar');
        const aberto = body.style.display === 'block';
        body.style.display = aberto ? 'none' : 'block';
        chevron.style.transform = aberto ? 'rotate(0deg)' : 'rotate(180deg)';
    });
});
