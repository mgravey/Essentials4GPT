// main.js

let modulesToLoad = [
    'modelUpdate',
    'importMaterialsAndSymbole',
    'conversationHistoryEdit',
    'switchEnterBehavior',
    'switchPastBehavior',
    'speech2TextManager'
];

// Load all relevant settings from storage
chrome.storage.local.get(modulesToLoad, function (items) {
    for (let i = 0; i < modulesToLoad.length; i++) {
        const moduleName = modulesToLoad[i];

        // Check if the module is enabled (i.e., true) before loading
        if (items[moduleName]) {
            import('./modules/' + moduleName + '.js')
                .then(module => {
                    if (module.initialize) {
                        module.initialize();
                        //console.log(moduleName)
                    }
                })
                .catch(err => {
                    console.error('Error loading ' + moduleName + ':', err);
                });
        }
    }
});

let GPTaccessToken = null;

function broadcastGPTaccessToken(token) {
    window.dispatchEvent(new CustomEvent('GPTaccessTokenEvent', {
        detail: token
    }));
}

window.addEventListener('getGPTaccessToken', function (event) {
    broadcastGPTaccessToken(GPTaccessToken);
})


window.addEventListener('message', function (event) {
    if (event.origin !== "https://chatgpt.com") return;

    if (event.data.type === 'GPTaccessToken') {
        GPTaccessToken = event.data.message;
        setTimeout(function () {
            broadcastGPTaccessToken(event.data.message)
        }, 100)
    }

    if (event.data.type === 'newLocation') {
        window.dispatchEvent(new CustomEvent('newLocationEvent', {
            detail: event.data.message
        }));
    }
});

