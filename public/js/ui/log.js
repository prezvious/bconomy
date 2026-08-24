// Activity Log & Console Chat Stream Manager
import { showToast } from './toast.js';
import { evaluateMathExpression, isPureMathExpression, renderLaTeXPreview } from '../utils/calculator.js';
import { COMMAND_DEFINITIONS, getCommandNames, resolveCommand } from '../controlRegistry.js';
import { getStoredSettings } from '../preferences.js';
import { openFullHelp } from './utilityRail.js';

let isErrorFilterActive = false;
const consoleHandlerBindings = new WeakMap();

const bindConsoleEvent = (element, eventName, handler) => {
    if (!element) return;
    const boundEvents = consoleHandlerBindings.get(element) || new Set();
    if (boundEvents.has(eventName)) return;
    boundEvents.add(eventName);
    consoleHandlerBindings.set(element, boundEvents);
    element.addEventListener(eventName, handler);
};

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
 * Updates status indicator dot button and error/log count badge
 */
export const updateLogHeaderStatus = () => {
    const log = document.getElementById('activity-log');
    const logCountEl = document.getElementById('log-count');
    const statusBtn = document.getElementById('btn-status-dot');
    if (!log) return;

    const entries = Array.from(log.querySelectorAll('.log-entry'));
    const totalCount = entries.length;
    const errorEntries = entries.filter(e => e.classList.contains('error'));
    const errorCount = errorEntries.length;

    if (logCountEl) {
        logCountEl.textContent = totalCount;
    }

    if (statusBtn) {
        if (errorCount === 0) {
            statusBtn.classList.remove('status-error');
            statusBtn.classList.add('status-ok');
            if (isErrorFilterActive) {
                isErrorFilterActive = false;
                statusBtn.classList.remove('filter-active');
                entries.forEach(e => e.style.display = '');
            }
            statusBtn.title = "No errors detected (0 errors). Click to check status.";
            statusBtn.setAttribute('aria-label', "System status: No errors");
        } else {
            statusBtn.classList.remove('status-ok');
            statusBtn.classList.add('status-error');
            if (isErrorFilterActive) {
                statusBtn.classList.add('filter-active');
                statusBtn.title = `Showing ${errorCount} error(s). Click to show all logs.`;
                statusBtn.setAttribute('aria-label', `System status: ${errorCount} errors (Filter active)`);
            } else {
                statusBtn.classList.remove('filter-active');
                statusBtn.title = `${errorCount} error(s) detected! Click to filter error logs.`;
                statusBtn.setAttribute('aria-label', `System status: ${errorCount} errors detected`);
            }
        }
    }
};

/**
 * Parses raw text formatted output into rich HTML embeds for Discord-like chat look.
 */
const formatChatMessageContent = (text, type) => {
    if (!text && typeof text !== 'object') return '';

    // Interactive Rich Calculator Embed Card
    if (type === 'calculator' || (typeof text === 'object' && text && text.formatted !== undefined)) {
        const calcObj = typeof text === 'object' ? text : { formatted: String(text), rawExpression: '', value: text };
        const expr = calcObj.rawExpression || '';
        const formattedVal = calcObj.formatted || String(calcObj.value);
        const isBigNum = Math.abs(Number(calcObj.value)) >= 1000;
        const shorthand = (calcObj.shorthand && isBigNum) ? calcObj.shorthand : '';
        const rawVal = calcObj.value !== undefined ? String(calcObj.value) : formattedVal.replace(/,/g, '');

        return `
            <div class="chat-embed-card embed-calculator">
                <div class="embed-header-row calc-header">
                    <span class="calc-title-pill">
                        <iconify-icon icon="lucide:calculator" class="calc-icon"></iconify-icon>
                        Calculator Result
                    </span>
                </div>
                <div class="calc-body">
                    ${expr ? `<div class="calc-expr-preview-row"><span class="calc-expr-preview">${renderLaTeXPreview(expr)}</span></div>` : ''}
                    <div class="calc-result-row">
                        <span class="calc-value">${escapeHtml(formattedVal)}</span>
                        ${shorthand ? `<span class="calc-shorthand">${escapeHtml(shorthand)}</span>` : ''}
                    </div>
                    <div class="calc-actions-row">
                        <button type="button" class="btn-calc-action btn-copy-calc" data-calc-value="${escapeHtml(rawVal)}" title="Copy raw result to clipboard">
                            <iconify-icon icon="lucide:copy"></iconify-icon> Copy Result
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    if (typeof text !== 'string') return `<div class="chat-standard-text">${escapeHtml(String(text))}</div>`;

    // Check if text is structured loot output from ActionEngine
    if (text.includes('+') && text.includes('items!') && text.includes('New Items:')) {
        const lines = text.split('\n');
        let totalItemsHeader = '';
        let itemsList = [];
        let multipliers = [];
        let specialNotes = [];

        let currentSection = 'header';

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith('+') && trimmed.includes('items!')) {
                totalItemsHeader = trimmed;
            } else if (trimmed === 'New Items:') {
                currentSection = 'items';
            } else if (trimmed === 'Multipliers:') {
                currentSection = 'multipliers';
            } else if (trimmed === 'Other:') {
                currentSection = 'other';
            } else {
                if (currentSection === 'items') {
                    itemsList.push(trimmed);
                } else if (currentSection === 'multipliers') {
                    multipliers.push(trimmed);
                } else if (currentSection === 'other') {
                    specialNotes.push(trimmed);
                }
            }
        }

        const itemsChipsHtml = itemsList.map(itemStr => {
            const match = itemStr.match(/^([\d,]+)×\s*(.+)$/);
            if (match) {
                const qty = match[1];
                const itemName = match[2];
                return `<span class="item-chip"><span class="qty">${qty}×</span> ${escapeHtml(itemName)}</span>`;
            }
            return `<span class="item-chip">${escapeHtml(itemStr)}</span>`;
        }).join('');

        const multChipsHtml = multipliers.map(m => {
            return `<span class="mult-chip"><iconify-icon icon="lucide:zap"></iconify-icon> ${escapeHtml(m)}</span>`;
        }).join('');

        const specialHtml = specialNotes.map(s => {
            return `<span class="special-chip rare-chip"><iconify-icon icon="lucide:sparkles"></iconify-icon> ${escapeHtml(s)}</span>`;
        }).join('');

        return `
            <div class="chat-embed-card embed-${type}">
                <div class="embed-header-row">
                    <span class="loot-total-pill">${escapeHtml(totalItemsHeader)}</span>
                </div>
                <div class="embed-items-grid">
                    ${itemsChipsHtml}
                </div>
                ${multipliers.length > 0 ? `<div class="embed-mult-row">${multChipsHtml}</div>` : ''}
                ${specialNotes.length > 0 ? `<div class="embed-special-row">${specialHtml}</div>` : ''}
            </div>
        `;
    }

    // Work cash payout structured text
    if (text.includes('+$') && text.includes('Cash!')) {
        const lines = text.split('\n');
        const firstLine = lines[0] || text;
        const subLines = lines.slice(1).filter(l => l.trim() && l.trim() !== 'Multipliers:');

        const multChips = subLines.map(l => `<span class="mult-chip"><iconify-icon icon="lucide:coins"></iconify-icon> ${escapeHtml(l.trim())}</span>`).join('');

        return `
            <div class="chat-embed-card embed-${type}">
                <div class="embed-header-row">
                    <span class="cash-total-pill">${escapeHtml(firstLine)}</span>
                </div>
                ${multChips ? `<div class="embed-mult-row">${multChips}</div>` : ''}
            </div>
        `;
    }

    // Standard message
    return `<div class="chat-standard-text">${escapeHtml(text)}</div>`;
};

export const addLogEntry = (message, type = 'system') => {
    const log = document.getElementById('activity-log');
    if (!log) return;

    const entry = document.createElement('div');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let title = 'System';
    if (type === 'success') title = 'Action';
    else if (type === 'bonus') title = 'Bonus';
    else if (type === 'rare') title = 'Loot Drop';
    else if (type === 'error') title = 'Alert';
    else if (type === 'calculator') title = 'Calculator';

    const msgUpper = String(message).toUpperCase();
    if (msgUpper.includes('MINE') || msgUpper.includes('MINING')) title = 'Mine Action';
    else if (msgUpper.includes('EXPLORE')) title = 'Explore Action';
    else if (msgUpper.includes('HUNT')) title = 'Hunt Action';
    else if (msgUpper.includes('FISH')) title = 'Fish Action';
    else if (msgUpper.includes('WORK')) title = 'Work Payout';

    entry.className = `log-entry ${type}`;

    const formattedBody = formatChatMessageContent(message, type);

    entry.innerHTML = `
        <div class="log-entry-header">
            <span class="log-entry-title">${escapeHtml(title)}</span>
            <span class="log-entry-time">${timeStr}</span>
        </div>
        <div class="log-entry-body">${formattedBody}</div>
    `;

    if (isErrorFilterActive && type !== 'error') {
        entry.style.display = 'none';
    }

    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;

    while (log.children.length > 50) {
        log.removeChild(log.firstChild);
    }

    updateLogHeaderStatus();
};

// Setup Console Interactive Handlers
export const setupConsoleHandlers = () => {
    const log = document.getElementById('activity-log');

    // Click event delegation for calculator embed card buttons (Copy)
    if (log) {
        bindConsoleEvent(log, 'click', (e) => {
            const copyBtn = e.target.closest('.btn-copy-calc');
            if (copyBtn) {
                const val = copyBtn.getAttribute('data-calc-value');
                if (val) {
                    navigator.clipboard.writeText(val);
                    showToast(`Copied ${val} to clipboard!`, 'info');
                }
                return;
            }
        });
    }

    // Status Dot Button Handler (Error indicator & status toggle)
    const statusBtn = document.getElementById('btn-status-dot');
    if (statusBtn) {
        bindConsoleEvent(statusBtn, 'click', () => {
            if (!log) return;
            const entries = Array.from(log.querySelectorAll('.log-entry'));
            const errorEntries = entries.filter(e => e.classList.contains('error'));
            const errorCount = errorEntries.length;

            if (errorCount === 0) {
                isErrorFilterActive = false;
                statusBtn.classList.remove('filter-active');
                entries.forEach(e => e.style.display = '');
                showToast('System status: Healthy. 0 errors detected.', 'info');
                addLogEntry('System status check: 0 errors detected. Console operating normally.', 'system');
            } else {
                isErrorFilterActive = !isErrorFilterActive;
                if (isErrorFilterActive) {
                    statusBtn.classList.add('filter-active');
                    entries.forEach(e => {
                        e.style.display = e.classList.contains('error') ? '' : 'none';
                    });
                    showToast(`Filtered feed: Showing ${errorCount} error log(s)`, 'error');
                } else {
                    statusBtn.classList.remove('filter-active');
                    entries.forEach(e => e.style.display = '');
                    showToast('Showing all console logs', 'info');
                }
                updateLogHeaderStatus();
            }
        });
    }

    // Clear console button
    const clearBtn = document.getElementById('btn-clear-log');
    if (clearBtn) {
        bindConsoleEvent(clearBtn, 'click', () => {
            if (log) {
                log.innerHTML = '';
                isErrorFilterActive = false;
                if (statusBtn) statusBtn.classList.remove('filter-active');
                addLogEntry('Console log cleared.', 'system');
            }
        });
    }

    // Console command input bar
    const cmdInput = document.getElementById('console-cmd-input');
    const sendBtn = document.getElementById('btn-console-send');
    const suggestions = document.getElementById('console-command-suggestions');
    let suggestionItems = [];
    let selectedSuggestionIndex = 0;

    const closeSuggestions = () => {
        suggestionItems = [];
        selectedSuggestionIndex = 0;
        suggestions?.classList.add('hidden');
        suggestions?.replaceChildren();
        cmdInput?.setAttribute('aria-expanded', 'false');
        cmdInput?.removeAttribute('aria-activedescendant');
    };

    const currentCommandSuggestions = rawValue => {
        const match = String(rawValue || '').match(/^\/([^\s/]*)$/);
        if (!match) return [];
        const query = match[1].toLowerCase();
        const controls = getStoredSettings().controls;
        return COMMAND_DEFINITIONS.map(definition => {
            const names = getCommandNames(definition, controls);
            const primary = controls.commands[definition.id]?.primary || definition.defaultName;
            const matchedAliases = names.filter(name => name !== primary && name.startsWith(query));
            return { definition, primary, names, matchedAliases };
        }).filter(entry => entry.primary.startsWith(query) || entry.matchedAliases.length)
            .sort((a, b) => {
                const aPrimary = a.primary.startsWith(query) ? 0 : 1;
                const bPrimary = b.primary.startsWith(query) ? 0 : 1;
                return aPrimary - bPrimary || a.primary.localeCompare(b.primary);
            });
    };

    const renderSuggestions = () => {
        if (!cmdInput || !suggestions) return;
        suggestionItems = currentCommandSuggestions(cmdInput.value);
        if (!suggestionItems.length) {
            closeSuggestions();
            return;
        }
        selectedSuggestionIndex = Math.min(selectedSuggestionIndex, suggestionItems.length - 1);
        suggestions.innerHTML = suggestionItems.map((entry, index) => `
            <button id="console-command-option-${index}" class="console-command-option ${index === selectedSuggestionIndex ? 'active' : ''}" type="button" role="option" aria-selected="${index === selectedSuggestionIndex}" data-command-index="${index}">
                <code>/${escapeHtml(entry.primary)}${entry.definition.usage ? ` ${escapeHtml(entry.definition.usage)}` : ''}</code>
                ${entry.matchedAliases.length ? `<small>Alias: /${escapeHtml(entry.matchedAliases[0])}</small>` : ''}
                <span>${escapeHtml(entry.definition.description)}</span>
            </button>
        `).join('');
        suggestions.classList.remove('hidden');
        cmdInput.setAttribute('aria-expanded', 'true');
        cmdInput.setAttribute('aria-activedescendant', `console-command-option-${selectedSuggestionIndex}`);
        suggestions.querySelectorAll('[data-command-index]').forEach(button => {
            button.addEventListener('mousedown', event => event.preventDefault());
            button.addEventListener('click', () => completeSuggestion(Number(button.dataset.commandIndex)));
        });
    };

    const completeSuggestion = index => {
        const entry = suggestionItems[index];
        if (!entry || !cmdInput) return false;
        cmdInput.value = `/${entry.primary}${entry.definition.usage ? ' ' : ''}`;
        closeSuggestions();
        cmdInput.focus();
        cmdInput.setSelectionRange?.(cmdInput.value.length, cmdInput.value.length);
        return true;
    };

    const handleExecuteCmd = async () => {
        if (!cmdInput) return;
        const rawVal = cmdInput.value.trim();
        if (!rawVal) return;

        cmdInput.value = '';
        closeSuggestions();

        const slashMatch = rawVal.match(/^\/([^\s/]+)(?:\s+([\s\S]*))?$/);
        const resolved = slashMatch ? resolveCommand(slashMatch[1], getStoredSettings().controls) : null;
        const commandId = resolved?.definition.id || '';
        const commandArgs = slashMatch?.[2] || '';

        if (commandId === 'calc') {
            const expr = commandArgs.trim();
            if (!expr) {
                addLogEntry(`Usage: /${resolved.primary} <expression> (e.g. /${resolved.primary} 1.5m + 500k)`, 'error');
                return;
            }
            const calcResult = evaluateMathExpression(expr);
            if (!calcResult.success) {
                addLogEntry(`Calculator Error: ${calcResult.error}`, 'error');
            } else {
                addLogEntry(calcResult, 'calculator');
            }
            return;
        }

        if (!slashMatch && isPureMathExpression(rawVal)) {
            const calcResult = evaluateMathExpression(rawVal);
            if (calcResult.success) {
                addLogEntry(calcResult, 'calculator');
                return;
            }
        }

        if (slashMatch && !resolved) {
            addLogEntry(`Unknown command '${rawVal}'. Type / to browse commands or use /help for the handbook.`, 'error');
            return;
        }

        if (commandId === 'clear') {
            if (log) log.innerHTML = '';
            isErrorFilterActive = false;
            if (statusBtn) statusBtn.classList.remove('filter-active');
            addLogEntry('Console log cleared via command.', 'system');
            return;
        }

        if (commandId === 'help') {
            openFullHelp({ returnFocus: cmdInput });
            return;
        }

        if (commandId === 'boost' || commandId === 'use') {
            const parts = commandArgs.trim().split(/\s+/).filter(Boolean);

            if (commandId === 'boost') {
                const targetAction = (parts[0] || '').toLowerCase();
                const targetTier = (parts[1] || 'T1').toUpperCase();

                const { doActivateBoosterDirect } = await import('../api.js');
                const { renderAll } = await import('./header.js');

                try {
                    if (targetAction === 'all') {
                        const actionsList = ['mine', 'explore', 'hunt', 'fish'];
                        const tiersList = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
                        for (const action of actionsList) {
                            for (const tier of tiersList) await doActivateBoosterDirect(action, tier);
                        }
                        showToast('Activated owned loot boosters for all actions!', 'success');
                        addLogEntry('Activated all available T1–T6 loot boosters across all gathering actions.', 'rare');
                        renderAll();
                        return;
                    }

                    if (['mine', 'explore', 'hunt', 'fish'].includes(targetAction)) {
                        if (targetTier === 'ALL') {
                            const tiersList = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
                            for (const tier of tiersList) await doActivateBoosterDirect(targetAction, tier);
                            showToast(`Activated owned loot boosters for ${targetAction}!`, 'success');
                            addLogEntry(`Activated available T1–T6 loot boosters for ${targetAction.toUpperCase()}!`, 'rare');
                        } else {
                            const res = await doActivateBoosterDirect(targetAction, targetTier);
                            if (res.result?.message) {
                                showToast(res.result.message, 'success');
                                addLogEntry(res.result.message, 'bonus');
                            }
                        }
                        renderAll();
                        return;
                    }
                    addLogEntry(`Usage: /${resolved.primary} <mine|explore|hunt|fish|all> <T1–T6|all>`, 'error');
                    return;
                } catch (error) {
                    showToast(error.message || 'Failed to activate boosters', 'error');
                    addLogEntry(`Booster activation failed: ${error.message}`, 'error');
                    return;
                }
            }

            if (commandId === 'use') {
                const itemName = commandArgs.trim();
                if (!itemName) {
                    addLogEntry(`Usage: /${resolved.primary} <item>`, 'error');
                    return;
                }
                const { doUseBooster } = await import('../api.js');
                const { renderAll } = await import('./header.js');

                try {
                    const res = await doUseBooster(itemName);
                    if (res.result && res.result.message) {
                        showToast(res.result.message, 'success');
                        addLogEntry(res.result.message, 'rare');
                        renderAll();
                        return;
                    }
                } catch (err) {
                    showToast(err.message || 'Failed to use booster', 'error');
                    addLogEntry(`Failed to use '${itemName}': ${err.message}`, 'error');
                    return;
                }
            }
        }

        if (['mine', 'explore', 'hunt', 'fish', 'work'].includes(commandId)) {
            const { executeCoreAction } = await import('./actions.js');
            await executeCoreAction(commandId);
            return;
        }

        addLogEntry(`Unknown command '${rawVal}'. Type / to browse commands.`, 'error');
    };

    if (sendBtn) {
        bindConsoleEvent(sendBtn, 'click', handleExecuteCmd);
    }
    if (cmdInput) {
        bindConsoleEvent(cmdInput, 'input', () => {
            selectedSuggestionIndex = 0;
            renderSuggestions();
        });
        bindConsoleEvent(cmdInput, 'keydown', (e) => {
            const menuOpen = Boolean(suggestions && !suggestions.classList.contains('hidden') && suggestionItems.length);
            if (menuOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                e.preventDefault();
                selectedSuggestionIndex = (selectedSuggestionIndex + (e.key === 'ArrowDown' ? 1 : -1) + suggestionItems.length) % suggestionItems.length;
                renderSuggestions();
                suggestions.querySelector(`[data-command-index="${selectedSuggestionIndex}"]`)?.scrollIntoView({ block: 'nearest' });
                return;
            }
            if (menuOpen && (e.key === 'Tab' || e.key === 'Enter')) {
                e.preventDefault();
                completeSuggestion(selectedSuggestionIndex);
                return;
            }
            if (menuOpen && e.key === 'Escape') {
                e.preventDefault();
                closeSuggestions();
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                handleExecuteCmd();
            }
        });
    }
};
