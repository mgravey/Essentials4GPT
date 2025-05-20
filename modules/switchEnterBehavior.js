
let textAreaNode=[];

function add2AndCleanAreaNodeList(textArea){
	//console.log("add2AndCleanAreaNodeList")
	textAreaNode.push(textArea);
	let listPrompt=[...document.querySelectorAll('#prompt-textarea')];
	textAreaNode = textAreaNode.filter(item => listPrompt.includes(item));
}


function switchPromptEnterBehavior(textArea){
	//console.log("switchPromptEnterBehavior")
	if(!textArea)
		textArea=document.querySelector('#prompt-textarea');
	if(!textArea) {
		setTimeout(switchPromptEnterBehavior,1000)
		return;	
	}
	if(textAreaNode.includes(textArea))
		return;
	textArea.addEventListener('keydown', function(event) {
		if (event.key === 'Enter') {
			if (event.shiftKey && event.isTrusted) {
				setTimeout(function(){
					document.querySelector('button[data-testid="send-button"]').click();
				},0)
				event.preventDefault();
				return;
			}
			if(event.isTrusted){
				//event.stopImmediatePropagation(); // Handle Enter key press
				event.preventDefault();
				textArea.dispatchEvent(new KeyboardEvent('keydown', {
					key: 'Enter',
					code: 'Enter',
					shiftKey:true,
					keyCode: 13,
					which: 13,
					bubbles: true,
					cancelable: false,
					detail:"test"
				}));
			}
		}
	},true);
	add2AndCleanAreaNodeList(textArea);
}

function addEnterForEdit(node,container){
	//console.log("addEnterForEdit")
	node.addEventListener('keydown',function(event){
		if (event.key === 'Enter' && event.shiftKey) {
			container.querySelector('button.btn-primary').click();
		}
	})
}

function setObserverOverMain(){
	//console.log("setObserverOverMain")
	// Select the <main> element
	const mainElement = document.querySelector('main');

	// Create a MutationObserver instance
	const observer = new MutationObserver((mutationsList, observer) => {
		for (let mutation of mutationsList) {
			if (mutation.type === 'childList') {
			// Check if a direct child has been added
				mutation.addedNodes.forEach(node => {
					if (node.id=="prompt-textarea")
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

function setObserverOverMain4Subtree(){
	// Select the <main> element
	//console.log("setObserverOverMain4Subtree")
	const mainElement = document.querySelector('main');

	// Create a MutationObserver instance
	const observer = new MutationObserver((mutationsList, observer) => {
		//console.log(mutationsList);
		for (let mutation of mutationsList) {
			if (mutation.type === 'childList') {
			// Check if a direct child has been added
				mutation.addedNodes.forEach(node => {
					if(!node || !node.querySelector) return;
					let textBox=node.querySelector(".grid textArea");
					if (textBox) { 
						addEnterForEdit(textBox,node)
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

export function initialize(){
	setObserverOverMain();
	switchPromptEnterBehavior();
	setObserverOverMain4Subtree();
}