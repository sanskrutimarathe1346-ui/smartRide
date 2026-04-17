import React, { useState } from 'react';
import axios from "axios";

import StudentPassForm from '../components/passForms/StudentPassForm';
import MonthlyPassForm from '../components/passForms/MonthlyPassForm';
import SeniorPassForm from '../components/passForms/SeniorPassForm';
import DailyPassForm from '../components/passForms/DailyPassForm';

const BuyPass = () => {

  const [passType, setPassType] = useState('');
  const [msg, setMsg] = useState('');

  const passTypes = [
    { type: "student", label: "🎓 Student Pass", color: "bg-blue-500" },
    { type: "monthly", label: "📅 Monthly Pass", color: "bg-green-500" },
    { type: "senior", label: "👴 Senior Pass", color: "bg-purple-500" },
    { type: "daily", label: "🚌 Daily Pass", color: "bg-orange-500" }
  ];

 const handleSubmit = async (formData) => {
  try {
    setMsg("");

    const token = localStorage.getItem("token");

    const data = new FormData();

    data.append("passType", passType);
    data.append("name", formData.name);

    if (formData.college) data.append("college", formData.college);
    if (formData.route) data.append("route", formData.route);
    if (formData.age) data.append("age", formData.age);

    // ✅ FIX FILES
    Object.values(formData).forEach((value) => {
      if (value instanceof File) {
        data.append("documents", value);
      }
    });

    
    const res = await axios.post(
  "http://localhost:5000/api/passes/apply", // ✅ FIXED
  data,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

    setMsg("success");
    setPassType("");

  } catch (error) {
    console.error(error);
    setMsg("error");
  }
};

  return (
    <div className="w-full px-12 py-10">

      <h1 className="text-3xl font-bold mb-10 text-center">
        Apply for Bus Pass
      </h1>

      {passType && (
        <div className="text-center">
          <button
            onClick={() => {
              setPassType('');
              setMsg("");
            }}
            className="mb-6 text-lg font-semibold text-blue-700 underline"
          >
            ← Change Pass Type
          </button>
        </div>
      )}

      {!passType && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {passTypes.map((p, index) => (
            <button
              key={index}
              className={`${p.color} text-white w-full h-36 rounded-2xl shadow-lg hover:scale-105`}
              onClick={() => {
                setPassType(p.type);
                setMsg("");
              }}
            >
              <div className="text-3xl">{p.label.split(" ")[0]}</div>
              <div>{p.label.replace(p.label.split(" ")[0], "")}</div>
            </button>
          ))}
        </div>
      )}

      <div className="max-w-md mx-auto mt-12">

        {passType === "student" && (
          <StudentPassForm onSubmit={handleSubmit} />
        )}

        {passType === "monthly" && (
          <MonthlyPassForm onSubmit={handleSubmit} />
        )}

        {passType === "senior" && (
          <SeniorPassForm onSubmit={handleSubmit} />
        )}

        {passType === "daily" && (
          <DailyPassForm onSubmit={handleSubmit} />
        )}

        {msg === "success" && (
          <p className="mt-4 text-center text-green-600 font-medium">
            ✅ Pass Application Submitted Successfully!
          </p>
        )}

        {msg === "error" && (
          <p className="mt-4 text-center text-red-600 font-medium">
            ❌ Failed to submit pass
          </p>
        )}

      </div>

    </div>
  );
};

export default BuyPass;