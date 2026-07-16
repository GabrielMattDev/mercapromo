/**
 * Filters Module - MercaPromo
 * Handles data filtering by date range, store and product
 */
const Filters = (function() {
    'use strict';

    var filteredData = [];
    var currentFilters = {
        dataInicio: null,
        dataFim: null,
        loja: '',
        produto: ''
    };

    // Lista fixa de lojas (codigo + nome) conforme imagem 2
    var LOJAS_FIXAS = [
        { codigo: '6', nome: 'CONTAGEM 381' },
        { codigo: '7', nome: 'PASSOS' },
        { codigo: '10', nome: 'NOVA SERRANA' },
        { codigo: '11', nome: 'POCOS DE CALDAS' },
        { codigo: '14', nome: 'RIBEIRAO DAS NEVES' },
        { codigo: '15', nome: 'MANHUACU' },
        { codigo: '16', nome: 'LINHA VERDE' },
        { codigo: '17', nome: 'PAULO AFONSO (BA)' },
        { codigo: '18', nome: 'MURIAE' },
        { codigo: '19', nome: 'JEQUIE (BA)' },
        { codigo: '20', nome: 'LUIZ EDUARDO MAGALHAES (BA)' },
        { codigo: '21', nome: 'VITORIA DA CONQUISTA (BA)' },
        { codigo: '22', nome: 'FEIRA DE SANTANA (BA)' },
        { codigo: '23', nome: 'BARREIRAS (BA)' },
        { codigo: '24', nome: 'CONTAGEM 2 COLONIAL' },
        { codigo: '25', nome: 'SANTO ANTONIO DE JESUS (BA)' },
        { codigo: '26', nome: 'ITABUNA (BA)' },
        { codigo: '27', nome: 'POUSO ALEGRE' },
        { codigo: '28', nome: 'JUAZEIRO (BA)' },
        { codigo: '29', nome: 'PORTO SEGURO (BA)' }
    ];

    function init() {
        setupEventListeners();
    }

    function setupEventListeners() {
        document.getElementById('btnFiltrar').addEventListener('click', applyFilters);
        document.getElementById('btnLimpar').addEventListener('click', clearFilters);

        document.getElementById('filterDataInicio').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') applyFilters();
        });
        document.getElementById('filterDataFim').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') applyFilters();
        });
    }

    function populateLojaSelect(data) {
        var select = document.getElementById('filterLoja');
        select.innerHTML = '<option value="">Todas</option>';

        // Usa lista fixa de lojas
        LOJAS_FIXAS.forEach(function(loja) {
            var option = document.createElement('option');
            option.value = loja.codigo;
            option.textContent = loja.codigo + ' - ' + loja.nome;
            select.appendChild(option);
        });
    }

    function populateProdutoSelect(data) {
        var select = document.getElementById('filterProduto');
        select.innerHTML = '<option value="">Todos</option>';

        var produtos = [...new Set(data.map(function(d) { return d.produto; }).filter(function(p) { return p; }))].sort();

        produtos.forEach(function(produto) {
            var option = document.createElement('option');
            option.value = produto;
            option.textContent = produto;
            select.appendChild(option);
        });
    }

    function setDateRange(data) {
        var dates = data.map(function(d) { return d.data; }).filter(function(d) { return d && !isNaN(d.getTime()); });
        if (dates.length === 0) return;

        var minDate = new Date(Math.min.apply(null, dates));
        var maxDate = new Date(Math.max.apply(null, dates));

        document.getElementById('filterDataInicio').value = minDate.toISOString().split('T')[0];
        document.getElementById('filterDataFim').value = maxDate.toISOString().split('T')[0];
    }

    function applyFilters() {
        var dataInicio = document.getElementById('filterDataInicio').value;
        var dataFim = document.getElementById('filterDataFim').value;
        var loja = document.getElementById('filterLoja').value;
        var produto = document.getElementById('filterProduto').value;

        var allData = FileParser.getAllData();

        currentFilters = {
            dataInicio: dataInicio ? new Date(dataInicio) : null,
            dataFim: dataFim ? new Date(dataFim) : null,
            loja: loja,
            produto: produto
        };

        filteredData = allData.filter(function(item) {
            var pass = true;

            // Date filter
            if (item.data && !isNaN(item.data.getTime())) {
                if (currentFilters.dataInicio) {
                    var inicio = new Date(currentFilters.dataInicio);
                    inicio.setHours(0, 0, 0, 0);
                    if (item.data < inicio) pass = false;
                }
                if (currentFilters.dataFim) {
                    var fim = new Date(currentFilters.dataFim);
                    fim.setHours(23, 59, 59, 999);
                    if (item.data > fim) pass = false;
                }
            }

            // Loja filter - compara com o codigo da loja
            if (currentFilters.loja) {
                // O item.loja pode ser o codigo ou o nome completo
                // Tenta match pelo codigo ou pelo nome
                var itemLojaTrim = (item.loja || '').toString().trim();
                var filterLoja = currentFilters.loja;

                // Se o item.loja for o codigo exato
                if (itemLojaTrim !== filterLoja) {
                    // Se nao bateu, verifica se o item.loja contem o codigo (ex: "18 - MURIAE" no arquivo)
                    if (itemLojaTrim.indexOf(filterLoja) === -1) {
                        pass = false;
                    }
                }
            }

            // Produto filter
            if (currentFilters.produto && item.produto !== currentFilters.produto) {
                pass = false;
            }

            return pass;
        });

        window.dispatchEvent(new CustomEvent('dataFiltered', { 
            detail: { data: filteredData, filters: currentFilters } 
        }));

        Toast.show(filteredData.length + ' registros encontrados', 'info');
    }

    function clearFilters() {
        var allData = FileParser.getAllData();
        setDateRange(allData);
        document.getElementById('filterLoja').value = '';
        document.getElementById('filterProduto').value = '';
        applyFilters();
        Toast.show('Filtros limpos', 'info');
    }

    function getFilteredData() {
        return filteredData;
    }

    function getCurrentFilters() {
        return currentFilters;
    }

    return {
        init: init,
        populateLojaSelect: populateLojaSelect,
        populateProdutoSelect: populateProdutoSelect,
        setDateRange: setDateRange,
        applyFilters: applyFilters,
        clearFilters: clearFilters,
        getFilteredData: getFilteredData,
        getCurrentFilters: getCurrentFilters
    };
})();