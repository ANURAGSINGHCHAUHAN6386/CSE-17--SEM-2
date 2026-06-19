import React, { useState } from "react";

// Premium Inline SVG icons for LuxeStay
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const UserGroupIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const BedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M5.25 7.5h13.5A2.25 2.25 0 0121 9.75v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15.75v-6a2.25 2.25 0 012.25-2.25z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "40px", height: "40px", color: "var(--primary)" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const roomsData = [
  {
    id: "royal-suite",
    name: "Royal Suite",
    price: 499, // in USD
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop",
    maxGuests: 2,
    amenities: ["King Bed", "Private Pool", "24/7 Butler", "Ocean Front Balcony", "Mini Bar"],
    description: "Experience absolute royalty. Spanning 120sqm, the Royal Suite includes a private infinity pool and personal butler services."
  },
  {
    id: "ocean-view",
    name: "Ocean View Room",
    price: 299,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=600&auto=format&fit=crop",
    maxGuests: 2,
    amenities: ["Queen Bed", "Floor-to-ceiling Windows", "Wi-Fi", "Espresso Machine"],
    description: "Wake up to breathtaking panoramic views of the turquoise ocean. Equipped with a private sunset deck."
  },
  {
    id: "luxury-family",
    name: "Luxury Family Room",
    price: 399,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600&auto=format&fit=crop",
    maxGuests: 4,
    amenities: ["2 Double Beds", "Connected Playroom", "Smart TV", "Breakfast Buffet"],
    description: "Spacious luxury designed for families. Includes a kids entertainment hub and premium amenities for four."
  },
  {
    id: "presidential-penthouse",
    name: "Presidential Penthouse",
    price: 799,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600&auto=format&fit=crop",
    maxGuests: 6,
    amenities: ["3 King Bedrooms", "Private Rooftop Deck", "Spa Room", "Chef Kitchen"],
    description: "The peak of luxury living on the 42nd floor. Perfect for high-profile retreats with private elevator access."
  }
];

export default function LuxeStay({ bookings, setBookings }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    checkIn: "",
    checkOut: "",
    roomType: "royal-suite",
    guests: 1,
    requests: ""
  });
  
  const [bookingInvoice, setBookingInvoice] = useState(null);

  // Auto Calculations
  const selectedRoom = roomsData.find(r => r.id === formData.roomType) || roomsData[0];
  
  let nights = 0;
  if (formData.checkIn && formData.checkOut) {
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const diff = end - start;
    if (diff > 0) {
      nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
  }

  const pricePerNight = selectedRoom.price;
  const subtotal = nights * pricePerNight;
  const resortFee = nights > 0 ? 50 : 0; // flat fee
  const tax = Math.round(subtotal * 0.12); // 12% Hotel tax
  const totalCost = subtotal + resortFee + tax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    // Validations
    if (!formData.checkIn || !formData.checkOut) {
      alert("Please select both Check-In and Check-Out dates.");
      return;
    }

    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (checkInDate < today) {
      alert("Check-in date cannot be in the past.");
      return;
    }

    if (checkOutDate <= checkInDate) {
      alert("Check-out date must be at least 1 day after the Check-in date.");
      return;
    }

    if (formData.guests > selectedRoom.maxGuests) {
      alert(`The selected room allows a maximum of ${selectedRoom.maxGuests} guests.`);
      return;
    }

    // Process Booking
    const newBooking = {
      id: "BK-" + Math.floor(100000 + Math.random() * 900000),
      fullName: formData.fullName,
      email: formData.email,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      roomName: selectedRoom.name,
      guests: formData.guests,
      nights: nights,
      totalCost: totalCost,
      status: "Confirmed",
      dateCreated: new Date().toLocaleDateString()
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    localStorage.setItem("luxe_stay_bookings", JSON.stringify(updatedBookings));

    // Show Invoice Modal
    setBookingInvoice(newBooking);

    // Reset Form
    setFormData({
      fullName: "",
      email: "",
      checkIn: "",
      checkOut: "",
      roomType: "royal-suite",
      guests: 1,
      requests: ""
    });
  };

  const handleCancelBooking = (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      const updated = bookings.filter(b => b.id !== bookingId);
      setBookings(updated);
      localStorage.setItem("luxe_stay_bookings", JSON.stringify(updated));
    }
  };

  return (
    <div className="luxe-stay fade-in" style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
      
      {/* Hero Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "0.25rem" }}>Luxe Stay Portal</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Five-star luxury accommodation bookings with immediate confirmation.</p>
        </div>
      </div>

      {/* Grid Layout: Rooms Catalog vs. Booking Form */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "2.5rem", alignItems: "start" }}>
        
        {/* Rooms Listing */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <h3 style={{ fontSize: "1.4rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>Our Luxury Suites</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {roomsData.map((room) => (
              <div key={room.id} className="glass-card fade-in" style={{ padding: "0", overflow: "hidden", display: "flex", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 250px", height: "240px", overflow: "hidden" }}>
                  <img src={room.image} alt={room.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                
                <div style={{ flex: "1.5 1 300px", padding: "1.75rem", display: "flex", flexDirection: "column", justifyItems: "space-between", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <h4 style={{ fontSize: "1.3rem" }}>{room.name}</h4>
                      <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--accent-gold)" }}>${room.price}<span style={{ fontSize: "0.85rem", fontWeight: "normal", color: "var(--text-muted)" }}>/night</span></span>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                      <span className="badge badge-warning" style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.6rem" }}>
                        <UserGroupIcon /> Max {room.maxGuests} Guests
                      </span>
                      <span className="badge badge-success" style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.6rem" }}>
                        <BedIcon /> Premium Bedding
                      </span>
                    </div>

                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>{room.description}</p>
                  </div>

                  <div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
                      {room.amenities.map((amenity, idx) => (
                        <span key={idx} style={{ fontSize: "0.75rem", backgroundColor: "var(--bg-secondary)", padding: "2px 8px", borderRadius: "4px", border: "1px solid var(--border-color)" }}>{amenity}</span>
                      ))}
                    </div>
                    
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setFormData(prev => ({ ...prev, roomType: room.id }))}
                      style={{ width: "100%" }}
                    >
                      Select For Booking
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Form Card */}
        <div className="glass-card" style={{ position: "sticky", top: "100px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h3 style={{ fontSize: "1.25rem", textAlign: "center" }}>Book Your Room</h3>
          
          <form onSubmit={handleBookingSubmit} style={{ display: "flex", flexDirection: "column" }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="fullName" required className="form-input" placeholder="e.g. John Doe" value={formData.fullName} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" name="email" required className="form-input" placeholder="e.g. john@example.com" value={formData.email} onChange={handleInputChange} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Check-In</label>
                <input type="date" name="checkIn" required className="form-input" value={formData.checkIn} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Check-Out</label>
                <input type="date" name="checkOut" required className="form-input" value={formData.checkOut} onChange={handleInputChange} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Suite Type</label>
                <select name="roomType" className="form-select" value={formData.roomType} onChange={handleInputChange}>
                  {roomsData.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Guests</label>
                <input type="number" name="guests" min="1" max={selectedRoom.maxGuests} required className="form-input" value={formData.guests} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Special Requests</label>
              <textarea name="requests" rows="2" className="form-textarea" placeholder="Dietary restrictions, pillow preferences..." value={formData.requests} onChange={handleInputChange}></textarea>
            </div>

            {/* Live Pricing Breakdown */}
            {nights > 0 && (
              <div style={{ backgroundColor: "var(--bg-secondary)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color)", margin: "0.5rem 0 1.5rem 0", display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Suite Rate ({nights} nights):</span>
                  <span>${subtotal}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Flat Resort Fee:</span>
                  <span>${resortFee}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Occupancy Tax (12%):</span>
                  <span>${tax}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", fontWeight: "800", color: "var(--text-heading)", borderTop: "1px solid var(--border-color)", paddingTop: "0.4rem", marginTop: "0.2rem" }}>
                  <span>Estimated Total:</span>
                  <span style={{ color: "var(--accent-gold)" }}>${totalCost}</span>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-gold" style={{ width: "100%", marginTop: "0.5rem" }}>
              Confirm Booking
            </button>
          </form>
        </div>

      </div>

      {/* Persistent Reservations Section */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <h3 style={{ fontSize: "1.4rem" }}>Active Bookings History</h3>
        
        {bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            <p>No active reservations found. Place a booking to see it listed here.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color)", color: "var(--text-heading)", fontWeight: "bold" }}>
                  <th style={{ padding: "0.75rem" }}>Booking ID</th>
                  <th style={{ padding: "0.75rem" }}>Guest Name</th>
                  <th style={{ padding: "0.75rem" }}>Suite Type</th>
                  <th style={{ padding: "0.75rem" }}>Duration</th>
                  <th style={{ padding: "0.75rem" }}>Total Paid</th>
                  <th style={{ padding: "0.75rem" }}>Status</th>
                  <th style={{ padding: "0.75rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-main)" }}>
                    <td style={{ padding: "0.75rem", fontWeight: "700" }}>{booking.id}</td>
                    <td style={{ padding: "0.75rem" }}>{booking.fullName}</td>
                    <td style={{ padding: "0.75rem" }}>{booking.roomName}</td>
                    <td style={{ padding: "0.75rem" }}>{booking.checkIn} to {booking.checkOut} ({booking.nights} nights)</td>
                    <td style={{ padding: "0.75rem", fontWeight: "700", color: "var(--accent-gold)" }}>${booking.totalCost}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <span className="badge badge-success">{booking.status}</span>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleCancelBooking(booking.id)}
                        style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem", borderRadius: "6px" }}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Receipt Invoice Modal */}
      {bookingInvoice && (
        <div style={{ 
          position: "fixed", top: "0", left: "0", width: "100%", height: "100%", 
          backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", 
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: "1000" 
        }}>
          <div className="glass-card fade-in" style={{ maxWidth: "450px", width: "90%", padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0.5rem" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--primary-glow)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", marginBottom: "0.5rem" }}>
                <ShieldCheckIcon />
              </div>
              <h3 style={{ fontSize: "1.5rem" }}>Booking Secured!</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Your reservation is confirmed. Here is your digital receipt.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", backgroundColor: "var(--bg-secondary)", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--border-color)", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Booking Reference:</span>
                <span style={{ fontWeight: "700", color: "var(--text-heading)" }}>{bookingInvoice.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Suite Reserved:</span>
                <span style={{ fontWeight: "600" }}>{bookingInvoice.roomName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Check-In Date:</span>
                <span>{bookingInvoice.checkIn}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Check-Out Date:</span>
                <span>{bookingInvoice.checkOut}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Nights:</span>
                <span>{bookingInvoice.nights}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Number of Guests:</span>
                <span>{bookingInvoice.guests}</span>
              </div>
              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem", marginTop: "0.5rem", display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: "800" }}>
                <span>Paid (USD):</span>
                <span style={{ color: "var(--accent-gold)" }}>${bookingInvoice.totalCost}</span>
              </div>
            </div>

            <button className="btn btn-gold" onClick={() => setBookingInvoice(null)} style={{ width: "100%" }}>
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
