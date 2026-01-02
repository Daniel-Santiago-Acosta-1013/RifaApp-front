# RifaApp Front

Frontend en React + TypeScript + Vite para consumir el backend de RifaApp.

## Requisitos
- Node.js 18+

## Desarrollo local
```
npm install
npm run dev
```

Configura el backend con:
```
VITE_API_BASE_URL=http://localhost:8000/rifaapp
```

## Build
```
npm run build
```

## Deploy
El workflow `deploy.yml` aplica Terraform en el repo de infra (stack frontend),
publica el `dist/` en S3 y crea invalidacion en CloudFront.

Variables necesarias (Actions):
- `AWS_REGION`
- `VITE_API_BASE_URL`
- `INFRA_REPO` (owner/RifaApp-infra)
- `INFRA_REF` (opcional, default `main`)
- `FRONTEND_REF` (opcional, default `main`)

Secrets necesarios:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `INFRA_DISPATCH_TOKEN` (PAT con acceso de lectura al repo infra)
