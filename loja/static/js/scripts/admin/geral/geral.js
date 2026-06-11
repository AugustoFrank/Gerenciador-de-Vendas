document.addEventListener("DOMContentLoaded", function() {
    // 1. MODO ESCURO
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (localStorage.getItem('tema-willy') === 'dark') document.body.classList.add('dark-mode');
    toggleBtn?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('tema-willy', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    // 2. AUTO-SUBMIT (DATAS)
    document.querySelectorAll('input[auto-submit]').forEach(input => {
        input.addEventListener('change', () => input.closest('form')?.submit());
    });

    // 3. REPOSIÇÃO VIA URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('repor_sku')) {
        const modal = document.getElementById('modalAdicionar');
        if (modal) {
            document.getElementById('modal-sku').value = params.get('repor_sku');
            document.getElementById('modal-nome').value = params.get('repor_nome');
            modal.style.display = 'flex';
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    // 4. MENU HAMBÚRGUER
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
