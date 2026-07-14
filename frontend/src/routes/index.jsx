import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Loading/Spinner';

const HomePage = lazy(() => import('../pages/Home/HomePage'));
const ProductListPage = lazy(() => import('../pages/Product/ProductListPage'));
const ProductDetailPage = lazy(() => import('../pages/Product/ProductDetailPage'));
const CartPage = lazy(() => import('../pages/Cart/CartPage'));
const CheckoutPage = lazy(() => import('../pages/Checkout/CheckoutPage'));
const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/Auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/Auth/ForgotPasswordPage'));
const ProfilePage = lazy(() => import('../pages/User/ProfilePage'));
const OrdersPage = lazy(() => import('../pages/User/OrdersPage'));
const OrderDetailPage = lazy(() => import('../pages/User/OrderDetailPage'));
const WishlistPage = lazy(() => import('../pages/User/WishlistPage'));
const SellerDashboardPage = lazy(() => import('../pages/Seller/SellerDashboardPage'));
const SellerProductsPage = lazy(() => import('../pages/Seller/SellerProductsPage'));
const SellerProductNewPage = lazy(() => import('../pages/Seller/SellerProductNewPage'));
const SellerProductEditPage = lazy(() => import('../pages/Seller/SellerProductEditPage'));
const SellerOrdersPage = lazy(() => import('../pages/Seller/SellerOrdersPage'));
const ChatPage = lazy(() => import('../pages/Chat/ChatPage'));
const SearchResultsPage = lazy(() => import('../pages/Search/SearchResultsPage'));
const AdminDashboardPage = lazy(() => import('../pages/Admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../pages/Admin/AdminUsersPage'));
const AdminProductsPage = lazy(() => import('../pages/Admin/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('../pages/Admin/AdminOrdersPage'));
const AdminSettingsPage = lazy(() => import('../pages/Admin/AdminSettingsPage'));
const AboutPage = lazy(() => import('../pages/Static/AboutPage'));
const ContactPage = lazy(() => import('../pages/Static/ContactPage'));
const FAQPage = lazy(() => import('../pages/Static/FAQPage'));
const TermsPage = lazy(() => import('../pages/Static/TermsPage'));
const PrivacyPage = lazy(() => import('../pages/Static/PrivacyPage'));
const NotFoundPage = lazy(() => import('../pages/NotFound/NotFoundPage'));
const SellPage = lazy(() => import('../pages/Sell/SellPage'));
const ComparePage = lazy(() => import('../pages/Compare/ComparePage'));

const Loading = () => <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner size="lg" /></div>;

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" />;
  return children;
}

function SellerRoute({ children }) {
  return <ProtectedRoute roles={['seller', 'admin']}>{children}</ProtectedRoute>;
}

function AdminRoute({ children }) {
  return <ProtectedRoute roles={['admin']}>{children}</ProtectedRoute>;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/sell" element={<SellPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/seller/dashboard" element={<SellerRoute><SellerDashboardPage /></SellerRoute>} />
        <Route path="/seller/products" element={<SellerRoute><SellerProductsPage /></SellerRoute>} />
        <Route path="/seller/products/new" element={<SellerRoute><SellerProductNewPage /></SellerRoute>} />
        <Route path="/seller/products/:id/edit" element={<SellerRoute><SellerProductEditPage /></SellerRoute>} />
        <Route path="/seller/orders" element={<SellerRoute><SellerOrdersPage /></SellerRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
