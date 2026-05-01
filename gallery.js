(function () {
    'use strict';

    const REPO = 'FLD1990/ExpdatosD3';
    const FOLDER = 'images';
    const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif|svg)$/i;
    const UNSUPPORTED_RE = /\.(heic|heif|tiff?|raw|cr2|nef|arw)$/i;

    const gallery = document.getElementById('gallery');
    const heroBgImg = document.getElementById('hero-bg-img');
    const heroPortrait = document.getElementById('hero-portrait');
    const heroStack = document.getElementById('hero-portrait-stack');

    /* ----------- IMAGE DISCOVERY ------------ */

    async function fetchFolder(ref) {
        const url = `https://api.github.com/repos/${REPO}/contents/${FOLDER}?ref=${encodeURIComponent(ref)}`;
        const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    }

    async function listImages() {
        const branches = ['main', 'claude/cat-birthday-website-XcK80'];
        let lastErr;
        for (const ref of branches) {
            try {
                const items = await fetchFolder(ref);
                const files = Array.isArray(items) ? items.filter(it => it.type === 'file') : [];
                if (files.length > 0) return files;
            } catch (e) { lastErr = e; }
        }
        if (lastErr) throw lastErr;
        return [];
    }

    function showStatus(text) {
        gallery.innerHTML = `<p class="gallery-status">${text}</p>`;
    }

    /* ----------- HERO BACKGROUND ------------ */

    function setHeroBg(url) {
        if (!url) return;
        const test = new Image();
        test.onload = () => {
            heroBgImg.style.backgroundImage = `url("${url}")`;
            heroBgImg.classList.add('loaded');
        };
        test.src = url;
    }

    function startPortraitSlideshow(urls) {
        if (!heroStack || !urls.length) return;
        heroStack.innerHTML = '';
        urls.forEach(u => {
            const img = document.createElement('img');
            img.src = u;
            img.alt = '';
            heroStack.appendChild(img);
        });
        const imgs = Array.from(heroStack.children);
        let idx = 0;
        imgs[idx].classList.add('active');
        heroStack.classList.add('loaded');

        if (imgs.length < 2) return;
        setInterval(() => {
            const prev = idx;
            idx = (idx + 1) % imgs.length;
            imgs[idx].classList.add('active');
            // remove .active from prev after the crossfade so the
            // ken-burns animation restarts cleanly on the new image
            setTimeout(() => imgs[prev].classList.remove('active'), 1400);
            // sync background blur
            setHeroBg(imgs[idx].src);
        }, 4200);
    }

    /* ----------- FAST-FRAME LOADING ------------ */

    function preloadAll(urls) {
        return Promise.all(urls.map(u => new Promise(res => {
            const img = new Image();
            img.onload = img.onerror = () => res();
            img.src = u;
        })));
    }

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function buildCard(idx, total, urls, finalUrl) {
        const fig = document.createElement('figure');
        fig.className = 'card flickering';
        fig.style.animationDelay = `${0.04 * idx}s`;

        const final = document.createElement('img');
        final.className = 'final';
        final.alt = 'Foto de Jarana';
        final.loading = 'lazy';
        final.src = finalUrl;

        const frame = document.createElement('img');
        frame.className = 'frame active';
        frame.alt = '';
        frame.src = urls[idx % urls.length];

        fig.appendChild(frame);
        fig.appendChild(final);

        // Schedule fast-frame flicker
        const sequence = shuffle(urls);
        let i = 0;
        const startDelay = 350 + idx * 70;        // staggered start
        const flickers = 6 + Math.floor(Math.random() * 4); // 6-9 frames
        const interval = 75;

        setTimeout(() => {
            fig.classList.add('in');
            const tick = setInterval(() => {
                i++;
                if (i >= flickers) {
                    clearInterval(tick);
                    final.classList.add('shown');
                    setTimeout(() => {
                        frame.remove();
                        fig.classList.remove('flickering');
                    }, 700);
                    return;
                }
                frame.src = sequence[i % sequence.length];
            }, interval);
        }, startDelay);

        return fig;
    }

    function renderGallery(files) {
        const supported = files.filter(f => IMAGE_RE.test(f.name));
        const unsupported = files.filter(f => UNSUPPORTED_RE.test(f.name));

        if (supported.length === 0) {
            if (unsupported.length > 0) {
                showStatus(`Encontré ${unsupported.length} foto(s) en formato no compatible (${unsupported.map(f => f.name.split('.').pop().toUpperCase()).join(', ')}). Conviértelas a JPG o PNG. 🙏`);
            } else {
                showStatus('Aún no hay fotos en /images. Súbelas y recarga. 🐾');
            }
            return;
        }

        const urls = supported.map(f => `${FOLDER}/${encodeURIComponent(f.name)}`);

        // Hero portrait cycles through every photo (Ken-Burns + crossfade)
        setHeroBg(urls[0]);
        startPortraitSlideshow(urls);

        // Wait for all to preload before flicker so frames change crisply
        gallery.innerHTML = '';
        preloadAll(urls).then(() => {
            urls.forEach((finalUrl, idx) => {
                const card = buildCard(idx, urls.length, urls, finalUrl);
                gallery.appendChild(card);
            });
        });

        if (unsupported.length > 0) {
            const note = document.createElement('p');
            note.className = 'gallery-status';
            note.textContent = `(${unsupported.length} archivo(s) no compatibles: ${unsupported.map(f => f.name).join(', ')})`;
            gallery.appendChild(note);
        }
    }

    listImages()
        .then(renderGallery)
        .catch(err => {
            console.error(err);
            showStatus('No pude cargar la galería. Recarga la página o revisa que el repo sea público.');
        });

    /* ----------- ANIMATIONS ------------ */

    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // Cursor-tracked parallax on hero background
    if (heroBgImg && window.matchMedia('(hover: hover)').matches) {
        let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
        document.addEventListener('mousemove', e => {
            tx = (e.clientX / window.innerWidth - 0.5) * 18;
            ty = (e.clientY / window.innerHeight - 0.5) * 18;
            if (!raf) {
                raf = requestAnimationFrame(function tick() {
                    cx += (tx - cx) * 0.05;
                    cy += (ty - cy) * 0.05;
                    heroBgImg.style.transform = `scale(1.18) translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
                    if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
                        raf = requestAnimationFrame(tick);
                    } else {
                        raf = 0;
                    }
                });
            }
        });
    }

    /* ----------- CELEBRATION ------------ */

    const celebration = document.getElementById('celebration');
    const confettiBox = document.getElementById('celebration-confetti');
    const COLORS = ['#ff5fa2', '#8b6cff', '#38d6ff', '#ffd66b', '#ffffff', '#ff8acc'];
    let lastCelebrate = 0;

    function spawnConfetti(count = 60) {
        confettiBox.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const piece = document.createElement('span');
            piece.className = 'confetti-piece';
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
            const distance = 200 + Math.random() * 280;
            const vx = Math.cos(angle) * distance;
            const vy = Math.sin(angle) * distance - 80;
            piece.style.setProperty('--vx', `${vx}px`);
            piece.style.setProperty('--vy', `${vy}px`);
            piece.style.background = COLORS[i % COLORS.length];
            piece.style.animationDelay = `${Math.random() * 0.15}s`;
            confettiBox.appendChild(piece);
        }
        for (let i = 0; i < 12; i++) {
            const heart = document.createElement('span');
            heart.className = 'heart-piece';
            heart.textContent = ['💛', '💗', '💜', '💙', '✨'][i % 5];
            heart.style.setProperty('--hx', `${(Math.random() - 0.5) * 80}vw`);
            heart.style.animationDelay = `${0.1 + Math.random() * 0.6}s`;
            heart.style.fontSize = `${1.2 + Math.random() * 1.4}rem`;
            confettiBox.appendChild(heart);
        }
    }

    function celebrate() {
        const now = Date.now();
        if (now - lastCelebrate < 4000) return;
        lastCelebrate = now;
        spawnConfetti(70);
        celebration.classList.remove('active');
        // force reflow so animation restarts
        void celebration.offsetWidth;
        celebration.classList.add('active');
        setTimeout(() => celebration.classList.remove('active'), 3200);
    }

    // Test trigger via URL: ?celebrar=1
    if (/[?&]celebrar=1/.test(location.search)) {
        setTimeout(celebrate, 800);
    }

    // Listen to Cusdis iframe events
    window.addEventListener('message', (event) => {
        if (!event.origin.includes('cusdis.com')) return;
        const d = event.data;
        const text = typeof d === 'string' ? d : JSON.stringify(d || '');
        // Cusdis emits various messages; we trigger on anything that looks
        // like a successful comment creation.
        if (/created|submit|posted|approved|success/i.test(text)) {
            celebrate();
        }
    });

    // Heuristic fallback: detect when the cusdis iframe grows in height
    // shortly after a click inside it. This catches the "submitted" UI
    // even if Cusdis doesn't emit a clear event.
    const cusdisRoot = document.getElementById('cusdis_thread');
    if (cusdisRoot) {
        let interactedAt = 0;
        let lastHeight = 0;
        cusdisRoot.addEventListener('mousedown', () => { interactedAt = Date.now(); });
        const ro = new ResizeObserver(entries => {
            for (const entry of entries) {
                const h = entry.contentRect.height;
                const grew = h > lastHeight + 30;
                const recentlyInteracted = Date.now() - interactedAt < 8000;
                if (grew && recentlyInteracted && lastHeight > 0) {
                    celebrate();
                    interactedAt = 0;
                }
                lastHeight = h;
            }
        });
        ro.observe(cusdisRoot);
    }
})();
