import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { DeliveryProvider } from "./contexts/DeliveryContext";
import Delivery from "./components/delivery";
import DeliveryUsr from "./pages/deliveryUsr";


import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';


function App() {
  return (
    <WebSocketProvider>
      <DeliveryProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/delivery/:id" element={<DeliveryUsr />} />
        </Routes>
      </DeliveryProvider>
    </WebSocketProvider>
  );
}

export default App;
