import React, { useState } from "react";

const SeniorPassForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    ageProof: null,
    aadhaar: null,
    addressProof: null,
    photo: null
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

    if (!formData.name || !formData.age) {
      alert("❌ Please enter all details");
      return;
    }

    if (formData.age < 60) {
      alert("❌ Only 60+ allowed");
      return;
    }

    if (
      !formData.ageProof ||
      !formData.aadhaar ||
      !formData.addressProof ||
      !formData.photo
    ) {
      alert("❌ Upload all documents");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mb-6">
  <h3 className="font-bold text-purple-800 text-lg mb-2">
    📄 Senior Citizen Pass Requirements
  </h3>

  <ul className="list-disc pl-5 space-y-1 text-gray-700">
    <li>Age must be 60 years or above</li>
    <li>Age Proof (PAN / Passport / School Leaving)</li>
    <li>Aadhaar Card</li>
    <li>Address Proof</li>
    <li>Passport Size Photo</li>
  </ul>

  <p className="mt-2 text-sm text-red-600 font-medium">
    Only applicants above 60 years are eligible.
  </p>
</div>

      <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="input-field"
          onChange={handleChange}
          required
        />
      <input type="number" name="age" placeholder="Age"  className="input-field" onChange={handleChange} required />

      <input type="file" name="ageProof" onChange={handleChange} required />
      <input type="file" name="aadhaar" onChange={handleChange} required />
      <input type="file" name="addressProof" onChange={handleChange} required />
      <input type="file" name="photo" onChange={handleChange} required />

      <button className="btn-primary w-full">Submit Senior Pass</button>
    </form>
  );
};

export default SeniorPassForm;