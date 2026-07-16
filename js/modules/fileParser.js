/**
 * File Parser Module - MercaPromo
 * Handles TXT, CSV, and XLSX file parsing
 */
const FileParser = (function() {
    'use strict';

    var allData = [];
    var fileName = '';

    // Expected column mappings (flexible)
    var COLUMN_MAP = {
        data: ['data', 'dt', 'date', 'data_emissao', 'dt_emissao', 'emissao', 'data_desconto'],
        loja: ['loja', 'cod_loja', 'codigo_loja', 'store', 'filial', 'unidade'],
        fornecedor: ['fornecedor', 'forn', 'supplier', 'nome_fornecedor', 'razao_social'],
        produto: ['produto', 'descricao', 'descricao_produto', 'item', 'mercadoria', 'nome_produto'],
        desconto: ['desconto', 'valor_desconto', 'vlr_desconto', 'discount', 'vl_desconto', 'total_desconto']
    };

    function normalizeHeader(header) {
        return header
            .toString()
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    }

    function detectColumns(headers) {
        var normalized = headers.map(normalizeHeader);
        var mapping = {};
        var key, possibleNames, name, idx, lojaIdx, fornIdx, descIdx;

        for (key in COLUMN_MAP) {
            if (COLUMN_MAP.hasOwnProperty(key)) {
                possibleNames = COLUMN_MAP[key];
                for (var i = 0; i < possibleNames.length; i++) {
                    name = possibleNames[i];
                    idx = -1;
                    for (var j = 0; j < normalized.length; j++) {
                        if (normalized[j] === name || normalized[j].indexOf(name) !== -1) {
                            idx = j;
                            break;
                        }
                    }
                    if (idx !== -1) {
                        mapping[key] = idx;
                        break;
                    }
                }
            }
        }

        // Fallback: try partial matching
        if (mapping.loja === undefined) {
            lojaIdx = -1;
            for (var k = 0; k < normalized.length; k++) {
                if (normalized[k].indexOf('loj') !== -1) {
                    lojaIdx = k;
                    break;
                }
            }
            if (lojaIdx !== -1) mapping.loja = lojaIdx;
        }
        if (mapping.fornecedor === undefined) {
            fornIdx = -1;
            for (var m = 0; m < normalized.length; m++) {
                if (normalized[m].indexOf('forn') !== -1 || normalized[m].indexOf('fornec') !== -1) {
                    fornIdx = m;
                    break;
                }
            }
            if (fornIdx !== -1) mapping.fornecedor = fornIdx;
        }
        if (mapping.desconto === undefined) {
            descIdx = -1;
            for (var n = 0; n < normalized.length; n++) {
                if (normalized[n].indexOf('desc') !== -1 || normalized[n].indexOf('descont') !== -1) {
                    descIdx = n;
                    break;
                }
            }
            if (descIdx !== -1) mapping.desconto = descIdx;
        }

        return mapping;
    }

    function parseValor(valor) {
        if (valor === null || valor === undefined) return 0;
        var str = valor.toString()
            .replace(/R\$\s?/gi, '')
            .replace(/\./g, '')
            .replace(',', '.');
        var num = parseFloat(str);
        return isNaN(num) ? 0 : num;
    }

    function parseData(dataStr) {
        if (!dataStr) return null;
        var str = dataStr.toString().trim();
        var match;

        // Try DD/MM/YYYY
        match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (match) {
            return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
        }

        // Try YYYY-MM-DD
        match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (match) {
            return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
        }

        // Try DD-MM-YYYY
        match = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
        if (match) {
            return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
        }

        // Try Excel serial
        var excelSerial = parseInt(str);
        if (!isNaN(excelSerial) && excelSerial > 30000 && excelSerial < 50000) {
            var excelEpoch = new Date(1899, 11, 30);
            return new Date(excelEpoch.getTime() + excelSerial * 24 * 60 * 60 * 1000);
        }

        // Fallback to native parse
        var d = new Date(str);
        return isNaN(d.getTime()) ? null : d;
    }

    function formatDateBR(date) {
        if (!date || isNaN(date.getTime())) return '';
        return date.toLocaleDateString('pt-BR');
    }

    function parseCSV(text) {
        var lines = text.split(/\r?\n/).filter(function(line) { return line.trim(); });
        if (lines.length < 2) return [];

        // Detect delimiter
        var firstLine = lines[0];
        var semicolonCount = (firstLine.match(/;/g) || []).length;
        var commaCount = (firstLine.match(/,/g) || []).length;
        var delimiter = semicolonCount >= commaCount ? ';' : ',';

        // Parse with respect to quotes
        function splitLine(line) {
            var result = [];
            var current = '';
            var inQuotes = false;

            for (var i = 0; i < line.length; i++) {
                var char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === delimiter && !inQuotes) {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current.trim());
            return result;
        }

        var headers = splitLine(lines[0]);
        var mapping = detectColumns(headers);

        if (Object.keys(mapping).length === 0) {
            throw new Error('Nao foi possivel identificar as colunas do arquivo. Verifique se o arquivo contem as colunas: Data, Loja, Fornecedor, Produto, Desconto');
        }

        var data = [];
        for (var i = 1; i < lines.length; i++) {
            var cols = splitLine(lines[i]);
            if (cols.length < 2) continue;

            var parsedDate = mapping.data !== undefined ? parseData(cols[mapping.data]) : null;
            var parsedValor = mapping.desconto !== undefined ? parseValor(cols[mapping.desconto]) : 0;

            // Skip rows with no valid data
            if (!parsedDate && parsedValor === 0 && !cols[mapping.loja]) continue;

            data.push({
                id: i,
                data: parsedDate,
                dataFormatada: formatDateBR(parsedDate),
                loja: mapping.loja !== undefined ? (cols[mapping.loja] || '').toString().trim() : '',
                fornecedor: mapping.fornecedor !== undefined ? (cols[mapping.fornecedor] || '').toString().trim() : '',
                produto: mapping.produto !== undefined ? (cols[mapping.produto] || '').toString().trim() : '',
                desconto: parsedValor,
                descontoFormatado: parsedValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                raw: cols
            });
        }

        return data;
    }

    function parseTXT(text) {
        // Try to detect if it's tab-separated or fixed-width
        var lines = text.split(/\r?\n/).filter(function(line) { return line.trim(); });
        if (lines.length < 2) return [];

        // Check if first line looks like headers
        var firstLine = lines[0].toLowerCase();
        var hasHeaders = firstLine.indexOf('data') !== -1 || firstLine.indexOf('loja') !== -1 || 
                          firstLine.indexOf('fornecedor') !== -1 || firstLine.indexOf('desconto') !== -1;

        if (hasHeaders) {
            return parseCSV(text.replace(/\t/g, ';'));
        }

        // Fixed-width fallback - try to split by multiple spaces or tabs
        var tabLines = text.split(/\r?\n/).map(function(l) { return l.split('\t'); });
        if (tabLines.length > 1 && tabLines[0].length > 3) {
            return parseCSV(text.replace(/\t/g, ';'));
        }

        // Last resort: treat as CSV with space delimiter
        return parseCSV(text);
    }

    function parseXLSX(arrayBuffer) {
        var workbook = XLSX.read(arrayBuffer, { type: 'array' });
        var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        var jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false });

        if (jsonData.length < 2) return [];

        var headers = jsonData[0].map(function(h) { return h ? h.toString() : ''; });
        var mapping = detectColumns(headers);

        if (Object.keys(mapping).length === 0) {
            throw new Error('Nao foi possivel identificar as colunas do arquivo Excel. Verifique se o arquivo contem as colunas: Data, Loja, Fornecedor, Produto, Desconto');
        }

        var data = [];
        for (var i = 1; i < jsonData.length; i++) {
            var row = jsonData[i];
            if (!row || row.length < 2) continue;

            var parsedDate = mapping.data !== undefined ? parseData(row[mapping.data]) : null;
            var parsedValor = mapping.desconto !== undefined ? parseValor(row[mapping.desconto]) : 0;

            if (!parsedDate && parsedValor === 0 && !row[mapping.loja]) continue;

            data.push({
                id: i,
                data: parsedDate,
                dataFormatada: formatDateBR(parsedDate),
                loja: mapping.loja !== undefined ? (row[mapping.loja] || '').toString().trim() : '',
                fornecedor: mapping.fornecedor !== undefined ? (row[mapping.fornecedor] || '').toString().trim() : '',
                produto: mapping.produto !== undefined ? (row[mapping.produto] || '').toString().trim() : '',
                desconto: parsedValor,
                descontoFormatado: parsedValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                raw: row
            });
        }

        return data;
    }

    function parseFile(file) {
        var ext = file.name.split('.').pop().toLowerCase();
        fileName = file.name;

        return new Promise(function(resolve, reject) {
            var reader = new FileReader();

            reader.onload = function(e) {
                try {
                    var data;
                    if (ext === 'xlsx' || ext === 'xls') {
                        data = parseXLSX(e.target.result);
                    } else if (ext === 'csv') {
                        var text = new TextDecoder('utf-8').decode(e.target.result);
                        data = parseCSV(text);
                    } else {
                        var text = new TextDecoder('utf-8').decode(e.target.result);
                        data = parseTXT(text);
                    }

                    allData = data;
                    resolve({ data: data, count: data.length, fileName: file.name });
                } catch (err) {
                    reject(err);
                }
            };

            reader.onerror = function() { reject(new Error('Erro ao ler o arquivo')); };

            if (ext === 'xlsx' || ext === 'xls') {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        });
    }

    function getAllData() {
        return allData;
    }

    function getFileName() {
        return fileName;
    }

    function setData(data) {
        allData = data;
    }

    return {
        parseFile: parseFile,
        getAllData: getAllData,
        getFileName: getFileName,
        setData: setData,
        parseValor: parseValor,
        formatDateBR: formatDateBR
    };
})();