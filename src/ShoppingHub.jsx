import React, { useState } from "react";

// Inline SVG icons for premium styling
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "18px", height: "18px" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: "16px", height: "16px", color: "var(--accent-gold)" }}>
    <path fillRule="evenodd" d="M10.788 2.903a.75.75 0 011.424 0l2.082 5.007 5.404.433a.75.75 0 01.417 1.302l-4.025 3.748 1.166 5.344a.75.75 0 01-1.093.796l-4.61-2.813-4.61 2.813a.75.75 0 01-1.093-.796l1.166-5.344-4.025-3.748a.75.75 0 01.417-1.302l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" style={{ width: "40px", height: "40px", color: "var(--success)" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const productsData = [
  {
    id: 1,
    name: "AeroPro Ultrabook",
    price: 45999,
    category: "Electronics",
    description: "Intel i5 13th Gen, 16GB RAM, 512GB SSD. Perfect for developers and professionals.",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1496181130204-755241544e35?auto=format&fit=crop&q=80&w=400",
    badge: "Hot Sell"
  },
  {
    id: 2,
    name: "PixelWave Phone 12",
    price: 19999,
    category: "Electronics",
    description: "6.5-inch 120Hz OLED screen, Triple Camera, 5G enabled, 128GB Storage.",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400",
    badge: "Sale"
  },
  {
    id: 3,
    name: "Studio X Noise Cancelling Headphones",
    price: 1499,
    category: "Audio",
    description: "Hybrid ANC, 40 hours battery life, high fidelity sound, comfortable over-ear design.",
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400",
    badge: "Best Seller"
  },
  {
    id: 4,
    name: "PulseFit Smart Watch Pro",
    price: 2999,
    category: "Wearables",
    description: "Heart rate monitoring, SPO2 sensor, 15 sports modes, GPS tracker, waterproof.",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400",
    badge: "Popular"
  },
  {
    id: 5,
    name: "Gamer Click Mech Keyboard",
    price: 3499,
    category: "Accessories",
    description: "RGB Backlit, Red Switches, Hot-swappable keys, metallic chassis.",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=400",
    badge: "New"
  },
  {
    id: 6,
    name: "PrecisionPro Wireless Mouse",
    price: 1299,
    category: "Accessories",
    description: "Ergonomic layout, silent clicks, rechargeable, 2400 DPI optical sensor.",
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=400",
    badge: "Sale"
  }
];

export default function ShoppingHub({ cart, addToCart, removeFromCart, updateCartQuantity, clearCart }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0); // in percent
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Filters
  const filteredProducts = productsData.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * appliedDiscount) / 100);
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 150;
  const total = subtotal - discountAmount + tax + shipping;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === "GEMINI20") {
      setAppliedDiscount(20);
      alert("Promo Applied: 20% Discount!");
    } else if (couponCode.toUpperCase() === "WELCOME10") {
      setAppliedDiscount(10);
      alert("Promo Applied: 10% Discount!");
    } else {
      alert("Invalid coupon code");
    }
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    setShowCheckoutModal(true);
  };

  const confirmPurchase = () => {
    clearCart();
    setCouponCode("");
    setAppliedDiscount(0);
    setShowCheckoutModal(false);
    setIsCartOpen(false);
    alert("Purchase successful! Your order is on the way.");
  };

  return (
    <div className="shopping-hub fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "0.25rem" }}>Amazon Premium</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Curated electronics and accessories with same-day delivery.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setIsCartOpen(!isCartOpen)} 
          style={{ position: "relative" }}
        >
          <CartIcon />
          <span>Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
          {cart.length > 0 && (
            <span style={{ 
              position: "absolute", top: "-5px", right: "-5px", 
              backgroundColor: "var(--accent-gold)", color: "white", 
              borderRadius: "50%", padding: "2px 6px", fontSize: "0.75rem", fontWeight: "bold" 
            }}>
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Main Layout Grid */}
      <div style={{ display: "grid", gridTemplateColumns: isCartOpen ? "1fr 360px" : "1fr", gap: "2rem", transition: "all 0.3s ease" }}>
        
        {/* Products Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Search and Filters */}
          <div className="glass-card" style={{ padding: "1.25rem 1.5rem", display: "flex", gap: "1.25rem", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1", minWidth: "250px" }}>
              <input 
                type="text" 
                placeholder="Search products..." 
                className="form-input" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", paddingLeft: "2.75rem" }}
              />
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                <SearchIcon />
              </span>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "2px" }}>
              {["All", "Electronics", "Audio", "Wearables", "Accessories"].map((cat) => (
                <button
                  key={cat}
                  className={`btn ${selectedCategory === cat ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setSelectedCategory(cat)}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", borderRadius: "50px" }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="glass-card" style={{ textAlign: "center", padding: "4rem" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>No products found</h3>
              <p style={{ color: "var(--text-muted)" }}>Try adjusting your search filters.</p>
            </div>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
              gap: "1.5rem" 
            }}>
              {filteredProducts.map((product) => (
                <div key={product.id} className="glass-card fade-in" style={{ padding: "0", overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ position: "relative", overflow: "hidden", height: "200px" }}>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform var(--transition-normal)" }}
                      onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
                      onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                    />
                    {product.badge && (
                      <span className="badge badge-success" style={{ position: "absolute", top: "12px", left: "12px", zIndex: "10" }}>
                        {product.badge}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: "1", gap: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{product.name}</h3>
                      <span style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--primary)" }}>₹{product.price.toLocaleString()}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <StarIcon />
                      <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-heading)" }}>{product.rating}</span>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>(1.2k reviews)</span>
                    </div>

                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", flex: "1" }}>{product.description}</p>
                    
                    <button 
                      className="btn btn-primary" 
                      onClick={() => addToCart(product)} 
                      style={{ width: "100%", marginTop: "1rem" }}
                    >
                      Add To Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shopping Cart Sidebar Drawer */}
        {isCartOpen && (
          <div className="glass-card fade-in" style={{ padding: "1.5rem", height: "fit-content", display: "flex", flexDirection: "column", gap: "1.5rem", borderLeft: "2px solid var(--border-color)", position: "sticky", top: "100px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.25rem" }}>My Shopping Cart</h3>
              <button 
                onClick={() => setIsCartOpen(false)} 
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.25rem", cursor: "pointer", fontWeight: "bold" }}
              >
                &times;
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>Your cart is empty.</p>
                <button className="btn btn-secondary" onClick={() => setIsCartOpen(false)} style={{ width: "100%" }}>Continue Shopping</button>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "300px", overflowY: "auto", paddingRight: "4px" }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: "flex", gap: "0.75rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                      <img src={item.image} alt={item.name} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }} />
                      <div style={{ flex: "1", display: "flex", flexDirection: "column" }}>
                        <h4 style={{ fontSize: "0.9rem", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>{item.name}</h4>
                        <span style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: "600" }}>₹{item.price.toLocaleString()}</span>
                        
                        {/* Quantity controls */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.25rem" }}>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            style={{ padding: "0 6px", fontSize: "0.85rem", height: "24px", minWidth: "24px" }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: "0.85rem", fontWeight: "bold" }}>{item.quantity}</span>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            style={{ padding: "0 6px", fontSize: "0.85rem", height: "24px", minWidth: "24px" }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", alignSelf: "center", padding: "4px" }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Promo Code Form */}
                <form onSubmit={handleApplyCoupon} style={{ display: "flex", gap: "0.5rem" }}>
                  <input 
                    type="text" 
                    placeholder="Coupon: GEMINI20" 
                    className="form-input" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{ flex: "1", padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}
                  />
                  <button type="submit" className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>Apply</button>
                </form>

                {/* Bill details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Subtotal:</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--success)" }}>
                      <span>Discount ({appliedDiscount}%):</span>
                      <span>-₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Est. Tax (5%):</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Shipping:</span>
                    <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: "800", color: "var(--text-heading)", borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem", marginTop: "0.25rem" }}>
                    <span>Total:</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <button className="btn btn-primary" onClick={handleCheckoutSubmit} style={{ width: "100%" }}>
                  Proceed to Checkout
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Checkout Receipt Modal */}
      {showCheckoutModal && (
        <div style={{ 
          position: "fixed", top: "0", left: "0", width: "100%", height: "100%", 
          backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", 
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: "1000" 
        }}>
          <div className="glass-card fade-in" style={{ maxWidth: "450px", width: "90%", padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0.5rem" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--success-glow)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", marginBottom: "0.5rem" }}>
                <CheckIcon />
              </div>
              <h3 style={{ fontSize: "1.5rem" }}>Confirm Your Purchase</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Please review your order details before confirming.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", backgroundColor: "var(--bg-secondary)", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span style={{ color: "var(--text-heading)", fontWeight: "600" }}>{item.name} <span style={{ color: "var(--text-muted)" }}>x{item.quantity}</span></span>
                  <span style={{ fontWeight: "700" }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem", marginTop: "0.5rem", display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: "800" }}>
                <span>Amount Payable:</span>
                <span style={{ color: "var(--primary)" }}>₹{total.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="btn btn-secondary" onClick={() => setShowCheckoutModal(false)} style={{ flex: "1" }}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmPurchase} style={{ flex: "1" }}>Place Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
