// Release Notes & Version Updates Modal Manager (Personal Game)
import { openDialog } from './modal.js';

export const RELEASES = [
    {
        id: 'v2.2.1',
        version: 'v2.2.1',
        isLatest: true,
        date: '2026-08-23',
        title: 'v2.2.1 — Work Shift Streak Amnesia Fixes & Inventory Action Polish',
        sections: [
            {
                type: 'Bug Fixes',
                items: [
                    {
                        title: 'Work Shift Streak Amnesia Window Preservation',
                        bullets: [
                            'Fixed an issue where the Amnesiac perk triggering during a work action set the cooldown to 0, which caused streak expiration timestamps to resolve to a 1970 epoch date and instantly break the active streak.',
                            'Anchored streak window calculations to natural cooldown durations so active streak timers remain open for the full 45-minute window regardless of cooldown resets.'
                        ]
                    },
                    {
                        title: 'Work Shift Streak Cooldown-Elapsed Gating',
                        bullets: [
                            'Added eligibility gating (streakEligibleAt) to prevent premature streak progression during immediate Amnesia-triggered shifts.',
                            'Shifts clocked during the active cooldown period grant full cash payouts and benefit from the current streak multiplier while preserving the streak stack without unearned increments.'
                        ]
                    }
                ]
            },
            {
                type: 'Improvements',
                items: [
                    {
                        title: 'Activate Boosters Button Label Polish',
                        bullets: [
                            'Removed the extraneous "(0)" counter suffix from the inventory toolbar Activate Boosters action button for clean, consistent UI styling.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'v2.2',
        version: 'v2.2',
        date: '2026-08-23',
        title: 'v2.2 — Item Locking, Pinned Inventory & Work Shift Streaks',
        sections: [
            {
                type: 'New Features',
                items: [
                    {
                        title: 'Item Locking (🔒)',
                        bullets: [
                            'Lock any item from within the Item Details Modal to protect it against accidental consumption, sales, or crafting.',
                            'Locked items are automatically skipped during Bulk Sell and cannot be sold individually in the shop.',
                            'Locked boosters cannot be consumed or batch activated.',
                            'Locked farm items (e.g. Melon) and gathering materials are protected from accidental crafting or tool upgrades.',
                            'Visual lock badge (🔒) is prominently displayed on locked inventory cards.'
                        ]
                    },
                    {
                        title: 'Item Pinning (📌)',
                        bullets: [
                            'Pin high-priority items directly to the top of the Inventory tab using the Pin toggle in the Item Details Modal.',
                            'Dedicated Pinned section with theme-matching SVG icon isolates pinned items, excluding them from lower standard category lists.'
                        ]
                    },
                    {
                        title: 'Work Shift Streaks (🔥)',
                        bullets: [
                            'Earn a compounding +1% cash pay bonus per consecutive work shift (capping at 20 stacks for +20% bonus pay).',
                            'Maintain your streak by clocking into work within 45 minutes after the work cooldown completes.',
                            'Work action card features a live streak badge and real-time countdown timer tracking the active streak window.'
                        ]
                    }
                ]
            },
            {
                type: 'Improvements',
                items: [
                    {
                        title: 'Crisp SVG Icon Theme Integration',
                        bullets: [
                            'Integrated matching inline SVG icon definitions for pin, pin-off, lock, unlock, and flame into the core icon pipeline.'
                        ]
                    },
                    {
                        title: 'Item Modal Action Safeguards',
                        bullets: [
                            'Item Details Modal dynamically disables the Use and Sell action controls when an item is locked.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'v2.1',
        version: 'v2.1',
        date: '2026-08-23',
        title: 'v2.1 — Prestige Ascension Costs, Dynamic Tier Scaling & Targeted Rank-Up Optimization',
        sections: [
            {
                type: 'New Features',
                items: [
                    {
                        title: 'Prestige Ascension Fee & Investiture Discount',
                        bullets: [
                            'Ascension from Tier 0 to Tier 1 is Free ($0), preserving player cash balances.',
                            'Ascending to Tier 2+ introduces dynamic scaling ascension costs: $550,000,000 × (t + 2).',
                            'Investiture perk reduces Tier 1+ prestige ascension costs by 2.5% per level up to 62.5% at Level 25.',
                            'Interactive confirmation modal and ascension UI display dynamic fees and enforce cash sufficiency.'
                        ]
                    },
                    {
                        title: 'Career Rank Escalation Multipliers',
                        bullets: [
                            'Rank-up costs across all 107 ranks scale linearly by prestige tier multiplier (t + 1): 1x at Tier 0, 2x at Tier 1, 3x at Tier 2, etc.',
                            'Cronyism perk provides up to 62.5% discount across all 107 ranks uniformly.'
                        ]
                    }
                ]
            },
            {
                type: 'Improvements',
                items: [
                    {
                        title: 'Multi-Tier Targeted Rank-Up & Max Affordable Solver',
                        bullets: [
                            'Targeted rank-up solver accurately budgets for both individual rank promotion ladders and tier ascension fees across any number of tiers.',
                            'Max Affordable mode automatically stops at Rank 107 (God) if the player can afford the rank ladder but lacks cash for the tier ascension fee.'
                        ]
                    },
                    {
                        title: 'Comprehensive Math Invariant & Test Suite Audit',
                        bullets: [
                            'Added dedicated audit test suite verifying 100% mathematical integrity across all 107 ranks, formulas, and large-number quadrillion bounds.'
                        ]
                    }
                ]
            },
            {
                type: 'Bug Fixes',
                items: [
                    {
                        title: 'Lower-Tier Target Clamping',
                        bullets: [
                            'Fixed an issue in Targeted Rank-Up calculations where targeting a lower tier than the current tier falsely prompted promotions in the current tier instead of reporting zero cost.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'v2.0',
        version: 'v2.0',
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
                            'Browse all updates with instant search, category filtering, and compact collapsible version accordions.'
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

let activeCategoryFilter = 'all';
let searchQuery = '';
const expandedVersions = new Set(['v2.2.1']); // v2.2.1 expanded by default

const escapeHtml = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const matchesCategory = (sectionType, filter) => {
    if (filter === 'all') return true;
    const lower = sectionType.toLowerCase();
    if (filter === 'features') return lower.includes('feature');
    if (filter === 'improvements') return lower.includes('improvement');
    if (filter === 'fixes') return lower.includes('fix') || lower.includes('bug');
    return true;
};

const renderReleaseAccordion = (release) => {
    const isLatest = release.isLatest;
    const query = searchQuery.trim().toLowerCase();

    // Filter sections based on category filter
    const matchingSections = (release.sections || []).filter(section => 
        matchesCategory(section.type, activeCategoryFilter)
    );

    if (matchingSections.length === 0) return '';

    // Auto-expand if active search query matches
    const isExpanded = expandedVersions.has(release.version) || (query.length > 0);

    const totalBullets = matchingSections.reduce((sum, sec) => 
        sum + (sec.items || []).reduce((itemSum, item) => itemSum + (item.bullets || []).length, 0), 0
    );

    const badgeHtml = isLatest
        ? `<span class="badge release-card-badge latest">Latest ${escapeHtml(release.version)}</span>`
        : `<span class="badge release-card-badge">${escapeHtml(release.version)}</span>`;

    const sectionsHtml = matchingSections.map(section => {
        const lowerType = section.type.toLowerCase();
        let sectionIcon = 'lucide:sparkles';
        if (lowerType.includes('improvement')) sectionIcon = 'lucide:wrench';
        if (lowerType.includes('fix') || lowerType.includes('bug')) sectionIcon = 'lucide:bug';

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
                <h4 class="release-section-heading">
                    <iconify-icon icon="${sectionIcon}" class="section-icon" aria-hidden="true"></iconify-icon>
                    <span>${escapeHtml(section.type)}</span>
                </h4>
                ${itemsHtml}
            </div>
        `;
    }).join('');

    return `
        <article class="release-accordion ${isExpanded ? 'is-expanded' : 'is-collapsed'} ${isLatest ? 'release-card-latest' : ''}" data-version="${escapeHtml(release.version)}">
            <button type="button" class="release-accordion-header" aria-expanded="${isExpanded ? 'true' : 'false'}" aria-controls="release-body-${escapeHtml(release.version)}">
                <div class="release-header-left">
                    <iconify-icon icon="lucide:chevron-right" class="accordion-chevron" aria-hidden="true"></iconify-icon>
                    ${badgeHtml}
                    <h3 class="release-card-title">${escapeHtml(release.title)}</h3>
                </div>
                <div class="release-header-right">
                    <span class="release-change-count">${totalBullets} change${totalBullets === 1 ? '' : 's'}</span>
                    <span class="release-date">
                        <iconify-icon icon="lucide:calendar" aria-hidden="true"></iconify-icon>
                        <span>${escapeHtml(release.date)}</span>
                    </span>
                </div>
            </button>
            <div class="release-accordion-body" id="release-body-${escapeHtml(release.version)}">
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
        const hasMatchingSection = (release.sections || []).some(section => 
            matchesCategory(section.type, activeCategoryFilter)
        );
        if (!hasMatchingSection) return false;

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
                <p>No release notes matched "${escapeHtml(searchQuery)}". Try a different search term or category.</p>
            </div>
        `;
    } else {
        container.innerHTML = filtered.map(renderReleaseAccordion).join('');
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

    const filterGroup = document.getElementById('release-category-filters');
    if (filterGroup) {
        filterGroup.querySelectorAll('.release-filter-chip').forEach(el => {
            el.classList.toggle('active', (el.dataset.category || 'all') === activeCategoryFilter);
        });
    }

    renderReleaseNotesList();
    openDialog('release-notes-modal', {
        initialFocus: '#release-notes-search',
        closeOnBackdrop: true
    });
};

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

    // Category filter chips
    const categoryGroup = document.getElementById('release-category-filters');
    if (categoryGroup && !categoryGroup.dataset.bound) {
        categoryGroup.dataset.bound = 'true';
        categoryGroup.addEventListener('click', (e) => {
            const chip = e.target.closest('.release-filter-chip');
            if (!chip) return;

            categoryGroup.querySelectorAll('.release-filter-chip').forEach(el => el.classList.remove('active'));
            chip.classList.add('active');
            activeCategoryFilter = chip.dataset.category || 'all';
            renderReleaseNotesList();
        });
    }

    // Expand All / Collapse All buttons
    const expandBtn = document.getElementById('btn-release-expand-all');
    if (expandBtn && !expandBtn.dataset.bound) {
        expandBtn.dataset.bound = 'true';
        expandBtn.addEventListener('click', () => {
            RELEASES.forEach(r => expandedVersions.add(r.version));
            renderReleaseNotesList();
        });
    }

    const collapseBtn = document.getElementById('btn-release-collapse-all');
    if (collapseBtn && !collapseBtn.dataset.bound) {
        collapseBtn.dataset.bound = 'true';
        collapseBtn.addEventListener('click', () => {
            expandedVersions.clear();
            renderReleaseNotesList();
        });
    }

    // Accordion item header click delegation
    const listContainer = document.getElementById('release-notes-list');
    if (listContainer && !listContainer.dataset.bound) {
        listContainer.dataset.bound = 'true';
        listContainer.addEventListener('click', (e) => {
            const headerBtn = e.target.closest('.release-accordion-header');
            if (!headerBtn) return;

            const card = headerBtn.closest('.release-accordion');
            if (!card) return;

            const version = card.dataset.version;
            if (!version) return;

            if (expandedVersions.has(version)) {
                expandedVersions.delete(version);
            } else {
                expandedVersions.add(version);
            }

            renderReleaseNotesList();
        });
    }
};
