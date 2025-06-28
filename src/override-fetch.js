(() => {
    let resourcesOverrider = [];
    let textures = {};
    const getResourceID = path => {
        const parts = path.replace(/^\/|\/$/g, '').split('/');
        if (parts.length !== 4)
            console.error(`Invalid path format "${path}": expected 4 parts (without version)`);

        const high = parseInt(parts[0], 8);
        const part1 = parseInt(parts[1], 8);
        const part2 = parseInt(parts[2], 8);
        const part3 = parseInt(parts[3], 8);

        const low = ((part1 << 16) | (part2 << 8) | part3) >>> 0;
        return ((BigInt(high) << 32n) | BigInt(low)).toString();
    };
    const overrideSkin = (element, skin) => {
        if (!skin || skin === "default") return;
        if (!textures[element]) {
            console.error(`Cant find ${element}`);
            return;
        }
        const overrides = ['object.a3d', 'lightmap.webp', 'tracks.webp', 'wheels.webp', 'object.3ds']
            .map(file => {
                if (file === "tracks.webp" && (skin === "LC" || skin === "XT")) return null;
                const toFile = (file === "tracks.webp" && skin === "GT") ? "wheels.webp" : file;
                return {
                    id: textures[element].id,
                    file,
                    link: `https://raw.githubusercontent.com/N3onTechF0X/TankiTextures/refs/heads/main/${textures[element].type}/${element}/${skin}/${toFile}`,
                    comment: `${element} -> ${skin} | ${file} -> ${toFile}`
                };
            }).filter(Boolean);
        console.log(`${element} ${skin}`);
        resourcesOverrider.push(...overrides);
    };
    const matchUrl = url => {
        const [, path, file] = url.match(/(\d+\/\d+\/\d+\/\d+)\/[^\/]+\/([^\/]+)$/) || [];
        if (!path || !file)
            return;
        const id = getResourceID(path);
        return resourcesOverrider.find(override =>
            override.id === id &&
            override.file === file
        );
    };
    const overrideFetch = ()=>{
        const originalFetch = window.fetch;
        window.fetch = async (url, options) => {
            const override = matchUrl(url);
            if (!override)
                return await originalFetch(url, options);

            try {
                const requestId = Math.random().toString(36).substring(2);
                window.postMessage({
                    type: 'CUSTOM_FETCH',
                    requestId,
                    url: override.link
                }, '*');

                const blob = await new Promise((resolve, reject) => {
                    const timeout = setTimeout(()=>{
                        reject(new Error('Overrider fetch timeout'));
                    }, 10000);
                    const listener = event => {
                        if (event.data.type !== 'CUSTOM_FETCH_RESULT' || event.data.requestId !== requestId)
                            return;
                        clearTimeout(timeout);
                        window.removeEventListener('message', listener);
                        if (event.data.error) reject(new Error(event.data.error));
                        else resolve(event.data.blob);
                    };
                    window.addEventListener('message', listener);
                });
                console.groupCollapsed(`[Overrider] Resource overridden successfully\n${override.comment}`);
                console.log(`ID: ${override.id}\nLink: ${override.link}`);
                console.groupEnd();

                return new Response(blob, {
                    status: 200,
                    statusText: 'OK',
                    headers: {'Content-Type': blob.type}
                });

            } catch (error) {
                console.error(`[Overrider] Error during resource override.\nID: ${override.id}\nLink: ${override.link}\nComment: ${override.comment}\nError: ${error}`);
            }
        };
    };
    window.addEventListener('message', event => {
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
        if (event.data.type && event.data.type === 'GET_ENABLED' && event.data.enabled)
            overrideFetch()
    });
})();
