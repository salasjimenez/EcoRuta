# Desarrollo local

## Requisitos

- Node.js 24 LTS
- npm

## Backend

```bash
cd backend
npm install
npm run start:dev
```

Comprueba que la API esté activa:

```bash
curl http://localhost:3000/api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "ecoruta-api",
  "timestamp": "..."
}
```

## Variables de entorno

El repositorio no genera ni distribuye archivos `.env`. Si necesitas uno para desarrollo local, créalo manualmente en `backend/.env`.

```text
PORT=3000
```

En v2 se documentarán aqui las variables de PostgreSQL.
