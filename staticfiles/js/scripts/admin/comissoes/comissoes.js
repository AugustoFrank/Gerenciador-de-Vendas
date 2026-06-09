document.addEventListener('DOMContentLoaded', () => {
    // --- 1. EXPORTAR PARA PDF ---
    const btnExportar = document.getElementById('btn-exportar');
    if (btnExportar) {
        btnExportar.addEventListener('click', (e) => {
            e.preventDefault(); 
            window.print(); 
        });
    }

    // --- 2. FILTRO DE DATAS AUTOMÁTICO ---
    const formFiltro = document.getElementById('form-relatorio');
    const dateInputs = document.querySelectorAll('.inpt-date');

    if (formFiltro && dateInputs.length > 0) {
        dateInputs.forEach(input => {
            input.addEventListener('change', () => {
                const dataInicio = document.querySelector('input[name="data_inicio"]').value;
                const dataFim = document.querySelector('input[name="data_fim"]').value;

                // Envia se as duas têm valor, ou se as duas estão vazias
                if ((dataInicio && dataFim) || (!dataInicio && !dataFim)) {
                    formFiltro.submit();
                }
            });
        });
    }

    // --- 3. DARK MODE ---
    const body = document.body;
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const currentTheme = localStorage.getItem('theme');

    function atualizarIconeDark(isDark) {
        const icon = darkModeToggle?.querySelector('i');
        if (icon) {
            icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun'; // ou fa-cog se você estiver usando a engrenagem
        }
    }

    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        atualizarIconeDark(true);
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            atualizarIconeDark(isDark);
        });
    }
});