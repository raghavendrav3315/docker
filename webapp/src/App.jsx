import { useEffect, useMemo, useState } from 'react';

const categories = ['All', 'Home', 'Kitchen', 'Textiles', 'Accessories'];
const imageUrl = (photo, width = 720) => `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=85`;
const money = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

function Icon({ name, size = 20, ...props }) {
  const shared = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', ...props };
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bag: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    heart: <path d="M20.8 8.7c0 4.5-8.8 10-8.8 10s-8.8-5.5-8.8-10a4.6 4.6 0 0 1 8.8-1.8 4.6 4.6 0 0 1 8.8 1.8Z" />,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    minus: <path d="M5 12h14" />,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg {...shared} aria-hidden="true">{paths[name]}</svg>;
}

function App() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [saved, setSaved] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== 'All') params.set('category', activeCategory);
    if (search.trim()) params.set('search', search.trim());
    fetch(`/api/products?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Could not load products.');
        return response.json();
      })
      .then(setProducts)
      .catch((error) => {
        if (error.name !== 'AbortError') setNotice(error.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [activeCategory, search]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(''), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  function addToCart(product) {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id);
      return existing
        ? items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...items, { ...product, quantity: 1 }];
    });
    setNotice(`${product.name} added to your bag`);
  }

  function updateQuantity(productId, difference) {
    setCart((items) => items
      .map((item) => item.id === productId ? { ...item, quantity: item.quantity + difference } : item)
      .filter((item) => item.quantity > 0));
  }

  async function checkout(event) {
    event.preventDefault();
    setCheckoutLoading(true);
    setCheckoutMessage('');
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, items: cart.map(({ id, quantity }) => ({ id, quantity })) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to place your order.');
      setCheckoutMessage(`${result.message} Order ${result.orderId}`);
      setCart([]);
      setEmail('');
    } catch (error) {
      setCheckoutMessage(error.message);
    } finally {
      setCheckoutLoading(false);
    }
  }

  function toggleSaved(productId) {
    setSaved((items) => items.includes(productId) ? items.filter((id) => id !== productId) : [...items, productId]);
  }

  function jumpToShop() {
    document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="site-shell">
      <div className="announcement">A little more considered. A little less ordinary. <span>Free shipping on orders over $100</span></div>
      <header className="site-header">
        <button className="icon-button menu-trigger" aria-label="Open menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Icon name="menu" /></button>
        <nav className={`main-nav ${mobileMenuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
          <a href="#shop" onClick={() => setMobileMenuOpen(false)}>Shop all</a>
          <a href="#story" onClick={() => setMobileMenuOpen(false)}>Our story</a>
          <a href="#journal" onClick={() => setMobileMenuOpen(false)}>Journal</a>
        </nav>
        <a className="wordmark" href="#" aria-label="Form and Field home"><span>FORM <i>&</i> FIELD</span><small>GOODS FOR SLOWER LIVING</small></a>
        <div className="header-actions">
          <label className="search-box">
            <Icon name="search" size={18} />
            <input aria-label="Search products" placeholder="Search" value={search} onChange={(event) => { setSearch(event.target.value); document.getElementById('shop').scrollIntoView({ behavior: 'smooth' }); }} />
          </label>
          <button className="icon-button saved-trigger" aria-label={`Saved items: ${saved.length}`} onClick={() => { setActiveCategory('All'); setSearch(''); setNotice(saved.length ? `You have ${saved.length} saved item${saved.length === 1 ? '' : 's'}` : 'Tap a heart to save a favorite'); }}><Icon name="heart" /></button>
          <button className="icon-button bag-trigger" aria-label={`Open shopping bag, ${cartCount} items`} onClick={() => setCartOpen(true)}><Icon name="bag" /><span className="bag-count">{cartCount}</span></button>
        </div>
      </header>

      <main>
        <section className="hero">
          <img className="hero-image" src={imageUrl('photo-1600210492486-724fe5c67fb0', 1800)} alt="Sunlit, warm-toned living room with natural materials" />
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow light-eyebrow"><span /> MADE FOR THE EVERYDAY</p>
            <h1>Make room<br />for <em>meaning.</em></h1>
            <p className="hero-copy">Thoughtful pieces for the spaces you live in<br className="desktop-break" /> and the moments you want to keep.</p>
            <button className="button button-light" onClick={jumpToShop}>Shop the collection <Icon name="arrow" size={17} /></button>
          </div>
          <div className="hero-caption"><span>01 / 03</span><span>THE SLOW LIVING EDIT</span></div>
        </section>

        <section className="benefits" aria-label="Our promises">
          <div><span className="benefit-mark">✳</span><p>Made with intention</p></div>
          <div><span className="benefit-mark">⌂</span><p>Natural, honest materials</p></div>
          <div><span className="benefit-mark">↺</span><p>Considered from start to finish</p></div>
        </section>

        <section className="shop-section" id="shop">
          <div className="section-heading">
            <div>
              <p className="eyebrow">OBJECTS WITH PURPOSE</p>
              <h2>Find your everyday.</h2>
            </div>
            <a href="#story" className="text-link">A little about us <Icon name="arrow" size={16} /></a>
          </div>
          <div className="shop-toolbar">
            <div className="category-tabs" role="tablist" aria-label="Filter products by category">
              {categories.map((category) => <button key={category} role="tab" aria-selected={activeCategory === category} className={activeCategory === category ? 'category-tab active' : 'category-tab'} onClick={() => setActiveCategory(category)}>{category}</button>)}
            </div>
            <span className="product-count">{loading ? 'Finding good things…' : `${products.length} thoughtful things`}</span>
          </div>

          {loading ? <div className="loading-grid" aria-label="Loading products">{[1, 2, 3, 4].map((item) => <div className="skeleton-card" key={item}><div /><span /></div>)}</div> : (
            products.length ? <div className="product-grid">
              {products.map((product) => <article className="product-card" key={product.id}>
                <div className="product-image-wrap">
                  <img src={imageUrl(product.image)} alt={product.name} loading="lazy" />
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <button className={`save-button ${saved.includes(product.id) ? 'is-saved' : ''}`} aria-label={saved.includes(product.id) ? `Remove ${product.name} from saved items` : `Save ${product.name}`} onClick={() => toggleSaved(product.id)}><Icon name="heart" size={19} /></button>
                  <button className="quick-add" onClick={() => addToCart(product)}>Add to bag <span>+</span></button>
                </div>
                <div className="product-info">
                  <div><p className="product-category">{product.category} <span>· {product.color}</span></p><h3>{product.name}</h3></div>
                  <p className="product-price">{money(product.price)}</p>
                </div>
                <div className="product-rating"><Icon name="star" size={13} /><span>{product.rating}</span><span className="review-count">({product.reviews})</span></div>
              </article>)}
            </div> : <div className="empty-results"><p>No little things found.</p><button className="text-link" onClick={() => { setSearch(''); setActiveCategory('All'); }}>Clear filters <Icon name="arrow" size={16} /></button></div>
          )}
          <div className="shop-more"><button className="button button-outline" onClick={() => { setActiveCategory('All'); setSearch(''); }}>Explore all the good things <Icon name="arrow" size={17} /></button></div>
        </section>

        <section className="story-section" id="story">
          <div className="story-image"><img src={imageUrl('photo-1616486338812-3dadae4b4ace', 1000)} alt="Handmade home objects arranged in a calm, sunlit interior" loading="lazy" /><span className="image-note">MADE TO BE KEPT</span></div>
          <div className="story-copy">
            <p className="eyebrow">A SMALLER KIND OF GOOD</p>
            <h2>Less, but<br /><em>lovelier.</em></h2>
            <p>We believe the things we bring home should earn their place. So we work with thoughtful makers, natural materials, and timeless forms to create everyday pieces you'll reach for, and keep, for years.</p>
            <a className="text-link" href="#journal">Get to know us <Icon name="arrow" size={16} /></a>
            <span className="story-scribble">good things,<br />made slowly</span>
          </div>
        </section>

        <section className="newsletter" id="journal">
          <div><p className="eyebrow">A NOTE FROM US</p><h2>Good things, occasionally.</h2><p>New arrivals, thoughtful reads, and 10% off your first order.</p></div>
          <form onSubmit={(event) => { event.preventDefault(); setNotice('You’re on the list. Look out for a little something in your inbox.'); event.currentTarget.reset(); }}>
            <label className="newsletter-input"><span className="visually-hidden">Your email address</span><input type="email" required placeholder="Your email address" /><button aria-label="Subscribe"><Icon name="arrow" /></button></label>
            <span>By subscribing, you agree to receive our occasional notes.</span>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand"><a className="wordmark" href="#"><span>FORM <i>& FIELD</i></span><small>GOODS FOR SLOWER LIVING</small></a><p>Fewer, better things for<br />a life well lived.</p></div>
        <div className="footer-column"><p>EXPLORE</p><a href="#shop">Shop all</a><a href="#story">Our story</a><a href="#journal">Journal</a></div>
        <div className="footer-column"><p>THE DETAILS</p><a href="#journal">Shipping & returns</a><a href="#journal">Care guide</a><a href="#journal">Get in touch</a></div>
        <div className="footer-bottom"><span>© 2025 FORM & FIELD. MADE WITH CARE.</span><span>INSTAGRAM &nbsp; · &nbsp; PINTEREST</span><span>US / USD</span></div>
      </footer>

      {cartOpen && <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
        <aside className="cart-drawer" aria-label="Shopping bag">
          <div className="drawer-heading"><div><p className="eyebrow">YOUR GOOD THINGS</p><h2>Your bag <span>({cartCount})</span></h2></div><button className="icon-button" aria-label="Close bag" onClick={() => setCartOpen(false)}><Icon name="close" /></button></div>
          {checkoutMessage && <div className="checkout-message"><Icon name="check" size={18} />{checkoutMessage}</div>}
          {!cart.length ? <div className="empty-cart"><span className="empty-bag-icon"><Icon name="bag" size={30} /></span><h3>Your bag is taking a breather.</h3><p>Find something lovely for your everyday.</p><button className="button button-dark" onClick={() => { setCartOpen(false); jumpToShop(); }}>Explore the shop <Icon name="arrow" size={17} /></button></div> : <>
            <div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}>
              <img src={imageUrl(item.image, 240)} alt={item.name} />
              <div className="cart-item-details"><p className="product-category">{item.category} · {item.color}</p><h3>{item.name}</h3><p>{money(item.price)}</p><div className="quantity-control"><button aria-label={`Remove one ${item.name}`} onClick={() => updateQuantity(item.id, -1)}><Icon name="minus" size={14} /></button><span>{item.quantity}</span><button aria-label={`Add one ${item.name}`} onClick={() => updateQuantity(item.id, 1)}><Icon name="plus" size={14} /></button></div></div>
              <button className="remove-item" aria-label={`Remove ${item.name}`} onClick={() => setCart((items) => items.filter((cartItem) => cartItem.id !== item.id))}><Icon name="close" size={17} /></button>
            </div>)}</div>
            <div className="cart-footer"><div className="shipping-progress"><span>✳</span> {cartTotal >= 100 ? 'You’ve unlocked free shipping!' : `You’re ${money(100 - cartTotal)} away from free shipping`}</div><div className="subtotal"><span>Subtotal</span><strong>{money(cartTotal)}</strong></div><p className="tax-note">Shipping and taxes calculated at checkout.</p><form onSubmit={checkout}><label className="checkout-email"><span className="visually-hidden">Email address</span><input type="email" required placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} /></label><button className="button button-dark checkout-button" disabled={checkoutLoading}>{checkoutLoading ? 'Placing your order…' : 'Continue to checkout'} <Icon name="arrow" size={17} /></button></form></div>
          </>}
        </aside>
      </div>}
      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
  );
}

export default App;
