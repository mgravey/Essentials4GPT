// Function to update the model dropdowns with available models
function updateModelDropdowns(models) {
    const simpleModelDropdown = document.getElementById('simple-model');
    const doubleModelDropdown = document.getElementById('double-model');

    // Clear any existing options
    simpleModelDropdown.innerHTML = '';
    doubleModelDropdown.innerHTML = '';

    // Populate dropdowns with available models
    models.forEach(model => {
        const simpleOption = document.createElement('option');
        const doubleOption = document.createElement('option');
        simpleOption.value = model.slug;
        simpleOption.textContent = model.title;
        doubleOption.value = model.slug;
        doubleOption.textContent = model.title;
        simpleModelDropdown.appendChild(simpleOption);
        doubleModelDropdown.appendChild(doubleOption);
    });

    // Load existing selections or default values
    chrome.storage.local.get(['simpleClickDefaultChat', 'doubleClickDefaultChat'], (result) => {
        if (result.simpleClickDefaultChat) {
            simpleModelDropdown.value = result.simpleClickDefaultChat.model;
            document.getElementById('simple-temporaryChat').checked = result.simpleClickDefaultChat.temporaryChat;
        }

        if (result.doubleClickDefaultChat) {
            doubleModelDropdown.value = result.doubleClickDefaultChat.model;
            document.getElementById('double-temporaryChat').checked = result.doubleClickDefaultChat.temporaryChat;
        }
    });
}

// Function to save settings immediately when a change is made
function saveSetting(key, value) {
    chrome.storage.local.set({ [key]: value }, () => {
        console.log(`${key} has been updated.`);
    });
}

// Initialize the options page
document.addEventListener('DOMContentLoaded', () => {
    // Load available models and update dropdowns
    chrome.storage.local.get('modelsAvailable', (result) => {
        if (result.modelsAvailable && Array.isArray(result.modelsAvailable)) {
            updateModelDropdowns(result.modelsAvailable);
        } else {
            console.error("No models available or invalid data format.");
        }
    });

    // Add event listeners for changes
    document.getElementById('simple-model').addEventListener('change', (event) => {
        saveSetting('simpleClickDefaultChat', {
            model: event.target.value,
            temporaryChat: document.getElementById('simple-temporaryChat').checked
        });
    });

    document.getElementById('simple-temporaryChat').addEventListener('change', (event) => {
        saveSetting('simpleClickDefaultChat', {
            model: document.getElementById('simple-model').value,
            temporaryChat: event.target.checked
        });
    });

    document.getElementById('double-model').addEventListener('change', (event) => {
        saveSetting('doubleClickDefaultChat', {
            model: event.target.value,
            temporaryChat: document.getElementById('double-temporaryChat').checked
        });
    });

    document.getElementById('double-temporaryChat').addEventListener('change', (event) => {
        saveSetting('doubleClickDefaultChat', {
            model: document.getElementById('double-model').value,
            temporaryChat: event.target.checked
        });
    });

    // Load settings for the new features
    chrome.storage.local.get(['conversationHistoryEdit', 'switchEnterBehavior', 'switchPastBehavior','addExpireDate', 'expireDateDefault'], (result) => {
        document.getElementById('conversationHistoryEdit').checked = !!result.conversationHistoryEdit;
        document.getElementById('switchEnterBehavior').checked = !!result.switchEnterBehavior;
        document.getElementById('switchPastBehavior').checked = !!result.switchPastBehavior;
        document.getElementById('addExpireDate').checked = !!result.addExpireDate;
        document.getElementById('expireDateDefault').value = result.expireDateDefault || 30;
        document.getElementById('expireDateDefault').disabled = !document.getElementById('addExpireDate').checked;
    });

    // Add event listeners for the new features
    document.getElementById('conversationHistoryEdit').addEventListener('change', (event) => {
        saveSetting('conversationHistoryEdit', event.target.checked);
    });

    document.getElementById('switchEnterBehavior').addEventListener('change', (event) => {
        saveSetting('switchEnterBehavior', event.target.checked);
    });

    document.getElementById('switchPastBehavior').addEventListener('change', (event) => {
        saveSetting('switchPastBehavior', event.target.checked);
    });

    // Add event listeners for the new features
    document.getElementById('addExpireDate').addEventListener('change', (event) => {
        saveSetting('addExpireDate', event.target.checked);
        document.getElementById('expireDateDefault').disabled = !event.target.checked;
    });

    document.getElementById('expireDateDefault').addEventListener('input', (event) => {
        saveSetting('expireDateDefault', parseInt(event.target.value, 10));
    });
});
