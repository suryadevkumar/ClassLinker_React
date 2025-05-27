import { useState, useEffect, useRef } from 'react';
import { getChatHistory, getParticipants } from '../services/api';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

export function useChat(subjectId, user) {
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!subjectId || !user) return;

    // Join subject room
    socket.emit('joinSubject', {
      subjectId,
      userId: user.id,
      userType: user.type
    });

    // Load initial data
    const loadData = async () => {
      try {
        const [historyRes, participantsRes] = await Promise.all([
          getChatHistory(subjectId),
          getParticipants(subjectId)
        ]);
        
        setMessages(historyRes.data);
        setParticipants(participantsRes.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Listen for new messages
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('error', (err) => setError(err));

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('error');
    };
  }, [subjectId, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (message) => {
    if (!message.trim()) return;
    
    socket.emit('sendMessage', {
      subjectId,
      userId: user.id,
      userName: user.name,
      userType: user.type,
      message
    });
  };

  return {
    messages,
    participants,
    loading,
    error,
    sendMessage,
    messagesEndRef
  };
}