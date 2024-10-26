document.getElementById('defaultPreset').addEventListener('click', function() {
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.value = 'default';
        if (select.classList.contains('from')) {
            selections[select.classList[1]].from = 'default';
        } else if (select.classList.contains('to')) {
            selections[select.classList[1]].to = 'default';
        }
    });
    savePreset();
});