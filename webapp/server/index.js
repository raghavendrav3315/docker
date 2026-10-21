import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT) || 4000;
const dirname = path.dirname(fileURLToPath(import.meta.url));
const products = [
  {
    id: 1,
    name: 'Everyday Ceramic Mug',
    category: 'Kitchen',
    price: 28,
    rating: 4.9,
    reviews: 124,
    badge: 'Bestseller',
    color: 'Oat',
    image: 'photo-1514228742587-6b1558fcca3d',
  },
  {
    id: 2,
    name: 'Linen Table Runner',
    category: 'Home',
    price: 46,
    rating: 4.8,
    reviews: 86,
    badge: 'Handmade',
    color: 'Natural',
    image: 'photo-1600210492486-724fe5c67fb0',
  },
  {
    id: 3,
    name: 'Ribbed Glass Carafe',
    category: 'Kitchen',
    price: 38,
    rating: 4.9,
    reviews: 52,
    badge: '',
    color: 'Clear',
    image: 'photo-1513558161293-cdaf765edfd7',
  },
  {
    id: 4,
    name: 'Soft Form Throw',
    category: 'Textiles',
    price: 88,
    rating: 5.0,
    reviews: 39,
    badge: 'Limited',
    color: 'Clay',
    image: 'photo-1600210491892-03d54c0aaf87',
  },
  {
    id: 5,
    name: 'Sunday Serving Bowl',
    category: 'Kitchen',
    price: 54,
    rating: 4.8,
    reviews: 71,
    badge: '',
    color: 'Chalk',
    image: 'photo-1610701596007-11502861dcfa',
  },
  {
    id: 6,
    name: 'Woven Market Tote',
    category: 'Accessories',
    price: 42,
    rating: 4.9,
    reviews: 93,
    badge: 'Bestseller',
    color: 'Natural',
    image: 'photo-1590874103328-eac38a683ce7',
  },
  {
    id: 7,
    name: 'Sculpted Bud Vase',
    category: 'Home',
    price: 34,
    rating: 4.7,
    reviews: 48,
    badge: '',
    color: 'Sand',
    image: 'photo-1578500494198-246f612d3b3d',
  },
  {
    id: 8,
    name: 'Cotton Kitchen Towels',
    category: 'Textiles',
    price: 24,
    rating: 4.9,
    reviews: 112,
    badge: 'Set of 2',
    color: 'Olive',
    image: 'photo-1600369671236-e74521d4b6ad',
  },
];

app.use(express.json({ limit: '32kb' }));

app.get('/api/products', (request, response) => {
  const category = request.query.category?.toString();
  const search = request.query.search?.toString().trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesCategory = !category || category === 'All' || product.category === category;
    const matchesSearch = !search || `${product.name} ${product.category} ${product.color}`.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });
  response.json(filtered);
});

app.post('/api/orders', (request, response) => {
  const { items, email } = request.body ?? {};
  if (!Array.isArray(items) || items.length === 0 || typeof email !== 'string' || !email.includes('@')) {
    response.status(400).json({ message: 'Add items to your bag and enter a valid email address.' });
    return;
  }

  const orderItems = items.map((item) => {
    if (!item || typeof item !== 'object') return null;
    const product = products.find((productItem) => productItem.id === Number(item.id));
    const count = Number(item.quantity);
    return product && Number.isInteger(count) && count > 0 && count <= 20
      ? { product, quantity: count }
      : null;
  });
  if (orderItems.some((item) => item === null)) {
    response.status(400).json({ message: 'One or more items in your bag are invalid.' });
    return;
  }

  const total = orderItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  response.status(201).json({
    orderId: `FF-${Date.now().toString(36).toUpperCase()}`,
    total,
    message: 'Your order is confirmed. Thanks for shopping thoughtfully.',
  });
});

app.use(express.static(path.resolve(dirname, '..', 'dist')));
app.get(/.*/, (request, response, next) => {
  if (request.path.startsWith('/api/')) {
    next();
    return;
  }
  response.sendFile(path.resolve(dirname, '..', 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Form & Field server running on port ${port}`);
});
