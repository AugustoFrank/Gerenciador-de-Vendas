window.toggleModal = function(id) {
    const modalAlvo = document.getElementById(id);
    if (modalAlvo) {
        modalAlvo.classList.toggle('hidden');
        
        if (!modalAlvo.classList.contains('hidden')) {
            document.body.classList.add('no-scroll');
            
            // LÓGICA NOVA: Gerar ID automático ao abrir o modal de Novo Colaborador
            if (id === 'modal-colaborador') {
                const idInput = document.getElementById('novo_username');
                // Gera o ID apenas se o campo estiver vazio
                if (idInput && idInput.value === '') {
                    idInput.value = Math.floor(10000 + Math.random() * 90000);
                }
            }
        } else {
            document.body.classList.remove('no-scroll');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const abrirModalBtn = document.querySelector('.btn-adc');
    const botoesCancelar = document.querySelectorAll('.btn-cancel');
    const modal = document.getElementById('modal-colaborador');

    if (abrirModalBtn && modal) {
        abrirModalBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            document.body.classList.add('no-scroll');
            
            // LÓGICA NOVA (Garantia extra caso o clique venha pelo listener):
            const idInput = document.getElementById('novo_username');
            if (idInput && idInput.value === '') {
                idInput.value = Math.floor(10000 + Math.random() * 90000);
            }
        });
    }

    botoesCancelar.forEach(botao => {
        botao.addEventListener('click', (e) => {
            const modalPai = botao.closest('.modal-overlay');
            if (modalPai) {
                modalPai.classList.add('hidden');
                document.body.classList.remove('no-scroll');
            }
        });
    });
});

// Fecha modal novo colaborador clicando fora
window.addEventListener('click', (e) => {
    const modal = document.getElementById('modal-colaborador');
    if (modal && e.target === modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('no-scroll');
    }
    
    // Fecha também o modal de editar perfil clicando fora
    const modalEditar = document.getElementById('modal-editar-perfil');
    if (modalEditar && e.target === modalEditar) {
        modalEditar.classList.add('hidden');
        document.body.classList.remove('no-scroll');
    }
});