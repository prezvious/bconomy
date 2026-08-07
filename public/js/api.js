// API Client & Action Handlers
import { getState, setState, saveState } from './state.js';
import { showToast } from './ui/toast.js';

/**
 * Generic API caller with auto playerState inclusion, state saving, error handling, and trigger element loading state support.
 */
export const apiCall = async (endpoint, method = 'GET', body = null, triggerElement = null) => {
    if (triggerElement) {
        triggerElement.classList.add('btn-loading');
        triggerElement.disabled = true;
    }

    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };

        let requestBody = body;
        if (method === 'POST') {
            requestBody = { playerState: getState(), ...(body || {}) };
        }

        if (requestBody) {
            options.body = JSON.stringify(requestBody);
        }

        const response = await fetch(endpoint, options);
        const data = await response.json();

        if (!response.ok || data.success === false || data.error) {
            const errorMsg = data.error || data.message || 'API Error';
            throw new Error(errorMsg);
        }

        if (data.state) {
            setState(data.state);
            saveState();
        }

        return data;
    } catch (error) {
        showToast(error.message || 'Something went wrong', 'error');
        console.error('API Error:', error);
        throw error;
    } finally {
        if (triggerElement) {
            triggerElement.classList.remove('btn-loading');
            triggerElement.disabled = false;
        }
    }
};

export const doAction = (actionType, el) => apiCall('/api/action', 'POST', { actionType }, el);
export const doRankUp = (el) => apiCall('/api/rank/up', 'POST', {}, el);
export const doAscend = (el) => apiCall('/api/prestige/ascend', 'POST', {}, el);
export const doUpgradePerk = (perkName, el) => apiCall('/api/prestige/perk', 'POST', { perkName }, el);
export const doUpgradeTool = (toolType, el) => apiCall('/api/tool/upgrade', 'POST', { toolType }, el);
export const doPlant = (plotId, cropName, el) => apiCall('/api/farm/plant', 'POST', { plotId, cropName }, el);
export const doPlantAll = (cropName, el) => apiCall('/api/farm/plant-all', 'POST', { cropName }, el);
export const doRemove = (plotId, el) => apiCall('/api/farm/remove', 'POST', { plotId }, el);
export const doWater = (plotId, el) => apiCall('/api/farm/water', 'POST', { plotId }, el);
export const doWaterAll = (el) => apiCall('/api/farm/water-all', 'POST', {}, el);
export const doAddPlot = (el) => apiCall('/api/farm/add-plot', 'POST', {}, el);
export const doClaim = (cropType, el) => apiCall('/api/farm/claim', 'POST', { cropType }, el);
export const doUseMelon = (el) => apiCall('/api/farm/use-melon', 'POST', {}, el);
export const doCompost = (plotId, el) => apiCall('/api/farm/apply-compost', 'POST', { plotId }, el);
export const doFarmState = () => apiCall('/api/farm/state', 'POST');
