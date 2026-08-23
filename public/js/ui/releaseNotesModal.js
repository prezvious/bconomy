// Release Notes & Version Updates Modal Manager (Personal Game)
import { openDialog } from './modal.js';
import { iconHtml } from '../utils.js';

export const RELEASES = [
    {
        id: 'v2.0',
        version: 'v2.0',
        isLatest: true,
        date: '2026-08-23',
        title: 'v2.0 — Timer Precision, Smart Duration Conversion & Display Settings',
        sections: [
            {
                type: 'New Features',
                items: [
                    {
                        title: 'Smart Adaptive Multi-Unit Duration Conversion',
                        bullets: [
                            'Long booster and action timers automatically convert into readable breakdowns across years (y), months (mo), weeks (w), days (d), hours (h), minutes (m), and seconds (s).',
                            'Supports 5 configurable breakdown styles: Smart Adaptive (top 3 units), Compact Adaptive (top 2 units), Full Breakdown (all units), Days & Hours, and Raw Hours.',
                            'Massive timers (e.g. 3,255,217 hours) now cleanly display as "371y 7mo 1w" instead of raw overflowing numbers.'
                        ]
                    },
                    {
                        title: 'In-Place Timer Hover Expiration Conversion',
                        bullets: [
                            'Hovering over active booster and faction timers dynamically swaps the countdown in-place with its calculated calendar expiration timestamp.',
                            'Supports 9 date formats: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, YYYY-MM-DD (ISO), YYYY/MM/DD, MM/DD/YYYY, D MMM YYYY, MMM D, YYYY, and Day, D Month YYYY.',
                            'Supports 5 time styles: 24-Hour (HH:mm:ss), 24-Hour Short (HH:mm), 12-Hour (hh:mm:ss AM/PM), 12-Hour Short (hh:mm AM/PM), and Date Only.',
                            'Supports Device Local Timezone and UTC.'
                        ]
                    },
                    {
                        title: 'Interactive Release Notes Modal',
                        bullets: [
                            'Accessible anytime directly from the Bconomy v2.0 button in the sidebar footer.',
                            'Browse all updates with instant search, version filtering, and structured changelogs.'
                        ]
                    }
                ]
            },
            {
                type: 'Improvements',
                items: [
                    {
                        title: 'Display & Timers Preferences Card',
                        bullets: [
                            'Added dedicated settings with interactive live preview pill inside Settings.',
                            'Preferences persist reliably in browser storage with graceful fallback resets.'
                        ]
                    },
                    {
                        title: 'Bulk Booster Integration',
                        bullets: [
                            'Standardized duration deltas and projected expiration dates across the Bulk Booster activation table.'
                        ]
                    }
                ]
            },
            {
                type: 'Bug Fixes',
                items: [
                    {
                        title: 'Zero-Quantity Booster Formatting',
                        bullets: [
                            'Prevented phantom "+Expired" text when adding 0-quantity boosters, accurately displaying "+0s".'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'v1.4',
        version: 'v1.4',
        date: '2026-08-23',
        title: 'v1.4 — Shop Bulk Strategy Optimizations & Rank Ascension Scaling',
        sections: [
            {
                type: 'Improvements',
                items: [
                    {
                        title: 'Shop Engine Calculations',
                        bullets: [
                            'Optimized bulk buy equal-distribution strategy across inventory catalog.',
                            'Clamped large cash balances safely and removed negative signs on projected purchase costs.'
                        ]
                    },
                    {
                        title: 'Rank & Ascension Scaling',
                        bullets: [
                            'Preserved cash balance on ascension leaps and optimized multi-tier calculations for multi-quadrillion balances.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'v1.3',
        version: 'v1.3',
        date: '2026-08-23',
        title: 'v1.3 — Modernized Header Layout & Player Account Profile Dialog',
        sections: [
            {
                type: 'New Features',
                items: [
                    {
                        title: 'Player Account Profile Modal',
                        bullets: [
                            'Inspect verified Player ID (#1, #2, ...), Guild Master username, linked email, and account status.',
                            'Integrated direct sign out and profile management.'
                        ]
                    },
                    {
                        title: 'Stat Folio Header Redesign',
                        bullets: [
                            'Upgraded top bar with clean rectangular cards, tabular numeric typography, and responsive single-bar layout.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'v1.2',
        version: 'v1.2',
        date: '2026-08-22',
        title: 'v1.2 — Supabase Cloud Auth, Sequential Player IDs & Password Security',
        sections: [
            {
                type: 'New Features',
                items: [
                    {
                        title: 'Cloud Authentication & Sync',
                        bullets: [
                            'Integrated Supabase authentication with email & password accounts and cloud vault backup.',
                            'Assigned sequential integer Player IDs (#1, #2, #100) on signup.'
                        ]
                    },
                    {
                        title: 'Dynamic Name Generator & Password Strength Meter',
                        bullets: [
                            'Comprehensive English dictionary word bank generating single-word and fantasy guild master usernames.',
                            'Interactive password meter checking length, numbers, symbols, and mixed case with visual segments.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'v1.1',
        version: 'v1.1',
        date: '2026-08-21',
        title: 'v1.1 — Level 500 Tools, Chrono Sockets & Farm Automation',
        sections: [
            {
                type: 'New Features',
                items: [
                    {
                        title: 'Level 500 Tools & Socket Overclocking',
                        bullets: [
                            'Procedural gathering recipes scaling up to Level 500 with up to 10 Chrono Module sockets and cooldown reduction.',
                            'Bulk tool upgrading with atomic transaction safety.'
                        ]
                    },
                    {
                        title: 'Farm Abundance & Multi-Cycle Yields',
                        bullets: [
                            'Water Abundance leveling up to Level 10 multiplying yield bonuses and byproducts across accelerated cycles.'
                        ]
                    },
                    {
                        title: 'Toast Notification Coalescing',
                        bullets: [
                            'Grouped repeated alerts into pulse badges, added category filtering, and introduced quiet minimal density mode.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'v1.0',
        version: 'v1.0',
        date: '2026-08-20',
        title: 'v1.0 — Initial Game Release',
        sections: [
            {
                type: 'New Features',
                items: [
                    {
                        title: 'Core Economy & Gathering Systems',
                        bullets: [
                            'Primary actions: Mine, Explore, Hunt, and Work with stamina/cooldown engines.',
                            'Farm plot management with crops, watering cycles, and plot level upgrades.',
                            'Shop buy/sell with restock intervals, markup formulas, and loot booster multipliers.',
                            'Rank progression, ascension prestige perks, gambling games (Coinflip, Slots), and Guild Factions.'
                        ]
                    }
                ]
            }
        ]
    }
];

let activeVersionFilter = 'all';
let searchQuery = '';

const escapeHtml = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const renderReleaseCard = (release) => {
    const isLatest = release.isLatest;
    const badgeHtml = isLatest
        ? `<span class="badge release-card-badge latest">Latest v2.0</span>`
        : `<span class="badge release-card-badge">${escapeHtml(release.version)}</span>`;

    const sectionsHtml = (release.sections || []).map(section => {
        const itemsHtml = (section.items || []).map(item => `
            <div class="release-item">
                <div class="release-item-header">
                    <strong class="release-item-title">${escapeHtml(item.title)}</strong>
                </div>
                <ul class="release-bullet-list">
                    ${(item.bullets || []).map(bullet => `<li>${escapeHtml(bullet)}</li>`).join('')}
                </ul>
            </div>
        `).join('');

        return `
            <div class="release-section">
                <h4 class="release-section-heading">${escapeHtml(section.type)}</h4>
                ${itemsHtml}
            </div>
        `;
    }).join('');

    return `
        <article class="release-card ${isLatest ? 'release-card-latest' : ''}" data-version="${escapeHtml(release.version)}">
            <div class="release-card-header">
                <div class="release-title-row">
                    ${badgeHtml}
                    <h3 class="release-card-title">${escapeHtml(release.title)}</h3>
                </div>
                <div class="release-meta-row">
                    <span class="release-date">
                        ${iconHtml('lucide:calendar')} ${escapeHtml(release.date)}
                    </span>
                </div>
            </div>
            <div class="release-card-body">
                ${sectionsHtml}
            </div>
        </article>
    `;
};

export const renderReleaseNotesList = () => {
    const container = document.getElementById('release-notes-list');
    const countEl = document.getElementById('release-notes-count');
    if (!container) return;

    const query = searchQuery.trim().toLowerCase();

    const filtered = RELEASES.filter(release => {
        if (activeVersionFilter !== 'all' && release.version !== activeVersionFilter) {
            return false;
        }

        if (!query) return true;

        const titleMatch = release.title.toLowerCase().includes(query);
        const versionMatch = release.version.toLowerCase().includes(query);
        const contentMatch = JSON.stringify(release.sections || []).toLowerCase().includes(query);
        return titleMatch || versionMatch || contentMatch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="release-empty-state">
                <iconify-icon icon="lucide:search-x" class="empty-icon" aria-hidden="true"></iconify-icon>
                <h4>No updates found</h4>
                <p>No release notes matched "${escapeHtml(searchQuery)}". Try a different search term or filter.</p>
            </div>
        `;
    } else {
        container.innerHTML = filtered.map(renderReleaseCard).join('');
    }

    if (countEl) {
        countEl.textContent = `Showing ${filtered.length} update version${filtered.length === 1 ? '' : 's'}`;
    }
};

export const openReleaseNotesModal = () => {
    const searchInput = document.getElementById('release-notes-search');
    if (searchInput) {
        searchInput.value = searchQuery;
    }

    const filterGroup = document.getElementById('release-version-filters');
    if (filterGroup) {
        filterGroup.querySelectorAll('.release-filter-chip').forEach(el => {
            el.classList.toggle('active', (el.dataset.version || 'all') === activeVersionFilter);
        });
    }

    renderReleaseNotesList();
    openDialog('release-notes-modal', {
        initialFocus: '#release-notes-search',
        closeOnBackdrop: true
    });
};

let listenersBound = false;

export const setupReleaseNotesModal = () => {
    const triggerBtn = document.getElementById('btn-release-notes');
    if (triggerBtn && !triggerBtn.dataset.bound) {
        triggerBtn.dataset.bound = 'true';
        triggerBtn.addEventListener('click', () => {
            openReleaseNotesModal();
        });
    }

    const searchInput = document.getElementById('release-notes-search');
    if (searchInput && !searchInput.dataset.bound) {
        searchInput.dataset.bound = 'true';
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderReleaseNotesList();
        });
    }

    const filterGroup = document.getElementById('release-version-filters');
    if (filterGroup && !filterGroup.dataset.bound) {
        filterGroup.dataset.bound = 'true';
        filterGroup.addEventListener('click', (e) => {
            const chip = e.target.closest('.release-filter-chip');
            if (!chip) return;

            filterGroup.querySelectorAll('.release-filter-chip').forEach(el => el.classList.remove('active'));
            chip.classList.add('active');
            activeVersionFilter = chip.dataset.version || 'all';
            renderReleaseNotesList();
        });
    }
};
