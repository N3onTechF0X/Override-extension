let selections = {};

function updateFieldsWithSelections() {
    for (const [itemName, to] of Object.entries(selections)) {
        const toSelect = document.querySelector(`#${itemName}`);
        if (toSelect) toSelect.value = to;
    }
}

function savePreset() {
    chrome.storage.local.set({ currentPreset: selections });
}

fetch('https://raw.githubusercontent.com/N3onTechF0X/Override-extension/main/textures_types.json')
  .then(response => response.json())
  .then(data => {
      populateFields('turret', data.turrets, 'turretsColumn');
      populateFields('hull', data.hulls, 'hullsColumn');
      populateFields('drone', data.drones, 'dronesColumn');
      chrome.storage.local.get('currentPreset', function(result) {
        if (result.currentPreset) {
            selections = result.currentPreset;
            updateFieldsWithSelections();
        }
    });
  })
  .catch(error => console.error('Ошибка загрузки JSON:', error));

function populateFields(category, items, columnId) {
    const column = document.getElementById(columnId);
    for (const itemName in items) {
        const skins = items[itemName];
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');
        const nameDiv = document.createElement('div');
        nameDiv.classList.add('item-name');
        nameDiv.setAttribute('translation', itemName);
        nameDiv.textContent = itemName;
        itemDiv.appendChild(nameDiv);
        const select = document.createElement('select');
        select.classList.add('to');
        select.id = itemName;
        skins.forEach(skin => {
            const option = document.createElement('option');
            option.value = skin;
            option.textContent = skin;
            select.appendChild(option);
        });

        selections[itemName] = select.value;

        select.addEventListener('change', function () {
            selections[itemName] = this.value;
            savePreset();
        });

        itemDiv.appendChild(select);
        column.appendChild(itemDiv);
    }
}
