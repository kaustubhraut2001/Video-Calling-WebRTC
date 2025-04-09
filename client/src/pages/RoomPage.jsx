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
  const [remoteemailid, setReomteEmailid] = useState(null);

  const handelNewUserJoined = useCallback(
    async (data) => {
      // console.log("User joined room", emailId);
      const { emailId } = data;
      const offer = await createOffer();
      setReomteEmailid(emailId);

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
      setReomteEmailid(from);
      socket.emit("call-accepted", { emailId: from, ans });
    },
    [socket, createAnswer]
  );

  const handleCallAccepted = useCallback(
    async (data) => {
      console.log("Call accepted", data);
      const { ans } = data;
      await setRemoteAnswer(ans);

      console.log("Remote answer set", ans);
    },
    [setRemoteAnswer]
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

  const handleTrackEvent = useCallback(
    (event) => {
      const stream = event.streams[0];
      console.log("Remote stream", stream);
      // setRemoteStream(stream);
      remoteStream(stream);
    },
    [remoteStream]
  );

  const handleNegotiationNeeded = useCallback(async () => {
    // const offer = await peer.createOffer();
    const localOffer = peer.localDescription;
    // await peer.setLocalDescription(offer);
    socket.emit("call-user", {
      emailId: remoteemailid,
      localOffer,
    });
  }, []);

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegotiationNeeded);

    return () => {
      peer.removeEventListener("negotiationneeded", handleNegotiationNeeded);
    };
  }, [peer, handleNegotiationNeeded]);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  return (
    <div>
      room page
      <button onClick={() => sendStream(myStream)}>Send Video</button>
      {console.log("myStream", myStream)}
      {myStream && (
        <ReactPlayer
          url={myStream}
          playing={true}
          muted={true}
          width="100%"
          height="auto"
        />
      )}
      {remoteStream && (
        <video
          ref={(video) => {
            if (video && remoteStream) video.srcObject = remoteStream;
          }}
          autoPlay
          style={{ width: "400px", border: "1px solid #ccc" }}
        />
      )}
    </div>
  );
};

export default RoomPage;
