import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Show confirmation before logout
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("authToken"); // Clear authentication token
      localStorage.removeItem("userData");  // Remove user data
      navigate("/login"); // Redirect to login page
    } else {
      navigate(-1); // Go back to previous page if canceled
    }
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Logging out...</h2>
    </div>
  );
};
export default Logout;
