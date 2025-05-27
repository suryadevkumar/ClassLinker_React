import { useEffect, useState } from 'react';
import { getSocket } from '../utils/socket';
import axios from 'axios';

export const useChat = (sub_id, user_id) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const socket = getSocket();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/chat/messages?sub_id=${sub_id}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [sub_id]);

  useEffect(() => {
    if (!sub_id) return;

    socket.emit('join_subject', { sub_id, user_id });

    socket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('typing', ({ user_id: typingId, user_name, isTyping }) => {
      setTypingUsers(prev => isTyping 
        ? [...prev.filter(u => u.user_id !== typingId), { user_id: typingId, user_name }]
        : prev.filter(u => u.user_id !== typingId))
    });

    return () => {
      socket.off('new_message');
      socket.off('typing');
      socket.emit('leave_subject', { sub_id, user_id });
    };
  }, [sub_id, user_id, socket]);

  const sendMessage = async (message, user_name, user_type) => {
    try {
      const res = await axios.post('/api/chat/send', {
        user_id,
        sub_id,
        message,
        user_name,
        user_type
      });
      socket.emit('send_message', res.data);
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  };

  const sendTyping = (isTyping, user_name) => {
    socket.emit('typing', { sub_id, user_id, user_name, isTyping });
  };

  return { messages, typingUsers, sendMessage, sendTyping };
};