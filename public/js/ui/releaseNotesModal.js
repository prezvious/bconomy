// Release Notes & Version Updates Modal Manager (Personal Game)
import { openDialog } from './modal.js';

export const RELEASES = [
    {
        id: 'v4.1.0',
        version: 'v4.1.0',
        isLatest: true,
        date: '2026-08-29',
        title: 'v4.1.0 — Hardened Developer Controls, Identity Recovery & Progression Contracts',
        sections: [
            {
                type: 'Developer Tooling & Security',
                items: [
                    {
                        title: 'Server-Authoritative Dev Cash Commands',
                        bullets: [
                            'Made dev.setCash and dev.addCash canonical and fail-closed behind BCONOMY_DEV_COMMANDS=true.',
                            'Implemented authorization matrix requiring direct local development or actor allowlisting via BCONOMY_DEV_USER_IDS, with proxy spoofing protection.',
                            'Retained player.setCash and player.addCash as guarded deprecation aliases with structured warning logs.'
                        ]
                    }
                ]
            },
            {
                type: 'Identity & Session Recovery',
                items: [
                    {
                        title: 'Account-Aware Identity Recovery',
                        bullets: [
                            'Added automatic snapshot migration for expired anonymous guest identities without losing local progress.',
                            'Added session recovery banner and sign-in barrier for expired registered accounts to prevent overwriting cloud state.',
                            'Retried failed commands with stable operation UUIDs and rebuilt state revisions.'
                        ]
                    }
                ]
            },
            {
                type: 'Progression & Targeted Advancement',
                items: [
                    {
                        title: 'Progression Rules API & Advancement Hardening',
                        bullets: [
                            'Added GET /api/data/progression-rules publishing the 3,000-tier advance limit.',
                            'Introduced explicit READY, INSUFFICIENT_CASH, and ALREADY_REACHED preview reason codes with deficit tracking.',
                            'Replaced duplicate client calculations with authoritative backend previews, added input validation error feedback, and ensured free Tier 0 God ascension.'
                        ]
                    }
                ]
            },
            {
                type: 'Bug Fixes & UI Stability',
                items: [
                    {
                        title: 'Perk Simulator Null-Safety',
                        bullets: [
                            'Added default simulatorTargets initialization and null-safety across all allocation sliders and preview routines.',
                            'Hardened state normalization across all save and sign-in entrypoints.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'v4.0.1',
        version: 'v4.0.1',
        date: '2026-08-29',
        title: 'v4.0.1 — Targeted Rank Advancement & State Normalization Fixes',
        sections: [
            {
                type: 'Bug Fixes',
                items: [
                    {
                        title: 'Targeted Rank-Up & Indexing Polish',
                        bullets: [
                            'Fixed targeted rank promotion return values to consistently report 1-based rank numbers instead of internal 0-based array indices.',
                            'Improved modal feedback with explicit status messages when at maximum rank (Rank 107 God), lacking cash, or when target rank is already reached.',
                            'Preserved modal focus restoration when opened via header rank tracker or progression buttons.'
                        ]
                    }
                ]
            },
            {
                type: 'Improvements',
                items: [
                    {
                        title: 'Defensive State Normalization & Header Stability',
                        bullets: [
                            'Integrated centralized state invariant normalization clamping cash, rank indices, and prestige values within safe numeric bounds.',
                            'Hardened header stats and deficit tracker against uninitialized rank metadata or legacy save formats.'
                        ]
                    }
                ]
            },
            {
                type: 'Developer Tooling & API',
                items: [
                    {
                        title: 'Dev Cash Commands & Gateway Integration',
                        bullets: [
                            'Added typed player.setCash and player.addCash command support in development mode for rapid local testing.',
                            'Upgraded console helper functions (setCash, addCash) to dispatch server-authoritative game commands.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'v4.0.0',
        version: 'v4.0.0',
        date: '2026-08-29',
        title: 'v4.0.0 — Multiplayer Factions',
        sections: [
            {
                type: 'New Features — Multiplayer Factions',
                items: [
                    {
                        title: 'Build and Join Shared Factions',
                        bullets: [
                            'Factions now support up to 20 real players with one Leader-owner and fixed Private, Corporal, Sergeant, Lieutenant, and Leader permissions.',
                            'Added Invite-only, Code-only, and Public-request recruitment, searchable listings, invitations, one-time codes with no time expiration, membership administration, ownership transfer, and activity records.',
                            'Public join requests open with one of 48 cheerful generated messages; players can edit the message or regenerate another before sending.'
                        ]
                    }
                ]
            },
            {
                type: 'New Features — Shared Economy',
                items: [
                    {
                        title: 'Coordinate Treasury and Action Boosts',
                        bullets: [
                            'Every member can make irreversible one-to-one cash deposits into the shared Faction Point treasury.',
                            'Authorized officers can manage fixed-duration or continuous boosts for Mining, Exploring, Hunting, Fishing, and Work, and the verified boost applies to every member.',
                            'Added a shared treasury ledger, faction activity history, personal notifications, roster contributions, and a complete Rank Permissions view.'
                        ]
                    }
                ]
            },
            {
                type: 'Improvements — Guest Access & Handbook',
                items: [
                    {
                        title: 'Use Factions Without Registration',
                        bullets: [
                            'Players receive an anonymous guest identity automatically and can use every faction feature without first signing in or creating an account.',
                            'Creating an account upgrades the same player identity, preserving progress and faction membership.',
                            'Guest identities are removed after 365 days without activity; inactive guest Leaders transfer ownership to the highest-ranked, earliest-joined eligible member.'
                        ]
                    },
                    {
                        title: 'Expanded Faction Manual',
                        bullets: [
                            'Expanded the searchable handbook to 59 topics with clear guides for membership modes, generated request messages, one-time codes, Faction Ranks, treasury operations, leadership, departure, and guest retention.'
                        ]
                    }
                ]
            },
            {
                type: 'Breaking Changes & Security',
                items: [
                    {
                        title: 'Server-Authoritative Multiplayer State',
                        bullets: [
                            'Faction data has moved out of the client-owned player save into revisioned PostgreSQL records protected by Row Level Security and service-only transactional functions.',
                            'Legacy local factions are imported once into shared state; player-state schema version 2 removes the local faction field.',
                            'One-time codes are stored only as SHA-256 hashes, command IDs prevent duplicate mutations, membership and ownership invariants are enforced at transaction commit, and action boosts are resolved on the server.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'v3.2.0',
        version: 'v3.2.0',
        date: '2026-08-25',
        title: 'v3.2.0 — Quality-of-Life Command Center',
        sections: [
            {
                type: 'Features — Career & Tools',
                items: [
                    {
                        title: 'Plan Progression Before Spending',
                        bullets: [
                            'Added a live next-rank cash deficit in the header and authoritative Next, Max Affordable, and Custom promotion previews.',
                            'Added a staged Prestige & Perk Simulator for current points, the next ascension, and hypothetical future budgets, including weighted recommendations and exact perk-effect comparisons.',
                            'Added exact Max Affordable tool upgrades with cumulative material costs and next-level blockers.'
                        ]
                    }
                ]
            },
            {
                type: 'Features — Shop & Inventory',
                items: [
                    {
                        title: 'Faster Market and Item Management',
                        bullets: [
                            'Added a persistent shop wishlist, restock highlighting, wishlist-only filtering, and configurable availability alerts.',
                            'Added configurable sell-roll percentage badges and color progress bars based on each item’s authoritative price range.',
                            'Added Extend All Active Boosters with a review plan, plus universal lock/favorite controls and checkbox, Shift-range, and lasso batch selection for inventory actions.'
                        ]
                    }
                ]
            },
            {
                type: 'Features — Crafting',
                items: [
                    {
                        title: 'Navigate and Build Dependency Chains',
                        bullets: [
                            'Added Where Is This Used reverse lookup with direct consumers and downstream dependency paths.',
                            'Added inline exact Craft Max Affordable summaries for Direct and Recursive modes.',
                            'Added one-click direct crafting for missing intermediate steps without losing the parent recipe context.'
                        ]
                    }
                ]
            },
            {
                type: 'Integrity & Security',
                items: [
                    {
                        title: 'Server-Authoritative Player Commands',
                        bullets: [
                            'Added versioned query and command gateways, canonical item metadata, normalized versioned player saves, and migration from legacy pinned items to favorites.',
                            'Added authenticated revision checks, idempotent command receipts, token verification, explicit cloud/device reconciliation, and environment-only Supabase credentials.',
                            'Removed unsafe email lookup and full-state synchronization paths; signed-in progress now commits one validated command at a time.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'v3.1.1',
        version: 'v3.1.1',
        date: '2026-08-24',
        title: 'v3.1.1 — Small-Screen Layout & Navigation',
        sections: [
            {
                type: 'Improvements',
                items: [
                    {
                        title: 'Fixed Mobile Navigation',
                        bullets: [
                            'Replaced the oversized, horizontally scrolling phone navigation with five equal destinations for Actions, Farm, Inventory, Crafting, and More.',
                            'Added an accessible More sheet for Shop, Tools, Rank & Ascension, Gambling, Faction, and Settings while preserving the full desktop sidebar.'
                        ]
                    }
                ]
            },
            {
                type: 'Bug Fixes',
                items: [
                    {
                        title: 'Narrow-Screen Content Containment',
                        bullets: [
                            'Reflowed gathering cards so action buttons, cooldown progress, Ready states, and Work streak details remain inside their cards.',
                            'Stacked Crop Storage claim controls when needed and constrained narrow layout children to prevent page-level horizontal overflow.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'v3.1.0',
        version: 'v3.1.0',
        date: '2026-08-24',
        title: 'v3.1.0 — Keyboard Controls, Custom Commands & Contextual Help',
        sections: [
            {
                type: 'Features',
                items: [
                    {
                        title: 'Customizable Keyboard Controls',
                        bullets: [
                            'Added 18 remappable shortcuts for all main sections, the five core actions, contextual Help, Console command entry, and theme switching.',
                            'Added searchable Controls & Commands settings with chord capture, conflict swapping, individual clearing and reset controls, full reset, and browser-local persistence.',
                            'Shortcuts pause while typing, composing text, or using a dialog, and assigned controls expose accessible shortcut annotations.'
                        ]
                    },
                    {
                        title: 'Customizable Slash Commands',
                        bullets: [
                            'Added editable primary names and up to five custom aliases for all existing Console commands.',
                            'Canonical names and built-in aliases always remain available as recovery commands.',
                            'Added keyboard-operated autocomplete where Enter or Tab completes a suggestion before a second Enter executes it.'
                        ]
                    },
                    {
                        title: 'Contextual Help Handbook',
                        bullets: [
                            'Added a Help control immediately before Console in the bottom-right utility dock.',
                            'Contextual Help follows the active section and subfeature, while Browse all topics and /help open a searchable 49-topic handbook.',
                            'Help content explains visible player controls and outcomes without publishing internal formulas, odds, drop tables, or hidden rewards.'
                        ]
                    }
                ]
            },
            {
                type: 'Improvements',
                items: [
                    {
                        title: 'Responsive Help & Console Rail',
                        bullets: [
                            'Unified Help and Console into a switchable desktop rail and compact-screen drawer with remembered open state, safe-area-aware controls, focus restoration, and mobile-sized touch targets.',
                            'Added context-aware page titles, handbook search status, accessible command suggestions, and current hotkey and command references inside Help.'
                        ]
                    }
                ]
            },
            {
                type: 'Bug Fixes',
                items: [
                    {
                        title: 'Crafting Workspace Scrolling',
                        bullets: [
                            'Improved the Crafting landing layout and bounded sidebar overflow so navigation remains usable on shorter displays.',
                            'Made crafting detail views vertically scrollable so long recipes and previews remain reachable.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'v3.0.0',
        version: 'v3.0.0',
        date: '2026-08-24',
        title: 'v3.0.0 — Realistic Crafting & Shared Quantity Controls',
        sections: [
            {
                type: 'Features',
                items: [
                    {
                        title: 'Complete Real-World Crafting Catalog',
                        bullets: [
                            'Added 450 named raw materials and 216 new craftable products across 18 real-world production domains, plus canonical recipes for 10 legacy components and 15 socket modules.',
                            'Added direct and recursive atomic crafting with locked-item protection, exact maximum calculation, dependency steps, aggregate raw costs, shortages, and surplus reporting.',
                            'Successful Mine, Explore, Hunt, and Fish actions now award 8–15 distinct weighted crafting-material stacks without placing the new catalog in the shop or transmutation pool.'
                        ]
                    },
                    {
                        title: 'Three Crafting Workspaces',
                        bullets: [
                            'Added Standard master-detail, Compact expandable-card, and Super Compact virtual-list views with persistent search, domain, effort, type, recipe-form, availability, and sort controls.',
                            'Added responsive crafting details, quantity presets, direct/recursive mode selection, authoritative preview, and server-validated execution.'
                        ]
                    }
                ]
            },
            {
                type: 'Improvements',
                items: [
                    {
                        title: 'Inherited Quantity Presets',
                        bullets: [
                            'Added four configurable presets plus Max with global, system, and individual-item inheritance.',
                            'Connected the shared values and preview policies to crafting, shop purchases and sales, booster activation, socket-module crafting, tool upgrades, and perk upgrades.'
                        ]
                    },
                    {
                        title: 'Catalog Integrity & Documentation',
                        bullets: [
                            'Added startup validation for exact catalog quotas, metadata, recipe forms, material reuse, downstream intermediate use, cross-domain dependencies, and acyclic depth.',
                            'Added generated catalog documentation and cross-layer engine, API, drop, preference, responsive UI, and regression tests.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'v2.2.2',
        version: 'v2.2.2',
        date: '2026-08-23',
        title: 'v2.2.2 — Scroll Stability & SVG Icon Rendering Reliability',
        sections: [
            {
                type: 'Bug Fixes',
                items: [
                    {
                        title: 'SVG Icon Visibility & Persistent Rendering',
                        bullets: [
                            'Added global baseline dimensions and display properties for iconify-icon to prevent SVG elements from collapsing to 0x0 during initial rendering or off-screen scroll cycles.',
                            'Removed strict paint containment from active panels so the browser preserves rendered shadow DOM trees in memory instead of discarding and re-fetching icons when scrolled into view.',
                            'Swapped overlapping droplets icon with clean, single-contour droplet icon on farm hydration controls for crisp visual presentation.'
                        ]
                    },
                    {
                        title: 'Scroll Layout Shift & Button Resizing Stabilization',
                        bullets: [
                            'Enabled stable scrollbar gutters on the main viewport to eliminate layout reflow and container width shifts when scrollbars appear.',
                            'Stabilized responsive flex wrapping rules and action button sizing in farm action banners to prevent erratic button expansion and layout jumping during scrolling.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'v2.2.1',
        version: 'v2.2.1',
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
const expandedVersions = new Set(RELEASES.filter(release => release.isLatest).map(release => release.version));

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
