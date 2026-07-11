# Stelk AI

Pollant 1.0 (`openai/gpt-oss-20b`) y Olcus 2.1 (`openai/gpt-oss-120b`), ambos Apache 2.0,
servidos en la nube vía Hugging Face Inference Providers a través de una función
serverless de Netlify que oculta tu token.

## 1. Genera un token de Hugging Face NUEVO

El anterior quedó expuesto en un chat, así que ya no es válido/seguro. Crea uno nuevo en
https://huggingface.co/settings/tokens — basta con permisos de lectura ("Make calls to
Inference Providers").

## 2. Despliega en Netlify (necesita Git o CLI, no Netlify Drop)

Netlify Drop solo sirve archivos estáticos: no construye funciones serverless. Usa una
de estas dos vías:

**Opción A — con Git (recomendado):**
1. Sube esta carpeta a un repo de GitHub/GitLab.
2. En Netlify: "Add new site" → "Import an existing project" → conecta el repo.
3. Build command: (vacío) — Publish directory: `.`

**Opción B — con Netlify CLI (sin repo):**
```bash
npm install -g netlify-cli
cd stelk-ai
netlify deploy --prod
```

## 3. Configura la variable de entorno

En el panel de Netlify: **Site settings → Environment variables → Add a variable**
- Key: `HF_TOKEN`
- Value: tu token nuevo de Hugging Face

Vuelve a desplegar (o dispara un "Trigger deploy") para que la función la recoja.

## Estructura

- `index.html` — la interfaz (motores, créditos, chat)
- `netlify/functions/chat.js` — proxy serverless hacia Hugging Face (aquí vive el token)
- `netlify.toml` — configuración de build de Netlify
