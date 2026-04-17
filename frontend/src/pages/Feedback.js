
import React, { useState } from 'react';
import { feedbackAPI } from '../services/api';

const Feedback = () => {
  const [text,setText]=useState('');
  const [msg,setMsg]=useState('');

  const submit=async(e)=>{
    e.preventDefault();
    try{
      await feedbackAPI.sendFeedback({message:text});
      setMsg('✅ Feedback submitted');
      setText('');
    }catch{
      setMsg('❌ Failed to submit');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">Send Feedback</h1>
        <form onSubmit={submit} className="space-y-3">
          <textarea className="input w-full" rows="4" required
            value={text} onChange={e=>setText(e.target.value)}
            placeholder="Write your feedback..." />
          <button className="btn-primary w-full">Submit</button>
        </form>
        {msg && <p className="mt-3">{msg}</p>}
      </div>
    </div>
  );
};
export default Feedback;
