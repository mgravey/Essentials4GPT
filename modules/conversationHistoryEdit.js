let accessToken;

function toogleSelection(event) 
{
	event.preventDefault(); // Prevent the default action
	event.stopPropagation(); // Stop the event from bubbling up

	// Apply or remove peer-checked class for the animation
	event.srcElement.closest('a').classList.toggle('peer-checked');
}

function addCheckboxToElement(element, enableAnimation = true) {
	// Create the checkbox container
	const label = document.createElement('label');
	label.className = 'selectBoxlabel inline-flex items-center cursor-pointer relative';

	const circle = document.createElement('div');
	circle.className = 'checkbox-circle';

	label.appendChild(circle);

	const linkContainer = element;//.querySelector('a.flex.items-center.gap-2.p-2');
	//console.log(element.classList.contains("inEditMode"), linkContainer)
	if ((!element.classList.contains("inEditMode")) && linkContainer && (!linkContainer.querySelector("label"))) {
		// Insert the checkbox at the start of the link container
		linkContainer.insertBefore(label, linkContainer.firstChild);

		// Optionally apply the circle animation
		if (enableAnimation) {
			requestAnimationFrame(() => {
				circle.classList.add('animate-circle');
			});
		} else {
			// Directly apply the final size without animation
			circle.classList.add('animate-circle');
		}

		// Optional: Prevent any click on the link container from propagating
		linkContainer.addEventListener('click', toogleSelection);
		element.classList.add("inEditMode")
	}
}

function removeCheckboxFromElement(element) {
	element.classList.remove("inEditMode")
	const linkContainer = element;

	if (linkContainer) {
		// Find the label containing the checkbox if it exists
		const label = linkContainer.querySelector('.selectBoxlabel');
		if (label) {
			const circle = label.querySelector('.checkbox-circle');

			// Add the shrinking animation class to the circle
			circle.classList.remove('animate-circle');
			// Wait for the animation to complete before removing the label
			setTimeout(() => {
				label.remove();
				
				linkContainer.removeEventListener('click', toogleSelection);;
				element.classList.remove('peer-checked');
			}, 500); // Match the timeout duration with the CSS transition duration
		}
	}
}

let observer=null;

function startEditMode(){

	document.querySelector('#stage-slideover-sidebar').style.width="calc( var(--sidebar-width) * 1.35 )";
	
	let navBarpanel=document.querySelector("nav").closest("div")
	let conversationArray=document.querySelector("#history").querySelectorAll("a")
	navBarpanel.children[0].style.width="100%"
	navBarpanel.classList.add("navPanel")
	navBarpanel.classList.add("expanded")
	// Toggle the 'deployed' class
	document.querySelector("#editMenu").classList.add('deployed');
	conversationArray.forEach(item => addCheckboxToElement(item));

	// Create a MutationObserver instance
	observer = new MutationObserver((mutationsList) => {
		console.log(mutationsList)
		mutationsList.forEach((mutation) => {
			console.log(mutation)
			// Check if the mutation added nodes
			if (mutation.addedNodes.length > 0) {
				document.querySelector("#history").querySelectorAll("a").forEach(item => addCheckboxToElement(item,false));
			}
		});
	});

	// Define the configuration for the observer
	const config = {
		childList: true, // Observe direct children
		subtree: true,   // Observe all descendants, not just direct children
	};

	// Start observing the target node
	observer.observe(document.querySelector("#history"), config);
}

function finishEditMode(){
	let navBarpanel=document.querySelector("nav").closest("div")
	let conversationArray=document.querySelector("#history").querySelectorAll("a")
	navBarpanel.classList.remove("expanded")
	document.querySelector("#editMenu").classList.remove('deployed');
	document.querySelector("#editConversationHistoryButton").classList.remove("inEdit");
	document.querySelector('#stage-slideover-sidebar').style.width="calc( var(--sidebar-width) )";
	conversationArray.forEach(item => removeCheckboxFromElement(item));
	if(observer){
		observer.disconnect();
		observer=null;
	}
}

function addEditMode(){
	console.log("addEditMode try")
	let conversationHistoryHolder=document.querySelector("#history") ||null;
	if(!conversationHistoryHolder)
	{
		setTimeout(addEditMode,200);
		return;
	}

	if(document.querySelector("#editMenu"))
		return;
	//console.log("addEditMode start")
	const span = document.createElement('span');
	span.className = 'material-symbols-outlined editHistoryButton';
	span.textContent = 'edit';
	span.id = 'editConversationHistoryButton';

	span.addEventListener("click",function(e){
		if(span.classList.contains("inEdit")){
			finishEditMode();
		}else{
			span.classList.add("inEdit");
			startEditMode();
		}
		e.stopPropagation();
	})

	conversationHistoryHolder.parentElement.firstChild.append(span);

	let editMenu = document.createElement('div');
	editMenu.className = 'flex flex-row pt-2 sticky justify-around bg-token-bg-elevated-secondary bottom-0 z-100 ';
	editMenu.id = 'editMenu'

	// Function to create a button with text description
	function createButton(iconName, description, colorClass) {
		let container = document.createElement('div');
		container.className = 'flex flex-col items-center ' + colorClass;

		let button = document.createElement('span');
		button.className = 'material-symbols-outlined';
		button.textContent = iconName;

		let text = document.createElement('span');
		text.className = 'text-xs pt-1';
		text.textContent = description;

		container.appendChild(button);
		container.appendChild(text);

		return container;
	}

	// Create the three buttons with descriptions and colors
	let archiveButton = createButton('archive', 'Archive', 'text-green-500');
	let cancelButton = createButton('cancel', 'Cancel', 'text-yellow-500');
	let deleteButton = createButton('delete', 'Delete', 'text-token-text-error');

	// Append the buttons to the editMenu div
	editMenu.appendChild(archiveButton);
	editMenu.appendChild(cancelButton);
	editMenu.appendChild(deleteButton);
	cancelButton.addEventListener("click",finishEditMode)

	archiveButton.addEventListener("click",function(){
		applyOnSelected("archive")
	})
	deleteButton.addEventListener("click",function(){
		applyOnSelected("delete")
	})
	//console.log("addEditMode finish")
	document.querySelector("nav").append(editMenu);//, document.querySelector("#sidebar").lastElementChild);
}

function applyOnSelected(action){

	function doAction(item,action){
		let payload=null;
		if(action=="archive")
			payload=JSON.stringify({ is_archived:true})
		if(action=="delete")
			payload=JSON.stringify({ is_visible: false })
		let coversationID=item.href.split("/").slice(-1)[0];
		//console.log(coversationID)
		fetch('https://chatgpt.com/backend-api/conversation/'+coversationID,{
			method: 'PATCH',
			headers:{
				Authorization:"Bearer "+accessToken,
				'Content-Type': 'application/json' 
			},
			body: payload
		})
		item.classList.add("removed")
		finishEditMode();
	}

	let selectedConversation=document.querySelector("#history").querySelectorAll("a.peer-checked");
	selectedConversation.forEach(item => doAction(item,action))
}

export function initialize(){
	addEditMode();
	
	window.addEventListener('GPTaccessTokenEvent', function(event) {
		accessToken=event.detail;
	});

}

