document.addEventListener('DOMContentLoaded', () => {
    const btnExcluirMassa = document.getElementById('btn-excluir-massa');
    const checkboxes = document.querySelectorAll('.check-colaborador');
    const selectAll = document.getElementById('select-all-equipe');

    // Função para atualizar a visibilidade do botão de excluir
    const atualizarBotaoExcluir = () => {
        const selecionados = document.querySelectorAll('.check-colaborador:checked').length;
        
        if (selecionados > 0) {
            btnExcluirMassa.classList.remove('hidden');
            btnExcluirMassa.innerHTML = `<i class="fa-solid fa-trash"></i> Excluir Selecionados (${selecionados})`;
        } else {
            btnExcluirMassa.classList.add('hidden');
        }
    };

    // Evento para o "Selecionar Todos"
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            checkboxes.forEach(cb => {
                // Sincroniza todos os checkboxes com o master
                cb.checked = this.checked;
            });
            atualizarBotaoExcluir();
        });
    }

    // Evento para cada checkbox individual
    checkboxes.forEach(cb => {
        cb.addEventListener('change', atualizarBotaoExcluir);
    });

    // Confirmação antes de enviar o formulário
    if (btnExcluirMassa) {
        btnExcluirMassa.onclick = function(e) {
            e.preventDefault();
            const selecionados = document.querySelectorAll('.check-colaborador:checked').length;
            
            if (confirm(`Tem certeza que deseja excluir ${selecionados} colaborador(es)? Esta ação não pode ser desfeita.`)) {
                document.getElementById('form-excluir-equipe').submit();
            }
        };
    }
});