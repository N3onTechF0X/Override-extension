document.querySelector('.closeDelete').addEventListener('click', ()=>{
    const elm = document.getElementById('deletePresetModal');
    elm.classList.remove('fadeIn');
    elm.classList.add('fadeOut');
    elm.addEventListener('animationend', ()=>{
        if (elm.classList.contains('fadeOut'))
            elm.style.display = 'none';
    }, {once: true});
});

document.getElementById('deletePreset').addEventListener('click', ()=>{
    const elm = document.getElementById('deletePresetModal');
    elm.style.display = 'block';
    elm.classList.remove('fadeOut');
    elm.classList.add('fadeIn');
    const deletePresetListDiv = document.getElementById('deletePresetList');
    deletePresetListDiv.innerHTML = '';
    chrome.storage.local.get('presets', result => {
        const presets = result.presets || {};
        for (const presetName in presets) {
            const button = document.createElement('button');
            button.textContent = presetName;
            button.className = 'delete-preset-button';
            button.addEventListener('click', ()=>{
                if (confirm(`Are you sure you want to delete the preset "${presetName}"?`)) {
                    deletePreset(presetName);
                    const elm = document.getElementById('deletePresetModal');
                    elm.classList.remove('fadeIn');
                    elm.classList.add('fadeOut');
                    elm.addEventListener('animationend', ()=>{
                        if (elm.classList.contains('fadeOut'))
                            elm.style.display = 'none';
                    }, {once: true});
                }
            });
            deletePresetListDiv.appendChild(button);
        }
    });
});

const deletePreset = presetName => {
    chrome.storage.local.get('presets', result=>{
        const presets = result.presets || {};
        delete presets[presetName];
        chrome.storage.local.set({ presets: presets });
    });
}