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
    const status = document.getElementById('gallery-status');

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
                const files = Array.isArray(items) ? items.filter((it) => it.type === 'file') : [];
                if (files.length > 0) return files;
            } catch (e) {
                lastErr = e;
            }
        }
        if (lastErr) throw lastErr;
        return [];
    }

    function render(files) {
        const supported = files.filter((f) => IMAGE_RE.test(f.name));
        const unsupported = files.filter((f) => UNSUPPORTED_RE.test(f.name));

        gallery.innerHTML = '';

        if (supported.length === 0) {
            const msg = document.createElement('p');
            msg.className = 'gallery-status';
            if (unsupported.length > 0) {
                msg.innerHTML = `Encontré ${unsupported.length} foto(s) en formato no compatible con navegadores (${unsupported.map(f => f.name.split('.').pop().toUpperCase()).join(', ')}). Conviértelas a JPG o PNG. 🙏`;
            } else {
                msg.textContent = 'Aún no hay fotos en la carpeta /images. Súbelas y recarga la página. 🐾';
            }
            gallery.appendChild(msg);
            return;
        }

        supported.forEach((file, idx) => {
            const fig = document.createElement('figure');
            fig.className = 'card';
            const img = document.createElement('img');
            img.src = `${FOLDER}/${file.name}`;
            img.alt = `Foto ${idx + 1} del cumpleañero`;
            img.loading = 'lazy';
            const cap = document.createElement('figcaption');
            cap.textContent = captions[idx % captions.length];
            fig.appendChild(img);
            fig.appendChild(cap);
            gallery.appendChild(fig);
        });

        if (unsupported.length > 0) {
            const note = document.createElement('p');
            note.className = 'gallery-status';
            note.style.gridColumn = '1 / -1';
            note.textContent = `(${unsupported.length} archivo(s) en formato no compatible no se pueden mostrar en navegadores: ${unsupported.map(f => f.name).join(', ')})`;
            gallery.appendChild(note);
        }
    }

    listImages()
        .then(render)
        .catch((err) => {
            status.textContent = 'No pude cargar la galería. Recarga la página o revisa que el repo sea público.';
            console.error(err);
        });
})();
