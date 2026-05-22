function atualizarIconeDark(isDark) {
    const toggleBtn = document.getElementById('dark-mode-toggle');
    const icon = toggleBtn?.querySelector('i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

document.addEventListener("DOMContentLoaded", function() {
    
    // ==========================================
    // 1. LÓGICA DO MENU HAMBURGUER (MOBILE)
    // ==========================================
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Trava a tela de fundo
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto'; // Destrava a tela
        });
    }

    // ==========================================
    // 2. LÓGICA DE MODO ESCURO
    // ==========================================
    const toggleBtn = document.getElementById('dark-mode-toggle');
    const body = document.body;

    const temaSalvo = localStorage.getItem('tema-willy');
    const esDark = temaSalvo === 'dark';

    if (esDark) {
        body.classList.add('dark-mode');
    }
    
    atualizarIconeDark(esDark);

    toggleBtn?.addEventListener('click', () => {
        const agoraEDark = body.classList.toggle('dark-mode');
        const novoTema = agoraEDark ? 'dark' : 'light';
        localStorage.setItem('tema-willy', novoTema);
        atualizarIconeDark(agoraEDark);
    });

    // ==========================================
    // 3. AUTO-SUBMIT DOS FILTROS
    // ==========================================
    const inputsData = document.querySelectorAll('input[auto-submit]');
    inputsData.forEach(input => {
        input.addEventListener('change', function() {
            const form = this.closest('form');
            if (form) {
                form.submit();
            }
        });
    });

});

// ==========================================
// 4. TROCA DE TELAS (ÁREA DINÂMICA)
// ==========================================
function mudarTela(tipo) {
    const secoes = document.querySelectorAll('.report-section');
    const abas = document.querySelectorAll('.tab-item');
    const titulo = document.getElementById('main-title');
    const subtitulo = document.getElementById('main-subtitle');

    secoes.forEach(s => s.classList.remove('active'));
    abas.forEach(t => t.classList.remove('active'));

    const secaoAtiva = document.getElementById('sec-' + tipo);
    const abaAtiva = document.getElementById('tab-' + tipo);

    if (secaoAtiva && abaAtiva) {
        secaoAtiva.classList.add('active');
        abaAtiva.classList.add('active');
    }

    const configuracoes = {
        'faturamento': {
            titulo: 'Faturamento Detalhado',
            subtitulo: 'Análise de entradas e saída de mercadoria (hoje).'
        },
        'vendedores': {
            titulo: 'Relatório de Vendas e Equipe',
            subtitulo: 'Desempenho financeiro e fiscal dos colaboradores.'
        }
    };

    if (configuracoes[tipo]) {
        titulo.innerText = configuracoes[tipo].titulo;
        subtitulo.innerText = configuracoes[tipo].subtitulo;
    }
}

// ==========================================

document.addEventListener("DOMContentLoaded", function() {
    // ==========================================
    // EXTRAÇÃO E GERAÇÃO DE PDF UNIFICADO (RESUMO GERAL)
    // ==========================================
    const btnExportar = document.getElementById('btn-exportar-pdf');

    btnExportar?.addEventListener('click', function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        // Coleta o período de datas selecionado nos inputs
        const dataInicio = document.getElementById('date-picker')?.value || 'Não informada';
        const dataFim = document.getElementById('date-picker-end')?.value || 'Não informada';

        // 1. TOPO DO DOCUMENTO (IDENTIDADE VISUAL)
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(20, 25, 41); // Slate escuro institucional
        doc.text("WILLY BOLSAS", 14, 20);

        doc.setFontSize(13);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(70, 80, 95);
        doc.text("Relatório Consolidado: Faturamento & Desempenho da Equipe", 14, 27);

        doc.setFontSize(9);
        doc.setTextColor(120, 130, 145);
        doc.text(`Período de Análise: ${dataInicio} até ${dataFim}`, 14, 34);
        doc.text(`Extraído em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 39);

        // Linha divisória do topo
        doc.setDrawColor(220, 225, 230);
        doc.line(14, 43, 196, 43);

        // =================================================================
        // SEÇÃO I: FATURAMENTO & ENTRADAS
        // =================================================================
        let currentY = 52;
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(20, 25, 41);
        doc.text("1. Resumo de Faturamento (Por Canal)", 14, currentY);
        
        // Coleta os cards de faturamento (PIX, Dinheiro, Débito, Crédito)
        currentY += 8;
        const cardsFaturamento = document.querySelectorAll('#sec-faturamento .metric-card');
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        
        cardsFaturamento.forEach(card => {
            const label = card.querySelector('span')?.innerText || '';
            const valor = card.querySelector('h2')?.innerText || '';
            
            doc.setFont("Helvetica", "normal");
            doc.text(`${label}:`, 18, currentY);
            doc.setFont("Helvetica", "bold");
            doc.text(valor, 55, currentY);
            currentY += 6;
        });

        // Tabela de Mercadorias da Seção I
        const tabelaMercadorias = document.querySelector('#sec-faturamento table');
        if (tabelaMercadorias) {
            doc.autoTable({
                html: tabelaMercadorias,
                startY: currentY + 4,
                theme: 'striped',
                headStyles: { fillColor: [31, 41, 55], fontStyle: 'bold', fontSize: 9 },
                bodyStyles: { fontSize: 8.5, textColor: [40, 40, 40] },
                margin: { left: 14, right: 14 }
            });
            // Atualiza a posição Y com base no término da tabela gerada
            currentY = doc.lastAutoTable.finalY + 12;
        } else {
            currentY += 10;
        }

        // =================================================================
        // SEÇÃO II: EQUIPE & DESEMPENHO DE VENDAS
        // =================================================================
        // Verifica se há espaço suficiente na página atual para começar a Seção 2, senão quebra página
        if (currentY > 220) {
            doc.addPage();
            currentY = 20;
        }

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(20, 25, 41);
        doc.text("2. Desempenho da Equipe & Comissões", 14, currentY);

        // Coleta as métricas da equipe (Vendas Equipe, Comissões)
        currentY += 8;
        const cardsVendedores = document.querySelectorAll('#sec-vendedores .metric-card');
        
        cardsVendedores.forEach(card => {
            const label = card.querySelector('span')?.innerText || '';
            const valor = card.querySelector('h2')?.innerText || '';
            
            doc.setFont("Helvetica", "normal");
            doc.text(`${label}:`, 18, currentY);
            doc.setFont("Helvetica", "bold");
            doc.text(valor, 55, currentY);
            currentY += 6;
        });

        // Tabela de Comissões dos Vendedores da Seção II
        const tabelaVendedores = document.querySelector('#sec-vendedores table');
        if (tabelaVendedores) {
            doc.autoTable({
                html: tabelaVendedores,
                startY: currentY + 4,
                theme: 'striped',
                headStyles: { fillColor: [75, 85, 99], fontStyle: 'bold', fontSize: 9 }, // Tom cinza distinto para diferenciar a tabela
                bodyStyles: { fontSize: 8.5, textColor: [40, 40, 40] },
                margin: { left: 14, right: 14 }
            });
        }

        // 4. DOWNLOAD DO ARQUIVO CONSOLIDADO
        const nomeArquivo = `resumo_geral_willy_bolsas_${dataInicio}_a_${dataFim}.pdf`;
        doc.save(nomeArquivo);
    });
});