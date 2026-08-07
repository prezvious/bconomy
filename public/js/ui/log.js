// Activity Log & Console Chat Stream Manager
import { showToast } from './toast.js';

let isErrorFilterActive = false;

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
    if (!text) return '';

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
    if (type === 'success') title = 'Dispatch';
    else if (type === 'bonus') title = 'Bonus';
    else if (type === 'rare') title = 'Loot Drop';
    else if (type === 'error') title = 'Alert';

    const msgUpper = String(message).toUpperCase();
    if (msgUpper.includes('MINE') || msgUpper.includes('MINING')) title = 'Mine Dispatch';
    else if (msgUpper.includes('EXPLORE')) title = 'Explore Dispatch';
    else if (msgUpper.includes('HUNT')) title = 'Hunt Dispatch';
    else if (msgUpper.includes('FISH')) title = 'Fish Dispatch';
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

    // Status Dot Button Handler (Error indicator & status toggle)
    const statusBtn = document.getElementById('btn-status-dot');
    if (statusBtn) {
        statusBtn.addEventListener('click', () => {
            const log = document.getElementById('activity-log');
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
        clearBtn.addEventListener('click', () => {
            const log = document.getElementById('activity-log');
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

    const handleExecuteCmd = async () => {
        if (!cmdInput) return;
        const rawVal = cmdInput.value.trim();
        if (!rawVal) return;

        cmdInput.value = '';
        const cmd = rawVal.toLowerCase().replace('/', '');

        if (cmd === 'clear') {
            const log = document.getElementById('activity-log');
            if (log) log.innerHTML = '';
            isErrorFilterActive = false;
            if (statusBtn) statusBtn.classList.remove('filter-active');
            addLogEntry('Console log cleared via command.', 'system');
            return;
        }

        if (cmd === 'help') {
            addLogEntry('Available Console Commands:\n• /mine - Dispatch Mine action\n• /explore - Dispatch Explore action\n• /hunt - Dispatch Hunt action\n• /fish - Dispatch Fish action\n• /work - Dispatch Work action\n• /clear - Clear log feed', 'system');
            return;
        }

        if (['mine', 'explore', 'hunt', 'fish', 'work'].includes(cmd)) {
            const btnEl = document.getElementById(`btn-act-${cmd}`);
            if (btnEl) {
                btnEl.click();
            } else {
                addLogEntry(`Dispatching ${cmd}...`, 'system');
            }
        } else {
            addLogEntry(`Unknown command '${rawVal}'. Type /help for available commands.`, 'error');
        }
    };

    if (sendBtn) {
        sendBtn.addEventListener('click', handleExecuteCmd);
    }
    if (cmdInput) {
        cmdInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleExecuteCmd();
            }
        });
    }
};

