function changeView(view) {
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
}

window.changeView = changeView;

document.addEventListener('DOMContentLoaded', () => {
    changeView('list');
});