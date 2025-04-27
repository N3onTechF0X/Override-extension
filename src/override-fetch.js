(function () {
    let resourcesOverrider = [];
    let textures = {};
    const createPattern = url => new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const overrideSkin = (element, to) => {
        if (!to || to === "default") return;
        if (!textures[element]) {
            console.error(`Cant find ${element}`);
            return;
        }
        const paths = ['object.a3d', 'lightmap.webp', 'tracks.webp', 'wheels.webp', 'object.3ds']
            .map(file => {
                if (file === "tracks.webp" && (to === "LC" || to === "XT")) return null;
                const toFile = (file === "tracks.webp" && to === "GT") ? "wheels.webp" : file;
                return {
                    from: `${textures[element].link}/${file}`,
                    to: `https://raw.githubusercontent.com/N3onTechF0X/TankiTextures/refs/heads/main/${textures[element].type}/${element}/${to}/${toFile}`,
                    comment: `${element} -> ${to} | ${file} -> ${toFile}`,
                    regex: createPattern(`${textures[element].link}/${file}`)
                };
            }).filter(Boolean);
        console.log(`${element} ${to}`);
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
            Object.entries(selections).forEach(([texture, to]) => {
                overrideSkin(texture, to);
            });
            console.groupEnd();
            console.log('[Overrider] Overrides added', resourcesOverrider);
        }
        if (event.data.type && event.data.type === 'GET_ENABLED') {
            if (event.data.enabled) {
                const originalFetch = window.fetch;
                window.fetch = async (url, options) => {
                    const override = resourcesOverrider.find(override => override.regex.test(url));
                    if (override) {
                        try {
                            const requestId = Math.random().toString(36).substring(2);

                            window.postMessage({
                                type: 'CUSTOM_FETCH',
                                requestId,
                                url: override.to
                            }, '*');

                            const blob = await new Promise((resolve, reject) => {
                                const timeout = setTimeout(() => {
                                    reject(new Error('Overrider fetch timeout'));
                                }, 10000);

                                const listener = (event) => {
                                    if (event.data.type === 'CUSTOM_FETCH_RESULT' && event.data.requestId === requestId) {
                                        clearTimeout(timeout);
                                        window.removeEventListener('message', listener);
                                        if (event.data.error) {
                                            reject(new Error(event.data.error));
                                        } else {
                                            resolve(event.data.blob);
                                        }
                                    }
                                };

                                window.addEventListener('message', listener);
                            });
                            console.groupCollapsed(`[Overrider] Resource overridden successfully\n${override.comment}`);
                            console.log(`From: ${override.from}\nTo: ${override.to}`);
                            console.groupEnd();

                            return new Response(blob, {
                                status: 200,
                                statusText: 'OK',
                                headers: {'Content-Type': blob.type}
                            });

                        } catch (error) {
                            console.error(`[Overrider] Error during resource override.\nLink: ${override.to}\nComment: ${override.comment}\nError: ${error}`);
                        }
                    }
                    return await originalFetch(url, options);
                };
            }
        }
    });

})
();
