
function executeActionDoubleClick() {
    chrome.storage.local.get("doubleClickDefaultChat", (result) => {
        let param = result["doubleClickDefaultChat"];
        let arg = "";
        if (param?.temporaryChat) {
            arg += "&temporary-chat=true";
        }
        if (param?.model) {
            arg += "&model=" + param.model;
        }
        chrome.tabs.create({ url: "https://chatgpt.com/?" + arg });
    });
}

function executeActionSimpleClick() {
    chrome.storage.local.get("simpleClickDefaultChat", (result) => {
        let param = result["simpleClickDefaultChat"];
        let arg = "";
        if (param?.temporaryChat) {
            arg += "&temporary-chat=true";
        }
        if (param?.model) {
            arg += "&model=" + param.model;
        }
        chrome.tabs.create({ url: "https://chatgpt.com/?" + arg });
    });
}

export function initialize() {
    let clickCount = 0;
    let clickTimeout=null;
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