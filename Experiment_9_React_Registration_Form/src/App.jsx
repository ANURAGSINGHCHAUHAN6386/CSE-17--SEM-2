import React, { useState } from "react";
import "./App.css";

function App() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (name === "" || email === "" || password === "") {
      setError("All fields are required");
    } 
    else {

      setError("");

      const newUser = {
        name: name,
        email: email
      };

      setRegisteredUsers([...registeredUsers, newUser]);

      setName("");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="container">

      <div className="form-box">

        <h1>Registration Form</h1>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Register</button>

        </form>

        {error && <p className="error">{error}</p>}

        <h2>Registered Users</h2>

        <ul>

          {registeredUsers.map((user, index) => (
            <li key={index}>
              {user.name} - {user.email}
            </li>
          ))}

        </ul>

      </div>

    </div>
  );
}

export default App;