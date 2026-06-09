window.changeView = function(view) {
    const listSection = document.getElementById('view-list');
    const gridSection = document.getElementById('view-grid');
    const btnLista = document.getElementById('btn-lista');
    const btnGrid = document.getElementById('btn-grid');

    if (!listSection || !gridSection || !btnLista || !btnGrid) return;

    btnLista.classList.remove('active');
    btnGrid.classList.remove('active');

    if (view === 'list') {
        listSection.style.display = 'block';
        gridSection.style.display = 'none';
        btnLista.classList.add('active');
    } else {
        listSection.style.display = 'none';
        gridSection.style.display = 'block';
        btnGrid.classList.add('active');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.changeView) window.changeView('list');
});

document.addEventListener('DOMContentLoaded', () => {
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', () => {
            // Adiciona ou tira a classe dark-mode do <body>
            document.body.classList.toggle('dark-mode');
            
            // Troca o ícone do Sol para Lua e vice-versa
            const icone = darkModeBtn.querySelector('i');
            if (document.body.classList.contains('dark-mode')) {
                icone.classList.remove('fa-sun');
                icone.classList.add('fa-moon');
            } else {
                icone.classList.remove('fa-moon');
                icone.classList.add('fa-sun');
            }
        });
    }
});

const novoTema = localStorage.getItem('tema-willy');
if (novoTema === 'dark') {
    document.body.classList.add('dark-mode');
} else {
    document.body.classList.remove('dark-mode');
}