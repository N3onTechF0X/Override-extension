let selections = {};

function updateFieldsWithSelections() {
    for (const [itemName, { from, to }] of Object.entries(selections)) {
        const fromSelect = document.querySelector(`.from.${itemName}`);
        const toSelect = document.querySelector(`.to.${itemName}`);
        if (fromSelect) fromSelect.value = from;
        if (toSelect) toSelect.value = to;
    }
}

function savePreset() {
    chrome.storage.local.set({ currentPreset: selections });
}

fetch('https://raw.githubusercontent.com/N3onTechF0X/Override-extension/main/textures_types.json')
  .then(response => response.json())
  .then(data => {
      populateFields('turret', data.turret, 'turretsColumn');
      populateFields('hull', data.hull, 'hullsColumn');
      populateFields('drone', data.drone, 'dronesColumn');
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
        const fromSelect = document.createElement('select');
        fromSelect.classList.add('from', itemName);
        skins.forEach(skin => {
            const option = document.createElement('option');
            option.value = skin;
            option.textContent = skin;
            fromSelect.appendChild(option);
        });
        const toSelect = document.createElement('select');
        toSelect.classList.add('to', itemName);
        skins.forEach(skin => {
            const option = document.createElement('option');
            option.value = skin;
            option.textContent = skin;
            toSelect.appendChild(option);
        });

        selections[itemName] = {
            from: fromSelect.value,
            to: toSelect.value
        };

        fromSelect.addEventListener('change', function () {
            selections[itemName].from = this.value;
            savePreset();
        });

        toSelect.addEventListener('change', function () {
            selections[itemName].to = this.value;
            savePreset();
        });

        itemDiv.appendChild(fromSelect);
        itemDiv.appendChild(toSelect);
        column.appendChild(itemDiv);
    }
}
