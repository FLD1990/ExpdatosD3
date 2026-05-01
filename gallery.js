(function () {
    'use strict';

    const REPO = 'FLD1990/ExpdatosD3';
    const FOLDER = 'images';
    const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif|svg)$/i;
    const UNSUPPORTED_RE = /\.(heic|heif|tiff?|raw|cr2|nef|arw)$/i;

    const captions = [
        'Esos ojos que lo dicen todo',
        'Modo siesta activado',
        'El trono del salón',
        'Vigilando el reino',
        'El día más especial',
        'Pequeño rey peludo',
        'Mirada de modelo',
        'Pose de campeón',
        'Sueños felinos',
        'Puro amor'
    ];

    const gallery = document.getElementById('gallery');

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

    function render(files) {
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

        gallery.innerHTML = '';
        supported.forEach((file, idx) => {
            const fig = document.createElement('figure');
            fig.className = 'card';
            fig.innerHTML = `
                <img src="${FOLDER}/${encodeURIComponent(file.name)}" alt="Foto ${idx + 1} del cumpleañero" loading="lazy">
                <figcaption>${captions[idx % captions.length]}</figcaption>
            `;
            gallery.appendChild(fig);
        });

        if (unsupported.length > 0) {
            const note = document.createElement('p');
            note.className = 'gallery-status';
            note.textContent = `(${unsupported.length} archivo(s) no compatibles: ${unsupported.map(f => f.name).join(', ')})`;
            gallery.appendChild(note);
        }
    }

    listImages()
        .then(render)
        .catch(err => {
            console.error(err);
            showStatus('No pude cargar la galería. Recarga la página o revisa que el repo sea público.');
        });

    /* ------------------- ANIMATIONS ------------------- */

    // Reveal on scroll
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // Subtle 3D tilt on hero card
    const tiltEl = document.querySelector('[data-tilt]');
    if (tiltEl && window.matchMedia('(hover: hover)').matches) {
        const max = 6;
        tiltEl.addEventListener('mousemove', (e) => {
            const r = tiltEl.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            tiltEl.style.transform = `perspective(1200px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
        });
        tiltEl.addEventListener('mouseleave', () => {
            tiltEl.style.transform = '';
        });
    }

    // Cursor-following blob in the background (extra dynamic touch)
    const aurora = document.querySelector('.aurora');
    if (aurora && window.matchMedia('(hover: hover)').matches) {
        let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
        document.addEventListener('mousemove', e => {
            tx = (e.clientX / window.innerWidth - 0.5) * 30;
            ty = (e.clientY / window.innerHeight - 0.5) * 30;
            if (!raf) {
                raf = requestAnimationFrame(function tick() {
                    cx += (tx - cx) * 0.06;
                    cy += (ty - cy) * 0.06;
                    aurora.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
                    if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
                        raf = requestAnimationFrame(tick);
                    } else {
                        raf = 0;
                    }
                });
            }
        });
    }
})();
