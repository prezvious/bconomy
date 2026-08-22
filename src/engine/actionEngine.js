/**
 * @module actionEngine
 * Handles resource gathering activities (mine, explore, hunt, fish) and work actions.
 */
const {
    getToolYieldMultiplier,
    getToolCooldownReduction,
    getWorkBasePay,
    calculateWorkBonuses,
    getAmnesiacChance,
    displayItemName,
    calculateBoosterMultiplier
} = require('../utils/formulas');
const { ACTION_COOLDOWNS, MINE_DROP_TABLE, EXPLORE_DROP_TABLE, HUNT_DROP_TABLE, FISH_DROP_TABLE, RANKS } = require('./dropTables');
const ShopEngine = require('./shopEngine');
const BoosterEngine = require('./boosterEngine');
const ToolEngine = require('./toolEngine');
const { FactionEngine } = require('./factionEngine');
const { FARM_UPGRADE_MATERIALS } = require('./farmPlotUpgrade');

const formatNumberCommas = (num) => new Intl.NumberFormat('en-US').format(num);

class ActionEngine {
    /**
     * Gets tool display name for action type and level.
     */
    static getToolName(actionType, level) {
        const names = { mine: 'Mine Tool', explore: 'Explore Tool', hunt: 'Hunt Tool', fish: 'Fish Tool' };
        return `${names[actionType] || 'Tool'} (Lv. ${level})`;
    }

    /**
     * Performs an action for the player.
     * @param {Object} playerState - The current player state
     * @param {string} actionType - 'mine', 'explore', 'hunt', 'fish', or 'work'
     * @param {number} [currentTime] - Optional timestamp (defaults to Date.now())
     * @returns {Object} Result of the action
     */
    static performAction(playerState, actionType, currentTime = Date.now()) {
        const now = currentTime;
        playerState.inventory = playerState.inventory || {};
        playerState.cooldowns = playerState.cooldowns || { mine: 0, explore: 0, hunt: 0, fish: 0, work: 0 };
        playerState.tools = playerState.tools || { mine: 1, explore: 1, hunt: 1, fish: 1 };
        playerState.perks = playerState.perks || {};
        playerState.cash = typeof playerState.cash === 'number' && !isNaN(playerState.cash) ? playerState.cash : 0;
        playerState.rankIndex = typeof playerState.rankIndex === 'number' && !isNaN(playerState.rankIndex) ? playerState.rankIndex : 0;

        ShopEngine.ensureShopState(playerState, now);
        BoosterEngine.ensureBoosterState(playerState);
        FactionEngine.ensureFactionState(playerState, now);
        ToolEngine.ensureSocketState(playerState);

        const cooldown = playerState.cooldowns[actionType] || 0;

        if (now < cooldown) {
            return { error: 'Action on cooldown', remainingTime: cooldown - now };
        }

        let amnesiacTriggered = false;
        const toolLevel = (playerState.tools && playerState.tools[actionType]) || 1;
        const socketSummary = ToolEngine.getToolSocketSummary(playerState, actionType);
        const socketBonuses = socketSummary ? socketSummary.activeBonuses : {};

        // Calculate cooldown with Level 300+ tool reduction and Chrono Resonator socket modules
        const baseDurationSec = ACTION_COOLDOWNS[actionType] || 300;
        const toolCooldownReductionSec = getToolCooldownReduction(toolLevel);
        const socketCooldownReductionSec = (socketBonuses && socketBonuses.cooldownReduction) || 0;
        const totalCooldownReductionSec = toolCooldownReductionSec + socketCooldownReductionSec;
        const effectiveCooldownSec = Math.max(5, baseDurationSec - totalCooldownReductionSec);
        let cooldownEnd = now + (effectiveCooldownSec * 1000);

        const checkAmnesiac = () => {
            const chance = getAmnesiacChance((playerState.perks && playerState.perks.amnesiac) || 0);
            if (Math.random() < chance) {
                cooldownEnd = 0;
                amnesiacTriggered = true;
            }
        };

        const factionMultiplier = FactionEngine.getFactionMultiplier(playerState, actionType, now);
        const factionName = (playerState.faction && playerState.faction.name) || 'Faction';
        const factionBoost = (playerState.faction && playerState.faction.boosts && playerState.faction.boosts[actionType]) || { level: 0 };

        if (['mine', 'explore', 'hunt', 'fish'].includes(actionType)) {
            let table;
            let baseRollPool = 1000;
            switch(actionType) {
                case 'mine':
                    table = MINE_DROP_TABLE;
                    baseRollPool = 1000;
                    break;
                case 'explore':
                    table = EXPLORE_DROP_TABLE;
                    baseRollPool = 400;
                    break;
                case 'hunt':
                    table = HUNT_DROP_TABLE;
                    baseRollPool = 300;
                    break;
                case 'fish':
                    table = FISH_DROP_TABLE;
                    baseRollPool = 200;
                    break;
            }

            const toolMultiplier = getToolYieldMultiplier(toolLevel);
            const serendipityLevel = (playerState.perks && playerState.perks.serendipity) || 0;
            let serendipityMultiplier = serendipityLevel > 0 ? (serendipityLevel + 1) : 1;
            if (socketBonuses && socketBonuses.serendipityBonus) {
                serendipityMultiplier += socketBonuses.serendipityBonus;
            }

            const rareProspectorBonus = 1 + ((socketBonuses && socketBonuses.rareDropBonus) || 0);

            // Multistrike Matrix roll
            const multistrikeChance = (socketBonuses && socketBonuses.multistrikeChance) || 0;
            const multistrikeTriggered = multistrikeChance > 0 && Math.random() < multistrikeChance;
            const rollMultiplier = multistrikeTriggered ? 2 : 1;

            const boosterInfo = calculateBoosterMultiplier(
                playerState.boosters && playerState.boosters.activeUntil && playerState.boosters.activeUntil[actionType],
                now
            );
            const boosterMultiplier = boosterInfo.multiplier;
            const totalMultiplier = toolMultiplier * boosterMultiplier * factionMultiplier * rollMultiplier;

            const itemsList = [];
            let totalItems = 0;

            for (const drop of table) {
                const isRare = drop.chance <= 5.0;
                const rareMult = (isRare && (serendipityLevel > 0 || (socketBonuses && socketBonuses.serendipityBonus)))
                    ? (serendipityMultiplier * rareProspectorBonus)
                    : (isRare ? rareProspectorBonus : 1);

                const expected = baseRollPool * (drop.chance / 100) * toolMultiplier * rareMult * boosterMultiplier * factionMultiplier * rollMultiplier;

                let quantity = 0;
                if (expected > 0) {
                    const variance = 0.96 + (Math.random() * 0.08); // +/- 4% roll variance
                    const scaledVal = expected * variance;
                    const baseQty = Math.floor(scaledVal);
                    const frac = scaledVal - baseQty;
                    quantity = baseQty + (Math.random() < frac ? 1 : 0);
                }

                if (quantity > 0) {
                    if (!playerState.inventory[drop.item]) {
                        playerState.inventory[drop.item] = 0;
                    }
                    playerState.inventory[drop.item] += quantity;
                    totalItems += quantity;
                    itemsList.push({
                        item: drop.item,
                        displayName: displayItemName(drop.item),
                        quantity,
                        chance: drop.chance,
                        isRare
                    });
                }
            }

            // Apply Transmutation (Transmuter modules)
            const transmutationRate = (socketBonuses && socketBonuses.transmutationRate) || 0;
            if (transmutationRate > 0 && itemsList.length > 0) {
                // Get rare items from the same drop table for transmutation targets
                const commonDrops = itemsList.filter(item => !item.isRare);
                const rareDropItems = table.filter(d => d.chance <= 5.0);
                
                if (rareDropItems.length > 0) {
                    for (const commonItem of commonDrops) {
                        let transmutedQty = 0;
                        for (let i = 0; i < commonItem.quantity; i++) {
                            if (Math.random() < transmutationRate) {
                                transmutedQty++;
                            }
                        }
                        if (transmutedQty > 0) {
                            // Pick a random rare item as target
                            const targetDrop = rareDropItems[Math.floor(Math.random() * rareDropItems.length)];
                            // Remove transmuted units from original
                            playerState.inventory[commonItem.item] = Math.max(0, (playerState.inventory[commonItem.item] || 0) - transmutedQty);
                            if (playerState.inventory[commonItem.item] <= 0) delete playerState.inventory[commonItem.item];
                            // Add transmuted units as rare item
                            playerState.inventory[targetDrop.item] = (playerState.inventory[targetDrop.item] || 0) + transmutedQty;
                            commonItem.quantity -= transmutedQty;
                            itemsList.push({
                                item: targetDrop.item,
                                displayName: displayItemName(targetDrop.item),
                                quantity: transmutedQty,
                                chance: targetDrop.chance,
                                isRare: true,
                                isTransmuted: true
                            });
                        }
                    }
                }
            }

            // Farm materials use literal independent drop rolls instead of the
            // legacy expected-quantity pools. Every gathering action can award
            // several material types on the same successful action.
            for (const [itemName, material] of Object.entries(FARM_UPGRADE_MATERIALS)) {
                const isRare = material.dropChance <= 5;
                const rareChanceMultiplier = isRare
                    ? serendipityMultiplier * rareProspectorBonus
                    : 1;
                const effectiveChance = Math.min(100, material.dropChance * rareChanceMultiplier);
                if (Math.random() >= effectiveChance / 100) continue;

                const [stackMin, stackMax] = material.dropStack;
                const baseStack = stackMin + Math.floor(Math.random() * (stackMax - stackMin + 1));
                const quantity = Math.max(1, Math.round(baseStack * totalMultiplier));
                playerState.inventory[itemName] = (playerState.inventory[itemName] || 0) + quantity;
                totalItems += quantity;
                itemsList.push({
                    item: itemName,
                    displayName: itemName,
                    quantity,
                    chance: material.dropChance,
                    effectiveChance,
                    isRare,
                    farmUpgradeMaterial: true
                });
            }

            // Sort items descending by quantity
            itemsList.sort((a, b) => b.quantity - a.quantity);

            checkAmnesiac();
            playerState.cooldowns[actionType] = cooldownEnd;

            const toolName = this.getToolName(actionType, toolLevel);

            // Build formatted text block matching Bconomy layout
            const textLines = [];
            textLines.push(`+${formatNumberCommas(totalItems)} items!`);
            textLines.push('');
            textLines.push('New Items:');
            for (const itemObj of itemsList) {
                textLines.push(`${formatNumberCommas(itemObj.quantity)}× ${displayItemName(itemObj.item)}`);
            }
            textLines.push('');
            textLines.push('Multipliers:');
            textLines.push(`${toolMultiplier.toFixed(2)}× from ${toolName}`);
            if (boosterMultiplier > 1) {
                textLines.push(`${boosterMultiplier.toFixed(2)}× from Active Loot Boosters (${boosterInfo.activeTiers.join(', ')})`);
            }
            if (factionMultiplier > 1) {
                textLines.push(`${factionMultiplier.toFixed(2)}× from Faction Boost (${factionName} - Lv. ${factionBoost.level})`);
            }
            if (multistrikeTriggered) {
                textLines.push(`2.00× from Multistrike Matrix (Duplicate Roll Pool)`);
            }
            textLines.push(`${totalMultiplier.toFixed(2)}× total multiplier!`);
            if (serendipityMultiplier > 1 || rareProspectorBonus > 1) {
                textLines.push(`${(serendipityMultiplier * rareProspectorBonus).toFixed(2)}× Rare Loot`);
            }

            if (totalCooldownReductionSec > 0) {
                textLines.push('');
                textLines.push('Overclock & Cooldown:');
                textLines.push(`-${totalCooldownReductionSec}s Cooldown (${effectiveCooldownSec}s effective)`);
            }

            if (amnesiacTriggered) {
                textLines.push('');
                textLines.push('Other:');
                textLines.push('Amnesia (Cooldown ignored)');
            }

            const formattedText = textLines.join('\n');

            return {
                success: true,
                actionType,
                totalItems,
                itemsList,
                toolMultiplier,
                boosterMultiplier,
                activeBoosterTiers: boosterInfo.activeTiers,
                factionMultiplier,
                totalMultiplier,
                serendipityMultiplier,
                serendipityLevel,
                multistrikeTriggered,
                toolCooldownReductionSec,
                socketCooldownReductionSec,
                totalCooldownReductionSec,
                effectiveCooldownSec,
                amnesiacTriggered,
                cooldownEnd,
                formattedText
            };
        } else if (actionType === 'work') {
            const tier = playerState.prestigeCount || 0;
            const basePay = getWorkBasePay(playerState.rankIndex || 0, RANKS, tier);
            const partialityLevel = (playerState.perks && playerState.perks.partiality) || 0;
            const { totalChance, bonusCount } = calculateWorkBonuses(partialityLevel);

            const payMultiplier = Math.pow(3, bonusCount);
            const totalMultiplier = payMultiplier * factionMultiplier;
            const totalPay = Math.floor(basePay * payMultiplier * factionMultiplier);
            const bonusTriggered = bonusCount > 0;

            playerState.cash = (playerState.cash || 0) + totalPay;

            checkAmnesiac();
            playerState.cooldowns[actionType] = cooldownEnd;

            const textLines = [];
            textLines.push(`+$${formatNumberCommas(totalPay)} Cash!`);
            textLines.push('');
            textLines.push('Multipliers:');
            if (bonusCount > 0) {
                textLines.push(`${payMultiplier.toFixed(2)}× Work Bonus (${bonusCount}× Stack)`);
            } else {
                textLines.push('1.00× Standard Work');
            }
            if (factionMultiplier > 1) {
                textLines.push(`${factionMultiplier.toFixed(2)}× from Faction Boost (${factionName} - Lv. ${factionBoost.level})`);
            }
            textLines.push(`${totalMultiplier.toFixed(2)}× total multiplier!`);

            if (amnesiacTriggered) {
                textLines.push('');
                textLines.push('Other:');
                textLines.push('Amnesia (Cooldown ignored)');
            }

            const formattedText = textLines.join('\n');

            return {
                success: true,
                actionType,
                basePay,
                bonusTriggered,
                bonusCount,
                payMultiplier,
                factionMultiplier,
                totalMultiplier,
                totalPay,
                amnesiacTriggered,
                cooldownEnd,
                formattedText
            };
        }

        return { error: 'Invalid action type' };
    }
}

module.exports = ActionEngine;
