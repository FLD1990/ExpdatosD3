(function () {
    'use strict';

    const STORAGE_KEY = 'cat-birthday-comments-v1';
    const form = document.getElementById('comment-form');
    const list = document.getElementById('comments-list');
    const emptyState = document.getElementById('empty-state');
    const nameInput = document.getElementById('name');
    const messageInput = document.getElementById('message');

    function loadComments() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function saveComments(comments) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, (ch) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[ch]));
    }

    function formatDate(iso) {
        const d = new Date(iso);
        return d.toLocaleDateString('es-ES', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function render() {
        const comments = loadComments();
        list.innerHTML = '';

        if (comments.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        emptyState.classList.add('hidden');

        comments.slice().reverse().forEach((c) => {
            const el = document.createElement('article');
            el.className = 'comment';
            el.innerHTML = `
                <div class="comment-author">
                    <span>${escapeHtml(c.name)}</span>
                    <time class="comment-date" datetime="${c.date}">${formatDate(c.date)}</time>
                </div>
                <p class="comment-text">${escapeHtml(c.message)}</p>
            `;
            list.appendChild(el);
        });
    }

    function launchConfetti() {
        const colors = ['#ff6f91', '#cdb4f5', '#ffd6a5', '#b8f2e6', '#ffb3c6'];
        for (let i = 0; i < 30; i++) {
            const piece = document.createElement('span');
            piece.style.cssText = `
                position: fixed;
                top: -10px;
                left: ${Math.random() * 100}vw;
                width: 10px;
                height: 14px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 2px;
                z-index: 9999;
                pointer-events: none;
                transform: rotate(${Math.random() * 360}deg);
                animation: fall ${2 + Math.random() * 2}s linear forwards;
            `;
            document.body.appendChild(piece);
            setTimeout(() => piece.remove(), 4000);
        }
    }

    const styleTag = document.createElement('style');
    styleTag.textContent = `@keyframes fall {
        to { transform: translateY(110vh) rotate(720deg); opacity: 0.8; }
    }`;
    document.head.appendChild(styleTag);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const message = messageInput.value.trim();
        if (!name || !message) return;

        const comments = loadComments();
        comments.push({
            name: name.slice(0, 40),
            message: message.slice(0, 500),
            date: new Date().toISOString()
        });
        saveComments(comments);
        form.reset();
        render();
        launchConfetti();

        document.getElementById('comments-list').scrollIntoView({
            behavior: 'smooth', block: 'nearest'
        });
    });

    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) render();
    });

    render();
})();
