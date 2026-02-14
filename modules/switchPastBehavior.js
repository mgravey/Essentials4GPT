
let isListenerAdded = false;

function handlePaste(event) {
    // Only target textareas (ChatGPT's prompt or edit boxes)
    const target = event.target;
    if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT' && !target.isContentEditable) return;

    const pastedData = (event.clipboardData || window.clipboardData);
    if (!pastedData || !pastedData.types.includes('text/html')) return;

    const htmlContent = pastedData.getData('text/html');
    const textContent = pastedData.getData('text') || pastedData.getData('text/plain');

    // Robust Word/Office detection
    const isFromOffice = /xmlns:o="urn:schemas-microsoft-com:office:office"|ProgId=Word\.Document|xmlns:w="urn:schemas-microsoft-com:office:word"|mso-/i.test(htmlContent);

    if (isFromOffice && textContent && textContent.trim().length > 0) {
        // It's a mixed paste from Word (text + likely images/formatting).
        // We block the default behavior to prevent ChatGPT from picking up the images.
        event.preventDefault();
        event.stopImmediatePropagation();

        // Pass only the plain text to the textarea
        document.execCommand('insertText', false, textContent);
    }
    // If it's from Office but has no text (only image), we let it pass through normally.
}

export function initialize() {
    if (!isListenerAdded) {
        // Use capture phase (true) to intercept the event before ChatGPT's own listeners
        window.addEventListener('paste', handlePaste, true);
        isListenerAdded = true;
    }
}
