# 🎂 Web de cumpleaños del gato

Estética Liquid Glass · galería dinámica · comentarios sin login (vía Firebase).

## Setup pendiente: conectar la base de datos (3 minutos)

Para que los visitantes puedan dejar comentarios sin registrarse en GitHub, hace falta una base de datos. Uso **Firebase Realtime Database** porque es gratis para siempre y se monta en clics.

### Pasos

1. **Crear proyecto Firebase** (con tu cuenta de Google):
   👉 https://console.firebase.google.com/
   - *Add project* → nombre cualquiera (p. ej. `cumple-gato`) → desactiva Analytics → *Create*.

2. **Activar la Realtime Database**:
   En el menú lateral: *Build → Realtime Database → Create Database*.
   - Región: la que prefieras (Europa va bien).
   - Reglas: **Start in test mode** → *Enable*.

3. **Registrar la app web**:
   En el icono ⚙️ → *Project settings → General*. Baja a *Your apps* → pulsa el icono `</>` (Web).
   - Apodo: `web` (lo que sea) → *Register app*.
   - Aparece un bloque `firebaseConfig = { ... }` con 7 valores (`apiKey`, `authDomain`, `databaseURL`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`).

4. **Pégame ese bloque entero aquí en el chat** y yo lo dejo cableado en `comments.js`.

> ⚠️ Si no aparece `databaseURL` en el config, vuelve a *Realtime Database* y copia la URL `https://...firebaseio.com` (o `...firebasedatabase.app`) — es esa.

### Reglas de seguridad recomendadas (después)

Test mode caduca a los 30 días. Para que dure para siempre, en *Realtime Database → Rules* pega:

```json
{
  "rules": {
    "comments": {
      ".read": true,
      ".write": "newData.hasChildren(['name','message']) && newData.child('message').isString() && newData.child('message').val().length <= 500 && newData.child('name').val().length <= 40"
    }
  }
}
```

## Estructura

- `index.html` — markup
- `styles.css` — Liquid Glass (aurora animada, glassmorphism, gradientes)
- `gallery.js` — descubre las fotos en `images/` vía la API de GitHub + animaciones
- `comments.js` — comentarios en tiempo real (Firebase Realtime Database)
- `images/` — fotos del gato (cualquier nombre, formato JPG/PNG/WebP/GIF/AVIF/SVG)
