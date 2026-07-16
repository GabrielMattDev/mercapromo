/**
 * Export Module - MercaPromo
 * Handles CSV and XLSX export
 */
const ExportModule = (function() {
    'use strict';

    function init() {
        document.getElementById('btnExportCSV').addEventListener('click', exportCSV);
        document.getElementById('btnExportXLSX').addEventListener('click', exportXLSX);
    }

    function getExportData() {
        // Get currently filtered data from table module
        const data = window.TableModule ? window.TableModule.getCurrentData() : [];
        return data;
    }

    function formatDateForExport(date) {
        if (!date || isNaN(date.getTime())) return '';
        return date.toLocaleDateString('pt-BR');
    }

    function exportCSV() {
        const data = getExportData();
        if (data.length === 0) {
            Toast.show('Nenhum dado para exportar', 'warning');
            return;
        }

        const headers = ['Data', 'Loja', 'Fornecedor', 'Produto', 'Desconto'];
        const rows = data.map(item => [
            item.dataFormatada || '',
            item.loja || '',
            item.fornecedor || '',
            item.produto || '',
            item.desconto ? item.desconto.toFixed(2).replace('.', ',') : '0,00'
        ]);

        // Add BOM for Excel UTF-8
        let csvContent = '\uFEFF' + headers.join(';') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => '"' + cell + '"').join(';') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'MercaPromo_Relatorio_' + new Date().toISOString().split('T')[0] + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Toast.show('Exportado ' + data.length + ' registros para CSV', 'success');
    }

    function exportXLSX() {
        const data = getExportData();
        if (data.length === 0) {
            Toast.show('Nenhum dado para exportar', 'warning');
            return;
        }

        const headers = ['Data', 'Loja', 'Fornecedor', 'Produto', 'Desconto'];
        const rows = data.map(item => [
            item.dataFormatada || '',
            item.loja || '',
            item.fornecedor || '',
            item.produto || '',
            item.desconto || 0
        ]);

        const wsData = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Set column widths
        ws['!cols'] = [
            { wch: 12 },  // Data
            { wch: 15 },  // Loja
            { wch: 40 },  // Fornecedor
            { wch: 35 },  // Produto
            { wch: 15 }   // Desconto
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Descontos');

        XLSX.writeFile(wb, 'MercaPromo_Relatorio_' + new Date().toISOString().split('T')[0] + '.xlsx');

        Toast.show('Exportado ' + data.length + ' registros para Excel', 'success');
    }

    return {
        init,
        exportCSV,
        exportXLSX
    };
})();
