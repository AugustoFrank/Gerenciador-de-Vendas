document.addEventListener('DOMContentLoaded', function() {
    console.log("🟢 JS Carregado! Procurando os campos...");

    const inputMatricula = document.getElementById('id_matricula');
    const inputUsername = document.getElementById('id_username'); // Campo que vai para o Django
    const divErroId = document.getElementById('erro-id');
    const inputPassword = document.getElementById('id_password');
    const formLogin = document.querySelector('form'); // Seleciona o formulário

    let usernameReal = ""; // Variável escondida para guardar o ID numérico

    if (inputMatricula) {
        inputMatricula.addEventListener('input', function() {
            const id = this.value;
            
            if (id.length >= 5) { 
                fetch(`/buscar-usuario-id/?id=${id}`)
                .then(response => response.json())
                .then(data => {
                    if (data.sucesso) {
                        // Exibe o Nome Completo na tela para o usuário (Ex: Augusto Frank)
                        inputUsername.value = data.nome; 
                        
                        // 🟢 CORREÇÃO: Pega o ID que o usuário digitou, e não do banco
                        usernameReal = id; 
                        
                        divErroId.style.display = 'none';
                    } else {
                        inputUsername.value = '';
                        usernameReal = '';
                        divErroId.style.display = 'block';
                    }
                })
                .catch(error => console.error("🔴 Erro de conexão:", error));
            } else {
                inputUsername.value = '';
                usernameReal = '';
                divErroId.style.display = 'none';
            }
        });

        // Enter no ID pula para a senha
        inputMatricula.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && inputUsername.value !== '') {
                e.preventDefault();
                inputPassword.focus();
            }
        });
    }

    // A MÁGICA ACONTECE AQUI
    // Intercepta o clique no botão "Entrar" antes de ir pro servidor
    if (formLogin) {
        formLogin.addEventListener('submit', function() {
            // Troca o Nome ("Izael") pelo ID ("96970") sorrateiramente
            if (usernameReal !== "") {
                inputUsername.value = usernameReal;
            }
        });
    }
});