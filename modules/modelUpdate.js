// Function to fetch the models and store them in chrome.storage.local
function fetchAndStoreModels(accessToken) {
	fetch('https://chatgpt.com/backend-api/models?history_and_training_disabled=false',{
		headers:{
			Authorization:"Bearer "+accessToken
		}
	})
	.then(response => response.json())
	.then(data => {
		if (data.models && Array.isArray(data.models)) {
			const modelsAvailable = data.models.map(model => ({
				slug: model.slug,
				title: model.title
			}));

			// Store the extracted models in chrome.storage.local
			chrome.storage.local.set({ modelsAvailable: modelsAvailable }, () => {
			});
		} else {

		}
	})
	.catch(error => {
		console.error('Error fetching models:', error);
	});
}

export function initialize(){
	window.addEventListener('GPTaccessTokenEvent', function(event) {
		fetchAndStoreModels(event.detail);
	})
}


