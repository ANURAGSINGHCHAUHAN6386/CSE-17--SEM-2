import React, { useState, useEffect } from "react";
import ShoppingHub from "./ShoppingHub";
import LuxeStay from "./LuxeStay";
import StudentHub from "./StudentHub";
import AirPollutionControlSystem from "./components/apcs/AirPollutionControlSystem";
import TrainGpsTracker from "./components/gps/TrainGpsTracker";
import NeuroPulseStudio from "./components/neuropulse/NeuroPulseStudio";

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

const TrainGpsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />
  </svg>
);

// Premium SVGs for Shell layout
const ApcsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);
const OverviewIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
  </svg>
);

const ShoppingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const StayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m16.5-18v18m-12-9h3.75m-3.75 3h3.75m-3.75 3h3.75m9-9h3.75m-3.75 3h3.75m-3.75 3h3.75M9 3.75h6.75c.621 0 1.125.504 1.125 1.125v3H7.875v-3c0-.621.504-1.125 1.125-1.125z" />
  </svg>
);

const AcademicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.231-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0a50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M12 13.49v.01" />
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "18px", height: "18px" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25m-13.5 0h-2.25m15.022-7.477l-1.591 1.591M6.78 17.22l-1.591 1.591M18.09 17.22l1.591 1.591M6.78 6.78L5.189 5.189A8.25 8.25 0 1120.25 12a8.25 8.25 0 01-8.25 8.25c-4.556 0-8.25-3.694-8.25-8.25c0-1.137.23-2.22.645-3.21z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "18px", height: "18px" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

const defaultStudents = [
  { id: "ST-1001", name: "Ram", email: "ram@abes.edu", course: "B.Tech", marks: 90, avatar: "👨‍🎓", registeredDate: "06/01/2026" },
  { id: "ST-1002", name: "Raj", email: "raj@abes.edu", course: "M.Tech", marks: 95, avatar: "🧑‍💻", registeredDate: "06/05/2026" },
  { id: "ST-1003", name: "Rohan", email: "rohan@abes.edu", course: "MCA", marks: 92, avatar: "🌟", registeredDate: "06/10/2026" }
];

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem("nexus_theme") || "dark");
  const [activeTab, setActiveTab] = useState("bci");

  // Sub-system States
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("nexus_shopping_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem("luxe_stay_bookings");
    return saved ? JSON.parse(saved) : [];
  });

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem("nexus_hub_students");
    return saved ? JSON.parse(saved) : defaultStudents;
  });

  // Sync theme attribute to document root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("nexus_theme", theme);
  }, [theme]);

  // Sync cart changes to storage
  useEffect(() => {
    localStorage.setItem("nexus_shopping_cart", JSON.stringify(cart));
  }, [cart]);

  // Shopping handlers
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateCartQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Find best scoring student
  const topStudent = [...students].sort((a, b) => b.marks - a.marks)[0];
  
  // Calculate cart items count
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-logo">N</div>
          <span className="brand-name">Nexus Hub</span>
        </div>

        <nav>
          <ul className="nav-links">
            <li>
              <button
                className={`nav-item ${activeTab === "bci" ? "active" : ""}`}
                onClick={() => setActiveTab("bci")}
                style={{ background: "none", width: "100%" }}
              >
                <BrainIcon />
                <span>NeuroPulse BCI</span>
                <span style={{ 
                  marginLeft: "auto", backgroundColor: "#a855f7", 
                  color: "#ffffff", borderRadius: "50%", padding: "2px 6px", fontSize: "0.68rem", fontWeight: "800",
                  boxShadow: "0 0 10px #a855f7" 
                }}>
                  NEURAL
                </span>
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === "gps" ? "active" : ""}`}
                onClick={() => setActiveTab("gps")}
                style={{ background: "none", width: "100%" }}
              >
                <TrainGpsIcon />
                <span>Train GPS Tracker</span>
                <span style={{ 
                  marginLeft: "auto", backgroundColor: "#00f0ff", 
                  color: "#04131f", borderRadius: "50%", padding: "2px 6px", fontSize: "0.68rem", fontWeight: "800" 
                }}>
                  OFFLINE
                </span>
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === "apcs" ? "active" : ""}`}
                onClick={() => setActiveTab("apcs")}
                style={{ background: "none", width: "100%" }}
              >
                <ApcsIcon />
                <span>APCS Flue Control</span>
                <span style={{ 
                  marginLeft: "auto", backgroundColor: "#06b6d4", 
                  color: "#04131f", borderRadius: "50%", padding: "2px 6px", fontSize: "0.68rem", fontWeight: "800" 
                }}>
                  LIVE
                </span>
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
                style={{ background: "none", width: "100%" }}
              >
                <OverviewIcon />
                <span>Overview</span>
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === "shopping" ? "active" : ""}`}
                onClick={() => setActiveTab("shopping")}
                style={{ background: "none", width: "100%" }}
              >
                <ShoppingIcon />
                <span>Shopping</span>
                {cartItemCount > 0 && (
                  <span style={{ 
                    marginLeft: "auto", backgroundColor: "var(--primary)", 
                    color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: "0.75rem" 
                  }}>
                    {cartItemCount}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === "stay" ? "active" : ""}`}
                onClick={() => setActiveTab("stay")}
                style={{ background: "none", width: "100%" }}
              >
                <StayIcon />
                <span>Luxe Stay</span>
                {bookings.length > 0 && (
                  <span style={{ 
                    marginLeft: "auto", backgroundColor: "var(--accent-gold)", 
                    color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: "0.75rem" 
                  }}>
                    {bookings.length}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === "academy" ? "active" : ""}`}
                onClick={() => setActiveTab("academy")}
                style={{ background: "none", width: "100%" }}
              >
                <AcademicIcon />
                <span>Academy</span>
                <span style={{ 
                  marginLeft: "auto", backgroundColor: "var(--success)", 
                  color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: "0.75rem" 
                }}>
                  {students.length}
                </span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="main-viewport">
        
        {/* Header Bar */}
        <header className="viewport-header">
          <div className="header-title-area">
            <h2 style={{ textTransform: "capitalize" }}>
              {activeTab === "bci" ? "NeuroPulse BCI Neural Signal Decoding Cockpit" : activeTab === "gps" ? "Train Offline GPS Speedometer & Tracker" : activeTab === "apcs" ? "Air Pollution Control System (APCS)" : activeTab === "stay" ? "Luxe Stay Room Booking" : activeTab === "academy" ? "Academy Hub" : activeTab + " Portal"}
            </h2>
          </div>

          <div className="user-badge">
            <div className="avatar-circle">AC</div>
            <span className="user-name">Anurag Chauhan</span>
          </div>
        </header>

        {/* Content Render Area */}
        <section className="content-body" style={activeTab === "apcs" || activeTab === "gps" || activeTab === "bci" ? { padding: 0 } : {}}>
          {activeTab === "bci" && <NeuroPulseStudio />}
          {activeTab === "gps" && <TrainGpsTracker />}

          {activeTab === "apcs" && (
            <AirPollutionControlSystem currentTheme={theme} onToggleTheme={toggleTheme} />
          )}

          {activeTab === "overview" && (
            <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
              
              {/* Welcome banner */}
              <div className="overview-banner">
                <div>
                  <h1>Welcome to Nexus Hub</h1>
                  <p>A unified space managing your shopping cart, five-star hotel reservations, and academic student records.</p>
                </div>
                <button className="btn btn-gold" onClick={() => setActiveTab("shopping")}>Explore Shopping</button>
              </div>

              {/* Stats Counters Grid */}
              <div className="overview-stats">
                
                <div className="stat-card" onClick={() => setActiveTab("apcs")} style={{ cursor: "pointer", border: "1px solid var(--apcs-border-glow, #06b6d4)" }}>
                  <div className="stat-icon-container" style={{ backgroundColor: "rgba(6, 182, 212, 0.15)", color: "#06b6d4" }}>
                    <ApcsIcon />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value" style={{ color: "#06b6d4" }}>96.4% Abatement</span>
                    <span className="stat-label">Air Pollution Control (APCS)</span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => setActiveTab("shopping")} style={{ cursor: "pointer" }}>
                  <div className="stat-icon-container purple">
                    <ShoppingIcon />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{cartItemCount} Items</span>
                    <span className="stat-label">Shopping Cart List</span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => setActiveTab("stay")} style={{ cursor: "pointer" }}>
                  <div className="stat-icon-container gold">
                    <StayIcon />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{bookings.length} Rooms</span>
                    <span className="stat-label">Active Hotel Bookings</span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => setActiveTab("academy")} style={{ cursor: "pointer" }}>
                  <div className="stat-icon-container green">
                    <AcademicIcon />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{students.length} Enrolled</span>
                    <span className="stat-label">Students Directory</span>
                  </div>
                </div>

              </div>

              {/* Two Column Layout widgets */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "2rem" }}>
                
                {/* Academy Widget */}
                <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: "1.2rem" }}>Academy Performance</h3>
                    <button className="btn btn-secondary" onClick={() => setActiveTab("academy")} style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>Onboard</button>
                  </div>
                  
                  {topStudent && (
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", backgroundColor: "var(--bg-secondary)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                      <span style={{ fontSize: "2.5rem" }}>{topStudent.avatar}</span>
                      <div>
                        <span className="badge badge-success" style={{ marginBottom: "0.25rem" }}>Top Performer</span>
                        <h4 style={{ fontSize: "1rem" }}>{topStudent.name}</h4>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Course: {topStudent.course} | Grade Score: {topStudent.marks}%</p>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {students.slice(0, 3).map((st) => (
                      <div key={st.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", padding: "0.25rem 0" }}>
                        <span style={{ color: "var(--text-heading)", fontWeight: "600" }}>{st.avatar} {st.name}</span>
                        <span style={{ color: "var(--text-muted)" }}>{st.course} • <span style={{ color: "var(--primary)", fontWeight: "700" }}>{st.marks}%</span></span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stay Bookings Widget */}
                <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: "1.2rem" }}>Stay Bookings</h3>
                    <button className="btn btn-secondary" onClick={() => setActiveTab("stay")} style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>Book Suite</button>
                  </div>

                  {bookings.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", flex: "1", padding: "1.5rem", border: "2px dashed var(--border-color)", borderRadius: "12px" }}>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No current active stays.</p>
                      <button className="btn btn-gold" onClick={() => setActiveTab("stay")} style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>Reserve Room</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: "1" }}>
                      {bookings.slice(0, 2).map((bk) => (
                        <div key={bk.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-secondary)", padding: "0.85rem 1rem", borderRadius: "10px", border: "1px solid var(--border-color)", fontSize: "0.85rem" }}>
                          <div>
                            <h4 style={{ fontSize: "0.9rem", color: "var(--text-heading)" }}>{bk.roomName}</h4>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Duration: {bk.checkIn} to {bk.checkOut}</p>
                          </div>
                          <span style={{ fontWeight: "700", color: "var(--accent-gold)" }}>${bk.totalCost}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {activeTab === "shopping" && (
            <ShoppingHub 
              cart={cart}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              updateCartQuantity={updateCartQuantity}
              clearCart={clearCart}
            />
          )}

          {activeTab === "stay" && (
            <LuxeStay 
              bookings={bookings}
              setBookings={setBookings}
            />
          )}

          {activeTab === "academy" && (
            <StudentHub 
              students={students}
              setStudents={setStudents}
            />
          )}
        </section>

      </main>
    </div>
  );
}