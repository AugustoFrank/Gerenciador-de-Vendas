// Função para recarregar os dados a cada 5 minutos
function atualizarDashboard() {
    console.log("Sincronizando dados de venda...");
    // Aqui você poderia usar AJAX para buscar apenas os números
    // Por enquanto, vamos apenas dar um refresh para garantir a simplicidade
    // setTimeout(() => location.reload(), 300000); 
}

// Pequena animação nos números ao carregar
document.querySelectorAll('.numero').forEach(num => {
    num.classList.add('fade-in');
});

atualizarDashboard();