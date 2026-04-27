const PRODUTO_SIMULADO = {
    nome: "Mochila Executiva Premium",
    precoVarejo: 30.00,
    precoAtacado: 24.00,
    estoque: 11
};

const selectTipoVenda = document.getElementById('tipo-venda');
const inputQuantidade = document.getElementById('quantidade-venda');
const selectPagamento = document.getElementById('forma-pagamento');
const caixaDinheiro = document.getElementById('area-caixa-dinheiro');
const inputDinheiroRecebido = document.getElementById('valor-recebido-caixa');

const displayUnitario = document.getElementById('exibicao-unitario');
const displaySubtotal = document.getElementById('resumo-subtotal');
const displayTotal = document.getElementById('resumo-total');
const displayTroco = document.getElementById('valor-troco-exibicao');

let totalVendaCalculado = 0;

function atualizarPrecosDaVenda() {
    let precoUnitario = 0;
    let quantidade = parseInt(inputQuantidade.value) || 0;

    if (selectTipoVenda.value === 'varejo') {
        precoUnitario = PRODUTO_SIMULADO.precoVarejo;
    } else {
        precoUnitario = PRODUTO_SIMULADO.precoAtacado;
    }

    totalVendaCalculado = precoUnitario * quantidade;

    displayUnitario.innerText = "R$ " + precoUnitario.toFixed(2).replace('.', ',');
    displaySubtotal.innerText = "R$ " + totalVendaCalculado.toFixed(2).replace('.', ',');
    displayTotal.innerText = "R$ " + totalVendaCalculado.toFixed(2).replace('.', ',');

    if (!caixaDinheiro.classList.contains('oculto')) {
        calcularTrocoTerminal();
    }
}

function verificarAbaDinheiro() {
    const metodoEscolhido = selectPagamento.value;

    if (metodoEscolhido.includes('dinheiro')) {
        caixaDinheiro.classList.remove('oculto');
    } else {
        caixaDinheiro.classList.add('oculto');
        inputDinheiroRecebido.value = "";
        displayTroco.innerText = "R$ 0,00";
        displayTroco.style.color = "#F43F5E"; // Reseta cor pra vermelho de "atraso"
    }
}

function calcularTrocoTerminal() {
    let recebido = parseFloat(inputDinheiroRecebido.value) || 0;

    let troco = recebido - totalVendaCalculado;

    if (recebido === 0) {
        displayTroco.innerText = "R$ 0,00";
        displayTroco.style.color = "#F43F5E"; // Vermelho
    } else if (troco < 0) {
        displayTroco.innerText = "Falta R$ " + Math.abs(troco).toFixed(2).replace('.', ',');
        displayTroco.style.color = "#F43F5E"; // Vermelho avisando que falta dinheiro
    } else {
        displayTroco.innerText = "R$ " + troco.toFixed(2).replace('.', ',');
        displayTroco.style.color = "#10B981"; // Verde avisando que tem troco pra dar
    }
}


selectTipoVenda.addEventListener('change', atualizarPrecosDaVenda);
inputQuantidade.addEventListener('input', atualizarPrecosDaVenda);

selectPagamento.addEventListener('change', verificarAbaDinheiro);

inputDinheiroRecebido.addEventListener('input', calcularTrocoTerminal);

// Botão finalizar apenas para simular amanhã
document.getElementById('btn-finalizar-venda').addEventListener('click', (evento) => {
    evento.preventDefault();
    const quantidadeDigitada = parseInt(inputQuantidade.value) || 0;
    
    if (quantidadeDigitada > PRODUTO_SIMULADO.estoque) {
        alert("⚠️ ERRO: Quantidade solicitada (" + quantidadeDigitada + ") é maior que o estoque disponível (11). A venda não pode ser finalizada.");
    } else {
        alert("✅ Venda simulada com sucesso!");
    }
});

atualizarPrecosDaVenda();