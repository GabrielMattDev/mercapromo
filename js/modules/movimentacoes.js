/**
 * Movimentacoes Module - MercaPromo
 * Handles detailed coupon view modal (style N2M-SLA)
 */
const MovimentacoesModule = (function() {
    'use strict';

    function init() {
        document.getElementById('movimentacoesClose').addEventListener('click', closeMovimentacoes);
        document.getElementById('movimentacoesOverlay').addEventListener('click', function(e) {
            if (e.target === document.getElementById('movimentacoesOverlay')) {
                closeMovimentacoes();
            }
        });
    }

    function openMovimentacoes(fornecedor, loja) {
        var allData = FileParser.getAllData();

        // Filtra cupons deste fornecedor e loja
        var cupons = allData.filter(function(item) {
            return item.fornecedor === fornecedor && item.loja === loja;
        });

        if (cupons.length === 0) {
            Toast.show('Nenhuma movimentacao encontrada', 'warning');
            return;
        }

        var totalDesconto = cupons.reduce(function(sum, c) { return sum + (c.desconto || 0); }, 0);
        var totalVenda = cupons.reduce(function(sum, c) { return sum + (c.valorVenda || 0); }, 0);
        var totalFinal = cupons.reduce(function(sum, c) { return sum + (c.valorFinal || 0); }, 0);

        var body = document.getElementById('movimentacoesBody');

        var html = '<div class="mov-header-info">';
        html += '<span class="mov-badge"><i class="fas fa-building"></i> ' + escapeHtml(fornecedor) + '</span>';
        html += '<span class="mov-badge"><i class="fas fa-store"></i> Loja: ' + escapeHtml(loja) + '</span>';
        html += '<span class="mov-badge"><i class="fas fa-receipt"></i> Total Cupons: ' + cupons.length + '</span>';
        html += '</div>';

        html += '<div class="mov-resumo-grid">';
        html += '<div class="mov-resumo-item"><label>Total em Vendas</label><span>' + totalVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + '</span></div>';
        html += '<div class="mov-resumo-item"><label>Total em Descontos</label><span class="mov-destaque-desconto">' + totalDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + '</span></div>';
        html += '<div class="mov-resumo-item"><label>Total Final</label><span>' + totalFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + '</span></div>';
        html += '</div>';

        // Tabela de movimentacoes
        html += '<div class="mov-table-container">';
        html += '<table class="mov-table">';
        html += '<thead><tr>';
        html += '<th>#</th>';
        html += '<th><i class="fas fa-file-alt"></i> Documento</th>';
        html += '<th><i class="fas fa-desktop"></i> PDV</th>';
        html += '<th><i class="fas fa-calendar"></i> Data/Hora</th>';
        html += '<th><i class="fas fa-box"></i> Produto</th>';
        html += '<th><i class="fas fa-tag"></i> Valor Venda</th>';
        html += '<th><i class="fas fa-percent"></i> Desconto</th>';
        html += '<th><i class="fas fa-check-circle"></i> Valor Final</th>';
        html += '</tr></thead><tbody>';

        cupons.forEach(function(cupom, idx) {
            html += '<tr>';
            html += '<td class="mov-num">' + (idx + 1) + '</td>';
            html += '<td class="mov-doc">' + escapeHtml(cupom.documento || '-') + '</td>';
            html += '<td class="mov-pdv">' + escapeHtml(cupom.pdv || '-') + '</td>';
            html += '<td class="mov-data">' + (cupom.dataHoraFormatada || cupom.dataFormatada || '-') + '</td>';
            html += '<td class="mov-produto" title="' + escapeHtml(cupom.produto || '') + '">' + escapeHtml(cupom.produto || '-') + '</td>';
            html += '<td class="mov-valor">' + (cupom.valorVendaFormatado || 'R$ 0,00') + '</td>';
            html += '<td class="mov-desconto">' + (cupom.descontoFormatado || 'R$ 0,00') + '</td>';
            html += '<td class="mov-final">' + (cupom.valorFinalFormatado || 'R$ 0,00') + '</td>';
            html += '</tr>';
        });

        html += '</tbody></table></div>';

        // Timeline
        html += '<div class="mov-timeline-section">';
        html += '<h4><i class="fas fa-stream"></i> Sequencia de Movimentacoes</h4>';
        html += '<div class="mov-timeline">';

        cupons.forEach(function(cupom, idx) {
            var isLast = idx === cupons.length - 1;
            html += '<div class="mov-timeline-item">';
            html += '<div class="mov-timeline-dot ' + (isLast ? 'last' : '') + '"></div>';
            html += '<div class="mov-timeline-content">';
            html += '<div class="mov-timeline-header">';
            html += '<span class="mov-timeline-doc">Doc: ' + escapeHtml(cupom.documento || '-') + '</span>';
            html += '<span class="mov-timeline-pdv">PDV ' + escapeHtml(cupom.pdv || '-') + '</span>';
            html += '<span class="mov-timeline-data">' + (cupom.dataHoraFormatada || cupom.dataFormatada || '-') + '</span>';
            html += '</div>';
            html += '<div class="mov-timeline-produto">' + escapeHtml(cupom.produto || '-') + '</div>';
            html += '<div class="mov-timeline-valores">';
            html += '<span>Venda: ' + (cupom.valorVendaFormatado || 'R$ 0,00') + '</span>';
            html += '<span class="mov-timeline-desc">Desconto: ' + (cupom.descontoFormatado || 'R$ 0,00') + '</span>';
            html += '<span>Final: ' + (cupom.valorFinalFormatado || 'R$ 0,00') + '</span>';
            html += '</div>';
            html += '</div></div>';
        });

        html += '</div></div>';

        body.innerHTML = html;
        document.getElementById('movimentacoesOverlay').style.display = 'flex';
    }

    function closeMovimentacoes() {
        document.getElementById('movimentacoesOverlay').style.display = 'none';
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    window.MovimentacoesModule = {
        openMovimentacoes: openMovimentacoes,
        closeMovimentacoes: closeMovimentacoes
    };

    return {
        init: init,
        openMovimentacoes: openMovimentacoes,
        closeMovimentacoes: closeMovimentacoes
    };
})();