// socket.js
import { Server } from 'socket.io';

const setupSocket=(server)=> {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join_subject', ({ sub_id, user_id }) => {
      socket.join(sub_id);
      console.log(`User ${user_id} joined subject ${sub_id}`);
    });

    socket.on('leave_subject', ({ sub_id, user_id }) => {
      socket.leave(sub_id);
      console.log(`User ${user_id} left subject ${sub_id}`);
    });

    socket.on('send_message', (message) => {
      io.to(message.sub_id).emit('new_message', message);
    });

    socket.on('typing', ({ sub_id, user_id, user_name, isTyping }) => {
      socket.to(sub_id).emit('typing', { user_id, user_name, isTyping });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
}

export default setupSocket;
