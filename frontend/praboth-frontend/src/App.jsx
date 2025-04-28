import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import { WebSocketProvider } from "./contexts/WebSocketContext";
// import DriversList from "./pages/DriversList";
// import DriverDetails from "./pages/DriverDetails";

function App() {
  return (
    <WebSocketProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/drivers" element={<DriversList />} />
        <Route path="/drivers/:driverId" element={<DriverDetails />} /> */}
        {/* Add more as needed */}
      </Routes>
    </WebSocketProvider>
  );
}

export default App;
