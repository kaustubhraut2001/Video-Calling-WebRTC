import React, { useState, useEffect } from "react";
import { useSocket } from "../providers/Socket";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { socket } = useSocket();
  console.log(socket, "socket");
  const [email, setEmail] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const navigate = useNavigate();

  const handleJoinRoom = () => {
    console.log("Joining room", roomCode);
    socket.emit("join-room", {
      roomId: roomCode,
      emailId: email,
    });

    navigate(`/room/${roomCode}`);
  };

  const handleRoomJoined = (data) => {
    console.log("Room joined", data);
  };

  useEffect(() => {
    socket.on("joined-room", handleRoomJoined);
    return () => {
      socket.off("joined-room", handleRoomJoined);
    };
  }, [socket]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Join a Room
        </h2>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            value={roomCode}
            placeholder="Enter room code"
            onChange={(e) => setRoomCode(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            type="submit"
            onClick={handleJoinRoom}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
