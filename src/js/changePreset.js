document.getElementById('changePreset').addEventListener('click', function() {
    const elm = document.getElementById('presetListModal');
    elm.style.display = 'block';
    elm.classList.remove('fadeOut');
    elm.classList.add('fadeIn');
    const presetListDiv = document.getElementById('presetList');
    presetListDiv.innerHTML = '';
    chrome.storage.local.get('presets', function(result) {
        const presets = result.presets || {};
        for (const presetName in presets) {
            const button = document.createElement('button');
            button.textContent = presetName;
            button.className = 'preset-list-button';
            button.addEventListener('click', function() {
                setPreset(presetName);
                const elm = document.getElementById('presetListModal');
                elm.style.visibility = "hidden";
            });
            presetListDiv.appendChild(button);
        }
    });
});

function setPreset(presetName) {
    chrome.storage.local.get('presets', function(result) {
        const presets = result.presets || {};
        if (presets[presetName]) {
            selections = presets[presetName];
            savePreset();
            updateFieldsWithSelections();
        }
    });
}

document.querySelector('.closeList').addEventListener('click', function() {
    const elm = document.getElementById('presetListModal');
    elm.classList.remove('fadeIn');
    elm.classList.add('fadeOut');
    elm.addEventListener('animationend', () => {
        if (elm.classList.contains('fadeOut')) {
            elm.style.display = 'none';
        }
    }, {once: true});
});