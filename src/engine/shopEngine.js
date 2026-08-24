/**
 * @module shopEngine
 * Core game engine module for the Bconomy Shop System and Loot Boosters.
 */

const {
    SHOP_RESTOCK_SECONDS,
    SELLABLE_ITEMS,
    BOOSTER_REGISTRY,
    getMarkupRange
} = require('./shopTables');

class ShopEngine {
    static getSellRoll(itemName, offerPrice) {
        const definition = SELLABLE_ITEMS[itemName];
        if (!definition || !Array.isArray(definition.sellRange)) return null;
        const [min, max] = definition.sellRange;
        const offer = Math.max(min, Math.min(max, Math.floor(Number(offerPrice) || min)));
        if (max === min) return { itemName, min, max, offer, fixed: true, percentage: null };
        const percentage = Math.max(0, Math.min(100, ((offer - min) / (max - min)) * 100));
        return { itemName, min, max, offer, fixed: false, percentage };
    }

    static getSellRolls(playerState) {
        const sellPrices = playerState?.shop?.sellPrices || {};
        return Object.fromEntries(Object.keys(SELLABLE_ITEMS).map(itemName => [
            itemName,
            this.getSellRoll(itemName, sellPrices[itemName])
        ]));
    }

    /**
     * Normalizes and ensures the shop and booster states exist on playerState.
     * Restocks the shop if the restock deadline has passed.
     */
    static ensureShopState(playerState, now = Date.now(), rng = Math.random) {
        playerState.inventory = playerState.inventory || {};
        playerState.cash = typeof playerState.cash === 'number' && !isNaN(playerState.cash) ? playerState.cash : 0;

        // Dynamic inventory consolidation for legacy aliases
        const consolidated = {};
        for (const [key, qty] of Object.entries(playerState.inventory)) {
            if (!qty || qty <= 0) continue;
            let canonicalKey = key.replace(/\s+/g, '');
            // Alias mappings
            if (canonicalKey === 'Bones') canonicalKey = 'OldBones';
            if (canonicalKey === 'Steak') canonicalKey = 'PrimeSteak';
            if (canonicalKey === 'Urn') canonicalKey = 'RitualUrn';
            if (canonicalKey === 'Mushroom') canonicalKey = 'RedMushroom';
            
            // Map back to display keys if exact match in SELLABLE_ITEMS or BOOSTER_REGISTRY
            const matchKey = Object.keys(SELLABLE_ITEMS).find(k => k.replace(/\s+/g, '') === canonicalKey)
                || Object.keys(BOOSTER_REGISTRY).find(k => k.replace(/\s+/g, '') === canonicalKey)
                || canonicalKey;

            consolidated[matchKey] = (consolidated[matchKey] || 0) + qty;
        }
        playerState.inventory = consolidated;

        // Ensure shop state
        playerState.shop = playerState.shop || {};
        playerState.shop.lastRestockAt = typeof playerState.shop.lastRestockAt === 'number' ? playerState.shop.lastRestockAt : 0;
        playerState.shop.nextRestockAt = typeof playerState.shop.nextRestockAt === 'number' ? playerState.shop.nextRestockAt : 0;
        playerState.shop.sellPrices = playerState.shop.sellPrices || {};
        playerState.shop.buyListings = playerState.shop.buyListings || {};
        playerState.shop.boosterListings = playerState.shop.boosterListings || {};

        // Ensure boosters state
        playerState.boosters = playerState.boosters || {};
        playerState.boosters.activeUntil = playerState.boosters.activeUntil || {
            mine: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 },
            explore: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 },
            fish: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 },
            hunt: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 }
        };

        const actions = ['mine', 'explore', 'fish', 'hunt'];
        const tiers = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
        for (const act of actions) {
            playerState.boosters.activeUntil[act] = playerState.boosters.activeUntil[act] || {};
            for (const t of tiers) {
                if (typeof playerState.boosters.activeUntil[act][t] !== 'number' || isNaN(playerState.boosters.activeUntil[act][t])) {
                    playerState.boosters.activeUntil[act][t] = 0;
                }
            }
        }

        // Restock check
        if (now >= playerState.shop.nextRestockAt || Object.keys(playerState.shop.buyListings).length === 0) {
            this.restockShop(playerState, now, rng);
        } else {
            // Ensure T1-T3 boosters are guaranteed available with stock Infinity
            for (const [bName, listing] of Object.entries(playerState.shop.boosterListings)) {
                const config = BOOSTER_REGISTRY[bName];
                if (config && config.inShop && ['T1', 'T2', 'T3'].includes(config.tier)) {
                    listing.available = true;
                    if (listing.stock === null || listing.stock === undefined || listing.stock <= 0) {
                        listing.stock = Infinity;
                    }
                }
            }
        }

        return playerState.shop;
    }

    /**
     * Performs a full time-gated replacement restock of the Buy and Sell shop.
     */
    static restockShop(playerState, now = Date.now(), rng = Math.random) {
        playerState.shop = playerState.shop || {};
        playerState.shop.sellPrices = {};
        playerState.shop.buyListings = {};
        playerState.shop.boosterListings = {};

        // 1. Roll normal items
        for (const [itemName, config] of Object.entries(SELLABLE_ITEMS)) {
            // Roll sell price: s_min + floor(U * (s_max - s_min + 1))
            const [sMin, sMax] = config.sellRange;
            const sellPrice = sMin + Math.floor(rng() * (sMax - sMin + 1));
            playerState.shop.sellPrices[itemName] = sellPrice;

            // Roll appearance check
            const appears = rng() < config.appearanceChance;
            if (appears) {
                const [qMin, qMax] = config.stockRange;
                const stock = qMin + Math.floor(rng() * (qMax - qMin + 1));

                let buyPrice;
                if (Array.isArray(config.buyRange)) {
                    const [bMin, bMax] = config.buyRange;
                    buyPrice = bMin + Math.floor(rng() * (bMax - bMin + 1));
                } else {
                    const [mMin, mMax] = getMarkupRange(sMax);
                    const markup = mMin + rng() * (mMax - mMin);
                    buyPrice = Math.round(sMax * markup);
                }

                playerState.shop.buyListings[itemName] = {
                    available: true,
                    stock,
                    buyPrice
                };
            } else {
                playerState.shop.buyListings[itemName] = {
                    available: false,
                    stock: 0,
                    buyPrice: 0
                };
            }
        }

        // 2. Roll T1-T4 Loot Boosters
        for (const [boosterName, config] of Object.entries(BOOSTER_REGISTRY)) {
            if (!config.inShop) {
                playerState.shop.boosterListings[boosterName] = {
                    available: false,
                    stock: 0,
                    buyPrice: 0,
                    action: config.action,
                    tier: config.tier,
                    durationMs: config.durationMs
                };
                continue;
            }

            const appears = rng() < config.appearanceChance;
            if (appears) {
                const [bMin, bMax] = config.buyRange;
                const buyPrice = bMin + Math.floor(rng() * (bMax - bMin + 1));
                let stock = Infinity;
                if (Array.isArray(config.stockRange) && isFinite(config.stockRange[0]) && isFinite(config.stockRange[1])) {
                    const [qMin, qMax] = config.stockRange;
                    stock = qMin + Math.floor(rng() * (qMax - qMin + 1));
                }
                playerState.shop.boosterListings[boosterName] = {
                    available: true,
                    stock,
                    buyPrice,
                    action: config.action,
                    tier: config.tier,
                    durationMs: config.durationMs
                };
            } else {
                playerState.shop.boosterListings[boosterName] = {
                    available: false,
                    stock: 0,
                    buyPrice: 0,
                    action: config.action,
                    tier: config.tier,
                    durationMs: config.durationMs
                };
            }
        }

        playerState.shop.lastRestockAt = now;
        playerState.shop.nextRestockAt = now + (SHOP_RESTOCK_SECONDS * 1000);

        return playerState.shop;
    }

    /**
     * Forces an immediate restock of the shop regardless of nextRestockAt deadline.
     */
    static forceRestock(playerState, now = Date.now(), rng = Math.random) {
        this.ensureShopState(playerState, now, rng);
        const shop = this.restockShop(playerState, now, rng);
        return {
            success: true,
            message: 'Shop successfully restocked',
            shop
        };
    }

    /**
     * Purchases a normal item from the system shop.
     */
    static buyItem(playerState, itemName, quantity, now = Date.now(), rng = Math.random) {
        this.ensureShopState(playerState, now, rng);

        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0 || !isFinite(qty)) {
            return { error: 'Invalid quantity requested' };
        }

        if (!SELLABLE_ITEMS[itemName] || !playerState.shop.buyListings[itemName]) {
            return { error: `Item '${itemName}' is not available for purchase` };
        }

        const listing = playerState.shop.buyListings[itemName];
        if (!listing.available || listing.stock < qty) {
            return { error: 'No stock available' };
        }

        if (typeof listing.buyPrice !== 'number' || listing.buyPrice <= 0 || !isFinite(listing.buyPrice)) {
            return { error: 'Invalid listing price. Please restock the shop.' };
        }

        const totalCost = qty * listing.buyPrice;
        if (playerState.cash < totalCost) {
            return { error: `Insufficient funds. Required: $${totalCost.toLocaleString()}, Available: $${playerState.cash.toLocaleString()}` };
        }

        playerState.cash -= totalCost;
        playerState.inventory[itemName] = (playerState.inventory[itemName] || 0) + qty;
        listing.stock -= qty;
        if (listing.stock <= 0) {
            listing.available = false;
        }

        return {
            success: true,
            itemName,
            quantity: qty,
            unitPrice: listing.buyPrice,
            totalCost,
            remainingStock: listing.stock,
            remainingCash: playerState.cash
        };
    }

    /**
     * Sells a normal item back to the system shop.
     */
    static sellItem(playerState, itemName, quantity, now = Date.now(), rng = Math.random) {
        this.ensureShopState(playerState, now, rng);

        if (BOOSTER_REGISTRY[itemName]) {
            return { error: 'Boosters cannot be sold to the system' };
        }

        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0 || !isFinite(qty)) {
            return { error: 'Invalid quantity requested' };
        }

        if (!SELLABLE_ITEMS[itemName]) {
            return { error: `Item '${itemName}' cannot be sold` };
        }

        if (Array.isArray(playerState.lockedItems) && playerState.lockedItems.includes(itemName)) {
            return { error: `Item '${itemName}' is locked and cannot be sold. Unlock it first.` };
        }

        const owned = playerState.inventory[itemName] || 0;
        if (owned < qty) {
            return { error: `Insufficient inventory. Owned: ${owned}, Requested: ${qty}` };
        }

        const unitPrice = playerState.shop.sellPrices[itemName] || SELLABLE_ITEMS[itemName].sellRange[0];
        const [sMin, sMax] = SELLABLE_ITEMS[itemName].sellRange;
        const validatedPrice = Math.max(sMin, Math.min(sMax, unitPrice));
        const totalReceived = qty * validatedPrice;

        playerState.inventory[itemName] -= qty;
        if (playerState.inventory[itemName] <= 0) {
            delete playerState.inventory[itemName];
        }

        playerState.cash = (playerState.cash || 0) + totalReceived;

        return {
            success: true,
            itemName,
            quantity: qty,
            unitPrice: validatedPrice,
            totalReceived,
            remainingOwned: playerState.inventory[itemName] || 0,
            currentCash: playerState.cash
        };
    }

    /**
     * Purchases a T1-T4 Loot Booster from the shop into inventory.
     */
    static buyBooster(playerState, boosterName, quantity = 1, now = Date.now(), rng = Math.random) {
        this.ensureShopState(playerState, now, rng);

        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0 || !isFinite(qty)) {
            return { error: 'Invalid quantity requested' };
        }

        const boosterConfig = BOOSTER_REGISTRY[boosterName];
        if (!boosterConfig || !boosterConfig.inShop) {
            return { error: `Booster '${boosterName}' is not available in the shop` };
        }

        const listing = playerState.shop.boosterListings[boosterName];
        if (!listing || !listing.available) {
            return { error: 'No stock available' };
        }

        if (typeof listing.buyPrice !== 'number' || listing.buyPrice <= 0 || !isFinite(listing.buyPrice)) {
            return { error: 'Invalid listing price. Please restock the shop.' };
        }

        const isUnlimited = listing.stock === Infinity || listing.stock === null || (Array.isArray(boosterConfig.stockRange) && boosterConfig.stockRange[0] === Infinity);

        if (!isUnlimited && listing.stock < qty) {
            return { error: 'No stock available' };
        }

        const totalCost = qty * listing.buyPrice;
        if (playerState.cash < totalCost) {
            return { error: `Insufficient funds. Required: $${totalCost.toLocaleString()}, Available: $${playerState.cash.toLocaleString()}` };
        }

        playerState.cash -= totalCost;
        playerState.inventory[boosterName] = (playerState.inventory[boosterName] || 0) + qty;
        
        if (!isUnlimited) {
            listing.stock -= qty;
            if (listing.stock <= 0) {
                listing.available = false;
            }
        }

        return {
            success: true,
            boosterName,
            quantity: qty,
            unitPrice: listing.buyPrice,
            totalCost,
            remainingStock: isUnlimited ? 'Unlimited' : listing.stock,
            remainingCash: playerState.cash
        };
    }

    /**
     * Activates a Loot Booster from player inventory.
     * Same-tier activation extends tier duration; cross-tier activations stack multiplicatively (2^k).
     */
    static activateBooster(playerState, boosterName, now = Date.now(), rng = Math.random) {
        this.ensureShopState(playerState, now, rng);

        const boosterConfig = BOOSTER_REGISTRY[boosterName];
        if (!boosterConfig) {
            return { error: `Invalid booster item '${boosterName}'` };
        }

        const owned = playerState.inventory[boosterName] || 0;
        if (owned < 1) {
            return { error: `You do not own any '${boosterName}' boosters` };
        }

        playerState.inventory[boosterName] -= 1;
        if (playerState.inventory[boosterName] <= 0) {
            delete playerState.inventory[boosterName];
        }

        const action = boosterConfig.action;
        const tier = boosterConfig.tier;
        const durationMs = boosterConfig.durationMs;

        const currentExpire = playerState.boosters.activeUntil[action][tier] || 0;
        const newExpire = Math.max(now, currentExpire) + durationMs;
        playerState.boosters.activeUntil[action][tier] = newExpire;

        return {
            success: true,
            boosterName,
            action,
            tier,
            activeUntil: newExpire,
            durationAddedMs: durationMs
        };
    }

    /**
     * Returns total multiplicative booster bonus (2^k) for a resource action.
     * Where k is the count of unexpired active booster tiers for that action.
     */
    static getActiveBoosterMultiplier(playerState, actionType, now = Date.now()) {
        this.ensureShopState(playerState, now);
        const actionBoosters = playerState.boosters.activeUntil[actionType];
        if (!actionBoosters) return 1;

        let activeCount = 0;
        for (const [tier, expireTime] of Object.entries(actionBoosters)) {
            if (typeof expireTime === 'number' && expireTime > now) {
                activeCount++;
            }
        }

        return Math.pow(2, activeCount);
    }

    /**
     * Returns structured metadata of all currently active boosters for an action.
     */
    static getActiveBoostersList(playerState, actionType, now = Date.now()) {
        this.ensureShopState(playerState, now);
        const actionBoosters = playerState.boosters.activeUntil[actionType] || {};
        const result = [];

        for (const [tier, expireTime] of Object.entries(actionBoosters)) {
            if (typeof expireTime === 'number' && expireTime > now) {
                // Find matching booster name
                const itemEntry = Object.entries(BOOSTER_REGISTRY).find(
                    ([name, config]) => config.action === actionType && config.tier === tier
                );
                result.push({
                    tier,
                    name: itemEntry ? itemEntry[0] : `${actionType.toUpperCase()} ${tier}`,
                    expireTime,
                    remainingMs: expireTime - now
                });
            }
        }

        return result;
    }

    /**
     * Previews a bulk sell operation of sellable inventory items.
     */
    static previewBulkSell(playerState, options = {}, now = Date.now(), rng = Math.random) {
        this.ensureShopState(playerState, now, rng);

        const inventory = playerState.inventory || {};
        const selectedItems = options.selectedItems || null;
        const keepOneOfEach = options.keepOneOfEach === true || options.preset === 'keepOneOfEach';
        const reserves = options.reserves || {};
        const categories = Array.isArray(options.categories) ? options.categories : null;

        const breakdown = [];
        let totalPayout = 0;
        let totalUnits = 0;

        for (const [itemName, ownedQty] of Object.entries(inventory)) {
            if (!ownedQty || ownedQty <= 0) continue;

            // Skip boosters and non-sellable items
            if (BOOSTER_REGISTRY[itemName] || !SELLABLE_ITEMS[itemName]) continue;

            // Skip locked items
            if (Array.isArray(playerState.lockedItems) && playerState.lockedItems.includes(itemName)) continue;

            // Check selection filter if provided
            if (selectedItems) {
                if (Array.isArray(selectedItems)) {
                    if (!selectedItems.includes(itemName)) continue;
                } else if (typeof selectedItems === 'object') {
                    const sel = selectedItems[itemName];
                    if (!sel || (typeof sel === 'object' && sel.selected === false)) continue;
                }
            }

            // Check category filter if provided
            if (categories && SELLABLE_ITEMS[itemName].category) {
                if (!categories.includes(SELLABLE_ITEMS[itemName].category)) continue;
            }

            // Determine reserve amount with strict clamping
            let rawReserve = 0;
            if (keepOneOfEach) {
                rawReserve = 1;
            } else if (typeof reserves[itemName] === 'number') {
                rawReserve = reserves[itemName];
            } else if (selectedItems && typeof selectedItems[itemName] === 'object' && typeof selectedItems[itemName].reserveQty === 'number') {
                rawReserve = selectedItems[itemName].reserveQty;
            }

            const reserve = Math.max(0, Math.min(ownedQty, Math.floor(rawReserve || 0)));
            const availableToSell = Math.min(ownedQty, Math.max(0, ownedQty - reserve));
            if (availableToSell <= 0) continue;

            const unitPrice = playerState.shop.sellPrices[itemName] || SELLABLE_ITEMS[itemName].sellRange[0];
            const subtotal = availableToSell * unitPrice;

            totalPayout += subtotal;
            totalUnits += availableToSell;

            breakdown.push({
                itemName,
                quantity: availableToSell,
                unitPrice,
                subtotal,
                remainingOwned: ownedQty - availableToSell
            });
        }

        const currentCash = typeof playerState.cash === 'number' && !isNaN(playerState.cash) ? playerState.cash : 0;

        return {
            success: true,
            action: 'sell',
            itemsAffectedCount: breakdown.length,
            totalUnits,
            totalPayout,
            currentCash,
            projectedCash: currentCash + totalPayout,
            breakdown
        };
    }

    /**
     * Executes a bulk sell operation of sellable inventory items.
     */
    static executeBulkSell(playerState, options = {}, now = Date.now(), rng = Math.random) {
        const preview = this.previewBulkSell(playerState, options, now, rng);
        if (preview.itemsAffectedCount === 0 || preview.totalUnits === 0) {
            return { error: 'No sellable items match criteria' };
        }

        for (const item of preview.breakdown) {
            const currentOwned = playerState.inventory[item.itemName] || 0;
            const qtyToDeduct = Math.min(currentOwned, item.quantity);
            playerState.inventory[item.itemName] = currentOwned - qtyToDeduct;
            if (playerState.inventory[item.itemName] <= 0) {
                delete playerState.inventory[item.itemName];
            }
        }

        playerState.cash = (typeof playerState.cash === 'number' && !isNaN(playerState.cash) ? playerState.cash : 0) + preview.totalPayout;

        return {
            success: true,
            action: 'sell',
            itemsAffectedCount: preview.itemsAffectedCount,
            totalUnits: preview.totalUnits,
            totalReceived: preview.totalPayout,
            currentCash: playerState.cash,
            breakdown: preview.breakdown
        };
    }

    /**
     * Previews a bulk buy operation from available system shop listings.
     */
    static previewBulkBuy(playerState, options = {}, now = Date.now(), rng = Math.random) {
        this.ensureShopState(playerState, now, rng);

        const priorityStrategy = options.priorityStrategy || 'lowestPrice';
        const selectedItems = options.selectedItems || null;
        const preset = options.preset || null;
        const categories = Array.isArray(options.categories) ? options.categories : null;

        // Collect available candidates
        const candidates = [];

        // Normal items
        for (const [itemName, listing] of Object.entries(playerState.shop.buyListings || {})) {
            if (!listing || !listing.available || listing.stock <= 0) continue;
            if (preset === 'boosterProcure') continue;
            if (!listing.buyPrice || listing.buyPrice <= 0 || !isFinite(listing.buyPrice)) continue;

            if (selectedItems) {
                if (Array.isArray(selectedItems)) {
                    if (!selectedItems.includes(itemName)) continue;
                } else if (typeof selectedItems === 'object') {
                    const sel = selectedItems[itemName];
                    if (!sel || (typeof sel === 'object' && sel.selected === false)) continue;
                }
            }

            if (categories && SELLABLE_ITEMS[itemName] && SELLABLE_ITEMS[itemName].category) {
                if (!categories.includes(SELLABLE_ITEMS[itemName].category)) continue;
            }

            const itemConfig = SELLABLE_ITEMS[itemName] || {};
            const appearanceChance = typeof itemConfig.appearanceChance === 'number' ? itemConfig.appearanceChance : 0.5;
            const maxSellPrice = Array.isArray(itemConfig.sellRange) ? itemConfig.sellRange[1] : 0;
            // Rarity score for normal items: lower appearance chance -> higher rarity score, tie-break with maxSellPrice
            const rarityScore = (1 / Math.max(0.00001, appearanceChance)) * 1000 + (maxSellPrice * 0.0001);

            candidates.push({
                itemName,
                isBooster: false,
                buyPrice: listing.buyPrice,
                stock: listing.stock,
                appearanceChance,
                maxSellPrice,
                rarityScore
            });
        }

        // Boosters
        for (const [boosterName, listing] of Object.entries(playerState.shop.boosterListings || {})) {
            if (!listing || !listing.available || listing.stock <= 0) continue;
            if (preset === 'itemsOnly') continue;
            if (!listing.buyPrice || listing.buyPrice <= 0 || !isFinite(listing.buyPrice)) continue;

            if (selectedItems) {
                if (Array.isArray(selectedItems)) {
                    if (!selectedItems.includes(boosterName)) continue;
                } else if (typeof selectedItems === 'object') {
                    const sel = selectedItems[boosterName];
                    if (!sel || (typeof sel === 'object' && sel.selected === false)) continue;
                }
            }

            const boosterConfig = BOOSTER_REGISTRY[boosterName] || {};
            const tier = boosterConfig.tier || listing.tier || 'T1';
            // Boosters ranked higher than normal items by tier (T6 > T5 > T4 > T3 > T2 > T1)
            const tierWeights = { T6: 600000000, T5: 500000000, T4: 400000000, T3: 300000000, T2: 200000000, T1: 100000000 };
            const rarityScore = (tierWeights[tier] || 100000000) + (listing.buyPrice || 0);

            candidates.push({
                itemName: boosterName,
                isBooster: true,
                tier,
                buyPrice: listing.buyPrice,
                stock: listing.stock,
                rarityScore
            });
        }

        // Sort by priority strategy
        if (priorityStrategy === 'lowestPrice') {
            candidates.sort((a, b) => a.buyPrice - b.buyPrice);
        } else if (priorityStrategy === 'highestPrice') {
            candidates.sort((a, b) => b.buyPrice - a.buyPrice);
        } else if (priorityStrategy === 'rarestFirst') {
            candidates.sort((a, b) => b.rarityScore - a.rarityScore);
        }

        let remainingCash = Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(Number(playerState.cash) || 0)));
        const initialCash = remainingCash;
        const purchases = {};

        if (priorityStrategy === 'equalDistribution') {
            const active = [];
            for (const item of candidates) {
                if (!item.buyPrice || item.buyPrice <= 0) continue;
                let maxAllowed = item.stock;
                let minQty = 0;
                if (selectedItems && typeof selectedItems[item.itemName] === 'object') {
                    const sel = selectedItems[item.itemName];
                    if (typeof sel.maxQty === 'number' && isFinite(sel.maxQty)) {
                        maxAllowed = Math.min(maxAllowed, Math.max(0, Math.floor(sel.maxQty)));
                    }
                    if (typeof sel.minQty === 'number' && isFinite(sel.minQty)) {
                        minQty = Math.max(0, Math.floor(sel.minQty));
                    }
                }
                if (maxAllowed > 0) {
                    active.push({
                        itemName: item.itemName,
                        buyPrice: item.buyPrice,
                        maxAllowed,
                        minQty,
                        purchased: 0
                    });
                }
            }

            // Fast multi-unit batch round-robin
            while (active.length > 0 && remainingCash > 0) {
                const roundCost = active.reduce((sum, it) => sum + it.buyPrice, 0);
                if (roundCost <= 0) break;

                const affordableRounds = Math.floor(remainingCash / roundCost);
                let maxRoundsToCapacity = Infinity;
                for (const it of active) {
                    const remainingCapacity = it.maxAllowed - it.purchased;
                    if (remainingCapacity < maxRoundsToCapacity) {
                        maxRoundsToCapacity = remainingCapacity;
                    }
                }

                const batchRounds = Math.min(affordableRounds, maxRoundsToCapacity);

                if (batchRounds >= 1) {
                    for (const it of active) {
                        it.purchased += batchRounds;
                        purchases[it.itemName] = it.purchased;
                    }
                    remainingCash -= batchRounds * roundCost;

                    for (let i = active.length - 1; i >= 0; i--) {
                        if (active[i].purchased >= active[i].maxAllowed) {
                            active.splice(i, 1);
                        }
                    }
                } else {
                    let boughtAnyInResidual = false;
                    for (let i = 0; i < active.length; i++) {
                        const it = active[i];
                        if (it.purchased < it.maxAllowed && remainingCash >= it.buyPrice) {
                            it.purchased += 1;
                            purchases[it.itemName] = it.purchased;
                            remainingCash -= it.buyPrice;
                            boughtAnyInResidual = true;
                        }
                    }
                    if (!boughtAnyInResidual) {
                        break;
                    }
                    for (let i = active.length - 1; i >= 0; i--) {
                        if (active[i].purchased >= active[i].maxAllowed) {
                            active.splice(i, 1);
                        }
                    }
                }
            }

            // Enforce minQty bounds: refund and cancel items that failed to reach minQty
            if (selectedItems && typeof selectedItems === 'object') {
                for (const item of candidates) {
                    const currentPurchased = purchases[item.itemName] || 0;
                    if (currentPurchased > 0) {
                        const itemSel = selectedItems[item.itemName];
                        const minQty = (itemSel && typeof itemSel === 'object' && typeof itemSel.minQty === 'number') ? itemSel.minQty : 0;
                        if (currentPurchased < minQty) {
                            remainingCash += currentPurchased * item.buyPrice;
                            delete purchases[item.itemName];
                        }
                    }
                }
            }
        } else {
            // Greedy purchasing based on sorted order
            for (const item of candidates) {
                let maxAllowed = item.stock;
                if (selectedItems && typeof selectedItems[item.itemName] === 'object' && typeof selectedItems[item.itemName].maxQty === 'number') {
                    maxAllowed = Math.min(maxAllowed, selectedItems[item.itemName].maxQty);
                }

                let minQty = 0;
                if (selectedItems && typeof selectedItems[item.itemName] === 'object' && typeof selectedItems[item.itemName].minQty === 'number') {
                    minQty = selectedItems[item.itemName].minQty;
                }

                if (!item.buyPrice || item.buyPrice <= 0) continue;

                const affordable = Math.floor(remainingCash / item.buyPrice);
                let qtyToBuy = Math.min(maxAllowed, affordable);

                if (qtyToBuy < minQty) {
                    qtyToBuy = 0;
                }

                if (qtyToBuy > 0) {
                    purchases[item.itemName] = qtyToBuy;
                    remainingCash -= qtyToBuy * item.buyPrice;
                }
            }
        }

        const breakdown = [];
        let totalCost = 0;
        let totalUnits = 0;

        for (const item of candidates) {
            const qty = purchases[item.itemName] || 0;
            if (qty <= 0) continue;

            const subtotal = qty * item.buyPrice;
            totalCost += subtotal;
            totalUnits += qty;

            const remainingStock = item.stock === Infinity ? 'Unlimited' : (item.stock - qty);

            breakdown.push({
                itemName: item.itemName,
                quantity: qty,
                unitPrice: item.buyPrice,
                subtotal,
                remainingStock
            });
        }

        return {
            success: true,
            action: 'buy',
            priorityStrategy,
            itemsAffectedCount: breakdown.length,
            totalUnits,
            totalCost,
            currentCash: initialCash,
            projectedCash: remainingCash,
            breakdown
        };
    }

    /**
     * Executes a bulk buy operation from available system shop listings.
     */
    static executeBulkBuy(playerState, options = {}, now = Date.now(), rng = Math.random) {
        const preview = this.previewBulkBuy(playerState, options, now, rng);
        if (preview.itemsAffectedCount === 0 || preview.totalUnits === 0) {
            return { error: 'No affordable shop listings match criteria' };
        }

        const currentCash = Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(Number(playerState.cash) || 0)));
        if (currentCash < preview.totalCost) {
            return { error: 'Insufficient funds to execute bulk purchase' };
        }

        playerState.cash = currentCash - preview.totalCost;

        for (const item of preview.breakdown) {
            playerState.inventory[item.itemName] = (playerState.inventory[item.itemName] || 0) + item.quantity;

            // Deduct stock if listing exists
            if (playerState.shop.buyListings && playerState.shop.buyListings[item.itemName]) {
                const listing = playerState.shop.buyListings[item.itemName];
                if (isFinite(listing.stock)) {
                    listing.stock = Math.max(0, listing.stock - item.quantity);
                    if (listing.stock <= 0) {
                        listing.available = false;
                    }
                }
            } else if (playerState.shop.boosterListings && playerState.shop.boosterListings[item.itemName]) {
                const listing = playerState.shop.boosterListings[item.itemName];
                if (isFinite(listing.stock)) {
                    listing.stock = Math.max(0, listing.stock - item.quantity);
                    if (listing.stock <= 0) {
                        listing.available = false;
                    }
                }
            }
        }

        return {
            success: true,
            action: 'buy',
            priorityStrategy: preview.priorityStrategy,
            itemsAffectedCount: preview.itemsAffectedCount,
            totalUnits: preview.totalUnits,
            totalCost: preview.totalCost,
            remainingCash: playerState.cash,
            breakdown: preview.breakdown
        };
    }
}

module.exports = ShopEngine;
