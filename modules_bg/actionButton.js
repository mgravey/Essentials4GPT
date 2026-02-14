
async function executeAction(settingKey) {
    chrome.storage.local.get(settingKey, (result) => {
        const param = result[settingKey];
        if (!param) return;

        let arg = "";
        if (param.temporaryChat) arg += (arg ? "&" : "") + "temporary-chat=true";
        if (param.model) arg += (arg ? "&" : "") + "model=" + param.model;

        // Always open a new tab as per user request
        chrome.tabs.create({ url: "https://chatgpt.com/?" + arg });
    });
}

function executeActionDoubleClick() {
    executeAction("doubleClickDefaultChat");
}

function executeActionSimpleClick() {
    executeAction("simpleClickDefaultChat");
}

export function initialize() {
    let clickCount = 0;
    let clickTimeout = null;
    chrome.action.onClicked.addListener(() => {
        clickCount++;
        if (clickCount === 1) {
            clickTimeout = setTimeout(() => {
                if (clickCount === 1) {
                    executeActionSimpleClick();
                }
                clickCount = 0;
            }, 300);
        } else if (clickCount === 2) {
            clearTimeout(clickTimeout);
            executeActionDoubleClick();
            clickCount = 0;
        }
    });

    console.log('Action button click handler initialized');
}