/**
 * @module server
 * Main application server.
 */
const express = require('express');
const cors = require('cors');
const ActionEngine = require('./src/engine/actionEngine');
const ToolEngine = require('./src/engine/toolEngine');
const RankPrestigeEngine = require('./src/engine/rankPrestigeEngine');
const { FarmEngine, CROP_DEFINITIONS } = require('./src/engine/farmEngine');
const { RANKS, PERK_DEFINITIONS, TOOL_UPGRADE_RECIPES } = require('./src/engine/dropTables');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const DEFAULT_STATE = {
    cash: 0,
    rankIndex: 0,
    prestigeCount: 0,
    prestigePoints: 0,
    inventory: {},
    tools: { mine: 1, explore: 1, hunt: 1, fish: 1 },
    perks: { investiture: 0, cronyism: 0, backchannel: 0, partiality: 0, serendipity: 0, numismatist: 0, amnesiac: 0 },
    cooldowns: { mine: 0, explore: 0, hunt: 0, fish: 0, work: 0 },
    farm: {
        waterAvailableAt: 0,
        storage: {
            Blueberry: 0,
            'Golden Wheat': 0,
            Melon: 0,
            Coffee: 0,
            Pumpkin: 0
        },
        plots: [
            { id: 1, crop: null, plantedAt: 0, nextHarvestAt: 0, composted: false }
        ]
    }
};

// State endpoints
app.get('/api/state/default', (req, res) => {
    const initialState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    FarmEngine.ensureFarmState(initialState);
    res.json(initialState);
});

// Action endpoints
app.post('/api/action', (req, res) => {
    const { playerState, actionType } = req.body;
    if (!playerState || !actionType) {
        return res.status(400).json({ error: 'Missing playerState or actionType' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = ActionEngine.performAction(playerState, actionType);
    res.json({ state: playerState, result });
});

// Tool endpoints
app.post('/api/tool/upgrade', (req, res) => {
    const { playerState, toolType } = req.body;
    if (!playerState || !toolType) {
        return res.status(400).json({ error: 'Missing playerState or toolType' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = ToolEngine.upgradeTool(playerState, toolType);
    res.json({ state: playerState, result });
});

// Rank endpoints
app.post('/api/rank/up', (req, res) => {
    const { playerState } = req.body;
    if (!playerState) {
        return res.status(400).json({ error: 'Missing playerState' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = RankPrestigeEngine.rankUp(playerState);
    res.json({ state: playerState, result });
});

// Prestige endpoints
app.post('/api/prestige/ascend', (req, res) => {
    const { playerState } = req.body;
    if (!playerState) {
        return res.status(400).json({ error: 'Missing playerState' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = RankPrestigeEngine.ascend(playerState);
    res.json({ state: playerState, result });
});

app.post('/api/prestige/perk', (req, res) => {
    const { playerState, perkName } = req.body;
    if (!playerState || !perkName) {
        return res.status(400).json({ error: 'Missing playerState or perkName' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = RankPrestigeEngine.upgradePerk(playerState, perkName);
    res.json({ state: playerState, result });
});

// Farm Endpoints
app.post('/api/farm/state', (req, res) => {
    const { playerState } = req.body;
    if (!playerState) {
        return res.status(400).json({ error: 'Missing playerState' });
    }
    FarmEngine.processFarmState(playerState);
    res.json({ state: playerState });
});

app.post('/api/farm/plant', (req, res) => {
    const { playerState, plotId, cropName } = req.body;
    if (!playerState || !plotId || !cropName) {
        return res.status(400).json({ error: 'Missing playerState, plotId, or cropName' });
    }
    const result = FarmEngine.plantCrop(playerState, parseInt(plotId, 10), cropName);
    res.json({ state: playerState, result });
});

app.post('/api/farm/plant-all', (req, res) => {
    const { playerState, cropName } = req.body;
    if (!playerState || !cropName) {
        return res.status(400).json({ error: 'Missing playerState or cropName' });
    }
    const result = FarmEngine.plantAllPlots(playerState, cropName);
    res.json({ state: playerState, result });
});

app.post('/api/farm/remove', (req, res) => {
    const { playerState, plotId } = req.body;
    if (!playerState || !plotId) {
        return res.status(400).json({ error: 'Missing playerState or plotId' });
    }
    const result = FarmEngine.removePlant(playerState, parseInt(plotId, 10));
    res.json({ state: playerState, result });
});

app.post('/api/farm/water', (req, res) => {
    const { playerState, plotId } = req.body;
    if (!playerState || !plotId) {
        return res.status(400).json({ error: 'Missing playerState or plotId' });
    }
    const result = FarmEngine.waterPlot(playerState, parseInt(plotId, 10));
    res.json({ state: playerState, result });
});

app.post('/api/farm/water-all', (req, res) => {
    const { playerState } = req.body;
    if (!playerState) {
        return res.status(400).json({ error: 'Missing playerState' });
    }
    const result = FarmEngine.waterAllPlots(playerState);
    res.json({ state: playerState, result });
});

app.post('/api/farm/add-plot', (req, res) => {
    const { playerState } = req.body;
    if (!playerState) {
        return res.status(400).json({ error: 'Missing playerState' });
    }
    const result = FarmEngine.addPlot(playerState);
    res.json({ state: playerState, result });
});

app.post('/api/farm/claim', (req, res) => {
    const { playerState, cropType } = req.body;
    if (!playerState) {
        return res.status(400).json({ error: 'Missing playerState' });
    }
    const result = FarmEngine.claimCrops(playerState, cropType || 'all');
    res.json({ state: playerState, result });
});

app.post('/api/farm/use-melon', (req, res) => {
    const { playerState } = req.body;
    if (!playerState) {
        return res.status(400).json({ error: 'Missing playerState' });
    }
    const result = FarmEngine.useMelon(playerState);
    res.json({ state: playerState, result });
});

app.post('/api/farm/apply-compost', (req, res) => {
    const { playerState, plotId } = req.body;
    if (!playerState || !plotId) {
        return res.status(400).json({ error: 'Missing playerState or plotId' });
    }
    const result = FarmEngine.applyCompost(playerState, parseInt(plotId, 10));
    res.json({ state: playerState, result });
});

// Data endpoints
app.get('/api/data/ranks', (req, res) => {
    res.json(RANKS);
});

app.get('/api/data/perks', (req, res) => {
    res.json(PERK_DEFINITIONS);
});

app.get('/api/data/farm/crops', (req, res) => {
    res.json(CROP_DEFINITIONS);
});

app.get('/api/data/tools/:toolType/recipe/:level', (req, res) => {
    const { toolType, level } = req.params;
    const reqs = ToolEngine.getUpgradeRequirements(toolType, parseInt(level, 10));
    if (!reqs) {
        return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(reqs);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Bconomy server listening on port ${PORT}`);
});
