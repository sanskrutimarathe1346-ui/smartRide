import React, { useState } from "react";

const StudentPassForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    bonafide: null,
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

    if (!formData.name || !formData.college) {
      alert("❌ Please fill all basic details");
      return;
    }

    if (
      !formData.bonafide ||
      !formData.aadhaar ||
      !formData.addressProof ||
      !formData.photo
    ) {
      alert("❌ Please upload all required documents");
      return;
    }

    onSubmit(formData);
  };

  return (
    <>
      {/* 📄 INSTRUCTIONS */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
        <h3 className="font-bold text-blue-800 text-lg mb-2">
          🎓 Student Pass Requirements
        </h3>

        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>Bonafide Certificate / Fee Receipt (from college)</li>
          <li>Aadhaar Card</li>
          <li>Address Proof (Light Bill / Ration Card)</li>
          <li>Passport Size Photo</li>
        </ul>

        <p className="mt-2 text-sm text-gray-600">
          Note: Bonafide must be signed and stamped by college authority.
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
          name="college"
          placeholder="College Name"
          className="input-field"
          onChange={handleChange}
          required
        />

        <div>
          <label className="block text-sm font-medium mb-1">
            Upload Bonafide Certificate
          </label>
          <input type="file" name="bonafide" onChange={handleChange} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Upload Aadhaar Card
          </label>
          <input type="file" name="aadhaar" onChange={handleChange} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Upload Address Proof
          </label>
          <input type="file" name="addressProof" onChange={handleChange} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Upload Photo
          </label>
          <input type="file" name="photo" onChange={handleChange} required />
        </div>

        <button className="btn-primary w-full text-lg">
          Submit Student Pass
        </button>
      </form>
    </>
  );
};

export default StudentPassForm;