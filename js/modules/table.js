/**
 * Table Module - MercaPromo
 * Handles table rendering, pagination, and search
 */
const TableModule = (function() {
    'use strict';

    let currentData = [];
    let currentPage = 1;
    let itemsPerPage = 25;
    let searchTerm = '';

    function init() {
        setupEventListeners();
    }

    function setupEventListeners() {
        document.getElementById('searchTable').addEventListener('input', debounce(handleSearch, 300));
        document.getElementById('perPage').addEventListener('change', handlePerPageChange);
        document.getElementById('btnFirst').addEventListener('click', function() { goToPage(1); });
        document.getElementById('btnPrev').addEventListener('click', function() { goToPage(currentPage - 1); });
        document.getElementById('btnNext').addEventListener('click', function() { goToPage(currentPage + 1); });
        document.getElementById('btnLast').addEventListener('click', function() { goToPage(getTotalPages()); });

        window.addEventListener('dataFiltered', function(e) {
            currentData = e.detail.data;
            currentPage = 1;
            render();
        });
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction() {
            var args = arguments;
            var later = function() {
                clearTimeout(timeout);
                func.apply(null, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function handleSearch(e) {
        searchTerm = e.target.value.toLowerCase().trim();
        currentPage = 1;
        render();
    }

    function handlePerPageChange(e) {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1;
        render();
    }

    function getFilteredBySearch() {
        if (!searchTerm) return currentData;
        return currentData.filter(function(item) {
            return (
                (item.loja && item.loja.toLowerCase().indexOf(searchTerm) !== -1) ||
                (item.fornecedor && item.fornecedor.toLowerCase().indexOf(searchTerm) !== -1) ||
                (item.produto && item.produto.toLowerCase().indexOf(searchTerm) !== -1) ||
                (item.dataFormatada && item.dataFormatada.indexOf(searchTerm) !== -1) ||
                (item.descontoFormatado && item.descontoFormatado.indexOf(searchTerm) !== -1)
            );
        });
    }

    function getTotalPages() {
        var data = getFilteredBySearch();
        return Math.ceil(data.length / itemsPerPage) || 1;
    }

    function goToPage(page) {
        var totalPages = getTotalPages();
        if (page < 1 || page > totalPages) return;
        currentPage = page;
        render();
    }

    function render() {
        var data = getFilteredBySearch();
        var totalPages = getTotalPages();
        var start = (currentPage - 1) * itemsPerPage;
        var end = start + itemsPerPage;
        var pageData = data.slice(start, end);

        renderTable(pageData);
        renderPagination(data.length, totalPages);
        updateKPIs(data);
    }

    function renderTable(data) {
        var tbody = document.getElementById('tableBody');

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><i class="fas fa-inbox"></i><p>Nenhum registro encontrado</p></div></td></tr>';
            return;
        }

        var html = '';
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            html += '<tr>' +
                '<td class="col-data">' + (item.dataFormatada || '-') + '</td>' +
                '<td><span class="loja-badge"><i class="fas fa-store"></i>' + (item.loja || '-') + '</span></td>' +
                '<td class="col-fornecedor" title="' + escapeHtml(item.fornecedor || '') + '">' + (item.fornecedor || '-') + '</td>' +
                '<td class="col-produto" title="' + escapeHtml(item.produto || '') + '">' + (item.produto || '-') + '</td>' +
                '<td class="col-quantidade">' + (item.quantidadeFormatada || '0') + '</td>' +
                '<td class="col-valor">' + (item.descontoFormatado || 'R$ 0,00') + '</td>' +
                '<td><button class="btn-view" onclick="TableModule.showDetail(' + item.id + ')"><i class="fas fa-eye"></i> Ver</button></td>' +
            '</tr>';
        }
        tbody.innerHTML = html;
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function renderPagination(totalItems, totalPages) {
        var startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
        var endItem = Math.min(currentPage * itemsPerPage, totalItems);
        document.getElementById('paginationInfo').textContent = 'Mostrando ' + startItem + ' a ' + endItem + ' de ' + totalItems + ' registros';

        document.getElementById('pageNumbers').textContent = currentPage + ' / ' + totalPages;

        document.getElementById('btnFirst').disabled = currentPage === 1;
        document.getElementById('btnPrev').disabled = currentPage === 1;
        document.getElementById('btnNext').disabled = currentPage === totalPages;
        document.getElementById('btnLast').disabled = currentPage === totalPages;
    }

    function updateKPIs(data) {
        var total = data.length;
        var valorTotal = data.reduce(function(sum, item) { return sum + (item.desconto || 0); }, 0);
        var lojas = new Set(data.map(function(d) { return d.loja; }).filter(function(l) { return l; })).size;
        var media = total > 0 ? valorTotal / total : 0;

        document.getElementById('kpiTotal').textContent = total.toLocaleString('pt-BR');
        document.getElementById('kpiValorTotal').textContent = valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById('kpiLojas').textContent = lojas.toLocaleString('pt-BR');
        document.getElementById('kpiMedia').textContent = media.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function showDetail(id) {
        var allData = FileParser.getAllData();
        var item = null;
        for (var i = 0; i < allData.length; i++) {
            if (allData[i].id === id) {
                item = allData[i];
                break;
            }
        }
        if (!item) return;

        var modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = '<div class="detail-grid">' +
            '<div class="detail-item"><label>Data</label><span>' + (item.dataFormatada || '-') + '</span></div>' +
            '<div class="detail-item"><label>Loja</label><span>' + (item.loja || '-') + '</span></div>' +
            '<div class="detail-item"><label>Fornecedor</label><span>' + (item.fornecedor || '-') + '</span></div>' +
            '<div class="detail-item"><label>Produto</label><span>' + (item.produto || '-') + '</span></div>' +
            '<div class="detail-item"><label>Quantidade</label><span>' + (item.quantidadeFormatada || '0') + '</span></div>' +
            '<div class="detail-item full-width"><label>Valor do Desconto</label><span class="valor-destaque">' + (item.descontoFormatado || 'R$ 0,00') + '</span></div>' +
        '</div>';

        document.getElementById('modalOverlay').style.display = 'flex';
    }

    function closeModal() {
        document.getElementById('modalOverlay').style.display = 'none';
    }

    // Expose showDetail globally for onclick
    window.TableModule = {
        showDetail: showDetail,
        closeModal: closeModal,
        getCurrentData: function() { return getFilteredBySearch(); }
    };

    return {
        init: init,
        render: render,
        showDetail: showDetail,
        closeModal: closeModal
    };
})();