// mainThread.js

function getAccessToken() {
    const key = Object.keys(document).find(k => k.startsWith("__reactContainer$"));
    if (!key) {
        console.log("React container key not found");
        return null;
    }

    return document[key]?.child?.child?.child?.child?.stateNode?.props?.children?.props?.router?.state?.loaderData?.root.clientBootstrap?.session?.accessToken || null;
}


// Inside the web page or iframe
function propagateToken() {
    let token=getAccessToken();
    if(token)
        window.postMessage({ type: 'GPTaccessToken', message: getAccessToken()}, 'https://chatgpt.com');
    else
        setTimeout(propagateToken,200);
}

propagateToken();

(function() {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
        originalPushState.apply(history, args);
        newUrl(args[2]);
    };
    
    function newUrl(val) {
    	window.postMessage({ type: 'newLocation', message:val }, 'https://chatgpt.com');
    }
})();

