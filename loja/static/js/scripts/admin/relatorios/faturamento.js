// ============================================================
// RELATÓRIO DE FATURAMENTO — Willy Bolsas
// ============================================================

function atualizarIconeDark(isDark) {
    const toggleBtn = document.getElementById('dark-mode-toggle');
    const icon = toggleBtn?.querySelector('i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function getCsrf() {
    return document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';
}

document.addEventListener('DOMContentLoaded', function () {

    // 1. Menu hamburguer
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar    = document.querySelector('.sidebar');
    const overlay    = document.getElementById('sidebar-overlay');

    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener('click', function () {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        overlay.addEventListener('click', function () {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    // 2. Dark mode
    const toggleBtn = document.getElementById('dark-mode-toggle');
    const body      = document.body;
    const temaSalvo = localStorage.getItem('tema-willy');
    const esDark    = temaSalvo === 'dark';

    if (esDark) { body.classList.add('dark-mode'); }
    atualizarIconeDark(esDark);

    toggleBtn?.addEventListener('click', function () {
        const agoraEDark = body.classList.toggle('dark-mode');
        localStorage.setItem('tema-willy', agoraEDark ? 'dark' : 'light');
        atualizarIconeDark(agoraEDark);
    });

    // 3. Filtro de datas com botão explícito
    const formDatas  = document.getElementById('form-relatorio');
    const dateFim    = document.getElementById('date-picker-end');
    const dateInicio = document.getElementById('date-picker');

    if (formDatas) {
        const btnFiltrar       = document.createElement('button');
        btnFiltrar.type        = 'submit';
        btnFiltrar.textContent = 'Filtrar';
        btnFiltrar.className   = 'btn-filtrar-datas';

        // Salva aba ativa antes de submeter
        btnFiltrar.addEventListener('click', function () {
            const abaAtual = document.querySelector('.tab-item.active')?.id?.replace('tab-', '') || 'faturamento';
            document.getElementById('input-aba-ativa').value = abaAtual;
        });

        formDatas.appendChild(btnFiltrar);

        [dateInicio, dateFim].forEach(input => {
            input?.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const abaAtual = document.querySelector('.tab-item.active')?.id?.replace('tab-', '') || 'faturamento';
                    document.getElementById('input-aba-ativa').value = abaAtual;
                    formDatas.submit();
                }
            });
        });

        dateFim?.addEventListener('change', function () {
            if (dateInicio?.value && dateFim?.value) {
                const abaAtual = document.querySelector('.tab-item.active')?.id?.replace('tab-', '') || 'faturamento';
                document.getElementById('input-aba-ativa').value = abaAtual;
                formDatas.submit();
            }
        });
    }

    // 4. Exportar CSV
    document.getElementById('btn-exportar-csv')?.addEventListener('click', function () {
        const linhas = [['Data', 'Hora', 'Vendedor', 'Valor Venda (R$)', 'Comissao (R$)']];

        document.querySelectorAll('#tabela-vendedores tbody tr').forEach(function (tr) {
            const colunas = tr.querySelectorAll('td');
            if (colunas.length >= 4) {
                const partes = colunas[0].textContent.split(' - ');
                linhas.push([
                    partes[0]?.trim() || '',
                    partes[1]?.trim() || '',
                    colunas[1].textContent.trim(),
                    colunas[2].textContent.replace('R$', '').trim(),
                    colunas[3].textContent.replace('R$', '').trim(),
                ]);
            }
        });

        const csv  = linhas.map(r => r.map(c => '"' + c + '"').join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href     = url;
        link.download = 'relatorio-vendedores-' + new Date().toLocaleDateString('pt-BR').replace(/\//g, '-') + '.csv';
        link.click();
        URL.revokeObjectURL(url);
    });

    // 5. Exportar PDF
    document.getElementById('btn-exportar-pdf')?.addEventListener('click', function () {
        const { jsPDF }  = window.jspdf;
        const doc        = new jsPDF('p', 'mm', 'a4');
        const dataInicio = document.getElementById('date-picker')?.value     || 'Não informada';
        const dataFim    = document.getElementById('date-picker-end')?.value || 'Não informada';

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(20, 25, 41);
        doc.text('WILLY BOLSAS', 14, 20);

        doc.setFontSize(13);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(70, 80, 95);
        doc.text('Relatório Consolidado: Faturamento & Desempenho da Equipe', 14, 27);

        doc.setFontSize(9);
        doc.setTextColor(120, 130, 145);
        doc.text('Período: ' + dataInicio + ' até ' + dataFim, 14, 34);
        doc.text('Extraído em: ' + new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR'), 14, 39);
        doc.setDrawColor(220, 225, 230);
        doc.line(14, 43, 196, 43);

        let posY = 52;
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(20, 25, 41);
        doc.text('1. Resumo de Faturamento (Por Canal)', 14, posY);
        posY += 8;

        document.querySelectorAll('#sec-faturamento .metric-card').forEach(function (card) {
            const label = card.querySelector('span')?.innerText || '';
            const valor = card.querySelector('h2')?.innerText   || '';
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(label + ':', 18, posY);
            doc.setFont('Helvetica', 'bold');
            doc.text(valor, 55, posY);
            posY += 6;
        });

        const tabelaFaturamento = document.querySelector('#tabela-faturamento');
        if (tabelaFaturamento) {
            doc.autoTable({
                html: tabelaFaturamento,
                startY: posY + 4,
                theme: 'striped',
                headStyles: { fillColor: [31, 41, 55], fontStyle: 'bold', fontSize: 9 },
                bodyStyles: { fontSize: 8.5, textColor: [40, 40, 40] },
                margin: { left: 14, right: 14 },
            });
            posY = doc.lastAutoTable.finalY + 12;
        } else {
            posY += 10;
        }

        if (posY > 220) { doc.addPage(); posY = 20; }

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(20, 25, 41);
        doc.text('2. Desempenho da Equipe & Comissões', 14, posY);
        posY += 8;

        document.querySelectorAll('#sec-vendedores .metric-card').forEach(function (card) {
            const label = card.querySelector('span')?.innerText || '';
            const valor = card.querySelector('h2')?.innerText   || '';
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(label + ':', 18, posY);
            doc.setFont('Helvetica', 'bold');
            doc.text(valor, 55, posY);
            posY += 6;
        });

        const tabelaVendedores = document.querySelector('#sec-vendedores table');
        if (tabelaVendedores) {
            doc.autoTable({
                html: tabelaVendedores,
                startY: posY + 4,
                theme: 'striped',
                headStyles: { fillColor: [75, 85, 99], fontStyle: 'bold', fontSize: 9 },
                bodyStyles: { fontSize: 8.5, textColor: [40, 40, 40] },
                margin: { left: 14, right: 14 },
            });
        }

        doc.save('resumo_geral_willy_bolsas_' + dataInicio + '_a_' + dataFim + '.pdf');
    });

    // 6. Cancelar venda
    document.querySelectorAll('.btn-cancelar-venda').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const id = btn.dataset.id;
            if (!confirm('Cancelar esta venda? A ação não pode ser desfeita.')) { return; }
            const form  = document.createElement('form');
            form.method = 'POST';
            form.action = '/cancelar-venda/' + id + '/';
            const csrf  = document.createElement('input');
            csrf.type   = 'hidden';
            csrf.name   = 'csrfmiddlewaretoken';
            csrf.value  = getCsrf();
            form.appendChild(csrf);
            document.body.appendChild(form);
            form.submit();
        });
    });

    // 7. Restaura aba ativa após filtro
    const params   = new URLSearchParams(window.location.search);
    const abaAtiva = params.get('aba') || 'faturamento';
    mudarTela(abaAtiva);

});

// 8. Troca de abas
function mudarTela(tipo) {
    document.querySelectorAll('.report-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    document.getElementById('sec-' + tipo)?.classList.add('active');
    document.getElementById('tab-' + tipo)?.classList.add('active');

    const inputAba = document.getElementById('input-aba-ativa');
    if (inputAba) { inputAba.value = tipo; }

    const titulos = {
        faturamento: { titulo: 'Faturamento Detalhado',        subtitulo: 'Análise de entradas e saída de mercadoria.' },
        vendedores:  { titulo: 'Relatório de Vendas e Equipe', subtitulo: 'Desempenho financeiro e fiscal dos colaboradores.' },
    };

    if (titulos[tipo]) {
        document.getElementById('main-title').innerText    = titulos[tipo].titulo;
        document.getElementById('main-subtitle').innerText = titulos[tipo].subtitulo;
    }

    if (tipo === 'faturamento') { renderGraficos(); }
}

// 9. Gráficos
var graficosRenderizados = false;

function renderGraficos() {
    if (graficosRenderizados) { return; }
    graficosRenderizados = true;

    const rawJson = document.getElementById('dados-graficos')?.textContent;
    if (!rawJson) { return; }

    var dados;
    try {
        dados = JSON.parse(rawJson);
    } catch (e) {
        console.error('Erro ao parsear dados dos gráficos:', e);
        return;
    }

    // Gráfico de linha
    var ctxBar = document.getElementById('grafico-barras')?.getContext('2d');
    if (ctxBar && dados.faturamento_por_dia && dados.faturamento_por_dia.length > 0) {
        var labels  = dados.faturamento_por_dia.map(d => { var p = d.data.split('-'); return p[2] + '/' + p[1]; });
        var valores = dados.faturamento_por_dia.map(d => d.total);

        new Chart(ctxBar, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    borderColor: '#3B82F6',
                    borderWidth: 2,
                    pointBackgroundColor: '#3B82F6',
                    pointRadius: 4,
                    fill: false,
                    tension: 0.4,
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#94A3B8', font: { size: 11 } },
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: {
                            color: '#94A3B8',
                            font: { size: 11 },
                            callback: function (v) {
                                if (v >= 1000) { return 'R$' + (v / 1000).toFixed(0) + 'k'; }
                                return 'R$' + v;
                            },
                        },
                    },
                },
            },
        });
    } else if (ctxBar) {
        ctxBar.canvas.parentElement.innerHTML = '<p class="empty-state">Sem dados de faturamento no período.</p>';
    }

    // Gráfico donut
    var ctxPizza = document.getElementById('grafico-pizza')?.getContext('2d');
    if (ctxPizza && dados.pagamentos) {
        var pg    = dados.pagamentos;
        var total = pg.pix + pg.dinheiro + pg.debito + pg.credito;

        if (total > 0) {
            new Chart(ctxPizza, {
                type: 'doughnut',
                data: {
                    labels: ['Pix', 'Dinheiro', 'Débito', 'Crédito'],
                    datasets: [{
                        data: [pg.pix, pg.dinheiro, pg.debito, pg.credito],
                        backgroundColor: ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'],
                        borderWidth: 0,
                    }],
                },
                options: {
                    responsive: true,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#94A3B8',
                                pointStyle: 'circle',
                                usePointStyle: true,
                                padding: 16,
                                font: { size: 12 },
                            },
                        },
                        tooltip: {
                            callbacks: {
                                label: function (ctx) {
                                    var val = ctx.parsed;
                                    var pct = ((val / total) * 100).toFixed(1);
                                    return ' R$ ' + val.toFixed(2) + ' (' + pct + '%)';
                                },
                            },
                        },
                    },
                },
            });
        } else {
            ctxPizza.canvas.parentElement.innerHTML = '<p class="empty-state">Sem dados de pagamento no período.</p>';
        }
    }
}
// Persistência de datas via localStorage
(function() {
    const inicio = document.getElementById('date-picker');
    const fim = document.getElementById('date-picker-end');
    if (!inicio || !fim) return;

    // Restaura apenas se o backend não enviou valor
    let restaurou = false;
    if (!inicio.value) {
        const salvo = localStorage.getItem('relatorio-data-inicio');
        if (salvo) { inicio.value = salvo; restaurou = true; }
    }
    if (!fim.value) {
        const salvo = localStorage.getItem('relatorio-data-fim');
        if (salvo) { fim.value = salvo; restaurou = true; }
    }
    // Auto-submit se restaurou datas do localStorage
    if (restaurou) {
        const form = document.getElementById('form-relatorio');
        if (form) {
            const overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,#131A33 0%,#1e2d5a 50%,#131A33 100%);display:flex;align-items:center;justify-content:center;z-index:9999;flex-direction:column;gap:24px;';
            const st = document.createElement('style');
            st.textContent = '@keyframes pulse-logo{0%,100%{transform:scale(1);}50%{transform:scale(1.08);}}@keyframes fade-dots{0%,100%{opacity:0.2;}50%{opacity:1;}}#loading-overlay img{animation:pulse-logo 1.6s ease-in-out infinite;width:90px;filter:drop-shadow(0 0 18px rgba(255,122,0,0.5))}.loading-dots span{display:inline-block;width:8px;height:8px;border-radius:50%;background:#FF7A00;margin:0 4px;animation:fade-dots 1.2s ease-in-out infinite}.loading-dots span:nth-child(2){animation-delay:0.2s}.loading-dots span:nth-child(3){animation-delay:0.4s}';
            const img = document.createElement('img');
            img.src = '/static/img/logo willy.png';
            const p = document.createElement('p');
            p.style.cssText = 'color:#fff;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;';
            p.textContent = 'Carregando...';
            const dots = document.createElement('div');
            dots.className = 'loading-dots';
            dots.innerHTML = '<span></span><span></span><span></span>';
            const txt = document.createElement('div');
            txt.style.cssText = 'text-align:center;';
            txt.appendChild(p);
            txt.appendChild(dots);
            overlay.appendChild(st);
            overlay.appendChild(img);
            overlay.appendChild(txt);
            document.body.appendChild(overlay);
            form.submit();
        }
    }


    // Salva ao clicar em qualquer submit do form
    document.addEventListener('click', function(e) {
        if (e.target.closest('#form-relatorio [type="submit"]')) {
            localStorage.setItem('relatorio-data-inicio', inicio.value);
            localStorage.setItem('relatorio-data-fim', fim.value);
        }
    });
})();
