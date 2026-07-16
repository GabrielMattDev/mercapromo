/**
 * Charts Module - MercaPromo
 * Handles Chart.js visualizations
 */
const ChartsModule = (function() {
    'use strict';

    let chartLojas = null;
    let chartPeriodo = null;

    function init() {
        window.addEventListener('dataFiltered', (e) => {
            renderCharts(e.detail.data);
        });
    }

    function renderCharts(data) {
        renderChartLojas(data);
        renderChartPeriodo(data);
    }

    function renderChartLojas(data) {
        const ctx = document.getElementById('chartLojas');
        if (!ctx) return;

        // Aggregate by loja
        const lojaMap = {};
        data.forEach(item => {
            if (item.loja) {
                lojaMap[item.loja] = (lojaMap[item.loja] || 0) + (item.desconto || 0);
            }
        });

        const labels = Object.keys(lojaMap).sort((a, b) => lojaMap[b] - lojaMap[a]).slice(0, 10);
        const values = labels.map(l => lojaMap[l]);

        if (chartLojas) chartLojas.destroy();

        chartLojas = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Valor em Descontos',
                    data: values,
                    backgroundColor: 'rgba(255, 107, 0, 0.7)',
                    borderColor: 'rgba(255, 107, 0, 1)',
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e1e2a',
                        titleColor: '#f1f1f4',
                        bodyColor: '#a0a0b0',
                        borderColor: '#2e2e3e',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return 'R$ ' + context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#6b6b7b', font: { size: 11 } },
                        grid: { display: false }
                    },
                    y: {
                        ticks: {
                            color: '#6b6b7b',
                            font: { size: 11 },
                            callback: function(value) {
                                return 'R$ ' + (value / 1000).toFixed(0) + 'k';
                            }
                        },
                        grid: { color: '#2e2e3e', drawBorder: false }
                    }
                }
            }
        });
    }

    function renderChartPeriodo(data) {
        const ctx = document.getElementById('chartPeriodo');
        if (!ctx) return;

        // Aggregate by month
        const mesMap = {};
        const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        data.forEach(item => {
            if (item.data && !isNaN(item.data.getTime())) {
                const key = `${mesesNomes[item.data.getMonth()]} ${item.data.getFullYear()}`;
                mesMap[key] = (mesMap[key] || 0) + (item.desconto || 0);
            }
        });

        const labels = Object.keys(mesMap);
        const values = labels.map(l => mesMap[l]);

        if (chartPeriodo) chartPeriodo.destroy();

        chartPeriodo = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        'rgba(255, 107, 0, 0.8)',
                        'rgba(0, 59, 122, 0.8)',
                        'rgba(255, 140, 0, 0.8)',
                        'rgba(0, 100, 180, 0.8)',
                        'rgba(255, 180, 0, 0.8)',
                        'rgba(0, 80, 150, 0.8)',
                        'rgba(255, 200, 50, 0.8)',
                        'rgba(0, 120, 200, 0.8)'
                    ],
                    borderColor: '#1e1e2a',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#a0a0b0',
                            font: { size: 11 },
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e1e2a',
                        titleColor: '#f1f1f4',
                        bodyColor: '#a0a0b0',
                        borderColor: '#2e2e3e',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                return context.label + ': R$ ' + context.parsed.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + ' (' + pct + '%)';
                            }
                        }
                    }
                }
            }
        });
    }

    return {
        init,
        renderCharts
    };
})();