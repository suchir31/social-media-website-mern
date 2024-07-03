import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const ChatBox = ({ friendUsername }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  const fetchMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/messages/conversation/${friendUsername}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [friendUsername]); // Add friendUsername as a dependency

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/messages/send',
        { recipientUsername: friendUsername, content: message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg) => (
          <div key={msg._id}>
            <strong>{msg.sender.username}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatBox;
