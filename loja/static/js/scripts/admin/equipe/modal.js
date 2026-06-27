window.toggleModal = function(id) {
    const modalAlvo = document.getElementById(id);
    if (modalAlvo) {
        modalAlvo.classList.toggle('hidden');

        if (!modalAlvo.classList.contains('hidden')) {
            document.body.classList.add('no-scroll');

            if (id === 'modal-colaborador') {
                const idInput = document.getElementById('novo_username');
                if (idInput && idInput.value === '') {
                    idInput.value = Math.floor(10000 + Math.random() * 90000);
                }
            }
        } else {
            document.body.classList.remove('no-scroll');
        }
    }
};

function previewNewImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.getElementById('newAvatarPreview');
        const iniciais = document.getElementById('newAvatarIniciais');
        if (img) {
            img.src = e.target.result;
            img.classList.add('avatar-img-visivel');
        }
        if (iniciais) {
            iniciais.classList.add('avatar-iniciais-oculta');
        }
    };
    reader.readAsDataURL(file);
}

document.addEventListener('DOMContentLoaded', () => {
    const inputNome = document.getElementById('novo_nome_completo');
    const avatarIniciais = document.getElementById('newAvatarIniciais');

    if (inputNome && avatarIniciais) {
        inputNome.addEventListener('input', () => {
            const valor = inputNome.value.trim();
            if (valor.length > 0) {
                avatarIniciais.textContent = valor.charAt(0).toUpperCase();
                avatarIniciais.style.backgroundColor = '#FF7A00';
            } else {
                avatarIniciais.textContent = '?';
                avatarIniciais.style.backgroundColor = '#1E294A';
            }
        });
    }

    const abrirModalBtn = document.querySelector('.btn-adc');
    const botoesCancelar = document.querySelectorAll('.btn-cancel');
    const modal = document.getElementById('modal-colaborador');

    if (abrirModalBtn && modal) {
        abrirModalBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            document.body.classList.add('no-scroll');

            const idInput = document.getElementById('novo_username');
            if (idInput && idInput.value === '') {
                idInput.value = Math.floor(10000 + Math.random() * 90000);
            }
        });
    }

    botoesCancelar.forEach(botao => {
        botao.addEventListener('click', () => {
            const modalPai = botao.closest('.modal-overlay');
            if (modalPai) {
                modalPai.classList.add('hidden');
                document.body.classList.remove('no-scroll');
            }
        });
    });
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('modal-colaborador');
    if (modal && e.target === modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('no-scroll');
    }

    const modalEditar = document.getElementById('modal-editar-perfil');
    if (modalEditar && e.target === modalEditar) {
        modalEditar.classList.add('hidden');
        document.body.classList.remove('no-scroll');
    }
});
