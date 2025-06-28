document.getElementById('randomPreset').addEventListener('click', ()=>{
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        const options = Array.from(select.options);
        const randomIndex = 1 + Math.floor(Math.random() * (options.length - 1));
        const randomValue = options[randomIndex].value;
        select.value = randomValue;
        selections[select.id] = randomValue;
    });
    savePreset();
});
