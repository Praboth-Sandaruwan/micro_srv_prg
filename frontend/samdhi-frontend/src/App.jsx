import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CustomerDashboard from "./pages/dashboards/CustomerDashboard";
import RestaurantDashboard from "./pages/dashboards/RestaurantDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import UsersList from "./pages/admin/UsersList";
import EditUser from "./pages/admin/EditUser";
import RestaurantsList from "./pages/admin/RestaurantsList";
import EditRestaurant from "./pages/admin/EditRestaurant";
import PendingRestaurants from "./pages/admin/PendingRestaurants";
import UserProfile from "./pages/profile/UserProfile";
import NotFoundPage from "./pages/NotFoundPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import { Toast } from "./components/ui/Toast";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import RegisterRestaurant from "./pages/restaurant/RegisterRestaurant";
import UpdateRestaurant from "./pages/restaurant/UpdateRestaurant";
import MenuManagement from "./pages/restaurant/MenuManagement";
import AddMenuItem from "./pages/restaurant/AddMenuItem";
import UpdateMenuItem from "./pages/restaurant/UpdateMenuItem";
import RestaurantMenu from "./pages/customer/RestaurantMenu";
import CustomerRestaurants from "./pages/customer/CustomerRestaurants";
import MenuItemDetails from "./pages/customer/MenuItemDetails";
import DeliveryUsr from "./pages/deliveryUsr";
import CustomerOrders from "./pages/customerOrders";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Redirect from root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* User Profile Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute
                  component={UserProfile}
                  allowedRoles={["admin", "restaurant", "customer"]}
                />
              }
            />

            {/* User tracking Route */}
            <Route
              path="/delivery/:id"
              element={
                <ProtectedRoute
                  component={DeliveryUsr}
                  allowedRoles={["admin", "restaurant", "customer"]}
                />
              }
            />

            {/* User deliveries Route */}
            <Route
              path="/delivery"
              element={
                <ProtectedRoute
                  component={CustomerOrders}
                  allowedRoles={["admin", "restaurant", "customer"]}
                />
              }
            />

            {/* Customer Routes */}
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute
                  component={CustomerDashboard}
                  allowedRoles={["customer"]}
                />
              }
            />
            <Route
              path="/customer/restaurants"
              element={<CustomerRestaurants />}
            />
            <Route
              path="/customer/register-restaurant"
              element={
                <ProtectedRoute
                  component={RegisterRestaurant}
                  allowedRoles={["customer"]}
                />
              }
            />
            <Route
              path="/customer/restaurants/:id/menu"
              element={
                <ProtectedRoute
                  component={RestaurantMenu}
                  allowedRoles={["customer"]}
                />
              }
            />
            <Route
              path="/customer/menu-items/:id"
              element={
                <ProtectedRoute
                  component={MenuItemDetails}
                  allowedRoles={["customer"]}
                />
              }
            />

            {/* Restaurant Routes */}
            <Route
              path="/restaurant/dashboard"
              element={
                <ProtectedRoute
                  component={RestaurantDashboard}
                  allowedRoles={["restaurant"]}
                />
              }
            />
            <Route
              path="/restaurant/register"
              element={
                <ProtectedRoute
                  component={RegisterRestaurant}
                  allowedRoles={["restaurant"]}
                />
              }
            />
            <Route
              path="/restaurant/edit/:id"
              element={
                <ProtectedRoute
                  component={UpdateRestaurant}
                  allowedRoles={["restaurant"]}
                />
              }
            />
            <Route
              path="/restaurant/menu"
              element={
                <ProtectedRoute
                  component={MenuManagement}
                  allowedRoles={["restaurant"]}
                />
              }
            />
            <Route
              path="/restaurant/menu/add"
              element={
                <ProtectedRoute
                  component={AddMenuItem}
                  allowedRoles={["restaurant"]}
                />
              }
            />
            <Route
              path="/restaurant/menu/edit/:id"
              element={
                <ProtectedRoute
                  component={UpdateMenuItem}
                  allowedRoles={["restaurant"]}
                />
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute
                  component={AdminDashboard}
                  allowedRoles={["admin"]}
                />
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute
                  component={UsersList}
                  allowedRoles={["admin"]}
                />
              }
            />

            <Route
              path="/admin/users/edit/:id"
              element={
                <ProtectedRoute component={EditUser} allowedRoles={["admin"]} />
              }
            />

            {/* Restaurant Admin Routes */}
            <Route
              path="/admin/restaurants"
              element={
                <ProtectedRoute
                  component={RestaurantsList}
                  allowedRoles={["admin"]}
                />
              }
            />

            <Route
              path="/admin/restaurants/edit/:id"
              element={
                <ProtectedRoute
                  component={EditRestaurant}
                  allowedRoles={["admin"]}
                />
              }
            />

            <Route
              path="/admin/pending-restaurants"
              element={
                <ProtectedRoute
                  component={PendingRestaurants}
                  allowedRoles={["admin"]}
                />
              }
            />

            {/* Catch-all Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
        <Toast />
      </AuthProvider>
    </Router>
  );
}

export default App;
