document.addEventListener('DOMContentLoaded', function() {
    const campoCargo = document.querySelector('select[name="nivel"]');
    const campoComissao = document.querySelector('input[name="comissao"]');

    if (campoCargo && campoComissao) {
        function alternarComissao() {
            if (campoCargo.value === 'administrador') {
                campoComissao.style.display = 'none';
                campoComissao.value = '0';
            } else {
                campoComissao.style.display = 'block';
            }
        }
        
        alternarComissao();
        campoCargo.addEventListener('change', alternarComissao);
    }
});

document.getElementById('search-equipe')?.addEventListener('input', function() {
    const termo = this.value.toLowerCase();
    
    // Filtra na Visão de Lista (Tabela)
    document.querySelectorAll('#view-list tbody tr').forEach(linha => {
        linha.style.display = linha.innerText.toLowerCase().includes(termo) ? '' : 'none';
    });

    // Filtra na Visão de Grid (Cards)
    document.querySelectorAll('.user-card').forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(termo) ? '' : 'none';
    });
});

document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. LÓGICA DE OCULTAR COMISSÃO ---
    const selectsNivel = document.querySelectorAll('select[name="nivel"]');
    selectsNivel.forEach(select => {
        const form = select.closest('form');
        if (form) {
            const campoComissao = form.querySelector('input[name="comissao"]');
            const divComissao = campoComissao ? campoComissao.closest('.input-field') : null;

            if (campoComissao) {
                const alternarComissao = () => {
                    const alvo = divComissao || campoComissao;
                    if (select.value === 'administrador') {
                        alvo.style.display = 'none';
                        campoComissao.value = '0';
                    } else {
                        alvo.style.display = 'block'; 
                    }
                };
                alternarComissao(); 
                select.addEventListener('change', alternarComissao); 
            }
        }
    });

    // --- 2. BUSCA EM TEMPO REAL ---
    const searchEquipe = document.getElementById('search-equipe');
    if (searchEquipe) {
        searchEquipe.addEventListener('input', function() {
            const termo = this.value.toLowerCase().trim();
            
            document.querySelectorAll('#view-list tbody tr').forEach(linha => {
                linha.style.display = linha.innerText.toLowerCase().includes(termo) ? '' : 'none';
            });

            document.querySelectorAll('.user-card').forEach(card => {
                card.style.display = card.innerText.toLowerCase().includes(termo) ? '' : 'none';
            });
        });
    }
});

let direcoes = { colaborador: 1, nivel: 1 }; 

window.ordenarTabela = function(coluna) {
    const tbody = document.querySelector('#view-list tbody');
    const linhas = Array.from(tbody.querySelectorAll('tr'));
    
    // 🟢 CORREÇÃO: Ajuste para os índices reais da sua tabela
    const indexColuna = (coluna === 'colaborador') ? 2 : 3; 

    // Inverte a direção toda vez que clica
    direcoes[coluna] *= -1; 
    const direcao = direcoes[coluna];

    linhas.sort((a, b) => {
        // Pega o texto das células específicas e trata para não quebrar com espaços extras
        const cellA = a.cells[indexColuna];
        const cellB = b.cells[indexColuna];

        // Proteção extra caso alguma linha não tenha a célula esperada
        if (!cellA || !cellB) return 0;

        const valA = cellA.innerText.toLowerCase().trim();
        const valB = cellB.innerText.toLowerCase().trim();

        if (valA < valB) return -1 * direcao;
        if (valA > valB) return 1 * direcao;
        return 0;
    });

    // Limpa a tabela e reinsere as linhas na nova ordem
    tbody.innerHTML = '';
    linhas.forEach(linha => tbody.appendChild(linha));
};

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


/* ==========================================
   MENU HAMBURGUER — MOBILE
   Willy Bolsas · equipe/mobile-menu.js
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    const sidebar       = document.querySelector('.sidebar, .aba-esquerda');
    const overlay       = document.querySelector('.sidebar-overlay');
    const btnHamburger  = document.querySelector('.btn-menu-mobile');

    if (!sidebar || !overlay || !btnHamburger) return;

    // Abre / fecha a sidebar
    const toggleSidebar = () => {
        const isOpen = sidebar.classList.toggle('open');
        overlay.classList.toggle('active', isOpen);
        document.body.classList.toggle('no-scroll', isOpen);
    };

    // Clique no botão hamburguer
    btnHamburger.addEventListener('click', toggleSidebar);

    // Clique no overlay fecha a sidebar
    overlay.addEventListener('click', toggleSidebar);

    // Fecha ao navegar (útil em SPAs ou links internos)
    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    });

    // Garante que no resize para desktop o estado seja limpo
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });
});