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

    if (esDark) {
        body.classList.add('dark-mode');
    }
    atualizarIconeDark(esDark);

    toggleBtn?.addEventListener('click', function () {
        const agoraEDark = body.classList.toggle('dark-mode');
        localStorage.setItem('tema-willy', agoraEDark ? 'dark' : 'light');
        atualizarIconeDark(agoraEDark);
    });

    // 3. Auto-submit filtros de data
    document.querySelectorAll('input[auto-submit]').forEach(function (input) {
        input.addEventListener('change', function () {
            const form = this.closest('form');
            if (form) {
                form.submit();
            }
        });
    });

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

        const csv  = linhas.map(function (r) {
            return r.map(function (c) {
                return '"' + c + '"';
            }).join(',');
        }).join('\n');

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
        doc.text('Período de Análise: ' + dataInicio + ' até ' + dataFim, 14, 34);
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

        const tabelaMercadorias = document.querySelector('#sec-faturamento table');
        if (tabelaMercadorias) {
            doc.autoTable({
                html: tabelaMercadorias,
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

        if (posY > 220) {
            doc.addPage();
            posY = 20;
        }

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
            if (!confirm('Cancelar esta venda? A ação não pode ser desfeita.')) {
                return;
            }
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

});

// 7. Troca de abas
function mudarTela(tipo) {
    document.querySelectorAll('.report-section').forEach(function (s) {
        s.classList.remove('active');
    });
    document.querySelectorAll('.tab-item').forEach(function (t) {
        t.classList.remove('active');
    });

    document.getElementById('sec-' + tipo)?.classList.add('active');
    document.getElementById('tab-' + tipo)?.classList.add('active');

    const titulos = {
        faturamento: {
            titulo:    'Faturamento Detalhado',
            subtitulo: 'Análise de entradas e saída de mercadoria.',
        },
        graficos: {
            titulo:    'Gráficos',
            subtitulo: 'Visualização do faturamento e formas de pagamento.',
        },
        vendedores: {
            titulo:    'Relatório de Vendas e Equipe',
            subtitulo: 'Desempenho financeiro e fiscal dos colaboradores.',
        },
    };

    if (titulos[tipo]) {
        document.getElementById('main-title').innerText    = titulos[tipo].titulo;
        document.getElementById('main-subtitle').innerText = titulos[tipo].subtitulo;
    }

    if (tipo === 'graficos') {
        renderGraficos();
    }
}

// 8. Gráficos
var graficosRenderizados = false;

function renderGraficos() {
    if (graficosRenderizados) {
        return;
    }
    graficosRenderizados = true;

    const rawJson = document.getElementById('dados-graficos')?.textContent;
    if (!rawJson) {
        return;
    }

    var dados;
    try {
        dados = JSON.parse(rawJson);
    } catch (e) {
        console.error('Erro ao parsear dados dos gráficos:', e);
        return;
    }

    // Gráfico de barras
    var ctxBar = document.getElementById('grafico-barras')?.getContext('2d');
    if (ctxBar && dados.faturamento_por_dia && dados.faturamento_por_dia.length > 0) {
        var labels = dados.faturamento_por_dia.map(function (d) {
            var p = d.data.split('-');
            return p[2] + '/' + p[1];
        });
        var valores = dados.faturamento_por_dia.map(function (d) {
            return d.total;
        });

        new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Faturamento (R$)',
                    data: valores,
                    backgroundColor: 'rgba(255, 122, 0, 0.75)',
                    borderColor: 'rgba(255, 122, 0, 1)',
                    borderWidth: 2,
                    borderRadius: 6,
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (v) {
                                return 'R$ ' + v.toFixed(2);
                            },
                        },
                    },
                },
            },
        });
    } else if (ctxBar) {
        ctxBar.canvas.parentElement.innerHTML = '<p class="empty-state">Sem dados de faturamento no período.</p>';
    }

    // Gráfico de pizza
    var ctxPizza = document.getElementById('grafico-pizza')?.getContext('2d');
    if (ctxPizza && dados.pagamentos) {
        var pg    = dados.pagamentos;
        var total = pg.pix + pg.dinheiro + pg.debito + pg.credito;

        if (total > 0) {
            new Chart(ctxPizza, {
                type: 'doughnut',
                data: {
                    labels: ['PIX', 'Dinheiro', 'Débito', 'Crédito'],
                    datasets: [{
                        data: [pg.pix, pg.dinheiro, pg.debito, pg.credito],
                        backgroundColor: ['#32BCAD', '#10B981', '#3B82F6', '#F59E0B'],
                        borderWidth: 2,
                    }],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' },
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