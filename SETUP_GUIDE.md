# SmartRide PMPML - Complete Setup Guide

## 📋 Project Structure Created

Your project has been set up with the following structure:

```
smartride-pmpml/
├── backend/              # Node.js + Express + MongoDB backend
│   ├── config/          # Database configuration
│   ├── models/          # Mongoose models (User, Ticket, Pass, Bus, Route, Feedback)
│   ├── routes/          # API routes (auth, tickets, passes, buses, routes, feedback)
│   ├── middleware/      # Auth and validation middleware
│   ├── server.js        # Main server file with Socket.io
│   ├── package.json     # Backend dependencies
│   └── .env.example     # Environment variables template
│
├── frontend/            # React frontend application
│   ├── public/         # Static files
│   ├── src/
│   │   ├── components/ # Reusable React components
│   │   ├── pages/      # Page components
│   │   ├── contexts/   # React contexts (Auth)
│   │   ├── services/   # API and Socket services
│   │   ├── App.js      # Main App component
│   │   └── index.js    # Entry point
│   ├── package.json    # Frontend dependencies
│   ├── tailwind.config.js
│   └── .env.example    # Frontend environment variables
│
├── COMPONENTS_TEMPLATE.md  # Component code templates
├── README.md              # Main documentation
└── .gitignore            # Git ignore rules
```

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ installed
- MongoDB v5+ installed and running
- Git installed

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Backend Environment

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env file with your configurations
# IMPORTANT: Update JWT_SECRET, MONGODB_URI, and API keys
nano .env
```

Required environment variables:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Strong secret key (minimum 32 characters)
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Get from Razorpay dashboard
- `GOOGLE_MAPS_API_KEY`: Get from Google Cloud Console

### Step 3: Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

Backend will run on `http://localhost:5000`

### Step 4: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Step 5: Configure Frontend Environment

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env file
nano .env
```

Update:
- `REACT_APP_API_URL=http://localhost:5000/api`
- `REACT_APP_SOCKET_URL=http://localhost:5000`
- `REACT_APP_RAZORPAY_KEY_ID`: Same as backend
- `REACT_APP_GOOGLE_MAPS_API_KEY`: Same as backend

### Step 6: Create Remaining Frontend Files

The `COMPONENTS_TEMPLATE.md` file contains code for all components. Create these files:

#### Essential Components (create these first):

**src/components/Navbar.js** - Navigation bar
**src/components/Footer.js** - Footer component
**src/components/PrivateRoute.js** - Route protection
**src/components/Loading.js** - Loading spinner
**src/components/QRCodeDisplay.js** - QR code display

#### Essential Pages (create these):

**src/pages/Home.js** - Landing page (code in COMPONENTS_TEMPLATE.md)
**src/pages/Login.js** - Login page (template below)
**src/pages/Register.js** - Registration page
**src/pages/Dashboard.js** - User dashboard
**src/pages/BookTicket.js** - Ticket booking
**src/pages/MyTickets.js** - View tickets
**src/pages/BuyPass.js** - Purchase passes
**src/pages/MyPasses.js** - View passes
**src/pages/LiveTracking.js** - Bus tracking map
**src/pages/Feedback.js** - Submit feedback
**src/pages/Profile.js** - User profile
**src/pages/admin/AdminDashboard.js** - Admin panel

### Step 7: Start Frontend

```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 📝 Quick Page Templates

### Login Page Template (src/pages/Login.js)

```jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-display font-bold text-center text-gray-800 mb-8">
          Welcome Back!
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-4 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="input-field pl-10"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-4 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="input-field pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
```

### Dashboard Template (src/pages/Dashboard.js)

```jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ticketAPI, passAPI } from '../services/api';
import { FaTicketAlt, FaIdCard, FaMapMarkedAlt, FaComments } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [recentTickets, setRecentTickets] = useState([]);
  const [activePass, setActivePass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ticketsRes, passRes] = await Promise.all([
        ticketAPI.getMyTickets({ limit: 5 }),
        passAPI.getActivePass().catch(() => ({ data: { pass: null } }))
      ]);
      
      setRecentTickets(ticketsRes.data.tickets);
      setActivePass(passRes.data.pass);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { title: 'Book Ticket', icon: <FaTicketAlt />, link: '/book-ticket', color: 'bg-blue-500' },
    { title: 'Buy Pass', icon: <FaIdCard />, link: '/buy-pass', color: 'bg-green-500' },
    { title: 'Live Tracking', icon: <FaMapMarkedAlt />, link: '/tracking', color: 'bg-purple-500' },
    { title: 'Feedback', icon: <FaComments />, link: '/feedback', color: 'bg-orange-500' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-2">Welcome, {user?.name}!</h1>
      <p className="text-gray-600 mb-8">Manage your bus travel efficiently</p>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className={`${action.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition flex flex-col items-center justify-center text-center`}
          >
            <div className="text-4xl mb-3">{action.icon}</div>
            <h3 className="font-semibold text-lg">{action.title}</h3>
          </Link>
        ))}
      </div>

      {/* Active Pass */}
      {activePass && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Active Pass</h2>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
            <p className="text-sm opacity-90">Pass Number</p>
            <p className="text-2xl font-bold mb-2">{activePass.passNumber}</p>
            <p className="text-sm">Valid until: {new Date(activePass.validUntil).toLocaleDateString()}</p>
            <Link to="/my-passes" className="mt-4 inline-block bg-white text-green-600 px-4 py-2 rounded-lg font-medium">
              View Details
            </Link>
          </div>
        </div>
      )}

      {/* Recent Tickets */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Recent Tickets</h2>
        {loading ? (
          <p>Loading...</p>
        ) : recentTickets.length > 0 ? (
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <div key={ticket._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{ticket.fromStop} → {ticket.toStop}</p>
                  <p className="text-sm text-gray-600">{ticket.ticketNumber}</p>
                </div>
                <span className={`badge ${
                  ticket.status === 'booked' ? 'badge-success' :
                  ticket.status === 'used' ? 'badge-info' :
                  'badge-danger'
                }`}>
                  {ticket.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No tickets found. <Link to="/book-ticket" className="text-primary-600">Book your first ticket!</Link></p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
```

## 🗄️ Database Setup

### Create Sample Data (Optional)

You can run these commands in MongoDB shell or use MongoDB Compass:

```javascript
// Create sample routes
db.routes.insertOne({
  routeNumber: "1",
  routeName: "Swargate to Hadapsar",
  startPoint: { name: "Swargate", latitude: 18.5018, longitude: 73.8636 },
  endPoint: { name: "Hadapsar", latitude: 18.5089, longitude: 73.9260 },
  distance: 12,
  estimatedDuration: 45,
  baseFare: 10,
  farePerKm: 2,
  operatingHours: { firstBus: "05:30", lastBus: "23:00" },
  frequency: 15,
  isActive: true,
  stops: [
    { stopName: "Market Yard", latitude: 18.5045, longitude: 73.8700, sequence: 1, estimatedArrivalTime: 10 },
    { stopName: "Pune Station", latitude: 18.5285, longitude: 73.8742, sequence: 2, estimatedArrivalTime: 20 }
  ]
});
```

### Create Admin User

```javascript
// In your backend, add this script or use registration with role: 'admin'
// Password will be hashed automatically by the User model
```

## 🔑 API Keys Setup

### 1. Razorpay (Payment Gateway)
1. Sign up at https://razorpay.com
2. Go to Dashboard → Settings → API Keys
3. Generate Test/Live keys
4. Add to .env files

### 2. Google Maps API
1. Go to Google Cloud Console
2. Create new project
3. Enable Maps JavaScript API & Geocoding API
4. Create API key
5. Add to .env files

## 🧪 Testing the Application

### Test Backend API

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "password": "password123"
  }'
```

### Test Frontend
1. Open http://localhost:3000
2. Register a new account
3. Login with credentials
4. Explore features

## 📱 Features Implementation Checklist

- [x] User Authentication (Register/Login)
- [x] Ticket Booking System
- [x] Pass Purchase System  
- [x] QR Code Generation
- [x] Live Bus Tracking (Socket.io)
- [x] Admin Dashboard
- [x] Feedback System
- [ ] Payment Integration (Razorpay - needs API keys)
- [ ] Email Notifications (needs email config)
- [ ] SMS Alerts (needs SMS gateway)

## 🐛 Common Issues & Solutions

### MongoDB Connection Error
```
Error: Cannot connect to MongoDB
```
**Solution**: Ensure MongoDB is running: `sudo systemctl start mongod`

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution**: Change PORT in backend/.env or kill process: `lsof -ti:5000 | xargs kill`

### Module Not Found
```
Error: Cannot find module 'express'
```
**Solution**: Run `npm install` in backend directory

### CORS Error in Frontend
```
Error: CORS policy blocked
```
**Solution**: Check FRONTEND_URL in backend/.env matches your frontend URL

## 📊 Project Features Overview

### For Passengers
✅ Online ticket booking with QR codes
✅ Daily/Monthly pass purchase
✅ Real-time bus tracking on map
✅ View booking history
✅ Submit feedback and complaints
✅ Profile management

### For Conductors
✅ Scan and verify tickets/passes
✅ View assigned bus details
✅ Track passenger count

### For Drivers
✅ Update live location
✅ View route information
✅ Access bus details

### For Admins
✅ Complete dashboard with analytics
✅ Manage buses, routes, users
✅ View feedback and complaints
✅ Generate reports
✅ System-wide announcements

## 🚀 Deployment

### Backend Deployment (Railway/Render/Heroku)
1. Create account on hosting platform
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Build production: `npm run build`
2. Deploy build folder
3. Configure environment variables

## 📞 Support

For issues or questions:
- Check README.md
- Review COMPONENTS_TEMPLATE.md
- Contact team members

## 🎓 Academic Information

**Project Title**: SmartRide PMPML: Daily QR Pass, Digital Ticketing & Live Tracking System

**Institution**: Dr. D. Y. Patil Institute of Technology, Pune

**Team Members**:
- Sanskruti Jagdish Marathe (TCOA19)
- Abhijeet Milan Gaikar (TCOB03)
- Yuvraj Charansing Pardeshi (TCOA72)

**Guide**: Prof. Sharad Adsure

**Year**: 2025-2026

---

## ✨ Next Steps

1. ✅ Backend is complete and ready to run
2. ✅ Frontend structure is set up
3. ⏭️ Create remaining page components from templates
4. ⏭️ Add custom styling and branding
5. ⏭️ Test all features thoroughly
6. ⏭️ Deploy to production

**Congratulations! Your SmartRide PMPML project foundation is complete! 🎉**
