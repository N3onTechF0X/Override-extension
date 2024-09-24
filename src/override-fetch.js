(function() {
    const resourcesParam = new URLSearchParams(window.location.search).get('resources');
    const resourcesURL = resourcesParam ?
        new URL(resourcesParam, window.location.origin).href :
        window.location.hostname === '3dtank.com' ?
        'https://res.3dtank.com' :
        window.location.hostname === 'tankionline.com' ?
        'https://s.eu.tankionline.com' :
        undefined;
    if (!resourcesURL) {
        console.error("[Overrider] Cant find resource server");
        return;
    }
    let resourcesOverrider = [];
    let textures = {};
    const createPattern = url => new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const overrideSkin = (element, from = "default", to = "default") => {
        if (from == to) return;
        if (!textures[element][from]) {
            console.error(`Cant find ${element} ${from}`);
            return;
        }
        if (!textures[element][to]) {
            console.error(`Cant find ${element} ${to}`);
            return;
        }
        const paths = ['object.a3d', 'lightmap.webp', 'tracks.webp', 'wheels.webp', 'meta.info', 'object.3ds'].map(file => ({
            from: `${textures[element][from]}/${file}`,
            to: `${resourcesURL}/${textures[element][to]}/${file}`,
            comment: `${element} ${from} -> ${to} | ${file}`,
            regex: createPattern(`${textures[element][from]}/${file}`)
        }));
        console.log(`${element} from ${from} to ${to}`);
        resourcesOverrider.push(...paths);
    };
    window.addEventListener('message', (event) => {
        if (event.source !== window) return;
        if (event.data.type && event.data.type === 'SET_TEXTURES') {
            textures = event.data.textures;
            console.log('[Overrider] Textures loaded', textures);
        }
        if (event.data.type && event.data.type === 'SET_SELECTIONS') {
            const selections = event.data.selections;
            console.log('[Overrider] Selections loaded', selections)
            console.groupCollapsed("[Overrider] Selected skins to override");
            Object.entries(selections).forEach(([texture, { from, to }]) => {
                overrideSkin(texture, from, to);
            });
            console.groupEnd("[Overrider] Selected skins to override");
            console.log('[Overrider] Overrides added', resourcesOverrider);
        }
        if (event.data.type && event.data.type === 'GET_ENABLED') {
            if (event.data.enabled) {
                const originalFetch = window.fetch;
                window.fetch = async (url, options) => {
                    const override = resourcesOverrider.find(override => override.regex.test(url));
                    if (override) {
                        try {
                            const response = await fetch(override.to, { type: "GET" });
                            if (response.ok) {
                                console.groupCollapsed(`[Overrider] Resource overridden successfully\n${override.comment}`);
                                console.log(`From: ${override.from}\nTo: ${override.to}`);
                                console.groupEnd(`[Overrider] Resource overridden successfully\n${override.comment}`);
                                const blob = await response.blob();
                                return new Response(blob, {
                                    status: 200,
                                    statusText: 'OK',
                                    headers: { 'Content-Type': blob.type }
                                });
                            } else {
                                console.error(`[Overrider] Failed to load resource.\nLink: ${override.to}\nComment: ${override.comment}\nStatus: ${response.status}`);
                            }
                        } catch (error) {
                            console.error(`[Overrider] Error during resource override.\nLink: ${override.to}\nComment: ${override.comment}\nError: ${error}`);
                        }
                    }
                    return await originalFetch(url, options);
                };
            }
        }
    });

})();
