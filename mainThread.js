// mainThread.js

function getAccessToken() {
    return JSON.parse(
        document.getElementById("client-bootstrap").textContent
    ).session.accessToken || null;
}


// Inside the web page or iframe
function propagateToken() {
    let token = getAccessToken();
    if (token)
        window.postMessage({ type: 'GPTaccessToken', message: getAccessToken() }, 'https://chatgpt.com');
    else
        setTimeout(propagateToken, 200);
}

propagateToken();

(function () {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
        originalPushState.apply(history, args);
        newUrl(args[2]);
    };

    function newUrl(val) {
        window.postMessage({ type: 'newLocation', message: val }, 'https://chatgpt.com');
    }

    // Intercept fetch to override model settings
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const url = args[0] instanceof URL ? args[0].href : (typeof args[0] === 'object' ? args[0].url : args[0]);

        if (typeof url === 'string' && url.includes('/backend-api/settings/user')) {
            const response = await originalFetch.apply(this, args);
            const urlParams = new URLSearchParams(window.location.search);
            const targetModel = urlParams.get('model');

            if (targetModel && response.ok) {
                try {
                    const data = await response.clone().json();
                    if (data.last_used_model_config) {
                        data.last_used_model_config.slugs.web = targetModel;
                        data.last_used_model_config.slugs.default = targetModel;

                        return new Response(JSON.stringify(data), {
                            status: response.status,
                            statusText: response.statusText,
                            headers: response.headers
                        });
                    }
                } catch (e) {
                    console.error("Essentials4GPT: Failed to hijack settings", e);
                }
            }
            return response;
        }
        return originalFetch.apply(this, args);
    };
})();

