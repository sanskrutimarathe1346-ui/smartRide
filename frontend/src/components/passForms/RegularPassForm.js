import React, { useState } from "react";

const RegularPassForm = ({ onSubmit }) => {
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
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Full Name" onChange={handleChange} required />

      <input type="file" name="aadhaar" onChange={handleChange} required />
      <input type="file" name="photo" onChange={handleChange} required />
      <input type="file" name="addressProof" onChange={handleChange} required />

      <button type="submit">Submit Regular Pass</button>
    </form>
  );
};

export default RegularPassForm;