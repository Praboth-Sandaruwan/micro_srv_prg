import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/driverapi";
import { jwtDecode } from "jwt-decode";
import { useWebSocket } from "../contexts/WebSocketContext";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { connectWebSocket } = useWebSocket();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await login(form.username, form.password);

      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);

        const decoded = jwtDecode(data.access_token);
        console.log("Decoded token:", decoded);
        const driverId = decoded.id || decoded.sub;

        localStorage.setItem("wsDriverId", driverId);

        navigate("/dashboard");
        
        connectWebSocket(driverId, data.access_token);

      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error details:", err);
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen max-w-screen bg-blue-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 wid">
      <div className="max-w-lg bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Login
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={form.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <button
              id="loginBtn"
              type="submit"
              disabled={isLoading}
              className="w-full py-2 mt-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600 hover:text-blue-500">
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
