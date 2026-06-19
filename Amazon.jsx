import "./App.css";

function Amazon() {
  const products = [
    { id: 1, name: "Laptop", price: "₹45,999" },
    { id: 2, name: "Mobile", price: "₹19,999" },
    { id: 3, name: "Headphones", price: "₹1,499" },
    { id: 4, name: "Smart Watch", price: "₹2,999" }
  ];

  return (
    <div>
      <nav className="navbar">
        <h2>Amazon Clone</h2>
        <input type="text" placeholder="Search Amazon" />
        <button>Search</button>
      </nav>

      <div className="hero">
        <h1>Welcome to Amazon</h1>
        <p>Shop Electronics, Fashion and More</p>
      </div>

      <div className="products">
        {products.map((item) => (
          <div className="card" key={item.id}>
            <h3>{item.name}</h3>
            <p>{item.price}</p>
            <button>Add To Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Amazon;