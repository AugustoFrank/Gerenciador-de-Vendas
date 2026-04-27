const abrirModalBtn = document.querySelector('.btn-adc');
const botoesCancelar = document.querySelectorAll('.btn-cancel');
const salvarModalBtn = document.querySelector('.btn-save');
const modal = document.getElementById('modal-colaborador');

abrirModalBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    document.body.classList.add('no-scroll');
});

botoesCancelar.forEach(botao => {
    botao.addEventListener('click', (e) => {
        const modalPai = botao.closest('.modal-overlay');
        if (modalPai) {
            modalPai.classList.add('hidden');
            document.body.classList.remove('no-scroll');
        }
    });
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('no-scroll');
    }
});

window.toggleModal = function(id) {
    const modalAlvo = document.getElementById(id);
    if (modalAlvo) {
        modalAlvo.classList.toggle('hidden');
        if (!modalAlvo.classList.contains('hidden')) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    }
};