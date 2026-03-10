import { v4 as uuidv4 } from 'uuid';
import type { Holding } from '../types';

export interface CSVParseResult {
  imported: Holding[];
  skipped: number;
  errors: string[];
  duplicates: string[];
}

/**
 * Parse a Trading 212 CSV export into Holding objects.
 *
 * Trading 212 export columns (relevant subset):
 *   Ticker, Name, Shares, "Average price", Currency
 *
 * Also handles generic CSVs with similar column names.
 */
export function parseTrading212CSV(
  csvText: string,
  existingTickers: string[] = []
): CSVParseResult {
  const result: CSVParseResult = { imported: [], skipped: 0, errors: [], duplicates: [] };

  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    result.errors.push('CSV file appears to be empty or has no data rows.');
    return result;
  }

  // Parse header row — normalise to lowercase, trim whitespace and quotes
  const rawHeaders = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());

  // Flexible column mapping
  const col = (names: string[]): number => {
    for (const name of names) {
      const idx = rawHeaders.findIndex((h) => h === name || h.includes(name));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const tickerCol   = col(['ticker', 'symbol', 'isin']);
  const nameCol     = col(['name', 'instrument', 'security name']);
  const sharesCol   = col(['shares', 'quantity', 'units', 'no. of shares']);
  const priceCol    = col(['average price', 'avg price', 'avg. price', 'average cost', 'cost basis per share', 'price']);
  const currencyCol = col(['currency', 'ccy']);

  if (tickerCol === -1) {
    result.errors.push('Could not find a Ticker column. Expected column named "Ticker" or "Symbol".');
    return result;
  }
  if (sharesCol === -1) {
    result.errors.push('Could not find a Shares column. Expected "Shares" or "Quantity".');
    return result;
  }
  if (priceCol === -1) {
    result.errors.push('Could not find an Average Price column. Expected "Average price" or "Avg price".');
    return result;
  }

  const existingSet = new Set(existingTickers.map((t) => t.toUpperCase()));

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quoted CSV fields properly
    const fields = parseCSVLine(line);

    const rawTicker = fields[tickerCol]?.trim().replace(/^"|"$/g, '') ?? '';
    const rawName   = nameCol !== -1 ? (fields[nameCol]?.trim().replace(/^"|"$/g, '') ?? '') : rawTicker;
    const rawShares = fields[sharesCol]?.trim().replace(/^"|"$/g, '') ?? '';
    const rawPrice  = fields[priceCol]?.trim().replace(/^"|"$/g, '') ?? '';
    const rawCcy    = currencyCol !== -1 ? (fields[currencyCol]?.trim().replace(/^"|"$/g, '') ?? 'GBP') : 'GBP';

    if (!rawTicker) {
      result.skipped++;
      continue;
    }

    const ticker = rawTicker.toUpperCase();
    const shares = parseFloat(rawShares.replace(/,/g, ''));
    const avgPrice = parseFloat(rawPrice.replace(/,/g, ''));

    if (isNaN(shares) || shares <= 0) {
      result.errors.push(`Row ${i + 1} (${ticker}): invalid shares value "${rawShares}" — skipped.`);
      result.skipped++;
      continue;
    }
    if (isNaN(avgPrice) || avgPrice <= 0) {
      result.errors.push(`Row ${i + 1} (${ticker}): invalid price value "${rawPrice}" — skipped.`);
      result.skipped++;
      continue;
    }

    if (existingSet.has(ticker)) {
      result.duplicates.push(ticker);
      result.skipped++;
      continue;
    }

    const currency = normaliseCurrency(rawCcy);

    result.imported.push({
      id: uuidv4(),
      ticker,
      name: rawName || ticker,
      shares,
      avgBuyPrice: avgPrice,
      currency,
      addedAt: new Date().toISOString(),
    });

    // Prevent duplicate tickers within the same CSV
    existingSet.add(ticker);
  }

  return result;
}

/** Split a CSV line respecting double-quoted fields. */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function normaliseCurrency(raw: string): 'GBP' | 'USD' | 'EUR' {
  const upper = raw.toUpperCase().trim();
  if (upper === 'GBP' || upper === 'GBX') return 'GBP'; // GBX = pence, treat as GBP
  if (upper === 'EUR') return 'EUR';
  return 'USD';
}
