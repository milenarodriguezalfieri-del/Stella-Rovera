# Nutrir(se) — Panel de Stella Rovera

Panel para gestionar pacientes y su diario de 21 días (3 etapas de 7 días),
basado en el enfoque de "Nutrir(se): la comida y nuestra historia personal".

## Estructura del proyecto

```
public/
  index.html        → redirige al panel
  panel.html         → login + lista de pacientes (lo que ve la profesional)
  paciente.html       → ficha de una paciente: link + progreso de las 3 etapas
  formulario.html     → lo que ve cada paciente en su link (diario de 3 etapas)
  css/style.css
  js/
    supabaseClient.js → conexión a Supabase (ya tiene tus credenciales)
    stages.js         → contenido de las 3 etapas x 7 días (editable)
    panel.js
    paciente.js
    formulario.js
supabase/
  schema.sql          → esquema de base de datos para correr en Supabase
```

## Paso 1 — Crear la base de datos

1. Entrá a tu proyecto en https://supabase.com/dashboard
2. Menú lateral → **SQL Editor** → **New query**
3. Pegá todo el contenido de `supabase/schema.sql` y hacé clic en **Run**

Esto crea las tablas `patients` y `diary_entries`, y las funciones que permiten
que cada paciente entre a su link sin necesitar una cuenta.

## Paso 2 — Crear el usuario de la nutricionista

El panel (`panel.html`) requiere login. Para crear el usuario de Stella:

1. En Supabase: **Authentication** → **Users** → **Add user** → **Create new user**
2. Cargá su email y una contraseña
3. Con eso ya puede entrar en `panel.html`

Si más adelante querés que otra persona del consultorio también entre al panel,
repetís este paso con su email.

## Paso 3 — Probar localmente

Como el sitio es estático (HTML + JS), alcanza con abrir los archivos con un
servidor simple. Por ejemplo, desde la carpeta `public`:

```bash
npx serve .
```

y entrar a la URL que te muestre (ej: http://localhost:3000/panel.html).

## Paso 4 — Subir a GitHub

```bash
cd stella-rovero
git init
git add .
git commit -m "Panel inicial de Nutrir(se)"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/NOMBRE-DEL-REPO.git
git push -u origin main
```

(Reemplazá `TU-USUARIO/NOMBRE-DEL-REPO` por los datos reales del repositorio
que crees en GitHub.)

## Paso 5 — Publicar el sitio (opcional)

Con GitHub Pages, gratis:

1. En el repositorio de GitHub → **Settings** → **Pages**
2. **Source**: `Deploy from a branch` → rama `main` → carpeta `/public`
3. Guardá. En unos minutos el sitio va a estar en algo como:
   `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/panel.html`

## Cómo editar el contenido de las 3 etapas

Todo el contenido de las consignas está en `public/js/stages.js`, en texto
plano y fácil de editar — no hace falta tocar nada más del código para
cambiar una pregunta.

## Seguridad — a tener en cuenta

- Las pacientes acceden con un link con código, sin login. Cualquiera que
  tenga el link puede escribir en el diario de esa paciente.
- Solo la nutricionista logueada puede ver la lista completa de pacientes
  y sus respuestas.
- Si en el futuro querés agregar más protección (por ejemplo, que el link
  expire, o un PIN adicional), es una mejora que podemos sumar después.
