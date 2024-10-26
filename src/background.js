async function fetchTextures() {
    const response = await fetch('https://raw.githubusercontent.com/N3onTechF0X/Override-extension/main/textures_links.json');
    const data = await response.json();
    return data;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fetchTextures') {
        fetchTextures().then(data => sendResponse(data));
        return true;
    }
});
