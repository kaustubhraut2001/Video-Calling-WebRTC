import { useMemo, createContext, useContext, useEffect, useCallback } from "react";


const PeerContext = createContext();

export const usePeer = () => {
    return useContext(PeerContext);
};

export const PeerProvider = ({ children }) => {

    const [remoteStream, setRemoteStream] = useState(null);

    const peer = useMemo(() => new RTCPeerConnection(
        {
            iceServers: [
                {
                    urls: ["stun:stun1.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478",
                    ]
                },
            ],
        }
    ), []);

    const createOffer = async () => {
        const offer = await peer.createOffer();

        console.log(offer, "offer");


        await peer.setLocalDescription(offer);
        return offer;
    };
    const createAnswer = async (offer) => {
        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;
    };

    const setRemoteAnswer = async (answer) => {
        await peer.setRemoteDescription(answer);
    };

    const sendStream = async (stream) => {
        const Tracks = stream.getTracks();
        Tracks.forEach((track) => {
            peer.addTrack(track, stream);
        });
    };

    const handleTrackEvent = useCallback((event) => {
        const stream = event.streams[0];
        setRemoteStream(stream);
    }, []);

    useEffect(() => {
        peer.addEventListener("track", handleTrackEvent);

        return () => {
            peer.removeEventListener("track", handleTrackEvent);
        };
    }, [peer, handleTrackEvent]);

    return(
        <PeerContext.Provider value={{peer, createOffer,createAnswer,setRemoteAnswer,sendStream,remoteStream}}>
            {children}
        </PeerContext.Provider>
    )
};