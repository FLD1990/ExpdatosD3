import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import {
    getDatabase, ref, push, onValue, query, limitToLast, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';

const firebaseConfig = {
    apiKey: "REPLACE_apiKey",
    authDomain: "REPLACE_authDomain",
    databaseURL: "REPLACE_databaseURL",
    projectId: "REPLACE_projectId",
    storageBucket: "REPLACE_storageBucket",
    messagingSenderId: "REPLACE_messagingSenderId",
    appId: "REPLACE_appId"
};

const form = document.getElementById('comment-form');
const nameInput = document.getElementById('c-name');
const messageInput = document.getElementById('c-message');
const submitBtn = document.getElementById('c-submit');
const status = document.getElementById('c-status');
const list = document.getElementById('comments-list');
const empty = document.getElementById('comments-empty');

const isConfigured = !Object.values(firebaseConfig).some(v => String(v).startsWith('REPLACE_'));

function setStatus(text, kind = '') {
    status.textContent = text;
    status.className = 'form-status' + (kind ? ' ' + kind : '');
}

function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

function render(comments) {
    list.innerHTML = '';
    if (!comments.length) {
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');
    comments
        .slice()
        .sort((a, b) => (b.date || 0) - (a.date || 0))
        .forEach(c => {
            const el = document.createElement('article');
            el.className = 'comment';
            el.innerHTML = `
                <div class="comment-author">
                    <span class="comment-name">${escapeHtml(c.name || 'Anónimo')}</span>
                    <time class="comment-date">${formatDate(c.date)}</time>
                </div>
                <p class="comment-text">${escapeHtml(c.message || '')}</p>
            `;
            list.appendChild(el);
        });
}

if (!isConfigured) {
    submitBtn.disabled = true;
    setStatus('⚙️ Pendiente: el dueño del gato debe pegar la config de Firebase en comments.js');
    empty.textContent = 'Los comentarios se activarán en cuanto la base de datos esté conectada. 🐾';
} else {
    try {
        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        const commentsRef = ref(db, 'comments');
        const recentQuery = query(commentsRef, limitToLast(200));

        onValue(recentQuery, snapshot => {
            const data = snapshot.val() || {};
            const arr = Object.values(data);
            render(arr);
        }, err => {
            console.error(err);
            setStatus('No se pudieron cargar los comentarios.', 'error');
        });

        form.addEventListener('submit', async e => {
            e.preventDefault();
            const name = nameInput.value.trim().slice(0, 40);
            const message = messageInput.value.trim().slice(0, 500);
            if (!name || !message) return;

            const last = parseInt(localStorage.getItem('cb-last') || '0', 10);
            if (Date.now() - last < 15_000) {
                setStatus('Espera unos segundos antes de enviar otro mensaje 💛', 'error');
                return;
            }

            submitBtn.disabled = true;
            setStatus('Enviando…');
            try {
                await push(commentsRef, { name, message, date: serverTimestamp() });
                form.reset();
                localStorage.setItem('cb-last', String(Date.now()));
                setStatus('¡Felicitación enviada! 🎉', 'success');
                setTimeout(() => setStatus(''), 3500);
            } catch (err) {
                console.error(err);
                setStatus('Error al enviar. Inténtalo de nuevo.', 'error');
            } finally {
                submitBtn.disabled = false;
            }
        });
    } catch (err) {
        console.error(err);
        setStatus('Error al conectar con la base de datos.', 'error');
        submitBtn.disabled = true;
    }
}
