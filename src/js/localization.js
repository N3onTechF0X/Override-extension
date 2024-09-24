chrome.storage.local.get('current_language', (data) => {
    const currentLanguage = data.current_language || 'en';
    fetch(`https://raw.githubusercontent.com/N3onTechF0X/Override-extension/main/language/${currentLanguage}.json`).then(
        response => {
            return response.json();
        }
    ).then(data => {
        const language = data;
        document.querySelectorAll("[translation]").forEach(element => {
            element.textContent = language[element.getAttribute("translation")];
        })
    });
});
