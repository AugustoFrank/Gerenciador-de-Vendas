// Função para o preview da foto no modal de edição
window.previewEditImage = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('editAvatarPreview');
            if (preview) preview.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
};

// Função principal para carregar os dados e abrir o modal automaticamente
window.abrirModalEditar = function(matricula, nome, endereco, data_nasc, nivel, comissao, cor) {
    // 1. Preenche o ID de Acesso no campo cinza (readonly)
    const inputId = document.getElementById('id_username_edit');
    if (inputId) {
        inputId.value = matricula;
    }

    // 2. Localiza o modal e preenche os demais campos de texto e data
    const modal = document.getElementById('modal-editar-perfil');
    if (modal) {
        modal.querySelector('input[name="nome_completo"]').value = nome;
        modal.querySelector('input[name="endereco"]').value = endereco;
        modal.querySelector('input[name="data_nascimento_edit"]').value = data_nasc;
        modal.querySelector('select[name="nivel"]').value = nivel;
        modal.querySelector('input[name="comissao"]').value = comissao;

        // 3. Seleciona automaticamente a bolinha da cor do banner correspondente
        const radioCor = modal.querySelector(`input[name="cor_banner_edit"][value="${cor}"]`);
        if (radioCor) radioCor.checked = true;

        // 4. Abre o modal usando a função global de toggle
        if (window.toggleModal) {
            window.toggleModal('modal-editar-perfil');
        } else {
            modal.classList.remove('hidden');
            document.body.classList.add('no-scroll');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const editModal = document.getElementById('modal-editar-perfil');
    if (editModal) {
        // Lógica do botão Cancelar
        const btnCancel = editModal.querySelector('.btn-cancel');
        if (btnCancel) {
            btnCancel.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.toggleModal) window.toggleModal('modal-editar-perfil');
            });
        }
        
        // Lógica do botão Salvar
        const btnSave = editModal.querySelector('.btn-save');
        if (btnSave) {
            btnSave.addEventListener('click', (e) => {
                // O preventDefault foi removido para permitir que o formulário seja enviado ao Django
                console.log("Enviando alterações para o ID: " + document.getElementById('id_username_edit').value);
            });
        }
    }
});

// Fecha o modal de edição clicando na área escura (fora do card)
window.addEventListener('click', (e) => {
    const editModal = document.getElementById('modal-editar-perfil');
    if (editModal && e.target === editModal) {
        editModal.classList.add('hidden');
        document.body.classList.remove('no-scroll');
    }
});


window.previewEditImage = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('editAvatarPreview');
            if (preview) preview.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
};

// 🟢 Adicionados os parâmetros: telefone e foto_url
window.abrirModalEditar = function(matricula, nome, endereco, telefone, data_nasc, nivel, comissao, cor, foto_url) {
    
    // 1. Preenche o ID de Acesso no campo cinza (readonly)
    const inputId = document.getElementById('id_username_edit');
    if (inputId) {
        inputId.value = matricula;
    }

    // 2. Localiza o modal
    const modal = document.getElementById('modal-editar-perfil');
    if (modal) {
        
        // 🟢 Função de Segurança: Evita aquele erro vermelho se um campo faltar
        const preencherCampo = (seletor, valor) => {
            const campo = modal.querySelector(seletor);
            if (campo) campo.value = valor || '';
        };

        preencherCampo('input[name="nome_completo"]', nome);
        preencherCampo('input[name="endereco"]', endereco);
        preencherCampo('input[name="telefone"]', telefone); // 🟢 Preenchendo o Telefone
        preencherCampo('input[name="data_nascimento_edit"]', data_nasc);
        preencherCampo('select[name="nivel"]', nivel);
        preencherCampo('input[name="comissao"]', comissao);

        // 3. Seleciona automaticamente a bolinha da cor do banner correspondente
        if (cor) {
            const radioCor = modal.querySelector(`input[name="cor_banner_edit"][value="${cor}"]`);
            if (radioCor) radioCor.checked = true;
        }

        // 4. 🟢 Atualiza a Foto de Perfil no Modal
        const previewFoto = document.getElementById('editAvatarPreview');
        if (previewFoto) {
            if (foto_url && foto_url !== 'None' && foto_url !== '') {
                previewFoto.src = foto_url; // Coloca a foto do usuário
            } else {
                previewFoto.src = '/static/img/icon.jpg'; // Volta para a imagem padrão se não tiver foto
            }
        }

        // 5. Abre o modal usando a função global de toggle ou removendo a classe
        if (typeof window.toggleModal === 'function') {
            window.toggleModal('modal-editar-perfil');
        } else {
            modal.classList.remove('hidden');
            document.body.classList.add('no-scroll');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const editModal = document.getElementById('modal-editar-perfil');
    if (editModal) {
        // Lógica do botão Cancelar
        const btnCancel = editModal.querySelector('.btn-cancel');
        if (btnCancel) {
            btnCancel.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof window.toggleModal === 'function') {
                    window.toggleModal('modal-editar-perfil');
                } else {
                    editModal.classList.add('hidden');
                    document.body.classList.remove('no-scroll');
                }
            });
        }
        
        // Lógica do botão Salvar
        const btnSave = editModal.querySelector('.btn-save');
        if (btnSave) {
            btnSave.addEventListener('click', (e) => {
                // O preventDefault foi removido para permitir que o formulário seja enviado ao Django
                console.log("Enviando alterações para o ID: " + document.getElementById('id_username_edit').value);
            });
        }
    }
});

// Fecha o modal de edição clicando na área escura (fora do card)
window.addEventListener('click', (e) => {
    const editModal = document.getElementById('modal-editar-perfil');
    if (editModal && e.target === editModal) {
        editModal.classList.add('hidden');
        document.body.classList.remove('no-scroll');
    }
});
