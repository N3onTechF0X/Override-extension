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

chrome.runtime.sendMessage({ action: 'fetchTextures' }, (textures) => {
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
});
