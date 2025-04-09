import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";
import ReactPlayer from "react-player";

const RoomPage = () => {
  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAnswer,
    sendStream,
    remoteStream,
  } = usePeer();
  console.log(createOffer, "create offer");

  const [myStream, setMyStream] = useState(null);
  // const [remoteStream, setRemoteStream] = useState(null);

  const handelNewUserJoined = useCallback(
    async (data) => {
      // console.log("User joined room", emailId);
      const { emailId } = data;
      const offer = await createOffer();

      socket.emit("call-user", {
        emailId,
        offer,
      });
    },
    [socket, createOffer]
  );

  const handleIncomingCall = useCallback(
    async (data) => {
      console.log("Incoming call", data);
      const { from, offer } = data;
      const ans = await createAnswer(offer);
      socket.emit("call-accepted", { emailId: from, ans });
    },
    [socket, createAnswer]
  );

  const handleCallAccepted = useCallback(
    async (data) => {
      console.log("Call accepted", data);
      const { ans } = data;
      await setRemoteAnswer(ans);
      await sendStream(myStream);
      console.log("Remote answer set", ans);
    },
    [socket, createAnswer]
  );

  useEffect(() => {
    socket.on("user-joined", handelNewUserJoined);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);

    return () => {
      socket.off("user-joined", handelNewUserJoined);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [socket, handelNewUserJoined, handleIncomingCall]);

  const getUserMediaStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setMyStream(stream);
  }, []);
  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  return (
    <div>
      room page
      <ReactPlayer stream={myStream} playing={true} muted={true} />
      <ReactPlayer stream={remoteStream} playing={true} muted={true} />
    </div>
  );
};

export default RoomPage;
