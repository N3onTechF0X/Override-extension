document.addEventListener('DOMContentLoaded', async () => {
    const toggleButton = document.getElementById('toggle-button');
    const editSkinsButton = document.getElementById('edit-skins');
    const presetsList = document.getElementById('presets-list');
    const languageSelect = document.getElementById('language-select');

    chrome.storage.local.get('current_language', (data) => {
        const currentLanguage = data.current_language || 'en';
        languageSelect.value = currentLanguage;
    });

    languageSelect.addEventListener('change', (event) => {
        const selectedLanguage = languageSelect.value;
        chrome.storage.local.set({ current_language: selectedLanguage });
        window.close();
    });

    chrome.storage.local.get('enabled', (data) => {
        const isEnabled = data.enabled || false;
        updateButtonState(isEnabled);
    });

    toggleButton.addEventListener('click', () => {
        chrome.storage.local.get('enabled', (data) => {
            const isEnabled = !data.enabled;
            chrome.storage.local.set({ enabled: isEnabled });
            updateButtonState(isEnabled);
        });
    });

    function updateButtonState(isEnabled) {
        if (isEnabled) {
            toggleButton.classList.remove('button-off');
            toggleButton.classList.add('button-on');
            toggleButton.textContent = 'On';
        } else {
            toggleButton.classList.remove('button-on');
            toggleButton.classList.add('button-off');
            toggleButton.textContent = 'Off';
        }
    }

    editSkinsButton.addEventListener('click', () => {
        chrome.tabs.create({ url: 'skins.html' });
    });

    chrome.storage.local.get('presets', (data) => {
        const presets = data.presets || {};
        for (const name in presets) {
            const li = document.createElement('li');
            li.classList.add('preset-item');
            li.innerHTML = `<button data-key="${name}" class="button-edit">${name}</button>`;
            presetsList.appendChild(li);
        };
    });

    presetsList.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const key = event.target.getAttribute('data-key');
            applyPreset(key);
        }
    });
});

function applyPreset(key) {
    chrome.storage.local.get('presets', (data) => {
        const presets = data.presets || [];
        chrome.storage.local.set({ currentPreset: presets[key] });
        window.close();
    });
}
