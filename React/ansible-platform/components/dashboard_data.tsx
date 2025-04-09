'use client'
import React, { useState } from "react";

const MessageButton = () => {
  const [message, setMessage] = useState("");

  const fetchMessage = async () => {
    try {
      const response = await fetch("http://localhost:8000/");
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Error fetching message:", error);
    }
  };

  return (
    <div>
      <button onClick={fetchMessage} className="btn">
        Click me
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default MessageButton;