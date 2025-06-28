function injectScript(filePath, callback) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(filePath);
    script.type = 'text/javascript';
    script.onload = () => {
        script.remove();
        if (callback) callback();
    };
    (document.head || document.documentElement).appendChild(script);
}

fetch('https://raw.githubusercontent.com/N3onTechF0X/Override-extension/main/textures_links.json', { cache: 'no-store' })
    .then(response => response.json())
    .then(textures => {
        injectScript('override-fetch.js', () => {
            chrome.storage.local.get('enabled', (result) => {
                const enabled = result.enabled || false;
                window.postMessage({ type: 'GET_ENABLED', enabled: enabled }, '*');
            });
            window.postMessage({ type: 'SET_TEXTURES', textures: textures }, '*');
            chrome.storage.local.get('currentPreset', (result) => {
                const selections = result.currentPreset || {};
                window.postMessage({ type: 'SET_SELECTIONS', selections: selections }, '*');
            });
        });
    })
    .catch(error => console.error('Error fetching textures:', error));


window.addEventListener('message', async (event) => {
    if (event.data.type === 'CUSTOM_FETCH') {
        const { requestId, url } = event.data;
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            window.postMessage({
                type: 'CUSTOM_FETCH_RESULT',
                requestId,
                blob
            }, '*');
        } catch (err) {
            window.postMessage({
                type: 'CUSTOM_FETCH_RESULT',
                requestId,
                error: err.message
            }, '*');
        }
    }
});
