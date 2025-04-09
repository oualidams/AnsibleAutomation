'use client';
import React, { useState } from 'react';

const MessageButton = () => {
  const [message, setMessage] = useState('');
  const [mockData, setMockData] = useState<{ id: number; name: string }[]>([]);
  const [searchResults, setSearchResults] = useState([]);

  const fetchMessage = async () => {
    try {
      const response = await fetch('http://localhost:8000/');
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Error fetching message:', error);
    }
  };

  const sendMessage = async () => {
    try {
      const response = await fetch('http://localhost:8000/123', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello from React!' }),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const updateMessage = async () => {
    try {
      const response = await fetch('http://localhost:8000/update/123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Updated message from React!' }),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const deleteMessage = async () => {
    try {
      const response = await fetch('http://localhost:8000/delete/123', {
        method: 'DELETE',
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const fetchMockData = async () => {
    try {
      const response = await fetch('http://localhost:8000/mock-data');
      const data = await response.json();
      setMockData(data);
    } catch (error) {
      console.error('Error fetching mock data:', error);
    }
  };

  const searchItems = async () => {
    try {
      const response = await fetch('http://localhost:8000/search?query=test');
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Error searching items:', error);
    }
  };

  const fetchDynamicData = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/post/${id}`);
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error fetching dynamic data:', error);
    }
  };

  return (
    <div>
      <h1>Test Backend Endpoints</h1>
      <button onClick={fetchMessage} className="btn">
        Fetch Message
      </button>
      {message && <p>{message}</p>}

      <button onClick={sendMessage} className="btn">
        Send Message
      </button>

      <button onClick={updateMessage} className="btn">
        Update Message
      </button>

      <button onClick={deleteMessage} className="btn">
        Delete Message
      </button>

      <button onClick={fetchMockData} className="btn">
        Fetch Mock Data
      </button>
      {mockData.length > 0 && (
        <ul>
          {mockData.map((item) => (
            <li key={item.id}>
              {item.name} (ID: {item.id})
            </li>
          ))}
        </ul>
      )}

      <button onClick={searchItems} className="btn">
        Search Items
      </button>
      {searchResults.length > 0 && (
        <ul>
          {searchResults.map((result, index) => (
            <li key={index}>{result}</li>
          ))}
        </ul>
      )}

      <button onClick={() => fetchDynamicData(123)} className="btn">
        Fetch Dynamic Data (ID: 123)
      </button>
    </div>
  );
};

export default MessageButton;