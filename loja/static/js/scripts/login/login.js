window.entrarNoSistema = function(evento) {
    evento.preventDefault();
    
    console.log("Botão de login clicado!");

    const destino = "admin.html"; 

    console.log("Navegando para:", destino);
    
    window.location.href = destino;
};