import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ChatPage = () => {
  const { friendUsername } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      console.log(token,"&&")
      const response = await axios.get(
        `https://soci-api1.onrender.com/api/messages/conversation/${friendUsername}`,
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
  }, [friendUsername]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://soci-api1.onrender.com/api/messages/send',
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
    <div className="chat-container">
      <div className="chat-header">
        <h1>Chat with {friendUsername}</h1>
        <button className="back-button" onClick={() => navigate('/profile')}>Back</button>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg._id} className="chat-message">
            <strong>{msg.sender.username}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatPage;
