document.getElementById('defaultPreset').addEventListener('click', function() {
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.value = 'default';
        selections[select.id] = 'default';
    });
    savePreset();
});