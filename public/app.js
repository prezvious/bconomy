// Bconomy Main Entry Point (ES Module)
import { apiCall } from './js/api.js';
import { loadState, setState, setRankData, setPerkData } from './js/state.js';
import { setupThemeToggle } from './js/theme.js';
import { renderAll } from './js/ui/header.js';
import { updateAllToolRecipes } from './js/ui/tools.js';
import { setupNavigation } from './js/navigation.js';
import { setupModals } from './js/ui/modal.js';
import { cooldownLoop } from './js/ui/cooldowns.js';
import { addLogEntry, setupConsoleHandlers } from './js/ui/log.js';

const init = async () => {
    setupThemeToggle();
    setupConsoleHandlers();

    try {
        const [ranks, perks] = await Promise.all([
            apiCall('/api/data/ranks', 'GET'),
            apiCall('/api/data/perks', 'GET')
        ]);

        setRankData(ranks);
        setPerkData(perks);

        let state = loadState();
        if (!state) {
            state = await apiCall('/api/state/default', 'GET');
        }
        setState(state);

        await updateAllToolRecipes();

        setupNavigation();
        setupModals();
        renderAll();

        requestAnimationFrame(cooldownLoop);

        addLogEntry('Merchant Guild Command Desk ready.', 'system');
    } catch (error) {
        console.error("Initialization failed:", error);
        addLogEntry('Initialization failed! Is the backend running?', 'error');
    }
};

document.addEventListener('DOMContentLoaded', init);
