
let textAreaNode = [];

function add2AndCleanAreaNodeList(textArea) {
	//console.log("add2AndCleanAreaNodeList")
	textAreaNode.push(textArea);
	let listPrompt = [...document.querySelectorAll('#prompt-textarea')];
	textAreaNode = textAreaNode.filter(item => listPrompt.includes(item));
}


function switchPromptEnterBehavior(textArea) {
	//console.log("switchPromptEnterBehavior")
	if (!textArea)
		textArea = document.querySelector('#prompt-textarea');
	if (!textArea) {
		setTimeout(switchPromptEnterBehavior, 1000)
		return;
	}
	if (textAreaNode.includes(textArea))
		return;
	textArea.addEventListener('keydown', function (event) {
		if (event.key === 'Enter') {
			const isModKey = (navigator.platform.toUpperCase().indexOf('MAC') >= 0) ? event.metaKey : event.ctrlKey;

			if (isModKey && event.isTrusted) {
				// Send message on Cmd+Enter (Mac) or Ctrl+Enter (Windows)
				setTimeout(function () {
					const sendButton = document.querySelector('button[data-testid="send-button"]');
					if (sendButton) sendButton.click();
				}, 0)
				event.preventDefault();
				return;
			}

			if (!event.shiftKey && event.isTrusted) {
				// For regular Enter, prevent default and send Shift+Enter to force newline
				event.preventDefault();
				textArea.dispatchEvent(new KeyboardEvent('keydown', {
					key: 'Enter',
					code: 'Enter',
					shiftKey: true,
					keyCode: 13,
					which: 13,
					bubbles: true,
					cancelable: false
				}));
			}

			// Shift+Enter will fall through and do the default newline behavior
		}
	}, true);
	add2AndCleanAreaNodeList(textArea);
}

function addEnterForEdit(node, container) {
	//console.log("addEnterForEdit")
	node.addEventListener('keydown', function (event) {
		const isModKey = (navigator.platform.toUpperCase().indexOf('MAC') >= 0) ? event.metaKey : event.ctrlKey;
		if (event.key === 'Enter' && isModKey) {
			const saveButton = container.querySelector('button.btn-primary');
			if (saveButton) saveButton.click();
		}
	})
}

function setObserverOverMain() {
	//console.log("setObserverOverMain")
	// Select the <main> element
	const mainElement = document.querySelector('main');

	// Create a MutationObserver instance
	const observer = new MutationObserver((mutationsList, observer) => {
		for (let mutation of mutationsList) {
			if (mutation.type === 'childList') {
				// Check if a direct child has been added
				mutation.addedNodes.forEach(node => {
					if (node.id == "prompt-textarea")
						switchPromptEnterBehavior(node)
				});
			}
		}
	});

	// Configure the observer to watch for child additions
	const config = { childList: true, subtree: true };

	// Start observing the <main> element
	observer.observe(mainElement, config);
}

function setObserverOverMain4Subtree() {
	// Select the <main> element
	//console.log("setObserverOverMain4Subtree")
	const mainElement = document.querySelector('main');

	// Create a MutationObserver instance
	const observer = new MutationObserver((mutationsList) => {
		//console.log(mutationsList);
		for (let mutation of mutationsList) {
			if (mutation.type === 'childList') {
				// Check if a direct child has been added
				mutation.addedNodes.forEach(node => {
					if (!node || !node.querySelector) return;
					let textBox = node.querySelector(".grid textArea");
					if (textBox) {
						addEnterForEdit(textBox, node)
					}
				});
			}
		}
	});

	// Configure the observer to watch for child additions
	const config = { childList: true, subtree: true };

	// Start observing the <main> element
	observer.observe(mainElement, config);
}

function setObserverOverBody() {
	// Select the <body> element
	const bodyElement = document.body;

	// Create a MutationObserver instance
	const observer = new MutationObserver((mutationsList, observer) => {
		for (let mutation of mutationsList) {
			if (mutation.type === 'childList') {
				mutation.addedNodes.forEach(node => {
					if (node.tagName === 'MAIN' || (node.querySelector && node.querySelector('main'))) {
						// Re-apply the observers after <main> is added/replaced
						setObserverOverMain();
						switchPromptEnterBehavior();
						setObserverOverMain4Subtree();
					}
				});
			}
		}
	});

	// Configure to watch only direct child additions/removals in <body>
	const config = { childList: true };

	// Start observing the <body> element
	observer.observe(bodyElement, config);
}

export function initialize() {

	// Start by checking if <main> already exists and set observers
	if (document.querySelector('main')) {
		setObserverOverMain();
		switchPromptEnterBehavior();
		setObserverOverMain4Subtree();
	}

	// Always start the body observer to catch <main> refreshes
	setObserverOverBody();
}