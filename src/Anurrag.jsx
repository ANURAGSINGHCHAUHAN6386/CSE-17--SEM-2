import React from 'react'

function skmimimimijijc() {
  return (
    <div>
      [1:09 am, 08/05/2026] Anurag Chauhan: export default function LuxuryHotelWebsite() {
  const rooms = [
    {
      name: 'Royal Suite',
      price: '$499/night',
      image:
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
    },
    {
      name: 'Ocean View Room',
      price: '$299/night',
      image:
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop',
    },
    {
      name: 'Luxury Family Room',
      price: '$399/night',
      image:
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Navbar */}
      <nav className="flex items-center j…
[1:10 am, 08/05/2026] Anurag Chauhan: this is Luxury hotal room booking👆
[1:12 am, 08/05/2026] Anurag Chauhan: export default function App() {
  const rooms = [
    {
      name: "Royal Suite",
      price: "$499/night",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Ocean View Room",
      price: "$299/night",
      image:
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Luxury Family Room",
      price: "$399/night",
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-black text-white flex justify-between items-center px-8 py-4">
        <h1 className="text-3xl font-bold">LUXE HOTEL</h1>

        <div className="space-x-6">
          <a href="#home">Home</a>
          <a href="#rooms">Rooms</a>
          <a href="#booking">Booking</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="h-[80vh] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600&auto=format&fit=crop')",
        }}
      >
        <div className="bg-black/60 p-10 rounded-3xl text-center text-white">
          <h2 className="text-6xl font-bold mb-4">
            Luxury Hotel Booking
          </h2>

          <p className="text-xl mb-6">
            Book your dream room online
          </p>

          <button className="bg-yellow-500 text-black px-8 py-3 rounded-xl font-bold">
            Book Now
          </button>
        </div>
      </section>

      {/* Rooms */}
      <section id="rooms" className="py-20 px-8">
        <h2 className="text-4xl font-bold text-center mb-10">
          Our Rooms
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl overflow-hidden shadow-xl"
            >
              <img
                src={room.image}
                alt={room.name}
                className="h-64 w-full object-cover"
              />

              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">
                  {room.name}
                </h3>

                <p className="text-gray-600 mb-4">
                  Premium luxury room with modern facilities.
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-yellow-600 font-bold">
                    {room.price}
                  </span>

                  <button className="bg-black text-white px-4 py-2 rounded-xl">
                    Reserve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Form */}
      <section
        id="booking"
        className="bg-black text-white py-20 px-8"
      >
        <div className="max-w-4xl mx-auto bg-gray-900 p-10 rounded-3xl">
          <h2 className="text-4xl font-bold text-center mb-10">
            Online Booking
          </h2>

          <form className="grid md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Full Name"
              className="p-4 rounded-xl bg-gray-800"
            />

            <input
              type="email"
              placeholder="Email"
              className="p-4 rounded-xl bg-gray-800"
            />

            <input
              type="date"
              className="p-4 rounded-xl bg-gray-800"
            />

            <input
              type="date"
              className="p-4 rounded-xl bg-gray-800"
            />

            <select className="p-4 rounded-xl bg-gray-800">
              <option>Select Room</option>
              <option>Royal Suite</option>
              <option>Ocean View Room</option>
              <option>Luxury Family Room</option>
            </select>

            <input
              type="number"
              placeholder="Guests"
              className="p-4 rounded-xl bg-gray-800"
            />

            <textarea
              placeholder="Special Request"
              className="md:col-span-2 p-4 rounded-xl bg-gray-800 h-32"
            ></textarea>

            <button
              type="submit"
              className="md:col-span-2 bg-yellow-500 text-black font-bold py-4 rounded-2xl"
            >
              Confirm Booking
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-300 text-center py-8">
        <h3 className="text-2xl font-bold text-white mb-2">
          LUXE HOTEL
        </h3>

        <p>Email: contact@luxehotel.com</p>
        <p>Phone: +1 234 567 890</p>

        <p className="mt-4 text-sm">
          © 2026 Luxe Hotel. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
    </div>
  )
}

export default skmimimimijijc
