// Release Notes & Version Updates Modal Manager
import { openDialog, closeDialog } from './modal.js';
import { iconHtml } from '../utils.js';

export const RELEASES = [
    {
        id: 'v2.0.0',
        version: 'v2.0',
        isLatest: true,
        date: '2026-08-23',
        title: 'v2.0 — Timer Precision, Duration Conversion & Display Personalization',
        link: 'https://blog.bconomy.net/category/updates/',
        sections: [
            {
                type: 'New Features',
                items: [
                    {
                        title: 'Smart Adaptive Multi-Unit Duration Conversion',
                        author: 'Bconomy Team',
                        bullets: [
                            'Long booster and cooldown timers automatically convert into readable breakdowns across years (y), months (mo), weeks (w), days (d), hours (h), minutes (m), and seconds (s).',
                            'Supports 5 configurable breakdown styles: Smart Adaptive (top 3 units), Compact Adaptive (top 2 units), Full Breakdown, Days & Hours, and Raw Hours.',
                            'Massive durations (e.g. 3,255,217 hours) now cleanly display as "371y 7mo 1w" instead of overwhelming digit strings.'
                        ]
                    },
                    {
                        title: 'In-Place Timer Hover Expiration Conversion',
                        author: 'Bconomy Team',
                        bullets: [
                            'Hovering over active booster and faction timers swaps the countdown in-place with its calculated calendar expiration timestamp.',
                            'Configurable date formats: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, YYYY-MM-DD (ISO), YYYY/MM/DD, MM/DD/YYYY, D MMM YYYY, MMM D, YYYY, and Day, D Month YYYY.',
                            'Configurable time formats: 24-Hour (HH:mm:ss), 24-Hour Short (HH:mm), 12-Hour (hh:mm:ss AM/PM), 12-Hour Short (hh:mm AM/PM), and Date Only.',
                            'Local device timezone and UTC display options.'
                        ]
                    },
                    {
                        title: 'Release Notes & Changelog Modal',
                        author: 'Bconomy Team',
                        bullets: [
                            'Directly accessible by clicking the Bconomy v2.0 button in the sidebar footer.',
                            'Search across official update archives with instant keyword filtering and yearly breakdown tabs.'
                        ]
                    }
                ]
            },
            {
                type: 'Improvements',
                items: [
                    {
                        title: 'Display & Timers Settings Card',
                        author: 'Bconomy Team',
                        bullets: [
                            'Added dedicated configuration controls with interactive live preview pill inside Settings.',
                            'Preferences persist reliably in browser storage and support graceful fallback resets.'
                        ]
                    },
                    {
                        title: 'Bulk Booster Integration',
                        author: 'Bconomy Team',
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
                        title: 'Timer Zero-Boundary Edge Case',
                        author: 'Bconomy Team',
                        bullets: [
                            'Prevented phantom "+Expired" text when adding 0-quantity boosters, accurately displaying "+0s".'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: '1141',
        version: 'v2026.08.22',
        date: '2026-08-22',
        title: 'v2026.08.22 — Bulk Item Actions, Pet Feeding & Relay Research Tree Rebuild',
        link: 'https://blog.bconomy.net/2026/08/22/release-v2026-08-22-09a1716ac/',
        sections: [
            {
                type: 'Improvements',
                items: [
                    {
                        title: 'Bulk item actions',
                        author: 'TheCarriedOne',
                        bullets: [
                            'You can use, craft, (un)lock or pin a whole selection of items at once from the Items page instead of doing them one-by-one.',
                            'The Pin button is now a dropdown showing all your categories so you can put selections into any category.',
                            'Select multiple items by clicking on their item images.'
                        ]
                    },
                    {
                        title: 'Feed selected pets',
                        author: 'TheCarriedOne',
                        bullets: [
                            'In Manage Pets → Feed & Collect you can now check individual pets and feed only those, even if not adventuring.',
                            'Pet find rate is now displayed on the pet items bar.'
                        ]
                    },
                    {
                        title: 'Relay research tree rebuild',
                        author: 'TheCarriedOne',
                        bullets: [
                            'Relay research tree now reads left-to-right in tidy columns, color-coded by title branch.',
                            'Expand tree to full page with new fullscreen button; includes Graph and List table modes with search.'
                        ]
                    }
                ]
            },
            {
                type: 'Bug Fixes',
                items: [
                    {
                        title: 'Rare Finds leaderboard and totals correction',
                        author: 'ShadyBliss',
                        bullets: [
                            'Finding a Museum collectible no longer increases Rare Finds counter; previous totals corrected.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: '1139',
        version: 'v2026.08.19',
        date: '2026-08-18',
        title: 'v2026.08.19 — Relay Network Store & DX Coolant Catalog',
        link: 'https://blog.bconomy.net/2026/08/19/release-v2026-08-19-11243bfa2/',
        sections: [
            {
                type: 'New Features',
                items: [
                    {
                        title: 'Relay Network Store',
                        author: 'TheCarriedOne',
                        bullets: [
                            'Spend Salvage on relay components and raw recipe materials.',
                            'DX Coolant is available for 250 Salvage with daily purchase limits scaling with module levels.',
                            'Five catalog items rotate on sale each day at a discount.'
                        ]
                    }
                ]
            },
            {
                type: 'Improvements',
                items: [
                    {
                        title: 'Bay fuel consumption',
                        author: 'TheCarriedOne',
                        bullets: [
                            'Mint and Recovery bays now burn fuel twice as fast.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: '1134',
        version: 'v2026.08.18',
        date: '2026-08-18',
        title: 'v2026.08.18 — Transmutation Queue & Mint Bay Economics Overhaul',
        link: 'https://blog.bconomy.net/2026/08/18/release-v2026-08-18-e39e945bd/',
        sections: [
            {
                type: 'New Features',
                items: [
                    {
                        title: 'Transmutation Queue',
                        author: 'TheCarriedOne',
                        bullets: [
                            'Refinery transmutations can now be queued up to 10 recipes to run sequentially offline.',
                            'Chained conversions seamlessly reserve materials and resolve dependencies.'
                        ]
                    }
                ]
            },
            {
                type: 'Improvements',
                items: [
                    {
                        title: 'Mint Bay income and costs',
                        author: 'TheCarriedOne',
                        bullets: [
                            'Mint Bays generate BC proportional to construction costs; deep module costs capped.',
                            'Tooltips display exact BC/min contributions.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: '1132',
        version: 'v2026.08.17.3',
        date: '2026-08-17',
        title: 'v2026.08.17.3 — Prestige Bonus to Work & Miniboss Loot',
        link: 'https://blog.bconomy.net/2026/08/17/release-v2026-08-17-62560b2a/',
        sections: [
            {
                type: 'New Features',
                items: [
                    {
                        title: 'Prestige bonus to Work',
                        author: 'TheCarriedOne',
                        bullets: [
                            'Every ascension permanently increases Work earnings, stacking on top of rank bonuses (~1.5x at tier 10, ~4x at tier 1000).'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: '1122',
        version: 'v2026.08.16',
        date: '2026-08-16',
        title: 'v2026.08.16 — Vault FP Drain Badge, Item Lock & Coinflip Stats',
        link: 'https://blog.bconomy.net/2026/08/16/release-v2026-08-16-c2487088/',
        sections: [
            {
                type: 'New Features',
                items: [
                    {
                        title: 'Item Lock & Safe Storage',
                        author: 'TheCarriedOne',
                        bullets: [
                            'Lock usable items so they cannot be accidentally consumed or bulk-used.'
                        ]
                    },
                    {
                        title: 'Coinflip Streaks & Leaderboards',
                        author: 'TheCarriedOne',
                        bullets: [
                            'Added win/loss streak trackers, Auspicious Coin flip durability stats, and Whiffed trophy.'
                        ]
                    }
                ]
            },
            {
                type: 'Improvements',
                items: [
                    {
                        title: 'Targeted Rank Up & Cash Preservation',
                        author: 'TheCarriedOne',
                        bullets: [
                            'Rank Up modal supports multi-tier jumps, max affordable calculations, and progress bar synchronization.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: '1120',
        version: 'v2026.08.15',
        date: '2026-08-15',
        title: 'v2026.08.15 — Supply Depot Rerolls & Pricing Scaling',
        link: 'https://blog.bconomy.net/2026/08/15/release-v2026-08-15-105dc619/',
        sections: [
            {
                type: 'Improvements',
                items: [
                    {
                        title: 'Supply Depot Rerolls',
                        author: 'TheCarriedOne',
                        bullets: [
                            'First daily reroll always costs base price; subsequent reroll price multiplier reduced to 1.3x.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: '2025-summary',
        version: '2025 Archive',
        date: '2025-12-31',
        title: '2025 Releases Summary (32 Updates)',
        link: 'https://blog.bconomy.net/category/updates/',
        sections: [
            {
                type: 'Changelog',
                items: [
                    {
                        title: 'Annual Milestones & Expansions',
                        author: 'Bconomy Archive',
                        bullets: [
                            'Level 500 Tool Upgrades and Chrono Socket Overclocking system introduced.',
                            'Supabase Cloud Save integration and sequential Player ID authentication.',
                            'Toast notification coalescing and quiet minimal density modes.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: '2024-summary',
        version: '2024 Archive',
        date: '2024-12-31',
        title: '2024 Releases Summary (15 Updates)',
        link: 'https://blog.bconomy.net/category/updates/',
        sections: [
            {
                type: 'Changelog',
                items: [
                    {
                        title: 'Economic Foundations & Guild Factions',
                        author: 'Bconomy Archive',
                        bullets: [
                            'Guild Treasury, Faction Boost activations, and Farm Plot automation expansions.',
                            'Shop restock intervals and mathematical dynamic pricing models.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'archive-early',
        version: '2020–2023 Archive',
        date: '2020-12-19',
        title: '2020–2023 Historical Changelogs (433 Updates)',
        link: 'https://blog.bconomy.net/category/updates/',
        sections: [
            {
                type: 'Changelog',
                items: [
                    {
                        title: 'Genesis of Bconomy',
                        author: 'TheCarriedOne',
                        bullets: [
                            'Initial launch of the Discord bot, economy commands, prestige ascension, and original gathering actions.'
                        ]
                    }
                ]
            }
        ]
    }
];

let activeFilter = 'all';
let searchQuery = '';

const getYearCategory = (dateStr, versionStr) => {
    if (!dateStr) return 'archive';
    if (dateStr.startsWith('2026')) return '2026';
    if (dateStr.startsWith('2025')) return '2025';
    if (dateStr.startsWith('2024')) return '2024';
    return 'archive';
};

const renderReleaseCard = (release) => {
    const isLatest = release.isLatest;
    const badgeHtml = isLatest
        ? `<span class="badge release-card-badge latest">Latest v2.0</span>`
        : `<span class="badge release-card-badge">${release.version}</span>`;

    const sectionsHtml = (release.sections || []).map(section => {
        const itemsHtml = (section.items || []).map(item => `
            <div class="release-item">
                <div class="release-item-header">
                    <strong class="release-item-title">${item.title}</strong>
                    ${item.author ? `<span class="release-item-author">(${item.author})</span>` : ''}
                </div>
                <ul class="release-bullet-list">
                    ${(item.bullets || []).map(bullet => `<li>${bullet}</li>`).join('')}
                </ul>
            </div>
        `).join('');

        return `
            <div class="release-section">
                <h4 class="release-section-heading">${section.type}</h4>
                ${itemsHtml}
            </div>
        `;
    }).join('');

    return `
        <article class="release-card ${isLatest ? 'release-card-latest' : ''}" data-version="${release.version}">
            <div class="release-card-header">
                <div class="release-title-row">
                    ${badgeHtml}
                    <h3 class="release-card-title">${release.title}</h3>
                </div>
                <div class="release-meta-row">
                    <span class="release-date">
                        ${iconHtml('lucide:calendar')} ${release.date}
                    </span>
                    ${release.link ? `
                        <a href="${release.link}" target="_blank" rel="noopener noreferrer" class="release-link" title="Open official release post">
                            <span>Official Post</span> ${iconHtml('lucide:external-link')}
                        </a>
                    ` : ''}
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
        const yearCat = getYearCategory(release.date, release.version);
        if (activeFilter !== 'all' && yearCat !== activeFilter) {
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
                <h4>No releases found</h4>
                <p>No release notes matched "${searchQuery}". Try a different search term or filter.</p>
            </div>
        `;
    } else {
        container.innerHTML = filtered.map(renderReleaseCard).join('');
    }

    if (countEl) {
        countEl.textContent = `Showing ${filtered.length} release update${filtered.length === 1 ? '' : 's'}`;
    }
};

export const openReleaseNotesModal = () => {
    renderReleaseNotesList();
    openDialog('release-notes-modal', {
        initialFocus: '#release-notes-search',
        closeOnBackdrop: true
    });
};

export const setupReleaseNotesModal = () => {
    const triggerBtn = document.getElementById('btn-release-notes');
    triggerBtn?.addEventListener('click', () => {
        openReleaseNotesModal();
    });

    const searchInput = document.getElementById('release-notes-search');
    searchInput?.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderReleaseNotesList();
    });

    const filterGroup = document.getElementById('release-year-filters');
    filterGroup?.addEventListener('click', (e) => {
        const chip = e.target.closest('.release-filter-chip');
        if (!chip) return;

        filterGroup.querySelectorAll('.release-filter-chip').forEach(el => el.classList.remove('active'));
        chip.classList.add('active');
        activeFilter = chip.dataset.year || 'all';
        renderReleaseNotesList();
    });
};
