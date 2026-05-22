const inputBusca = document.getElementById('input-referencia');
const listaSugestoes = document.getElementById('produtos-sugestao');
const precoDisplay = document.getElementById('preco-unitario');
const totalDisplay = document.getElementById('total-venda');
const subtotalDisplay = document.getElementById('subtotal-exibicao');
const estoqueDisplay = document.getElementById('estoque-disponivel');
const qtdInput = document.getElementById('quantidade');
const tipoVendaSelect = document.getElementById('tipo-venda');
const formaPagamentoSelect = document.getElementById('forma-pagamento');
const boxTroco = document.getElementById('box-troco');
const inputRecebido = document.getElementById('valor-recebido');
const trocoDisplay = document.getElementById('valor-troco');
const inputRef = document.getElementById('input-referencia');
const spanEstoque = document.getElementById('estoque-disponivel');
const h2Preco = document.getElementById('preco-unitario');
const selectTipo = document.getElementById('tipo-venda');
let produtoAtual = null;
let totalGeral = 0;

// Busca pelo texto (Ajax)
inputBusca.addEventListener('input', function() {
    const termo = this.value.trim();
    if (termo.length >= 2) {
        fetch(`/buscar-produto-ajax/?referencia=${termo}`)
            .then(res => res.json())
            .then(data => {
                if (data.sucesso) {
                    listaSugestoes.innerHTML = ''; 
                    data.produtos.forEach(p => {
                        let option = document.createElement('option');
                        option.value = p.referencia; 
                        option.textContent = p.nome;  
                        listaSugestoes.appendChild(option);
                        if (termo === p.referencia) {
                            produtoAtual = p; 
                            document.getElementById('nome_produto') ? document.getElementById('nome_produto').value = p.nome : null; 
                            atualizarInterface();
                        }
                    });
                }
            });
    }
});

// Busca pelo leitor/SKU (Enter ou desfocar) - 🟢 LÓGICAS UNIFICADAS AQUI
inputRef.addEventListener('change', async function() {
    const sku = this.value.split(' - ')[0]; // Pega apenas o código antes do traço
    
    if (sku.length > 0) {
        try {
            // CORREÇÃO: Usando a rota exata que existe no seu views.py
            const response = await fetch(`/consulta-estoque/?referencia=${sku}`);
            const result = await response.json();
            
            if (result.success) {
                // ATUALIZAÇÃO REAL: Muda o texto estático pelo valor do banco
                spanEstoque.innerText = `${result.estoque} em estoque`;
                spanEstoque.classList.remove('status-zerado');
                
                // LÓGICA DE CORES (Movida do seu antigo evento Blur)
                if (result.estoque <= 0) {
                    spanEstoque.style.color = "#EF4444"; // Vermelho
                } else {
                    spanEstoque.style.color = "#10B981"; // Verde original
                }
                
                // Aproveita e já atualiza o preço unitário baseado no tipo de venda
                const preco = selectTipo.value === 'varejo' ? result.preco_varejo : result.preco_atacado;
                h2Preco.innerText = `R$ ${parseFloat(preco).toFixed(2).replace('.', ',')}`;
                
                // Guarda os preços no elemento para o Select de tipo usar depois
                h2Preco.dataset.varejo = result.preco_varejo;
                h2Preco.dataset.atacado = result.preco_atacado;

                // Alimenta o produtoAtual para a matemática da interface e do troco funcionar
                produtoAtual = {
                    nome: result.nome || sku,
                    estoque: result.estoque,
                    preco_varejo: parseFloat(result.preco_varejo),
                    preco_atacado: parseFloat(result.preco_atacado)
                };
                atualizarInterface();

            } else {
                produtoAtual = null;
                spanEstoque.innerText = "Produto inexistente";
                spanEstoque.classList.add('status-zerado');
                spanEstoque.style.color = "#EF4444"; // Mantendo o vermelho do erro
                h2Preco.innerText = "R$ 0,00";
            }
        } catch (error) {
            console.error("Erro ao buscar dados do banco:", error);
        }
    }
});

function atualizarInterface() {
    if (!produtoAtual) return;
    const preco = tipoVendaSelect.value === 'varejo' ? produtoAtual.preco_varejo : produtoAtual.preco_atacado;
    const quantidade = parseInt(qtdInput.value) || 1;
    totalGeral = preco * quantidade;
    precoDisplay.innerText = `R$ ${preco.toFixed(2).replace('.', ',')}`;
    subtotalDisplay.innerText = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    totalDisplay.innerText = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    estoqueDisplay.innerText = `${produtoAtual.estoque} em estoque`;
    const nomeExibicao = document.getElementById('nome-produto-exibicao');
    if (nomeExibicao) nomeExibicao.innerText = produtoAtual.nome;
    calcularTroco();
}

function calcularTroco() {
    const recebido = parseFloat(inputRecebido.value) || 0;
    
    if (totalGeral > 0) {
        const diferenca = recebido - totalGeral;
        
        if (diferenca > 0) {
            trocoDisplay.innerText = `Troco: R$ ${diferenca.toFixed(2).replace('.', ',')}`;
            trocoDisplay.style.color = "#10B981"; // Verde
        } else if (diferenca < 0 && recebido > 0) {
            trocoDisplay.innerText = `Falta: R$ ${Math.abs(diferenca).toFixed(2).replace('.', ',')}`;
            trocoDisplay.style.color = "#EF4444"; // Vermelho
        } else {
            trocoDisplay.innerText = "R$ 0,00";
            trocoDisplay.style.color = "#86868B"; // Cinza
        }
    } else {
        trocoDisplay.innerText = "R$ 0,00";
        trocoDisplay.style.color = "inherit";
    }
}

formaPagamentoSelect.addEventListener('change', function() {
    boxTroco.style.display = this.value.includes('dinheiro') ? 'flex' : 'none';
    if (!this.value.includes('dinheiro')) {
        inputRecebido.value = '';
        calcularTroco();
    }
});

qtdInput.addEventListener('input', atualizarInterface);
tipoVendaSelect.addEventListener('change', atualizarInterface);
inputRecebido.addEventListener('input', calcularTroco);

// Lógica para enviar o formulário e salvar a venda
function finalizarVenda() {
    if (!produtoAtual && document.getElementById('input-referencia').value.trim() === '') {
        return alert("Selecione um produto primeiro!");
    }
    
    const formVenda = document.querySelector('form'); 
    if (formVenda) {
        formVenda.submit(); 
    } else {
        alert("Erro no layout: Formulário de venda não encontrado.");
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === "F2") {
        e.preventDefault();
        finalizarVenda();
    }
});

// ==========================================
// MODO ESCURO SINCRONIZADO
// ==========================================
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;
const icon = darkModeToggle ? darkModeToggle.querySelector('i') : null;

// Verifica a memória (localStorage) ao carregar a página
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    if (icon) { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
} else {
    body.classList.remove('dark-mode');
    if (icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
}

// Alterna e salva na memória ao clicar
if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        if (icon) {
            icon.classList.remove(isDark ? 'fa-sun' : 'fa-moon');
            icon.classList.add(isDark ? 'fa-moon' : 'fa-sun');
        }
    });
}