document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const container = document.getElementById('estoque-central-container');
    const modal = document.getElementById('modalAdicionar');

    // ==========================================
    // 1. DARK MODE (PADRONIZADO E PERSISTENTE)
    // ==========================================
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const currentTheme = localStorage.getItem('tema-willy');

    // Aplica o tema salvo ao carregar
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

    // ==========================================
    // 2. CONTROLE DO BOTÃO ADICIONAR (NOVO)
    // ==========================================
    const btnAdicionar = document.getElementById('btn-adc');
    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', (e) => {
            e.stopPropagation();
            abrirModalAdicionar();
        });
    }

    // ==========================================
    // 3. AUTO-PREENCHIMENTO DO MODAL (DATALIST)
    // ==========================================
    const modalNome = document.getElementById('modal-nome');
    if (modalNome) {
        modalNome.addEventListener('input', function(e) {
            const datalist = document.getElementById('lista-produtos-existentes');
            const option = Array.from(datalist.options).find(opt => opt.value === e.target.value);
            
            if (option) {
                document.getElementById('modal-sku').value = option.getAttribute('data-sku');
                document.getElementById('modal-custo').value = option.getAttribute('data-custo');
                document.getElementById('modal-perc-imposto').value = option.getAttribute('data-imposto');
                document.getElementById('modal-perc-varejo').value = option.getAttribute('data-perc-varejo');
                document.getElementById('modal-perc-atacado').value = option.getAttribute('data-perc-atacado');
            }
        });
    }

    // ==========================================
    // 4. BUSCA DINÂMICA (GLOBAL E VENDEDORES)
    // ==========================================
    const searchInput = document.getElementById('search-produto');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const termo = this.value.toLowerCase().trim();
            
            // Busca na tabela principal
            document.querySelectorAll('#tabela-produtos-corpo tr.produto-item').forEach(linha => {
                linha.style.display = linha.innerText.toLowerCase().includes(termo) ? '' : 'none';
            });

            // Busca na tabela de vendedor (se ativa)
            if (container) {
                const tabelaAtiva = container.querySelector('.tabela-estoque-vendedor:not(.hidden)');
                tabelaAtiva?.querySelectorAll('.produto-item').forEach(linha => {
                    linha.style.display = linha.innerText.toLowerCase().includes(termo) ? '' : 'none';
                });
            }
        });
    }

    // ==========================================
    // 5. CAPTURA DE URL E CLIQUES NA TABELA
    // ==========================================
    const params = new URLSearchParams(window.location.search);
    if (params.get('repor_sku')) {
        abrirModalCompleto(params.get('repor_sku'), params.get('repor_nome'), 'Verificar na Tabela');
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    document.querySelector('table')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-edit-table');
        if (btn) {
            const linha = btn.closest('tr');
            const dados = {
                sku: linha.cells[0].innerText.replace('#', '').trim(),
                nome: linha.querySelector('.produto-nome').innerText,
                saldo: linha.cells[2].innerText.replace(' un', '').trim(),
                compra: linha.getAttribute('data-compra'),
                imposto: linha.getAttribute('data-imposto'),
                varejo: linha.getAttribute('data-varejo'),
                atacado: linha.getAttribute('data-atacado')
            };

            abrirModalCompleto(dados.sku, dados.nome, dados.saldo);
            
            document.getElementById('modal-compra').value = dados.compra.replace('.', ',');
            document.getElementById('modal-imposto').value = dados.imposto;
            document.getElementById('modal-varejo').value = dados.varejo;
            document.getElementById('modal-atacado').value = dados.atacado;
        }
    });

    // Lógica de fechamento (ESC e Botão Cancelar)
    const btnCancelar = document.getElementById('btn-cancelar-modal');
    btnCancelar?.addEventListener('click', fecharModal);

    window.addEventListener('keydown', (e) => {
        if (e.key === "Escape") fecharModal();
    });
});

// ==========================================
// FUNÇÕES GLOBAIS
// ==========================================

window.abrirModalAdicionar = function() {
    const modal = document.getElementById('modalAdicionar');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        const skuField = document.getElementById('modal-sku');
        if (skuField && !skuField.value) {
            skuField.value = Math.floor(10000 + Math.random() * 90000).toString();
        }
    }
};

window.abrirModalCompleto = function(sku, nome, saldo = '0') {
    const modal = document.getElementById('modalAdicionar');
    if (modal) {
        document.getElementById('modal-sku').value = sku;
        document.getElementById('modal-nome').value = nome;
        document.getElementById('valor-saldo-atual').innerText = saldo;
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
};

window.fecharModal = function() {
    const modal = document.getElementById('modalAdicionar');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        const inputQtd = document.getElementsByName('quantidade')[0];
        if (inputQtd) inputQtd.value = 0;
    }
};

window.abrirEstoqueVendedor = function(username) {
    document.getElementById('vendedores-grid').classList.add('hidden');
    document.getElementById('estoque-detalhes-container').classList.remove('hidden');
    document.querySelectorAll('.tabela-estoque-vendedor').forEach(t => t.classList.add('hidden'));
    document.getElementById(`estoque-${username}`)?.classList.remove('hidden');
};

window.voltarParaCards = function() {
    document.getElementById('vendedores-grid').classList.remove('hidden');
    document.getElementById('estoque-detalhes-container').classList.add('hidden');
};

window.onclick = function(e) {
    const modal = document.getElementById('modalAdicionar');
    if (e.target === modal) fecharModal();
};

let ordemCrescente = true;
function ordenarTabela(tipo) {
    const tabela = document.getElementById('tabela-produtos-corpo');
    const linhas = Array.from(tabela.querySelectorAll('tr.produto-item'));
    const icone = document.getElementById('icon-estoque');

    linhas.sort((a, b) => {
        const valorA = parseInt(a.querySelector('.badge-status').innerText);
        const valorB = parseInt(b.querySelector('.badge-status').innerText);
        return ordemCrescente ? valorA - valorB : valorB - valorA;
    });

    ordemCrescente = !ordemCrescente;
    if (icone) icone.className = ordemCrescente ? 'fas fa-sort-amount-up' : 'fas fa-sort-amount-down';
    linhas.forEach(linha => tabela.appendChild(linha));
}

const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Trava a tela de fundo
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto'; // Destrava a tela
        });
    }