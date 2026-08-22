// Pure helpers for compact plot ID ranges and typed farm selections.

const sortedUniquePositiveIds = values => [...new Set((Array.isArray(values) ? values : [])
    .filter(value => Number.isSafeInteger(value) && value > 0))]
    .sort((a, b) => a - b);

export const formatPlotIdRanges = plotIds => {
    const ids = sortedUniquePositiveIds(plotIds);
    if (ids.length === 0) return '';

    const ranges = [];
    let start = ids[0];
    let end = ids[0];
    for (let index = 1; index < ids.length; index++) {
        if (ids[index] === end + 1) {
            end = ids[index];
            continue;
        }
        ranges.push(start === end ? String(start) : `${start}-${end}`);
        start = ids[index];
        end = ids[index];
    }
    ranges.push(start === end ? String(start) : `${start}-${end}`);
    return ranges.join(', ');
};

export const parsePlotSelection = (expression, availablePlotIds) => {
    const availableIds = sortedUniquePositiveIds(availablePlotIds);
    const available = new Set(availableIds);
    const input = String(expression || '').trim();
    if (!input) return { valid: false, error: 'Enter at least one plot number or range.' };
    if (input.length > 240) return { valid: false, error: 'Plot selection is too long. Use compact ranges to shorten it.' };
    if (availableIds.length === 0) return { valid: false, error: 'No farm plots are currently available.' };

    const selected = new Set();
    for (const rawPart of input.split(',')) {
        const part = rawPart.trim();
        const match = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
        if (!match) {
            return { valid: false, error: `“${part || rawPart}” is invalid. Use numbers and ranges such as 1, 3, 5-8.` };
        }

        const start = Number(match[1]);
        const end = match[2] === undefined ? start : Number(match[2]);
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start <= 0 || end <= 0) {
            return { valid: false, error: 'Plot numbers must be positive whole numbers.' };
        }
        if (end < start) {
            return { valid: false, error: `Range ${start}-${end} is descending. Enter the lower plot number first.` };
        }
        if ((end - start + 1) > availableIds.length) {
            return { valid: false, error: `Range ${start}-${end} is larger than the current farm.` };
        }
        for (let id = start; id <= end; id++) selected.add(id);
    }

    const unavailable = [...selected].filter(id => !available.has(id)).sort((a, b) => a - b);
    if (unavailable.length > 0) {
        return {
            valid: false,
            error: `Unavailable plot number${unavailable.length === 1 ? '' : 's'}: ${formatPlotIdRanges(unavailable)}.`
        };
    }

    return { valid: true, plotIds: [...selected].sort((a, b) => a - b) };
};
