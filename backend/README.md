# Backend (Express + SQLite)

Run locally:

1. Install

cd backend
npm install

2. Start

npm run start

API endpoints

- GET /api/products
- GET /api/products/search?name=<query>
- POST /api/products/import (multipart/form-data, field name: file)
- GET /api/products/export
- PUT /api/products/:id
- GET /api/products/:id/history
