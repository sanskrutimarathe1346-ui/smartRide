import React, { useState } from "react";

const DailyPassForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    route: "",
    aadhaar: null,
    idProof: null
  });

  const handleChange = (e) => {
    const { name, files, value } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.route) {
      alert("❌ Please enter all details");
      return;
    }

    if (!formData.aadhaar || !formData.idProof) {
      alert("❌ Please upload required documents");
      return;
    }

    onSubmit(formData);
  };

  return (
    <>
      {/* 📄 INSTRUCTIONS */}
      <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-6">
        <h3 className="font-bold text-orange-800 text-lg mb-2">
          🚌 Daily Pass Instructions
        </h3>

        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>Valid for one day only</li>
          <li>Aadhaar Card is required</li>
          <li>Any ID Proof (PAN / Driving License / etc.)</li>
          <li>Enter correct route details</li>
        </ul>

        <p className="mt-2 text-sm text-gray-600">
          Note: Pass will be issued instantly after verification.
        </p>
      </div>

      {/* 📝 FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="input-field"
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="route"
          placeholder="Enter Route (e.g. Swargate → Hinjewadi)"
          className="input-field"
          onChange={handleChange}
          required
        />

        <div>
          <label className="block text-sm font-medium mb-1">Upload Aadhaar Card</label>
          <input type="file" name="aadhaar" onChange={handleChange} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Upload ID Proof</label>
          <input type="file" name="idProof" onChange={handleChange} required />
        </div>

        <button className="btn-primary w-full text-lg">
          Get Daily Pass
        </button>
      </form>
    </>
  );
};

export default DailyPassForm;