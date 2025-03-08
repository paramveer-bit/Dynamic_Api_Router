const routes = [
    { requested: "amazon.in/[id]", forwarded: "http://example.com/[id]" },
    { requested: "amazon.in/user/[userId]/post/[postId]", forwarded: "http://blog.com/u/[userId]/p/[postId]" },
    { requested: "amazon.in/user/profile/[userId]", forwarded: "http://profile.com/user/[userId]" }
];
const matchRoute = (url) => {
    let bestMatch = null;
    let bestRegex = null;
    let bestParams = [];

    for (const route of routes) {
        // Convert stored pattern into regex
        let pattern = "^" + route.requested.replace(/\[.*?\]/g, "([^/]+)") + "$";
        let regex = new RegExp(pattern);
        let match = url.match(regex);
        
        if (match) {
            let keys = [...route.requested.matchAll(/\[(.*?)\]/g)].map(m => m[1]); // Extract parameter names
            let values = match.slice(1); // Extract actual values

            // Store the best matching route
            if (!bestMatch || bestMatch.requested.length < route.requested.length) { 
                bestMatch = route;
                bestRegex = regex;
                bestParams = Object.fromEntries(keys.map((k, i) => [k, values[i]]));
            }
        }
    }

    // If no match found, return null
    if (!bestMatch) return null;

    // Replace placeholders in forwarded URL
    let finalUrl = bestMatch.forwarded;
    for (const [key, value] of Object.entries(bestParams)) {
        finalUrl = finalUrl.replace(`[${key}]`, value);
    }

    return finalUrl;
};

// Example usage
console.log(matchRoute("amazon.in/123")); // http://example.com/123
console.log(matchRoute("amazon.in/user/param")); // http://blog.com/u/42/p/99
console.log(matchRoute("amazon.in/user/profile/88")); // http://profile.com/user/88
