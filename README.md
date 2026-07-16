# Painel Validação MercaPromo

Dashboard para importação, visualização e análise de relatórios de descontos da MercaPromo.

## Funcionalidades

- **Importação de Arquivos**: Suporte a TXT, CSV e XLSX
- **Filtros**: Data Início, Data Fim, Loja
- **KPIs**: Total de descontos, valor total, lojas envolvidas, média por desconto
- **Gráficos**: Descontos por loja (barra) e distribuição por período (doughnut)
- **Tabela**: Paginada, com busca e ordenação visual
- **Exportação**: CSV e Excel do relatório filtrado
- **Detalhes**: Modal com informações completas de cada registro

## Estrutura

```
painel-validacao-mercapromo/
├── index.html              # Página principal
├── css/
│   ├── geral.css           # Estilos base, header, toast, modal
│   └── dashboard.css       # Upload, filtros, KPIs, tabela, gráficos
├── js/
│   ├── app.js              # Orquestrador principal
│   └── modules/
│       ├── fileParser.js   # Parser de TXT/CSV/XLSX
│       ├── filters.js      # Filtros de data e loja
│       ├── charts.js       # Gráficos Chart.js
│       ├── table.js        # Tabela, paginação, busca
│       ├── export.js       # Exportação CSV/XLSX
│       └── toast.js        # Notificações
└── assets/                 # Imagens e ícones
```

## Como usar

1. Abra `index.html` em um navegador moderno (Chrome, Edge, Firefox)
2. Clique em "Selecionar Arquivo" ou arraste um arquivo TXT/CSV/XLSX
3. O painel será carregado automaticamente com os dados
4. Use os filtros de Data e Loja para refinar os resultados
5. Exporte o relatório filtrado em CSV ou Excel

## Formato esperado do arquivo

O arquivo deve conter as colunas (nomes flexíveis):
- **Data** → data, dt, date, emissao, data_desconto
- **Loja** → loja, cod_loja, filial, unidade
- **Fornecedor** → fornecedor, forn, supplier, razao_social
- **Produto** → produto, descricao, item, mercadoria
- **Desconto** → desconto, valor_desconto, vlr_desconto, discount

## Atalhos

- `Ctrl + O` → Abrir arquivo
- `Escape` → Fechar modal

## Tecnologias

- HTML5 + CSS3 (sem frameworks CSS)
- Vanilla JavaScript (ES6+)
- Chart.js 4.4.1 (gráficos)
- SheetJS/XLSX 0.18.5 (leitura/escrita Excel)
- Font Awesome 6.5.1 (ícones)

## Versão

v1.0.0 - 16/07/2026
