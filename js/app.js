/**
 * App Module - Painel Validação MercaPromo
 * Main application orchestrator
 */
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // DOM Elements
    const uploadSection = document.getElementById('uploadSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const fileInput = document.getElementById('fileInput');
    const btnUpload = document.getElementById('btnUpload');
    const uploadCard = document.querySelector('.upload-card');
    const statusBadge = document.getElementById('statusBadge');
    const statusText = document.getElementById('statusText');
    const recordCount = document.getElementById('recordCount');
    const countText = document.getElementById('countText');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');

    // Initialize modules
    function initModules() {
        Filters.init();
        TableModule.init();
        ChartsModule.init();
        ExportModule.init();
    }

    // Upload handlers
    function setupUpload() {
        btnUpload.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);

        // Drag & drop
        uploadCard.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadCard.classList.add('dragover');
        });

        uploadCard.addEventListener('dragleave', () => {
            uploadCard.classList.remove('dragover');
        });

        uploadCard.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadCard.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                processFile(files[0]);
            }
        });

        // Click on card also triggers upload
        uploadCard.addEventListener('click', (e) => {
            if (e.target === uploadCard || e.target.closest('.upload-icon') || 
                e.target.tagName === 'H3' || e.target.tagName === 'P') {
                fileInput.click();
            }
        });
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) processFile(file);
    }

    async function processFile(file) {
        const validExts = ['txt', 'csv', 'xlsx', 'xls'];
        const ext = file.name.split('.').pop().toLowerCase();

        if (!validExts.includes(ext)) {
            Toast.show('Formato de arquivo não suportado. Use TXT, CSV ou XLSX.', 'error');
            return;
        }

        // Update status
        statusBadge.classList.add('active');
        statusText.textContent = 'Processando arquivo...';

        try {
            const result = await FileParser.parseFile(file);

            if (result.count === 0) {
                Toast.show('Nenhum registro válido encontrado no arquivo.', 'warning');
                statusBadge.classList.remove('active');
                statusText.textContent = 'Aguardando arquivo';
                return;
            }

            // Show dashboard
            uploadSection.style.display = 'none';
            dashboardSection.style.display = 'block';

            // Update status
            statusText.textContent = 'Arquivo carregado';
            recordCount.style.display = 'flex';
            countText.textContent = `${result.count.toLocaleString('pt-BR')} registros`;

            // Setup filters
            Filters.populateLojaSelect(result.data);
            Filters.populateProdutoSelect(result.data);
            Filters.setDateRange(result.data);
            Filters.applyFilters();

            Toast.show('Arquivo "' + file.name + '" carregado com sucesso! ' + result.count + ' registros importados.', 'success');

        } catch (err) {
            console.error('Erro ao processar arquivo:', err);
            Toast.show('Erro ao processar arquivo: ' + err.message, 'error');
            statusBadge.classList.remove('active');
            statusText.textContent = 'Erro no processamento';
        }
    }

    // Modal handlers
    modalClose.addEventListener('click', () => {
        modalOverlay.style.display = 'none';
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modalOverlay.style.display = 'none';
        }
    });

    // Keyboard shortcut for upload
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
            e.preventDefault();
            fileInput.click();
        }
    });

    // Initialize
    initModules();
    setupUpload();

    console.log('%c Painel Validação MercaPromo ', 'background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; font-size: 14px; padding: 4px 12px; border-radius: 4px;');
    console.log('%c Pronto para importar relatórios de descontos ', 'color: #a0a0b0; font-size: 12px;');
});