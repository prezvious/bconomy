'use strict';

const { normalizeItemId, getItem } = require('../data/itemRegistry');
const { cleanupOwnedItemFlags } = require('../state/playerState');

const VALID_FLAGS = new Set(['locked', 'favorite']);

class InventoryEngine {
    static setFlags(playerState, itemIds, changes = {}) {
        if (!playerState || typeof playerState !== 'object' || Array.isArray(playerState)) {
            return { error: 'Missing or invalid player state' };
        }
        if (!Array.isArray(itemIds) || itemIds.length === 0) return { error: 'Select at least one item' };

        const normalizedChanges = Object.fromEntries(Object.entries(changes)
            .filter(([flag, value]) => VALID_FLAGS.has(flag) && typeof value === 'boolean'));
        if (Object.keys(normalizedChanges).length === 0) return { error: 'No valid inventory flag changes supplied' };

        cleanupOwnedItemFlags(playerState);
        const canonicalIds = [];
        for (const rawId of itemIds) {
            const id = normalizeItemId(rawId);
            const item = id ? getItem(id) : null;
            if (!id || !item) return { error: `Unknown item '${rawId}'` };
            if (item.storageScope !== 'inventory' || !playerState.inventory[id]) {
                return { error: `Item '${item.displayName}' is not currently owned in shared inventory` };
            }
            if (!canonicalIds.includes(id)) canonicalIds.push(id);
        }

        const lists = {
            locked: new Set(playerState.lockedItems || []),
            favorite: new Set(playerState.favoriteItems || [])
        };
        for (const id of canonicalIds) {
            for (const [flag, enabled] of Object.entries(normalizedChanges)) {
                if (enabled) lists[flag].add(id);
                else lists[flag].delete(id);
            }
        }
        playerState.lockedItems = [...lists.locked];
        playerState.favoriteItems = [...lists.favorite];
        cleanupOwnedItemFlags(playerState);

        return {
            success: true,
            itemIds: canonicalIds,
            changes: normalizedChanges,
            lockedItems: [...playerState.lockedItems],
            favoriteItems: [...playerState.favoriteItems]
        };
    }

    static setWishlist(playerState, itemIds, wished, now = Date.now()) {
        if (!playerState || typeof playerState !== 'object' || Array.isArray(playerState)) {
            return { error: 'Missing or invalid player state' };
        }
        if (!Array.isArray(itemIds) || itemIds.length === 0) return { error: 'Select at least one item' };
        if (typeof wished !== 'boolean') return { error: 'Wishlist state must be true or false' };
        if (!Number.isSafeInteger(now) || now < 0) return { error: 'Invalid wishlist timestamp' };

        cleanupOwnedItemFlags(playerState);
        const canonicalIds = [];
        for (const rawId of itemIds) {
            const id = normalizeItemId(rawId);
            if (!id) return { error: `Unknown item '${rawId}'` };
            if (!canonicalIds.includes(id)) canonicalIds.push(id);
        }
        playerState.shopWishlist = playerState.shopWishlist && typeof playerState.shopWishlist === 'object'
            ? { ...playerState.shopWishlist }
            : {};
        for (const id of canonicalIds) {
            if (wished) playerState.shopWishlist[id] = { addedAt: now };
            else delete playerState.shopWishlist[id];
        }
        return { success: true, itemIds: canonicalIds, wished, shopWishlist: playerState.shopWishlist };
    }
}

module.exports = InventoryEngine;
