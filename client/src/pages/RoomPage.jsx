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

  const [myStream, setMyStream] = useState(null);
  const [remoteemailid, setReomteEmailid] = useState(null);

  const handelNewUserJoined = useCallback(
    async (data) => {
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
      const { from, offer } = data;
      const ans = await createAnswer(offer);
      setReomteEmailid(from);
      socket.emit("call-accepted", { emailId: from, ans });
    },
    [socket, createAnswer]
  );

  const handleCallAccepted = useCallback(
    async (data) => {
      const { ans } = data;
      await setRemoteAnswer(ans);
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
      remoteStream(stream);
    },
    [remoteStream]
  );

  const handleNegotiationNeeded = useCallback(async () => {
    const localOffer = peer.localDescription;
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <div className="text-2xl font-bold text-gray-700 mb-4">Room Page</div>

        <button
          onClick={() => sendStream(myStream)}
          className="mb-6 px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
        >
          Send Video
        </button>

        <div className="grid md:grid-cols-2 gap-6">
          {myStream && (
            <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Your Video
              </h3>
              <ReactPlayer
                url={myStream}
                playing={true}
                muted={true}
                width="100%"
                height="auto"
                className="rounded-lg overflow-hidden"
              />
            </div>
          )}

          {remoteStream && (
            <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Remote Video
              </h3>
              <video
                ref={(video) => {
                  if (video && remoteStream) video.srcObject = remoteStream;
                }}
                autoPlay
                className="rounded-lg w-full h-auto border border-gray-300"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
