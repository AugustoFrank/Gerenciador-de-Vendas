const filtroInicio = document.getElementById('filtro-inicio');
const filtroFim = document.getElementById('filtro-fim');
const linhasVendas = document.querySelectorAll('.linha-venda');

function filtrarPorData() {
    const inicio = filtroInicio.value;
    const fim = filtroFim.value;

    linhasVendas.forEach(linha => {
        const dataVenda = linha.getAttribute('data-data');
        let mostrar = true;

        if (inicio && dataVenda < inicio) mostrar = false;
        if (fim && dataVenda > fim) mostrar = false;

        linha.style.display = mostrar ? '' : 'none';
    });
}

if (filtroInicio) filtroInicio.addEventListener('change', filtrarPorData);
if (filtroFim) filtroFim.addEventListener('change', filtrarPorData);

const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;
const icon = darkModeToggle ? darkModeToggle.querySelector('i') : null;

if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    if (icon) { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
} else {
    body.classList.remove('dark-mode');
    if (icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
}

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