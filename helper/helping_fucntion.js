function findPathsContaining(root, searchString) {
    const results = [];
    const seen = new WeakSet();

    function search(obj, path) {
        if (typeof obj !== "object" || obj === null || seen.has(obj)) return;
        seen.add(obj);

        for (const key in obj) {
            if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

            try {
                const value = obj[key];
                const newPath = path ? `${path}.${key}` : key;

                // Check if the value is a string and contains the search string
                if (typeof value === "string" && value.includes(searchString)) {
                    results.push(newPath);
                }

                // Recursively search if the value is an object
                if (typeof value === "object") {
                    search(value, newPath);
                }
            } catch (e) {
                // Catch and ignore errors (e.g., security restrictions on properties)
            }
        }
    }

    search(root, "");
    return results;
}