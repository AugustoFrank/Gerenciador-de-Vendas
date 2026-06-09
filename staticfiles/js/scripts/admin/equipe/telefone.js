// -----------------------------------------
// 1. Lógica de Máscara de Telefone e Data
// -----------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const inputTelefone = document.querySelector('input[name="telefone"]');
    const campoDataNascimento = document.querySelector('input[name="data_nascimento"]');

    // Máscara de Telefone (Verificação de existência incluída)
    if (inputTelefone) {
        inputTelefone.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ""); 
            if (value.length > 11) value = value.slice(0, 11);

            if (value.length > 10) {
                value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
            } else if (value.length > 5) {
                value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
            } else if (value.length > 2) {
                value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
            } else if (value.length > 0) {
                value = value.replace(/^(\d*)/, "($1");
            }
            e.target.value = value;
        });
    }

    // Limite de Data de Nascimento
    if (campoDataNascimento) {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        const dataMaxima = `${ano}-${mes}-${dia}`;
        
        campoDataNascimento.max = dataMaxima;

        campoDataNascimento.addEventListener('input', (e) => {
            const dataDigitada = e.target.value;
            if (dataDigitada) {
                const anoDigitado = dataDigitada.split('-')[0];
                if (anoDigitado.length > 4) {
                    e.target.value = ''; 
                    alert('Ano inválido! Digite um ano com 4 números.');
                }
            }
        });
    }
});

// -----------------------------------------
// 2. Gerador de ID Automático (Protegido contra null)
// -----------------------------------------
const btnAdicionar = document.getElementById('btn-adiciona-modal');

if (btnAdicionar) {
    btnAdicionar.addEventListener('click', function() {
        const idInput = document.getElementById('novo_username');
        // Só gera se o campo existir e estiver vazio
        if (idInput && idInput.value === '') {
            idInput.value = Math.floor(10000 + Math.random() * 90000);
        }
    });
}