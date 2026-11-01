import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Sidebar from '../components/layout/Sidebar';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import Home from '../pages/public/Home';
import Marketplace from '../pages/public/Marketplace';
import ProductDetails from '../pages/public/ProductDetails';
import FarmerProfile from '../pages/public/FarmerProfile';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Consumer Pages
import ConsumerDashboard from '../pages/consumer/ConsumerDashboard';
import CartPage from '../pages/consumer/CartPage';
import CheckoutPage from '../pages/consumer/CheckoutPage';
import OrderTracking from '../pages/consumer/OrderTracking';
import AddressesPage from '../pages/consumer/AddressesPage';
import WishlistPage from '../pages/consumer/WishlistPage';
import FollowedFarmsPage from '../pages/consumer/FollowedFarmsPage';

// Farmer Pages
import FarmerDashboard from '../pages/farmer/FarmerDashboard';
import MyProducts from '../pages/farmer/MyProducts';
import AddEditProduct from '../pages/farmer/AddEditProduct';
import FarmerOrders from '../pages/farmer/FarmerOrders';
import FarmerProfileSettings from '../pages/farmer/FarmerProfileSettings';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminFarmers from '../pages/admin/AdminFarmers';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminCategories from '../pages/admin/AdminCategories';

// Public Layout Wrapper
const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-[#fbfaf8]">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

// Portal Layout (Farmer / Admin with Sidebar)
const PortalLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-[#fbfaf8]">
    <Navbar />
    <div className="flex-1 flex max-w-7xl w-full mx-auto">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
    </div>
    <Footer />
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Storefront Routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/marketplace" element={<PublicLayout><Marketplace /></PublicLayout>} />
      <Route path="/products/:id" element={<PublicLayout><ProductDetails /></PublicLayout>} />
      <Route path="/farmers/:farmerId" element={<PublicLayout><FarmerProfile /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

      {/* Auth Routes */}
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
      <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />

      {/* Consumer Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['consumer', 'farmer', 'admin']} />}>
        <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />
        <Route path="/wishlist" element={<PublicLayout><WishlistPage /></PublicLayout>} />
        <Route path="/orders/:id" element={<PublicLayout><OrderTracking /></PublicLayout>} />
        <Route path="/orders" element={<PublicLayout><ConsumerDashboard /></PublicLayout>} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['consumer']} />}>
        <Route path="/consumer/dashboard" element={<PublicLayout><ConsumerDashboard /></PublicLayout>} />
        <Route path="/consumer/followed-farms" element={<PublicLayout><FollowedFarmsPage /></PublicLayout>} />
        <Route path="/checkout" element={<PublicLayout><CheckoutPage /></PublicLayout>} />
        <Route path="/addresses" element={<PublicLayout><AddressesPage /></PublicLayout>} />
      </Route>

      {/* Farmer Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['farmer', 'admin']} />}>
        <Route path="/farmer/dashboard" element={<PortalLayout><FarmerDashboard /></PortalLayout>} />
        <Route path="/farmer/products" element={<PortalLayout><MyProducts /></PortalLayout>} />
        <Route path="/farmer/products/new" element={<PortalLayout><AddEditProduct /></PortalLayout>} />
        <Route path="/farmer/products/edit/:id" element={<PortalLayout><AddEditProduct /></PortalLayout>} />
        <Route path="/farmer/orders" element={<PortalLayout><FarmerOrders /></PortalLayout>} />
        <Route path="/farmer/profile" element={<PortalLayout><FarmerProfileSettings /></PortalLayout>} />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<PortalLayout><AdminDashboard /></PortalLayout>} />
        <Route path="/admin/users" element={<PortalLayout><AdminUsers /></PortalLayout>} />
        <Route path="/admin/farmers" element={<PortalLayout><AdminFarmers /></PortalLayout>} />
        <Route path="/admin/products" element={<PortalLayout><AdminProducts /></PortalLayout>} />
        <Route path="/admin/orders" element={<PortalLayout><AdminOrders /></PortalLayout>} />
        <Route path="/admin/categories" element={<PortalLayout><AdminCategories /></PortalLayout>} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
