import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
//import { ticketAPI } from '../services/api';
import axios from 'axios';

import { FaTicketAlt, FaIdCard, FaMapMarkedAlt, FaComments } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();

  const [recentTickets, setRecentTickets] = useState([]);
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem("token");

    const [ticketsRes, passesRes] = await Promise.all([
      axios.get("http://localhost:5000/api/tickets/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      axios.get("http://localhost:5000/api/passes/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ]);

    setRecentTickets(ticketsRes.data.tickets);
    setPasses(passesRes.data.passes);

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
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

      <h1 className="text-3xl font-bold mb-2">
        Welcome, {user?.name}!
      </h1>

      <p className="text-gray-600 mb-8">
        Manage your bus travel efficiently
      </p>

      {/* QUICK ACTIONS */}
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

      {/* 🪪 USER PASSES */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">My Passes</h2>

        {passes.length === 0 ? (
          <p>No passes found</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {passes.map((pass) => (
              <div key={pass._id} className="bg-gray-50 p-4 rounded-lg shadow">

  <h3 className="font-bold text-lg mb-2">
    {pass.passType.toUpperCase()} PASS
  </h3>

  <p><strong>Name:</strong> {pass.name}</p>

  {pass.college && (
    <p><strong>College:</strong> {pass.college}</p>
  )}

  {pass.route && (
    <p><strong>Route:</strong> {pass.route}</p>
  )}

  {/* ✅ STATUS BADGE */}
  <p className="mt-2">
    <strong>Status:</strong>
    <span className={`ml-2 font-semibold ${
      pass.status === "approved"
        ? "text-green-600"
        : pass.status === "pending"
        ? "text-yellow-600"
        : "text-red-600"
    }`}>
      {pass.status.toUpperCase()}
    </span>
  </p>

  {/* ✅ APPROVED PASS CARD */}
  {pass.status === "approved" && (
    <div className="mt-4 border-2 border-green-500 rounded-xl p-4 bg-green-50 shadow-md">

      <h4 className="font-bold text-green-700 text-center">
        PMPML BUS PASS
      </h4>

      <p className="text-xs text-center text-gray-500 mb-2">
        Valid for 30 days
      </p>

      <p><strong>Name:</strong> {pass.name}</p>
      <p><strong>Type:</strong> {pass.passType}</p>

      {pass.route && (
        <p><strong>Route:</strong> {pass.route}</p>
      )}

      {/* 🔥 QR SECTION */}
      <div className="flex flex-col items-center mt-4">

        {pass.qrCode ? (
          <img
            src={pass.qrCode}
            alt="QR Code"
            className="w-32 h-32 border rounded-lg"
          />
        ) : (
          <p className="text-red-500 text-sm mt-2">
            QR not generated yet
          </p>
        )}

      </div>

    </div>
  )}

</div>
          
            ))}
          </div>
        )}
      </div>

      {/* 🎫 RECENT TICKETS (ENHANCED UI) */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">My Tickets</h2>

        {loading ? (
          <p>Loading...</p>
        ) : recentTickets.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

            {recentTickets.map((ticket) => (
              <div key={ticket._id} className="bg-gray-50 p-4 rounded-lg shadow">

                <h3 className="font-bold text-lg mb-2">
                  {ticket.fromStop} → {ticket.toStop}
                </h3>

                <p className="text-sm text-gray-600 mb-1">
                  ID: {ticket.ticketNumber}
                </p>

                <p className="text-sm">
                  Fare: ₹{ticket.totalAmount}
                </p>

                <p className="text-sm">
                  Date: {ticket.travelDate?.substring(0, 10)}
                </p>

                {/* ✅ STATUS */}
                <p className="mt-2">
                  <strong>Status:</strong>
                  <span className={`ml-2 font-semibold ${
                    ticket.status === "active"
                      ? "text-green-600"
                      : ticket.status === "used"
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}>
                    {ticket.status.toUpperCase()}
                  </span>
                </p>

                {/* ✅ QR CODE */}
                {ticket.qrCode && (
                  <div className="mt-3 flex justify-center">
                    <img
                      src={ticket.qrCode}
                      alt="QR"
                      className="w-28 h-28"
                    />
                  </div>
                )}

              </div>
            ))}

          </div>
        ) : (
          <p className="text-gray-600">
            No tickets found.{" "}
            <Link to="/book-ticket" className="text-blue-600">
              Book your first ticket!
            </Link>
          </p>
        )}
      </div>

    </div>
  );
};

export default Dashboard;