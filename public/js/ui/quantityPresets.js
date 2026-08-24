import { getStoredSettings, resolveQuantityPreferences } from '../preferences.js';

const escapeAttribute = value => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

export const getQuantityPresets = (systemId, subjectId = '', maxValue = null) => {
    const resolved = resolveQuantityPreferences(getStoredSettings(), systemId, subjectId);
    return {
        ...resolved,
        presets: resolved.presets.map(preset => ({
            ...preset,
            enabled: preset.valid && (preset.max || maxValue === null || preset.value <= maxValue)
        }))
    };
};

export const quantityPresetButtonsHtml = ({ systemId, subjectId = '', maxValue = null, activeValue = 1, targetId = '' }) => {
    const resolved = getQuantityPresets(systemId, subjectId, maxValue);
    return resolved.presets.map(preset => {
        const selected = String(activeValue) === String(preset.value);
        const title = !preset.valid
            ? 'This preset is invalid or duplicates another preset'
            : !preset.enabled
                ? 'This quantity exceeds the current maximum'
                : `Set quantity to ${preset.label}`;
        return `<button class="quantity-preset-btn${selected ? ' active' : ''}" type="button" data-quantity-preset="${escapeAttribute(preset.value)}"${targetId ? ` data-quantity-target="${escapeAttribute(targetId)}"` : ''} aria-pressed="${selected}" title="${escapeAttribute(title)}" ${preset.enabled ? '' : 'disabled'}>${escapeAttribute(preset.label)}</button>`;
    }).join('');
};
