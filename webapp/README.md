# Form & Field

A responsive React storefront backed by a small Node.js and Express API.

## Run locally

```sh
npm install
npm run dev
```

The Vite storefront runs at `http://localhost:5173`; the API runs at `http://localhost:4000`.

## Production

```sh
npm run build
npm start
```

The production server serves the built storefront and API on port `4000`. Set `PORT` to change the server port.

## Docker

```sh
docker build -t form-and-field .
docker run --rm -p 4000:4000 form-and-field
```

Product catalog and order endpoints are `GET /api/products` and `POST /api/orders`. Orders are demo-only and are not persisted or sent to a payment provider.
