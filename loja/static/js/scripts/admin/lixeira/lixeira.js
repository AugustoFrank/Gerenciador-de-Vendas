document.addEventListener('DOMContentLoaded', () => {

    // ── Dark mode ─────────────────────────────────────────────────
    const darkToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    if (localStorage.getItem('tema-willy') === 'dark') {
        body.classList.add('dark-mode');
        darkToggle?.querySelector('i')?.classList.replace('fa-sun', 'fa-moon');
    }
    darkToggle?.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('tema-willy', isDark ? 'dark' : 'light');
        darkToggle.querySelector('i').className = isDark ? 'fas fa-moon' : 'fas fa-sun';
    });

    // ── Menu hambúrguer ───────────────────────────────────────────
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    menuToggle?.addEventListener('click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        body.style.overflow = 'hidden';
    });
    overlay?.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        body.style.overflow = 'auto';
    });

    // ── Abas ──────────────────────────────────────────────────────
    document.querySelectorAll('.lixeira-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.lixeira-tab').forEach(t => t.classList.remove('ativo'));
            document.querySelectorAll('.lixeira-painel').forEach(p => p.classList.remove('ativo'));
            tab.classList.add('ativo');
            document.getElementById(`painel-${tab.dataset.tab}`).classList.add('ativo');
        });
    });

    // ── URLs de ação ──────────────────────────────────────────────
    const urlsRestaurar = {
        produto:  '/admin/restaurar-produto/',
        venda:    '/admin/restaurar-venda/',
        vendedor: '/admin/restaurar-vendedor/',
    };
    const urlsExcluir = {
        produto:  '/admin/excluir-perm-produto/',
        venda:    '/admin/excluir-perm-venda/',
        vendedor: '/admin/excluir-perm-vendedor/',
    };

    function getCsrf() {
        return document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';
    }

    // ── Restaurar ─────────────────────────────────────────────────
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-restaurar');
        if (!btn) return;
        const { tipo, id } = btn.dataset;
        const csrf = getCsrf();
        try {
            const res  = await fetch(urlsRestaurar[tipo], {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
                body: JSON.stringify({ ids: [id] }),
            });
            const data = await res.json();
            if (data.sucesso) {
                const tr = btn.closest('tr');
                const badge = document.querySelector(`.lixeira-tab[data-tab="${tipo}s"] .tab-badge`);
                if (badge) badge.textContent = Math.max(0, parseInt(badge.textContent) - 1);
                tr.remove();
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao restaurar item.');
        }
    });

    // ── Exclusão permanente — Modal ────────────────────────────────
    const modal        = document.getElementById('modal-excluir-perm');
    const modalTexto   = document.getElementById('modal-confirm-texto');
    const btnCancelar  = document.getElementById('modal-btn-cancelar');
    const btnConfirmar = document.getElementById('modal-btn-confirmar');

    let pendente = null;

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-excluir-perm');
        if (!btn) return;
        pendente = { tipo: btn.dataset.tipo, id: btn.dataset.id, tr: btn.closest('tr') };
        modalTexto.textContent = `Excluir permanentemente "${btn.dataset.nome}"? Esta ação não pode ser desfeita.`;
        modal.classList.remove('hidden');
    });

    btnCancelar?.addEventListener('click', () => {
        modal.classList.add('hidden');
        pendente = null;
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            pendente = null;
        }
    });

    btnConfirmar?.addEventListener('click', async () => {
        if (!pendente) return;
        const { tipo, id, tr } = pendente;
        const csrf = getCsrf();
        try {
            const res  = await fetch(urlsExcluir[tipo], {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
                body: JSON.stringify({ ids: [id] }),
            });
            const data = await res.json();
            if (data.sucesso) {
                const badge = document.querySelector(`.lixeira-tab[data-tab="${tipo}s"] .tab-badge`);
                if (badge) badge.textContent = Math.max(0, parseInt(badge.textContent) - 1);
                tr.remove();
                modal.classList.add('hidden');
                pendente = null;
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao excluir permanentemente.');
        }
    });
});
