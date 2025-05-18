export function initialize() {
	chrome.runtime.onInstalled.addListener(function() {
	    chrome.storage.local.get([
	        'doubleClickDefaultChat', 
	        'simpleClickDefaultChat', 
	        'modelUpdate',
	        'importMaterialsAndSymbole',
	        'conversationHistoryEdit',
	        'switchEnterBehavior',
	        'switchPastBehavior'
	    ], function(items) {
	        const defaults = {
	            doubleClickDefaultChat: items.doubleClickDefaultChat || {
	                temporaryChat: true,
	                //model: "gpt-4o"
	            },
	            simpleClickDefaultChat: items.simpleClickDefaultChat || {
	                temporaryChat: false,
	                //model: "gpt-4o"
	            },
	            modelUpdate: items.modelUpdate !== undefined ? items.modelUpdate : true,
	            importMaterialsAndSymbole: items.importMaterialsAndSymbole !== undefined ? items.importMaterialsAndSymbole : true,
	            conversationHistoryEdit: items.conversationHistoryEdit !== undefined ? items.conversationHistoryEdit : true,
	            switchEnterBehavior: items.switchEnterBehavior !== undefined ? items.switchEnterBehavior : true,
	            switchPastBehavior: items.switchPastBehavior !== undefined ? items.switchPastBehavior : true,
	            addExpireDate: items.addExpireDate !== undefined ? items.addExpireDate : false,
	            addNumberOfRequest: items.addNumberOfRequest !== undefined ? items.addNumberOfRequest : true,
	            expireDateDefault:items.expireDateDefault !== undefined ? items.expireDateDefault : 7,
	            shortcutS2T:items.shortcutS2T !== undefined ? items.shortcutS2T : "Shift+Alt+Space",
	            speech2TextManager:items.speech2TextManager !== undefined ? items.speech2TextManager : true,
	            eventForMode: true,
	            modelsAvailable: items.modelsAvailable || [
	                {slug: 'gpt-4', title: 'GPT-4 (All Tools)'},
	                {slug: 'gpt-4o', title: 'GPT-4o'},
	                {slug: 'gpt-4o-mini', title: 'GPT-4o mini'}
	            ]
	        };
	        chrome.storage.local.set(defaults);
	    });
	});

	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request.action === "getFromStorage") {
			chrome.storage.local.get(request.key, (result) => {
				sendResponse({ data: result[request.key] });
			});
			return true; // Keeps the messaging channel open for the response
		} else if (request.action === "setToStorage") {
			let data = {};
			data[request.key] = request.value;
			chrome.storage.local.set(data, () => {
				sendResponse({ success: true });
			});
			return true;
		}
	});
}