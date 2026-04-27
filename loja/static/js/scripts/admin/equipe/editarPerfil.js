window.previewEditImage = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('editAvatarPreview');
            if (preview) {
                preview.src = e.target.result;
            }
        }
        reader.readAsDataURL(file);
    }
};

window.toggleColorPopoverEdit = function() {
    const popover = document.getElementById('colorPopoverEdit');
    if (popover) {
        popover.classList.toggle('open');
    }
};

window.selectEditColor = function(hexColor) {
    const previewInside = document.getElementById('currentViewEdit');
    if (previewInside) {
        previewInside.style.backgroundColor = hexColor;
    }
    
    const popover = document.getElementById('colorPopoverEdit');
    if (popover) {
        popover.classList.remove('open');
    }
};



document.addEventListener('DOMContentLoaded', () => {
    const editModal = document.getElementById('modal-editar-perfil');
    
    if (editModal) {
        const btnCancel = editModal.querySelector('.btn-cancel');
        if (btnCancel) {
            btnCancel.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof toggleModal === 'function') {
                    toggleModal('modal-editar-perfil');
                } else {
                    editModal.classList.add('hidden');
                    document.body.style.overflow = 'auto';
                }
            });
        }

        window.addEventListener('click', (e) => {
    if (e.target === editModal) {
        editModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    };
});


        const btnSave = editModal.querySelector('.btn-save');
        if (btnSave) {
            btnSave.addEventListener('click', (e) => {
                e.preventDefault();
                console.log("Alterações do perfil salvas com sucesso!");
                
                if (typeof toggleModal === 'function') {
                    toggleModal('modal-editar-perfil');
                }
            });
        }
    }
});