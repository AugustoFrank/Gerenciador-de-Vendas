// ==========================================
// 1. MODO ESCURO (Roda em todas as páginas)
// ==========================================
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;
const icon = darkModeToggle ? darkModeToggle.querySelector('i') : null;

// Sincroniza o tema ao carregar
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    if (icon) { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
} else {
    body.classList.remove('dark-mode');
    if (icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
}

// Evento de clique do Modo Escuro
if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        if (icon) {
            icon.classList.remove(isDark ? 'fa-sun' : 'fa-moon');
            icon.classList.add(isDark ? 'fa-moon' : 'fa-sun');
        }
    });
}

// ==========================================
// 2. LÓGICA DE VENDAS (Blindada com IFs)
// ==========================================
// Aqui a gente avisa o JS: "Só procure esses IDs se eles existirem!"
const inputQuantidade = document.getElementById('quantidade-venda');
const selectTipoVenda = document.getElementById('tipo-venda');

if (inputQuantidade && selectTipoVenda) {
    const PRODUTO_SIMULADO = {
        nome: "Mochila Executiva Premium",
        precoVarejo: 30.00,
        precoAtacado: 24.00,
        estoque: 11
    };

    function atualizarPrecos() {
        const precoUnitario = selectTipoVenda.value === 'varejo' ? PRODUTO_SIMULADO.precoVarejo : PRODUTO_SIMULADO.precoAtacado;
        const quantidade = parseInt(inputQuantidade.value) || 0;
        const total = precoUnitario * quantidade;

        const dUnit = document.getElementById('exibicao-unitario');
        const dTot = document.getElementById('resumo-total');

        if (dUnit) dUnit.innerText = "R$ " + precoUnitario.toFixed(2).replace('.', ',');
        if (dTot) dTot.innerText = "R$ " + total.toFixed(2).replace('.', ',');
    }

    selectTipoVenda.addEventListener('change', atualizarPrecos);
    inputQuantidade.addEventListener('input', atualizarPrecos);
}

// Botão Finalizar (Também blindado)
const btnFinalizar = document.getElementById('btn-finalizar-venda');
if (btnFinalizar) {
    btnFinalizar.addEventListener('click', (e) => {
        e.preventDefault();
        alert("✅ Venda finalizada com sucesso!");
    });
}

console.log('🚀 JS COMPLETO: Carregado e protegido contra erros!');

document.addEventListener('DOMContentLoaded', () => {
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
});