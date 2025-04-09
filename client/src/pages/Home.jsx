import React, { useState,useEffect } from 'react'
import { useSocket } from '../providers/Socket';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const {socket} = useSocket();
  console.log(socket , "socket");
  const [email, setEmail] = useState();
  const [roomCode , setRoomCode] = useState("");

  const navigate = useNavigate();

  const handleJoinRoom = () => {
    console.log("Joining room", roomCode);
    socket.emit("join-room", {
      roomId: roomCode,
      emailId: email
    });

    navigate(`/room/${roomCode}`);
  };

  const handleRoomJoined = (data) => {
    console.log("Room joined", data);
  }

  useEffect(() => {
    socket.on("joined-room", handleRoomJoined);
    return () => {
      socket.off("joined-room", handleRoomJoined);
    }
  }, [socket]);
  
  
  return (
    <div>
      <div>
        <input type="email" value={email} placeholder='Email' onChange={(e) => setEmail(e.target.value)}/>
        <input type='text' value={roomCode} placeholder='Enter room code' onChange={(e) => setRoomCode(e.target.value)}/>
        <button type='submit' onClick={handleJoinRoom}>Join</button>
      </div>
    </div>
  )
}

export default Home
