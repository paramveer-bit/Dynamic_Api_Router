
interface Route {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
    requestUrl: string;
    forwardUrl: string;
    caching: boolean;
    cacheTime: number | null;
    rateLimiting: boolean;
    defaultRate: number | null;
    bannedUser: string[];
}
const matchRoute = (url: string, routes: Route[]): Route | null => {
    let bestMatch = null;
    let bestRegex = null;
    let bestParams: { [k: string]: string } = {};

    for (const route of routes) {
        // Convert stored pattern into regex
        let pattern = "^" + route.requestUrl.replace(/\[.*?\]/g, "([^/]+)") + "$";
        let regex = new RegExp(pattern);
        let match = url.match(regex);

        if (match) {
            let keys = [...route.requestUrl.matchAll(/\[(.*?)\]/g)].map(m => m[1]); // Extract parameter names
            let values = match.slice(1); // Extract actual values

            // Store the best matching route
            if (!bestMatch || bestMatch.requestUrl.length < route.requestUrl.length) {
                bestMatch = route;
                bestRegex = regex;
                bestParams = Object.fromEntries(keys.map((k, i) => [k, values[i]]));
            }
        }
    }

    // If no match found, return null
    if (!bestMatch) return null;

    // Replace placeholders in forwarded URL
    let finalUrl = bestMatch.forwardUrl;
    for (const [key, value] of Object.entries(bestParams)) {
        finalUrl = finalUrl.replace(`[${key}]`, value);
    }

    bestMatch.forwardUrl = finalUrl;

    return bestMatch;
};

export default matchRoute;