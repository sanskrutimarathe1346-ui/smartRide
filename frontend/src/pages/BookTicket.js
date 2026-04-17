import React, { useState } from "react";
import QRCode from "qrcode.react";

const BookTicket = () => {

  const routes = [
    { id: "1", name: "Swargate → Hinjewadi", fare: 30 },
    { id: "2", name: "Katraj → Wakad", fare: 25 },
    { id: "3", name: "Shivajinagar → Hadapsar", fare: 20 },
    { id: "4", name: "Nigdi → Pune Station", fare: 35 }
  ];

  const [form, setForm] = useState({
    routeId: "",
    routeName: "",
    fromStop: "",
    toStop: "",
    travelDate: ""
  });

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedRoute = routes.find(r => r.id === form.routeId);

  // 🔹 Generate Ticket (frontend preview)
  const generateTicket = (e) => {
    e.preventDefault();

    const newTicket = {
      id: "TCK" + Math.floor(Math.random() * 100000),
      ...form,
      fare: selectedRoute?.fare || 0,
      status: "ACTIVE"
    };

    setTicket(newTicket);
  };

  // 🔥 SAVE TO BACKEND (FIXED)
  const confirmBooking = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/tickets/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          routeId: form.routeId,          // ✅ IMPORTANT
          fromStop: form.fromStop,
          toStop: form.toStop,
          passengerCount: 1,
          travelDate: form.travelDate,
          fare: selectedRoute?.fare
        })
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Ticket booked successfully!");

        // ✅ replace preview with real backend ticket (QR included)
        setTicket(data.ticket);
      } else {
        alert(data.message || "❌ Booking failed");
      }

    } catch (err) {
      console.error(err);
      alert("❌ Server error");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">

      <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-xl">

        <h1 className="text-3xl font-bold text-center mb-6">🎫 QR Ticket Booking</h1>

        <form onSubmit={generateTicket} className="space-y-4">

          <select
            className="w-full border rounded-xl px-4 py-3"
            required
            onChange={(e) => {
              const selected = routes.find(r => r.id === e.target.value);
              setForm({
                ...form,
                routeId: selected.id,
                routeName: selected.name
              });
            }}
          >
            <option value="">Select Route</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <input
            className="w-full border rounded-xl px-4 py-3"
            placeholder="From Stop"
            required
            onChange={(e) => setForm({ ...form, fromStop: e.target.value })}
          />

          <input
            className="w-full border rounded-xl px-4 py-3"
            placeholder="To Stop"
            required
            onChange={(e) => setForm({ ...form, toStop: e.target.value })}
          />

          <input
            type="date"
            className="w-full border rounded-xl px-4 py-3"
            required
            onChange={(e) => setForm({ ...form, travelDate: e.target.value })}
          />

          {/* Fare Preview */}
          {selectedRoute && (
            <div className="bg-blue-50 p-3 rounded-xl text-blue-700 font-medium">
              Fare: ₹{selectedRoute.fare}
            </div>
          )}

          <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold">
            Generate QR Ticket
          </button>

        </form>

        {/* Ticket Display */}
        {ticket && (

          <div className="mt-8 border rounded-2xl p-6 bg-gray-50">

            <h2 className="text-lg font-bold mb-3">🎟 Ticket Generated</h2>

            <p><b>ID:</b> {ticket.ticketNumber || ticket.id}</p>
            <p>{ticket.fromStop} → {ticket.toStop}</p>
            <p>Date: {ticket.travelDate?.substring(0, 10) || ticket.date}</p>
            <p>Fare: ₹{ticket.totalAmount || ticket.fare}</p>
            <p>Status: {ticket.status}</p>

            {/* ✅ BACKEND QR */}
            <div className="flex justify-center my-4">
              {ticket.qrCode ? (
                <img src={ticket.qrCode} alt="QR" className="w-40 h-40" />
              ) : (
                <QRCode value={JSON.stringify(ticket)} size={160} />
              )}
            </div>

            <button
              onClick={confirmBooking}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
            >
              {loading ? "Booking..." : "Book Ticket Successfully"}
            </button>

          </div>

        )}

      </div>
    </div>

  );
};

export default BookTicket;