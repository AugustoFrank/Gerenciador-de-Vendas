const inputBusca = document.getElementById('busca-estoque');
const linhasEstoque = document.querySelectorAll('.linha-produto');

if (inputBusca) {
    inputBusca.addEventListener('keyup', function() {
        const termo = this.value.toLowerCase();
        linhasEstoque.forEach(linha => {
            const sku = linha.querySelector('.sku-cell').innerText.toLowerCase();
            const nome = linha.querySelector('.nome-cell').innerText.toLowerCase();
            if (sku.includes(termo) || nome.includes(termo)) {
                linha.style.display = '';
            } else {
                linha.style.display = 'none';
            }
        });
    });
}

// ==========================================
// MODO ESCURO SINCRONIZADO
// ==========================================
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;
const icon = darkModeToggle ? darkModeToggle.querySelector('i') : null;

if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    if (icon) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
} else {
    body.classList.remove('dark-mode');
    if (icon) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
}

if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        if (icon) {
            if (isDark) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            } else {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }
    });
}