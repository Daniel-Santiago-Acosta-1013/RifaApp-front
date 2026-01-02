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
El workflow `deploy.yml` publica el `dist/` en S3 y crea invalidacion en CloudFront.
Variables necesarias (Actions):
- `AWS_REGION`
- `FRONTEND_BUCKET`
- `CLOUDFRONT_DISTRIBUTION_ID`
- `VITE_API_BASE_URL`

Secrets necesarios:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
