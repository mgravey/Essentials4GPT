let textAreaNode=[];

function add2AndCleanAreaNodeList(textArea){
    textAreaNode.push(textArea);
    let listPrompt=[...document.querySelectorAll('#prompt-textarea')];
    textAreaNode = textAreaNode.filter(item => listPrompt.includes(item));
}


function switchPromptPastBehavior(textArea){
    if(!textArea)
        textArea=document.querySelector('#prompt-textarea');
    if(!textArea) {
        setTimeout(switchPromptPastBehavior,1000)
        return; 
    }
    if(textAreaNode.includes(textArea))
        return;
    textArea.addEventListener('paste', function(event) {
        // Get the pasted data
        let pastedData = (event.clipboardData || window.clipboardData)//.getData('text');    
        // Optionally, you can prevent the default paste action
        
        if( pastedData.types.includes('text/html')){
            const htmlContent = pastedData.getData('text/html');
            // Check for common Microsoft Office markers
            const isFromOffice = /xmlns:o="urn:schemas-microsoft-com:office:office"|ProgId=Word\.Document|xmlns:w="urn:schemas-microsoft-com:office:word"/.test(htmlContent);
            if (isFromOffice) {
                //console.log("from office")
                document.execCommand('insertText', false, pastedData.getData('text'));
                event.preventDefault()
                event.stopImmediatePropagation();            
            }
        }        
    },true);
    add2AndCleanAreaNodeList(textArea);
}

function setObserverOverMain(){
    // Select the <main> element
    const mainElement = document.querySelector('main');

    // Create a MutationObserver instance
    const observer = new MutationObserver((mutationsList, observer) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
            // Check if a direct child has been added
                mutation.addedNodes.forEach(node => {
                    if (node.id=="prompt-textarea")
                        switchPromptPastBehavior(node)
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
    switchPromptPastBehavior();
}
