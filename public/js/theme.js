import { THEME_KEY } from './utils.js';

export const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
        console.error('Error saving theme', e);
    }
};

export const loadTheme = () => {
    try {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
        console.error('Error loading theme', e);
    }
    return 'light';
};

export const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'light' ? 'dark' : 'light');
};

export const setupThemeToggle = () => {
    applyTheme(loadTheme());

    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', toggleTheme);
};
