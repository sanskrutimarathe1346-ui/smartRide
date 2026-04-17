import React, { useState } from "react";

const MonthlyPassForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    aadhaar: null,
    photo: null,
    addressProof: null
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

    if (!formData.name) {
      alert("❌ Please enter your name");
      return;
    }

    if (!formData.aadhaar || !formData.photo || !formData.addressProof) {
      alert("❌ Please upload all required documents");
      return;
    }

    onSubmit(formData);
  };

  return (
    <>
      {/* 📄 INSTRUCTIONS */}
      <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
        <h3 className="font-bold text-green-800 text-lg mb-2">
          📄 Monthly Pass Requirements
        </h3>

        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>Aadhaar Card (Mandatory)</li>
          <li>Passport Size Photo</li>
          <li>Address Proof (Light Bill / Ration Card / etc.)</li>
        </ul>

        <p className="mt-2 text-sm text-gray-600">
          Note: All documents must be clear and valid. Incomplete applications will be rejected.
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

        <div>
          <label className="block text-sm font-medium mb-1">Upload Aadhaar Card</label>
          <input type="file" name="aadhaar" onChange={handleChange} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Upload Photo</label>
          <input type="file" name="photo" onChange={handleChange} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Upload Address Proof</label>
          <input type="file" name="addressProof" onChange={handleChange} required />
        </div>

        <button className="btn-primary w-full text-lg">
          Submit Monthly Pass
        </button>
      </form>
    </>
  );
};

export default MonthlyPassForm;