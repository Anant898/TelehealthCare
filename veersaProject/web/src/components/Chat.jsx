import React, { useState, useEffect, useRef, useMemo } from 'react';
import io from 'socket.io-client';
import api from '../services/api';
import './Chat.css';
const Chat = ({ consultationId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Get current user info
  const currentUser = useMemo(() => {
    const userStr = localStorage.getItem('user');
    const patientStr = localStorage.getItem('patient');
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return { id: user.id, role: user.role || 'patient', name: user.name };
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    if (patientStr) {
      try {
        const patient = JSON.parse(patientStr);
        return { id: patient.id, role: 'patient', name: patient.name };
      } catch (e) {
        console.error('Error parsing patient data:', e);
      }
    }
    
    return { id: null, role: 'patient', name: 'Unknown' };
  }, []);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5002');
    
    fetchMessages();
    socketRef.current.emit('join-consultation', consultationId);

    socketRef.current.on('new-message', (message) => {
      setMessages((prev) => {
        // Avoid duplicate messages
        if (prev.some(m => m._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-consultation', consultationId);
        socketRef.current.off('new-message');
        socketRef.current.disconnect();
      }
    };
  }, [consultationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chat/consultation/${consultationId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await api.post(`/chat/consultation/${consultationId}`, {
        message: newMessage,
        messageType: 'text'
      });

      // Add message to local state immediately
      setMessages((prev) => [...prev, response.data]);

      // Emit to socket for other participants
      if (socketRef.current) {
        socketRef.current.emit('chat-message', {
          consultationId,
          ...response.data
        });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Check if a message is from the current user
  const isOwnMessage = (message) => {
    // Compare sender ID with current user ID
    if (message.sender === currentUser.id) return true;
    if (message.sender?._id === currentUser.id) return true;
    
    // Fallback: check if senderModel matches current user role
    const senderModel = message.senderModel?.toLowerCase();
    const userRole = currentUser.role?.toLowerCase();
    
    if (senderModel === 'patient' && userRole === 'patient') {
      return message.sender === currentUser.id;
    }
    if (senderModel === 'doctor' && userRole === 'doctor') {
      return message.sender === currentUser.id;
    }
    
    return false;
  };

  if (loading) {
    return <div className="chat-loading">Loading chat...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat</h3>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={message._id || index}
            className={`chat-message ${isOwnMessage(message) ? 'own' : 'other'}`}
          >
            <div className="message-sender">
              {isOwnMessage(message) ? 'You' : (message.senderModel === 'Doctor' ? '👨‍⚕️ Doctor' : '👤 Patient')}
            </div>
            <div className="message-content">
              {message.message}
            </div>
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button type="submit" className="chat-send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;

