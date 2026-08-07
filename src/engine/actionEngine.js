const { getToolYieldMultiplier, getWorkBasePay, calculateWorkBonuses, getAmnesiacChance, displayItemName } = require('../utils/formulas');
const { ACTION_COOLDOWNS, MINE_DROP_TABLE, EXPLORE_DROP_TABLE, HUNT_DROP_TABLE, FISH_DROP_TABLE, RANKS } = require('./dropTables');

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
     * @returns {Object} Result of the action
     */
    static performAction(playerState, actionType) {
        const now = Date.now();
        const cooldown = playerState.cooldowns[actionType] || 0;
        
        if (now < cooldown) {
            return { error: 'Action on cooldown', remainingTime: cooldown - now };
        }

        let amnesiacTriggered = false;
        let cooldownEnd = now + (ACTION_COOLDOWNS[actionType] * 1000);

        const checkAmnesiac = () => {
            const chance = getAmnesiacChance(playerState.perks.amnesiac || 0);
            if (Math.random() < chance) {
                cooldownEnd = 0;
                amnesiacTriggered = true;
            }
        };

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

            const toolLevel = playerState.tools[actionType] || 1;
            const toolMultiplier = getToolYieldMultiplier(toolLevel);
            const serendipityLevel = playerState.perks.serendipity || 0;
            const serendipityMultiplier = serendipityLevel > 0 ? (serendipityLevel + 2) : 1;

            const itemsList = [];
            let totalItems = 0;

            for (const drop of table) {
                const isRare = drop.chance <= 5.0;
                const rareMult = (isRare && serendipityLevel > 0) ? serendipityMultiplier : 1;
                const expected = baseRollPool * (drop.chance / 100) * toolMultiplier * rareMult;
                
                let quantity = 0;
                if (expected >= 1) {
                    const variance = 0.96 + (Math.random() * 0.08); // +/- 4% variance
                    quantity = Math.max(1, Math.round(expected * variance));
                } else if (expected > 0) {
                    // Probabilistic drop for ultra-rare items when expected < 1
                    if (Math.random() < expected) {
                        quantity = 1;
                    }
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

            // Sort items descending by quantity
            itemsList.sort((a, b) => b.quantity - a.quantity);

            checkAmnesiac();
            playerState.cooldowns[actionType] = cooldownEnd;

            const toolName = this.getToolName(actionType, toolLevel);
            
            // Build formatted text block exactly matching Bconomy layout (no emojis)
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
            textLines.push(`${toolMultiplier.toFixed(2)}× total multiplier!`);
            if (serendipityLevel > 0) {
                textLines.push(`${serendipityMultiplier.toFixed(2)}× Rare Loot`);
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
                serendipityMultiplier,
                serendipityLevel,
                amnesiacTriggered,
                cooldownEnd,
                formattedText
            };
        } else if (actionType === 'work') {
            const basePay = getWorkBasePay(playerState.rankIndex || 0, RANKS);
            const partialityLevel = (playerState.perks && playerState.perks.partiality) || 0;
            const { totalChance, bonusCount } = calculateWorkBonuses(partialityLevel);
            
            const payMultiplier = Math.pow(3, bonusCount);
            const totalPay = basePay * payMultiplier;
            const bonusTriggered = bonusCount > 0;

            playerState.cash = (playerState.cash || 0) + totalPay;

            checkAmnesiac();
            playerState.cooldowns[actionType] = cooldownEnd;

            const textLines = [];
            textLines.push(`+$${formatNumberCommas(Math.floor(totalPay))} Cash!`);
            textLines.push('');
            textLines.push('Multipliers:');
            if (bonusCount > 0) {
                textLines.push(`${payMultiplier.toFixed(2)}× Work Bonus (${bonusCount}× Stack)`);
            } else {
                textLines.push('1.00× Standard Work');
            }
            textLines.push(`${payMultiplier.toFixed(2)}× total multiplier!`);

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
