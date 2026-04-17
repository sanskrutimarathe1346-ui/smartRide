import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookTicket from './pages/BookTicket';
import MyTickets from './pages/MyTickets';
import BuyPass from './pages/BuyPass';
import MyPasses from './pages/MyPasses';
import LiveTracking from './pages/LiveTracking';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">

          {/* NAVBAR */}
          <Navbar />

          {/* MAIN CONTENT */}
          <main className="flex-grow">
            <Routes>

              {/* ---------------- PUBLIC ROUTES ---------------- */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/tracking" element={<LiveTracking />} />

              {/* ---------------- PASSENGER ROUTES ---------------- */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/book-ticket"
                element={
                  <PrivateRoute>
                    <BookTicket />
                  </PrivateRoute>
                }
              />

              <Route
                path="/my-tickets"
                element={
                  <PrivateRoute>
                    <MyTickets />
                  </PrivateRoute>
                }
              />

              <Route
                path="/buy-pass"
                element={
                  <PrivateRoute>
                    <BuyPass />
                  </PrivateRoute>
                }
              />

              <Route
                path="/my-passes"
                element={
                  <PrivateRoute>
                    <MyPasses />
                  </PrivateRoute>
                }
              />

              <Route
                path="/feedback"
                element={
                  <PrivateRoute>
                    <Feedback />
                  </PrivateRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />

              {/* ---------------- ADMIN ROUTE ---------------- */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute requiredRole="admin">
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />

              {/* ---------------- 404 ROUTE ---------------- */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </main>

          {/* FOOTER */}
          <Footer />

        </div>

        {/* TOAST NOTIFICATIONS */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

      </Router>
    </AuthProvider>
  );
}

export default App;