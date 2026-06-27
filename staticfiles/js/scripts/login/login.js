document.addEventListener('DOMContentLoaded', function() {
    const inputMatricula = document.getElementById('id_matricula');
    const inputUsername = document.getElementById('id_username');
    const hintIdValido = document.getElementById('hint-id-valido');
    const divErroId = document.getElementById('erro-id');
    const inputPassword = document.getElementById('id_password');
    const formLogin = document.querySelector('form');
    let usernameReal = "";

    if (inputMatricula) {
        inputMatricula.addEventListener('input', function() {
            const id = this.value;
            if (id.length >= 5) {
                fetch(`/buscar-usuario-id/?id=${id}`)
                .then(response => response.json())
                .then(data => {
                    if (data.sucesso) {
                        usernameReal = id;
                        if (hintIdValido) hintIdValido.textContent = 'ID válido ✓';
                        if (divErroId) divErroId.classList.add('hidden');
                    } else {
                        usernameReal = '';
                        if (hintIdValido) hintIdValido.textContent = '';
                        if (divErroId) divErroId.classList.remove('hidden');
                    }
                })
                .catch(error => console.error("Erro de conexão:", error));
            } else {
                usernameReal = '';
                if (hintIdValido) hintIdValido.textContent = '';
                if (divErroId) divErroId.classList.add('hidden');
            }
        });

        inputMatricula.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && usernameReal !== '') {
                e.preventDefault();
                inputPassword.focus();
            }
        });
    }

    if (formLogin) {
        formLogin.addEventListener('submit', function() {
            if (usernameReal !== "" && inputUsername) {
                inputUsername.value = usernameReal;
            }
        });
    }
});
