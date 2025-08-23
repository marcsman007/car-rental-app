import { Link } from "react-router-dom";

function Home() {
  const token = localStorage.getItem("token");

  return (
    <div className="container">
      <h1>Welcome to Car Rental App 🚗</h1>
      <p style={{ marginBottom: "20px" }}>
        Select a car and book easily. Manage your bookings with ease. 
      </p>

      {token ? (
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/cars">
            <button style={{ padding: "10px 20px", cursor: "pointer" }}>View Cars</button>
          </Link>
          <Link to="/bookings">
            <button style={{ padding: "10px 20px", cursor: "pointer" }}>My Bookings</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/login">
            <button style={{ padding: "10px 20px", cursor: "pointer" }}>Login</button>
          </Link>
          <Link to="/register">
            <button style={{ padding: "10px 20px", cursor: "pointer" }}>Register</button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Home;
