import React from 'react';
import { Link } from 'react-router-dom';
import { FaBus, FaQrcode, FaMapMarkedAlt, FaClock, FaShieldAlt, FaTicketAlt } from 'react-icons/fa';

const Home = () => {
  const features = [
    {
      icon: <FaQrcode className="text-4xl" />,
      title: 'QR-Based Ticketing',
      description: 'Book tickets online and get instant QR codes. No more waiting in queues!'
    },
    {
      icon: <FaMapMarkedAlt className="text-4xl" />,
      title: 'Live Bus Tracking',
      description: 'Track your bus in real-time on the map. Know exactly when it will arrive.'
    },
    {
      icon: <FaClock className="text-4xl" />,
      title: 'Daily & Monthly Passes',
      description: 'Purchase passes online with special discounts for students and seniors.'
    },
    {
      icon: <FaShieldAlt className="text-4xl" />,
      title: 'Secure Payments',
      description: 'Integrated with Razorpay for safe and secure digital payments.'
    },
    {
      icon: <FaTicketAlt className="text-4xl" />,
      title: 'Pass Booking',
      description: 'Book daily or monthly bus passes online instantly without standing in queues.'
    }
  ];

  return (
    <div>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <FaBus className="text-6xl mx-auto mb-6 animate-bounce-slow" />
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
            SmartRide PMPML
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Your Digital Companion for Pune City Buses
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-accent px-8 py-4 text-lg">
              Get Started
            </Link>

            <Link
              to="/tracking"
              className="bg-white text-primary-700 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100"
            >
              Track Live Buses
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-4xl font-bold text-center mb-12">
            Why Choose SmartRide?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
             key={index}
            className="card text-center hover:scale-105 transition-transform cursor-default"
            >
                <div className="text-primary-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>

                <h3 className="font-bold text-xl mb-2">
                  {feature.title}
                </h3>

                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-16 bg-primary-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">250+</div>
              <div className="text-primary-200">Active Buses</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-primary-200">Routes</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-primary-200">Daily Passengers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-primary-200">Service Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold mb-6">
            Ready to Experience Smart Travel?
          </h2>

          <p className="text-xl text-gray-600 mb-8">
            Join thousands of commuters who travel smartly with SmartRide PMPML
          </p>

          <Link to="/register" className="btn-primary px-10 py-4 text-lg inline-block">
            Create Free Account
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;