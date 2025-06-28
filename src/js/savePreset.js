document.querySelector('.closeSave').addEventListener('click', ()=>{
    const elm = document.getElementById('savePresetModal');
    elm.classList.remove('fadeIn');
    elm.classList.add('fadeOut');
    elm.addEventListener('animationend', () => {
        if (elm.classList.contains('fadeOut'))
            elm.style.display = 'none';
    }, {once: true});
});

document.getElementById('savePreset').addEventListener('click', ()=>{
    const elm = document.getElementById('savePresetModal');
    elm.style.display = 'block';
    elm.classList.remove('fadeOut');
    elm.classList.add('fadeIn');
});

document.getElementById('modalCancel').addEventListener('click', ()=>{
    const elm = document.getElementById('savePresetModal');
    elm.classList.remove('fadeIn');
    elm.classList.add('fadeOut');
    elm.addEventListener('animationend', () => {
        if (elm.classList.contains('fadeOut'))
            elm.style.display = 'none';
    }, {once: true});
});

document.getElementById('modalOk').addEventListener('click', ()=>{
    const presetName = document.getElementById('presetName').value.trim();
    const existError = document.getElementById('exist_error');
    const nameError = document.getElementById('name_error');
    const presetInput = document.getElementById('presetName');
    existError.style.display = 'none';
    nameError.style.display = 'none';
    presetInput.classList.remove('invalid');
    const validName = /^[a-zA-Zа-яА-Я0-9\s]+$/.test(presetName);
    if (!validName || presetName.length > 20) {
        nameError.style.display = 'block';
        presetInput.classList.add('invalid');
        return;
    }
    chrome.storage.local.get('presets', function(result) {
        const presets = result.presets || {};
        if (presets[presetName]) {
            existError.style.display = 'block';
            presetInput.classList.add('invalid');
        } else {
            presets[presetName] = selections;
            chrome.storage.local.set({ presets: presets }, function() {
                const elm = document.getElementById('savePresetModal');
                elm.classList.remove('fadeIn');
                elm.classList.add('fadeOut');
                elm.addEventListener('animationend', () => {
                    if (elm.classList.contains('fadeOut'))
                        elm.style.display = 'none';
                }, {once: true});
            });
        }
    });
});