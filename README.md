# 🎂 Web de cumpleaños del gato

Una web estática y festiva con galería de fotos y zona de felicitaciones.

## Estructura

- `index.html` — página principal
- `styles.css` — estilos (tema cumpleaños con globos, tarta y confeti)
- `script.js` — sistema de comentarios (guardado en `localStorage`)
- `images/` — aquí van las fotos del gato (`cat-1.jpg` … `cat-5.jpg`)

## Antes de desplegar: subir las fotos

Copia las 5 fotos a la carpeta `images/` con los nombres `cat-1.jpg`, `cat-2.jpg`, `cat-3.jpg`, `cat-4.jpg`, `cat-5.jpg`. Mira `images/README.md` para más detalle.

## Desplegar con GitHub Pages

1. Ve a la pestaña **Settings** del repositorio en GitHub.
2. En el menú lateral, abre **Pages**.
3. En **Source** elige **Deploy from a branch**.
4. Branch: selecciona la rama (`main` cuando hagas merge, o la rama actual) y carpeta `/ (root)`. Pulsa **Save**.
5. Espera 1-2 minutos. Tu web estará en `https://<tu-usuario>.github.io/<nombre-repo>/`.

## Sobre los comentarios

Los comentarios se guardan en el navegador del visitante (`localStorage`). Cada persona ve los suyos. Es la opción sin servidor más simple. Si quieres comentarios compartidos por todos los visitantes, una opción es integrar [giscus](https://giscus.app) (usa GitHub Discussions): se sustituye el formulario por su script con tu repo configurado.

---

(Repo original: ejercicios D3. Ver carpetas `Practica 1 (D3)` y `Practica 3 (D3)`.)
