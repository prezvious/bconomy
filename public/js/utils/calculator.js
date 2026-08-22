/**
 * Bconomy Math Calculation Engine
 * Safe mathematical expression parser and evaluator for chat, console, and quantity inputs.
 * Supports:
 * - Shorthand suffixes: k, m, b, t, q, thousand(s), million(s), billion(s), trillion(s), quadrillion(s)
 * - Basic arithmetic: +, -, *, /, %, ^, ()
 * - Percentage calculations: 500 + 10%, 200 - 15%, 100 * 20%
 * - Math functions: sqrt, abs, round, floor, ceil, min, max
 * - Contextual keywords: max, all, owned
 */

const SUFFIX_MAP = [
    { pattern: /(\d+(?:\.\d+)?)\s*(?:quadrillion|quadrillions|q)\b/gi, multiplier: 1e15 },
    { pattern: /(\d+(?:\.\d+)?)\s*(?:trillion|trillions|t)\b/gi, multiplier: 1e12 },
    { pattern: /(\d+(?:\.\d+)?)\s*(?:billion|billions|b)\b/gi, multiplier: 1e9 },
    { pattern: /(\d+(?:\.\d+)?)\s*(?:million|millions|m)\b/gi, multiplier: 1e6 },
    { pattern: /(\d+(?:\.\d+)?)\s*(?:thousand|thousands|k)\b/gi, multiplier: 1e3 }
];

/**
 * Replaces suffix representations (e.g. 1.5k, 2.5 million, 500k) with numeric literals.
 * @param {string} exprStr - Input expression string
 * @returns {string} Normalized expression string with numeric literals
 */
export function parseShorthandNumbers(exprStr) {
    if (!exprStr) return '';
    let normalized = String(exprStr).trim();
    for (const { pattern, multiplier } of SUFFIX_MAP) {
        normalized = normalized.replace(pattern, (match, numStr) => {
            const num = parseFloat(numStr);
            if (isNaN(num)) return match;
            const val = num * multiplier;
            return String(val);
        });
    }
    return normalized;
}

/**
 * Pre-processes percentage expressions like `500 + 10%`, `200 - 15%`, `100 * 20%`.
 */
function preprocessPercentages(exprStr) {
    // Matches Pattern: (Number/SubExpr) (+|-|*|/) Number%
    // Replace "A + B%" -> "A + (A * (B/100))"
    // Replace "A - B%" -> "A - (A * (B/100))"
    // Replace "A * B%" -> "A * (B/100)"
    // Replace "A / B%" -> "A / (B/100)"
    let expr = exprStr;

    // Handle additive percentage: number or parenthesized group followed by +/- number%
    expr = expr.replace(/(\d+(?:\.\d+)?|\))[\s]*([+-])[\s]*(\d+(?:\.\d+)?)%/gi, (match, left, op, pct) => {
        const pctVal = parseFloat(pct) / 100;
        return `${left} ${op} (${left} * ${pctVal})`;
    });

    // Handle multiplicative/standalone percentage: number% -> (number / 100)
    expr = expr.replace(/(\d+(?:\.\d+)?)%/gi, (match, pct) => {
        return `(${parseFloat(pct) / 100})`;
    });

    return expr;
}

/**
 * Replaces contextual keywords like `max`, `all`, `owned` with context values if provided.
 */
function replaceKeywords(exprStr, contextData = {}) {
    let expr = exprStr;
    const maxVal = contextData.max !== undefined ? contextData.max : (contextData.owned !== undefined ? contextData.owned : null);
    const ownedVal = contextData.owned !== undefined ? contextData.owned : (contextData.max !== undefined ? contextData.max : null);

    if (maxVal !== null) {
        // Replace 'max' or 'all' keyword as a variable operand, but NOT function calls like max(...)
        expr = expr.replace(/\bmax\b(?!\s*\()/gi, String(maxVal));
        expr = expr.replace(/\ball\b/gi, String(maxVal));
    }
    if (ownedVal !== null) {
        expr = expr.replace(/\bowned\b/gi, String(ownedVal));
    }
    return expr;
}

/**
 * Checks if a string is a pure standalone mathematical expression.
 * Returns true for expressions like "8 * 8", "9/3 * (39 + 3)", "1.5k + 500", "sqrt(144)", "500 + 10%".
 * Returns false for normal text or game commands like "/mine", "hello world", "sell blueberry".
 */
export function isPureMathExpression(str) {
    if (!str || typeof str !== 'string') return false;
    const trimmed = str.trim();
    if (!trimmed || trimmed.startsWith('/')) return false;

    // Normalize shorthand first
    const normalized = parseShorthandNumbers(trimmed);

    // Expression must contain math operators, math functions, or numbers
    const containsOperator = /[+\-*/%^]/.test(normalized);
    const containsFunction = /\b(sqrt|abs|round|floor|ceil|min|max)\b/i.test(normalized);

    if (!containsOperator && !containsFunction) {
        return false;
    }

    // Strip out all valid tokens: numbers, operators, parentheses, commas, keywords, and suffixes
    let cleaned = trimmed
        .replace(/(\d+(?:\.\d+)?)\s*(?:quadrillion|quadrillions|trillion|trillions|billion|billions|million|millions|thousand|thousands|[kmbtqKMBTQ])\b/gi, ' ')
        .replace(/\b(sqrt|abs|round|floor|ceil|min|max|max|all|owned)\b/gi, ' ')
        .replace(/[\d\s+\-*/%^().,]+/g, ' ');

    // If any non-whitespace text remains, it's not a pure math expression
    if (cleaned.trim().length > 0) {
        return false;
    }

    // Final evaluation check
    const result = evaluateMathExpression(trimmed);
    return result.success && typeof result.value === 'number' && !isNaN(result.value);
}

/**
 * Evaluates a mathematical expression safely without using `eval()`.
 * @param {string} exprStr - Mathematical expression to evaluate
 * @param {Object} [contextData] - Optional context with values for `max`, `all`, `owned`
 * @returns {Object} { success: boolean, value?: number, formatted?: string, shorthand?: string, error?: string, rawExpression: string }
 */
export function evaluateMathExpression(exprStr, contextData = {}) {
    const rawExpression = String(exprStr || '').trim();
    if (!rawExpression) {
        return { success: false, error: 'Empty expression', rawExpression };
    }

    try {
        let prep = parseShorthandNumbers(rawExpression);
        prep = replaceKeywords(prep, contextData);
        prep = preprocessPercentages(prep);

        const val = parseAndEval(prep);

        if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
            return { success: false, error: 'Invalid calculation result', rawExpression };
        }

        const formatted = formatWithCommas(val);
        const shorthand = formatCompactShorthand(val);

        return {
            success: true,
            value: val,
            formatted,
            shorthand,
            rawExpression
        };
    } catch (err) {
        return {
            success: false,
            error: err.message || 'Calculation error',
            rawExpression
        };
    }
}

/**
 * Safe Recursive Descent / Shunting-Yard AST Expression Evaluator
 */
function parseAndEval(expr) {
    let tokens = tokenize(expr);
    if (tokens.length === 0) throw new Error('No tokens');

    let pos = 0;

    function peek() {
        return tokens[pos];
    }

    function consume(type, val) {
        const token = tokens[pos];
        if (!token) throw new Error(`Unexpected end of expression`);
        if (type && token.type !== type) throw new Error(`Unexpected token '${token.value}'`);
        if (val !== undefined && token.value !== val) throw new Error(`Expected '${val}', got '${token.value}'`);
        pos++;
        return token;
    }

    function parseExpr() {
        let left = parseTerm();
        while (peek() && (peek().value === '+' || peek().value === '-')) {
            const op = consume().value;
            const right = parseTerm();
            if (op === '+') left = left + right;
            else if (op === '-') left = left - right;
        }
        return left;
    }

    function parseTerm() {
        let left = parseFactor();
        while (peek() && (peek().value === '*' || peek().value === '/' || peek().value === '%')) {
            const op = consume().value;
            const right = parseFactor();
            if (op === '*') left = left * right;
            else if (op === '/') {
                if (right === 0) throw new Error('Division by zero');
                left = left / right;
            } else if (op === '%') {
                if (right === 0) throw new Error('Division by zero');
                left = left % right;
            }
        }
        return left;
    }

    function parseFactor() {
        let left = parsePower();
        while (peek() && peek().value === '^') {
            consume();
            const right = parseFactor(); // Right associative exponentiation
            left = Math.pow(left, right);
        }
        return left;
    }

    function parsePower() {
        const token = peek();
        if (!token) throw new Error('Unexpected end of expression');

        if (token.type === 'operator' && token.value === '-') {
            consume();
            return -parsePower();
        }
        if (token.type === 'operator' && token.value === '+') {
            consume();
            return parsePower();
        }

        if (token.type === 'number') {
            consume();
            return token.numValue;
        }

        if (token.type === 'function') {
            const funcName = consume().value.toLowerCase();
            consume('paren', '(');
            const args = [];
            if (peek() && peek().value !== ')') {
                args.push(parseExpr());
                while (peek() && peek().value === ',') {
                    consume('comma', ',');
                    args.push(parseExpr());
                }
            }
            consume('paren', ')');
            return evalMathFunction(funcName, args);
        }

        if (token.type === 'paren' && token.value === '(') {
            consume('paren', '(');
            const val = parseExpr();
            consume('paren', ')');
            return val;
        }

        throw new Error(`Unexpected token '${token.value}'`);
    }

    const res = parseExpr();
    if (pos < tokens.length) {
        throw new Error(`Unexpected token '${tokens[pos].value}' at end`);
    }
    return res;
}

function evalMathFunction(name, args) {
    switch (name) {
        case 'sqrt':
            if (args.length !== 1) throw new Error('sqrt() takes 1 argument');
            if (args[0] < 0) throw new Error('sqrt() of negative number');
            return Math.sqrt(args[0]);
        case 'abs':
            if (args.length !== 1) throw new Error('abs() takes 1 argument');
            return Math.abs(args[0]);
        case 'round':
            if (args.length !== 1) throw new Error('round() takes 1 argument');
            return Math.round(args[0]);
        case 'floor':
            if (args.length !== 1) throw new Error('floor() takes 1 argument');
            return Math.floor(args[0]);
        case 'ceil':
            if (args.length !== 1) throw new Error('ceil() takes 1 argument');
            return Math.ceil(args[0]);
        case 'min':
            if (args.length < 1) throw new Error('min() requires at least 1 argument');
            return Math.min(...args);
        case 'max':
            if (args.length < 1) throw new Error('max() requires at least 1 argument');
            return Math.max(...args);
        default:
            throw new Error(`Unknown function ${name}()`);
    }
}

function tokenize(str) {
    const tokens = [];
    let i = 0;
    const len = str.length;

    while (i < len) {
        const char = str[i];

        if (/\s/.test(char)) {
            i++;
            continue;
        }

        // Numbers (integers or decimals)
        if (/[\d.]/.test(char)) {
            let numStr = '';
            while (i < len && /[\d.]/.test(str[i])) {
                numStr += str[i];
                i++;
            }
            const numVal = parseFloat(numStr);
            if (isNaN(numVal)) throw new Error(`Invalid number '${numStr}'`);
            tokens.push({ type: 'number', value: numStr, numValue: numVal });
            continue;
        }

        // Operators
        if (['+', '-', '*', '/', '%', '^'].includes(char)) {
            tokens.push({ type: 'operator', value: char });
            i++;
            continue;
        }

        // Parentheses & Commas
        if (char === '(' || char === ')') {
            tokens.push({ type: 'paren', value: char });
            i++;
            continue;
        }
        if (char === ',') {
            tokens.push({ type: 'comma', value: ',' });
            i++;
            continue;
        }

        // Function names (sqrt, abs, round, floor, ceil, min, max)
        if (/[a-zA-Z]/.test(char)) {
            let ident = '';
            while (i < len && /[a-zA-Z]/.test(str[i])) {
                ident += str[i];
                i++;
            }
            const lower = ident.toLowerCase();
            if (['sqrt', 'abs', 'round', 'floor', 'ceil', 'min', 'max'].includes(lower)) {
                tokens.push({ type: 'function', value: lower });
            } else {
                throw new Error(`Unknown identifier '${ident}'`);
            }
            continue;
        }

        throw new Error(`Unexpected character '${char}'`);
    }

    return tokens;
}

/**
 * Formats a number with comma separators.
 */
export function formatWithCommas(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    if (Number.isInteger(num)) {
        return new Intl.NumberFormat('en-US').format(num);
    }
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(num);
}

/**
 * Formats a number into compact shorthand notation (e.g. 1.5K, 2.5M, 1B).
 */
export function formatCompactShorthand(num) {
    if (!num || isNaN(num)) return '0';
    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    const fmt = (val, sfx) => sign + parseFloat(val.toFixed(2)) + sfx;

    if (abs >= 1e15) return fmt(abs / 1e15, 'Q');
    if (abs >= 1e12) return fmt(abs / 1e12, 'T');
    if (abs >= 1e9) return fmt(abs / 1e9, 'B');
    if (abs >= 1e6) return fmt(abs / 1e6, 'M');
    if (abs >= 1e3) return fmt(abs / 1e3, 'K');
    return num.toString();
}

/**
 * Attaches live calculation preview badge and auto-evaluation on blur to any quantity input.
 * @param {HTMLInputElement} inputEl - Target input element
 * @param {HTMLElement} previewEl - Element to render live preview badge in
 * @param {Function|Object} [getContextFn] - Optional function returning { max, owned } context values
 */
export function attachMathInputPreview(inputEl, previewEl, getContextFn = () => ({})) {
    if (!inputEl) return null;

    // The same persistent input can represent different inventory items over
    // time. Remove the previous closure so it cannot keep stale quantity data.
    if (typeof inputEl._mathPreviewCleanup === 'function') {
        inputEl._mathPreviewCleanup();
    }

    const updatePreview = () => {
        const valStr = inputEl.value.trim();
        if (!valStr) {
            if (previewEl) previewEl.innerHTML = '';
            return null;
        }

        const ctx = typeof getContextFn === 'function' ? getContextFn() : (getContextFn || {});
        const res = evaluateMathExpression(valStr, ctx);

        if (res.success && typeof res.value === 'number' && !isNaN(res.value)) {
            const intVal = Math.max(1, Math.floor(res.value));
            if (previewEl) {
                previewEl.innerHTML = `<span class="qty-live-preview-pill" title="Calculated quantity">= ${formatWithCommas(intVal)}</span>`;
            }
            return intVal;
        } else {
            if (previewEl && /[+\-*/%^()kKmMbBtTqQ]/.test(valStr)) {
                previewEl.innerHTML = `<span class="qty-live-preview-pill calc-error" title="Invalid math expression">Syntax Error</span>`;
            } else if (previewEl) {
                previewEl.innerHTML = '';
            }
            return null;
        }
    };

    inputEl.addEventListener('input', updatePreview);

    const handleBlur = () => {
        const computed = updatePreview();
        if (computed !== null && computed > 0) {
            inputEl.value = computed;
            if (previewEl) previewEl.innerHTML = '';
        }
    };
    inputEl.addEventListener('blur', handleBlur);

    inputEl._mathPreviewCleanup = () => {
        inputEl.removeEventListener('input', updatePreview);
        inputEl.removeEventListener('blur', handleBlur);
        delete inputEl._mathPreviewCleanup;
    };

    return updatePreview;
}

/**
 * Converts a raw ASCII math expression into a LaTeX string for typesetting.
 * Uses \times for multiplication (*), \div for division (/), \sqrt{x} for sqrt, etc.
 */
export function convertToLaTeX(exprStr) {
    if (!exprStr || typeof exprStr !== 'string') return '';
    let latex = exprStr.trim();

    // 1. Escape LaTeX special characters like % -> \%
    latex = latex.replace(/%/g, '\\%');

    // 2. Convert function calls: sqrt(x) -> \sqrt{x}, abs(x) -> \left|x\right|
    latex = latex.replace(/\bsqrt\s*\(([^()]+)\)/gi, '\\sqrt{$1}');
    latex = latex.replace(/\babs\s*\(([^()]+)\)/gi, '\\left|$1\\right|');
    latex = latex.replace(/\b(round|floor|ceil|min|max)\s*\(([^()]+)\)/gi, '\\text{$1}($2)');

    // 3. Convert power expressions x ^ y -> x^{y}
    latex = latex.replace(/(\d+(?:\.\d+)?|\)|[a-zA-Z]+)\s*\^\s*(\d+(?:\.\d+)?|\)|[a-zA-Z]+)/gi, '$1^{$2}');

    // 4. Convert operators: * -> \times, / -> \div
    latex = latex.replace(/\*/g, ' \\times ');
    latex = latex.replace(/\//g, ' \\div ');

    // 5. Format shorthand number suffixes cleanly in LaTeX text mode
    const suffixReplacements = [
        { pattern: /(\d+(?:\.\d+)?)\s*(?:quadrillion|quadrillions)\b/gi, tex: '$1\\text{ quadrillion}' },
        { pattern: /(\d+(?:\.\d+)?)\s*(?:trillion|trillions)\b/gi, tex: '$1\\text{ trillion}' },
        { pattern: /(\d+(?:\.\d+)?)\s*(?:billion|billions)\b/gi, tex: '$1\\text{ billion}' },
        { pattern: /(\d+(?:\.\d+)?)\s*(?:million|millions)\b/gi, tex: '$1\\text{ million}' },
        { pattern: /(\d+(?:\.\d+)?)\s*(?:thousand|thousands)\b/gi, tex: '$1\\text{ thousand}' },
        { pattern: /(\d+(?:\.\d+)?)\s*q\b/gi, tex: '$1\\text{Q}' },
        { pattern: /(\d+(?:\.\d+)?)\s*t\b/gi, tex: '$1\\text{T}' },
        { pattern: /(\d+(?:\.\d+)?)\s*b\b/gi, tex: '$1\\text{B}' },
        { pattern: /(\d+(?:\.\d+)?)\s*m\b/gi, tex: '$1\\text{M}' },
        { pattern: /(\d+(?:\.\d+)?)\s*k\b/gi, tex: '$1\\text{k}' }
    ];

    for (const { pattern, tex } of suffixReplacements) {
        latex = latex.replace(pattern, tex);
    }

    return latex;
}

const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

/**
 * Renders LaTeX string via KaTeX if available in browser, or returns clean monospace text fallback.
 */
export function renderLaTeXPreview(exprStr) {
    if (!exprStr) return '';
    const latexStr = convertToLaTeX(exprStr);
    
    if (typeof window !== 'undefined' && window.katex && typeof window.katex.renderToString === 'function') {
        try {
            return window.katex.renderToString(latexStr, {
                throwOnError: false,
                displayMode: false
            });
        } catch (e) {
            console.warn('KaTeX render error:', e);
        }
    }

    return `<span class="calc-expr-preview-fallback">${escapeHtml(exprStr)}</span>`;
}

