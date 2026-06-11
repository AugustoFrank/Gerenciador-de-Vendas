const inputBusca     = document.getElementById('input-referencia');
const listaSugestoes = document.getElementById('produtos-sugestao');
const qtdInput       = document.getElementById('quantidade');
const estoqueDisplay = document.getElementById('estoque-disponivel');
const precoDisplay   = document.getElementById('preco-unitario');
const subtotalEl     = document.getElementById('subtotal-exibicao');
const totalEl        = document.getElementById('total-venda');
const badgeQtd       = document.getElementById('badge-qtd');
const listaCarrinho  = document.getElementById('lista-carrinho');
const rodapeEl       = document.getElementById('carrinho-rodape');
const totalAtaEl     = document.getElementById('total-atacado-unitario');
const totalVarEl     = document.getElementById('total-varejo-unitario');

let produtoAtual = null;
let carrinho     = [];

function brl(v) {
    return 'R$ ' + parseFloat(v).toFixed(2).replace('.', ',');
}

// ── Busca de produto (autocomplete) ──────────────────────────────
inputBusca.addEventListener('input', function () {
    const termo = this.value.trim();
    if (termo.length >= 2) {
        fetch(`/buscar-produto-ajax/?referencia=${termo}`)
            .then(r => r.json())
            .then(data => {
                if (data.sucesso) {
                    listaSugestoes.innerHTML = '';
                    data.produtos.forEach(p => {
                        const opt       = document.createElement('option');
                        opt.value       = p.referencia;
                        opt.textContent = p.nome;
                        listaSugestoes.appendChild(opt);
                    });
                }
            });
    }
});

inputBusca.addEventListener('change', async function () {
    const sku = this.value.split(' - ')[0].trim();
    if (!sku) return;
    try {
        const res  = await fetch(`/consulta-estoque/?referencia=${sku}`);
        const data = await res.json();

        const badgePromo = document.getElementById('badge-promo-lancamento');

        if (data.success) {
            produtoAtual = {
                referencia:    sku,
                nome:          data.nome || sku,
                estoque:       data.estoque,
                preco_varejo:  parseFloat(data.preco_varejo),
                preco_atacado: parseFloat(data.preco_atacado),
                em_promocao:   data.em_promocao || false,
            };
            estoqueDisplay.innerText   = `${data.estoque} em estoque`;
            estoqueDisplay.style.color = data.estoque > 0 ? '#10B981' : '#EF4444';
            precoDisplay.innerText     = brl(produtoAtual.preco_varejo);

            badgePromo.style.display = data.em_promocao ? 'inline-flex' : 'none';
        } else {
            produtoAtual               = null;
            estoqueDisplay.innerText   = 'Produto não encontrado';
            estoqueDisplay.style.color = '#EF4444';
            precoDisplay.innerText     = 'R$ 0,00';
            badgePromo.style.display   = 'none';
        }
    } catch (e) {
        console.error(e);
    }
});

// ── Adicionar ao carrinho ─────────────────────────────────────────
document.getElementById('btn-adicionar').addEventListener('click', () => {
    if (!produtoAtual) return alert('Selecione um produto primeiro.');
    const qtd = parseInt(qtdInput.value) || 1;
    if (qtd > produtoAtual.estoque) return alert('Quantidade maior que o estoque disponível.');

    const existente = carrinho.find(i => i.referencia === produtoAtual.referencia);
    if (existente) {
        existente.quantidade += qtd;
    } else {
        carrinho.push({
            referencia:    produtoAtual.referencia,
            nome:          produtoAtual.nome,
            quantidade:    qtd,
            preco_varejo:  produtoAtual.preco_varejo,
            preco_atacado: produtoAtual.preco_atacado,
            em_promocao:   produtoAtual.em_promocao,
        });
    }

    inputBusca.value         = '';
    qtdInput.value           = 1;
    produtoAtual             = null;
    estoqueDisplay.innerText = '-- em estoque';
    precoDisplay.innerText   = 'R$ 0,00';
    document.getElementById('badge-promo-lancamento').style.display = 'none';

    renderizarCarrinho();
});

// ── Renderizar carrinho ───────────────────────────────────────────
function renderizarCarrinho() {
    listaCarrinho.innerHTML = '';

    if (carrinho.length === 0) {
        listaCarrinho.innerHTML = '<p class="carrinho-vazio">Nenhum item adicionado.</p>';
        rodapeEl.style.display  = 'none';
        badgeQtd.textContent    = '0';
        subtotalEl.innerText    = 'R$ 0,00';
        totalEl.innerText       = 'R$ 0,00';
        return;
    }

    let somaVarejoUnitario  = 0;
    let somaAtacadoUnitario = 0;
    let somaTotal           = 0;

    carrinho.forEach((item, idx) => {
        somaVarejoUnitario  += item.preco_varejo;
        somaAtacadoUnitario += item.preco_atacado;
        somaTotal           += item.preco_varejo * item.quantidade;

        const div       = document.createElement('div');
        div.className   = 'item-carrinho';
        div.innerHTML   = `
            <div class="item-info">
                <strong>${item.nome}</strong>
                <span>${item.quantidade}x · SKU: ${item.referencia}</span>
                ${item.em_promocao ? '<span class="badge-promo-carrinho"><i class="fas fa-tag"></i> Promoção</span>' : ''}
            </div>
            <div class="item-precos">
                <div class="preco-col atacado">
                    <span>ATACADO</span>
                    <strong>${brl(item.preco_atacado)}</strong>
                </div>
                <div class="preco-col varejo">
                    <span>VAREJO</span>
                    <strong>${brl(item.preco_varejo)}</strong>
                </div>
                <button type="button" class="btn-remover-item" onclick="removerItem(${idx})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        listaCarrinho.appendChild(div);
    });

    rodapeEl.style.display = 'flex';
    totalAtaEl.innerText   = brl(somaAtacadoUnitario);
    totalVarEl.innerText   = brl(somaVarejoUnitario);
    badgeQtd.textContent   = carrinho.length;
    subtotalEl.innerText   = brl(somaTotal);
    totalEl.innerText      = brl(somaTotal);
}

window.removerItem = function (idx) {
    carrinho.splice(idx, 1);
    renderizarCarrinho();
};

// ── Checkout ──────────────────────────────────────────────────────
document.getElementById('btn-finalizar').addEventListener('click', () => {
    if (carrinho.length === 0) return alert('Adicione pelo menos um produto ao carrinho.');
    document.getElementById('overlay-checkout').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    atualizarCheckout();
});

document.getElementById('btn-fechar-checkout').addEventListener('click', fecharCheckout);
document.getElementById('btn-cancelar-checkout').addEventListener('click', fecharCheckout);

function fecharCheckout() {
    document.getElementById('overlay-checkout').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

const checkoutPagamento = document.getElementById('checkout-pagamento');
const checkoutTipo      = document.getElementById('checkout-tipo');

checkoutPagamento.addEventListener('change', atualizarCheckout);
checkoutTipo.addEventListener('change', atualizarCheckout);
document.getElementById('checkout-recebido')?.addEventListener('input', calcularTroco);

document.getElementById('checkout-valor-1').addEventListener('input', function () {
    const total = parseFloat(
        document.getElementById('checkout-total').innerText
            .replace('R$ ', '').replace(',', '.')
    ) || 0;
    const v1    = parseFloat(this.value) || 0;
    const resto = Math.max(0, total - v1);
    document.getElementById('checkout-valor-2').value = resto.toFixed(2);
});

document.getElementById('checkout-valor-2').addEventListener('input', function () {
    const total = parseFloat(
        document.getElementById('checkout-total').innerText
            .replace('R$ ', '').replace(',', '.')
    ) || 0;
    const v2    = parseFloat(this.value) || 0;
    const resto = Math.max(0, total - v2);
    document.getElementById('checkout-valor-1').value = resto.toFixed(2);
});

function elegívelDesconto(pag) {
    const partes     = pag.split('_');
    const temCredito = partes.includes('credito');
    const temDescontavel = partes.some(p => ['debito', 'pix', 'dinheiro'].includes(p));
    return !temCredito && temDescontavel;
}

function atualizarCheckout() {
    const pag       = checkoutPagamento.value;
    const tipo      = checkoutTipo.value;
    const bandBox   = document.getElementById('checkout-bandeira-box');
    const compostos = document.getElementById('checkout-compostos');
    const trocoBox  = document.getElementById('checkout-troco-box');

    bandBox.style.display  = pag.includes('credito') || pag.includes('debito') ? 'flex' : 'none';
    trocoBox.style.display = pag.includes('dinheiro') ? 'flex' : 'none';

    const COMPOSTOS = ['credito_pix', 'credito_dinheiro', 'credito_debito', 'debito_pix', 'debito_dinheiro', 'dinheiro_pix'];
    if (COMPOSTOS.includes(pag)) {
        compostos.classList.remove('hidden');
        const partes = pag.split('_');
        const nomes  = { credito: 'Crédito', debito: 'Débito', pix: 'Pix', dinheiro: 'Dinheiro' };
        document.getElementById('label-valor-1').innerText = `VALOR ${nomes[partes[0]].toUpperCase()} (R$)`;
        document.getElementById('label-valor-2').innerText = `VALOR ${nomes[partes[1]].toUpperCase()} (R$)`;
    } else {
        compostos.classList.add('hidden');
    }

    let subtotal = 0;
    let desconto = 0;

    carrinho.forEach(item => {
        const preco     = tipo === 'atacado' ? item.preco_atacado : item.preco_varejo;
        const itemTotal = preco * item.quantidade;
        subtotal += itemTotal;

        if (tipo === 'varejo' && elegívelDesconto(pag) && !item.em_promocao) {
            desconto += itemTotal * 0.10;
        }
    });

    const total = subtotal - desconto;

    const elSubtotal  = document.getElementById('checkout-subtotal');
    const elDesconto  = document.getElementById('checkout-desconto');
    const elLinhaDesc = document.getElementById('checkout-linha-desconto');

    if (elSubtotal) elSubtotal.innerText = brl(subtotal);

    if (elLinhaDesc && elDesconto) {
        if (desconto > 0) {
            elLinhaDesc.style.display = 'flex';
            elDesconto.innerText      = '- ' + brl(desconto);
        } else {
            elLinhaDesc.style.display = 'none';
        }
    }

    document.getElementById('checkout-total').innerText = brl(total);
    calcularTroco();
}

function calcularTroco() {
    const total    = parseFloat(document.getElementById('checkout-total').innerText.replace('R$ ', '').replace(',', '.')) || 0;
    const recebido = parseFloat(document.getElementById('checkout-recebido').value) || 0;
    const diff     = recebido - total;
    const el       = document.getElementById('checkout-troco');

    if (diff > 0) {
        el.innerText   = brl(diff);
        el.style.color = '#10B981';
    } else if (diff < 0 && recebido > 0) {
        el.innerText   = '- ' + brl(Math.abs(diff));
        el.style.color = '#EF4444';
    } else {
        el.innerText   = 'R$ 0,00';
        el.style.color = 'inherit';
    }
}

// ── Confirmar venda ───────────────────────────────────────────────
document.getElementById('btn-confirmar-checkout').addEventListener('click', async () => {
    if (carrinho.length === 0) return;

    const tipo      = checkoutTipo.value;
    const pagamento = checkoutPagamento.value;
    const bandeira  = document.getElementById('checkout-bandeira').value;
    const cliente   = document.getElementById('input-cliente').value.trim();

    const COMPOSTOS = ['credito_pix', 'credito_dinheiro', 'credito_debito', 'debito_pix', 'debito_dinheiro', 'dinheiro_pix'];

    const valor1 = parseFloat(document.getElementById('checkout-valor-1').value) || 0;
    const valor2 = parseFloat(document.getElementById('checkout-valor-2').value) || 0;

    let totalReal = 0;
    carrinho.forEach(item => {
        let preco = tipo === 'atacado' ? item.preco_atacado : item.preco_varejo;
        if (tipo === 'varejo' && elegívelDesconto(pagamento) && !item.em_promocao) {
            preco = preco * 0.9;
        }
        totalReal += preco * item.quantidade;
    });

    const itens = carrinho.map(item => {
        let preco = tipo === 'atacado' ? item.preco_atacado : item.preco_varejo;
        if (tipo === 'varejo' && elegívelDesconto(pagamento) && !item.em_promocao) {
            preco = preco * 0.9;
        }
        const precoTotal = preco * item.quantidade;

        let v_credito  = 0;
        let v_debito   = 0;
        let v_pix      = 0;
        let v_dinheiro = 0;

        if (COMPOSTOS.includes(pagamento) && totalReal > 0) {
            const proporcao = precoTotal / totalReal;
            const partes    = pagamento.split('_');
            const mapa      = { credito: 0, debito: 0, pix: 0, dinheiro: 0 };

            mapa[partes[0]] = valor1 * proporcao;
            mapa[partes[1]] = valor2 * proporcao;

            v_credito  = parseFloat(mapa.credito.toFixed(2));
            v_debito   = parseFloat(mapa.debito.toFixed(2));
            v_pix      = parseFloat(mapa.pix.toFixed(2));
            v_dinheiro = parseFloat(mapa.dinheiro.toFixed(2));
        } else {
            if (pagamento === 'credito')  v_credito  = parseFloat(precoTotal.toFixed(2));
            if (pagamento === 'debito')   v_debito   = parseFloat(precoTotal.toFixed(2));
            if (pagamento === 'pix')      v_pix      = parseFloat(precoTotal.toFixed(2));
            if (pagamento === 'dinheiro') v_dinheiro = parseFloat(precoTotal.toFixed(2));
        }

        return {
            referencia:      item.referencia,
            quantidade:      item.quantidade,
            tipo_venda:      tipo,
            forma_pagamento: pagamento,
            bandeira_cartao: bandeira,
            em_promocao:     item.em_promocao,
            preco_unitario:  parseFloat(preco.toFixed(2)),
            valor_credito:   v_credito,
            valor_debito:    v_debito,
            valor_pix:       v_pix,
            valor_dinheiro:  v_dinheiro,
        };
    });

    const payload = { cliente, tipo_venda: tipo, forma_pagamento: pagamento, bandeira_cartao: bandeira, itens };

    try {
        const csrf = document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';
        const res  = await fetch('/finalizar-carrinho/', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
            body:    JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.sucesso) {
            fecharCheckout();

            const agora = new Date();
            document.getElementById('cupom-datetime').innerText =
                agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR');

            document.getElementById('cupom-vendedor-nome').innerText =
                document.querySelector('main')?.dataset?.vendedor || 'Vendedor';

            const nomesPag = {
                credito: 'Crédito', debito: 'Débito', pix: 'Pix', dinheiro: 'Dinheiro',
                credito_pix: 'Crédito + Pix', credito_dinheiro: 'Crédito + Dinheiro',
                credito_debito: 'Crédito + Débito', debito_pix: 'Débito + Pix',
                debito_dinheiro: 'Débito + Dinheiro', dinheiro_pix: 'Dinheiro + Pix',
            };
            document.getElementById('cupom-pagamento').innerText =
                nomesPag[checkoutPagamento.value] || checkoutPagamento.value;

            document.getElementById('cupom-subtotal').innerText =
                document.getElementById('checkout-subtotal')?.innerText || 'R$ 0,00';
            document.getElementById('cupom-total').innerText =
                document.getElementById('checkout-total')?.innerText || 'R$ 0,00';

            const linhaDesc     = document.getElementById('checkout-linha-desconto');
            const cupomLinhDesc = document.getElementById('cupom-linha-desconto');
            if (linhaDesc?.style.display !== 'none') {
                cupomLinhDesc.style.display = 'flex';
                document.getElementById('cupom-desconto').innerText =
                    document.getElementById('checkout-desconto')?.innerText || '';
            } else {
                cupomLinhDesc.style.display = 'none';
            }

            const itensEl = document.getElementById('cupom-itens');
            itensEl.innerHTML = '';
            carrinho.forEach(item => {
                const precoUnit = checkoutTipo.value === 'atacado' ? item.preco_atacado : item.preco_varejo;
                const linha     = document.createElement('div');
                linha.className = 'cupom-item';
                linha.innerHTML = `
                    <span class="cupom-item-nome">${item.nome}</span>
                    <span class="cupom-item-detalhe">${item.quantidade}x ${brl(precoUnit)} = ${brl(precoUnit * item.quantidade)}</span>
                `;
                itensEl.appendChild(linha);
            });

            carrinho = [];
            renderizarCarrinho();

            document.getElementById('overlay-cupom').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        } else {
            alert('Erro: ' + (data.erro || 'Tente novamente.'));
        }
    } catch (e) {
        console.error(e);
        alert('Erro ao finalizar venda.');
    }
});

document.getElementById('btn-fechar-cupom').addEventListener('click', () => {
    document.getElementById('overlay-cupom').classList.add('hidden');
    document.body.style.overflow = 'auto';
});

document.getElementById('btn-imprimir-cupom').addEventListener('click', () => {
    window.print();
});

// ── Teclado ───────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
    if (e.key === 'F2') { e.preventDefault(); document.getElementById('btn-finalizar').click(); }
    if (e.key === 'Escape') fecharCheckout();
});

// ── Dark mode ─────────────────────────────────────────────────────
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body           = document.body;

if (localStorage.getItem('tema-willy') === 'dark') {
    body.classList.add('dark-mode');
    darkModeToggle?.querySelector('i')?.classList.replace('fa-sun', 'fa-moon');
}

darkModeToggle?.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('tema-willy', isDark ? 'dark' : 'light');
    const icon   = darkModeToggle.querySelector('i');
    icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
});

// ── Menu mobile ───────────────────────────────────────────────────
const menuToggle = document.getElementById('menu-toggle');
const sidebar    = document.querySelector('.sidebar');
const overlay    = document.getElementById('sidebar-overlay');

menuToggle?.addEventListener('click', () => {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

overlay?.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});