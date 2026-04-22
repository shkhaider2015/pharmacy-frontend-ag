import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import Categories from './screens/Categories';
import Inventory from './screens/Inventory';
import Suppliers from './screens/Suppliers';
import Products from './screens/Products';
import Users from './screens/Users';
import Orders from './screens/Orders';
import { useAuthStore } from './store/authStore';

const ProtectedRoute = () => {
  const token = useAuthStore(state => state.token);
  console.log("Token in app ", token)
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const PublicRoute = () => {
  const token = useAuthStore(state => state.token);
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="categories" element={<Categories />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="products" element={<Products />} />
            <Route path="users" element={<Users />} />
            <Route path="orders" element={<Orders />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
