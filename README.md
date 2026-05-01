# 🎂 Web de cumpleaños del gato

Web estática con galería de fotos y comentarios compartidos vía giscus.

## Pasos para que funcione (en orden)

### 1. Subir las 5 fotos
👉 https://github.com/FLD1990/ExpdatosD3/upload/claude/cat-birthday-website-XcK80/images

Renómbralas a `cat-1.jpg`, `cat-2.jpg`, `cat-3.jpg`, `cat-4.jpg`, `cat-5.jpg` y arrástralas. Pulsa **Commit changes**.

### 2. Activar Discussions
👉 https://github.com/FLD1990/ExpdatosD3/settings#features

Baja a la sección **Features** y marca la casilla **Discussions**.

### 3. Instalar la app de giscus
👉 https://github.com/apps/giscus/installations/select_target

Elige tu cuenta → **Only select repositories** → marca `ExpdatosD3` → **Install**.

### 4. Conseguir el `category-id` que falta
👉 https://giscus.app

- En **Repository** escribe: `FLD1990/ExpdatosD3`
- Verás ✅ verde si los pasos 2 y 3 están bien.
- En **Discussion Category** elige **Announcements**.
- Baja hasta el bloque `<script src="https://giscus.app/client.js" ...>` y copia solo el valor de `data-category-id` (algo tipo `DIC_kwDO...`).
- Pégalo en `index.html` reemplazando `PEGA_AQUI_TU_CATEGORY_ID`.

### 5. Activar GitHub Pages
👉 https://github.com/FLD1990/ExpdatosD3/settings/pages

- **Source**: *Deploy from a branch*
- **Branch**: `main` (haz merge de la rama antes) o la rama actual `claude/cat-birthday-website-XcK80`
- **Folder**: `/ (root)` → **Save**

En 1-2 minutos la web estará en:
👉 https://fld1990.github.io/ExpdatosD3/

## Estructura

- `index.html` — página principal (giscus integrado)
- `styles.css` — estilos festivos
- `images/` — fotos del gato

## Avisarme cuando hayas hecho los pasos

Si me dices el `category-id` del paso 4, lo pego yo por ti y lo dejo todo listo.
