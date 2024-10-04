import { useEffect, useMemo, useRef, useState } from "react";
import io from "socket.io-client";
import WebRTC from "./utils/webRtc";

interface PeerData {
  strangerId: string;
  polite: boolean;
}

function App() {
  const socket = useMemo(() => {
    return io("http://localhost:3000", {
      transports: ["websocket"],
    });
  }, []);
  const webRTC = useMemo(() => new WebRTC(), []);
  const [strangerId, setStrangerId] = useState<string | null>(null);
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const polite = useRef<boolean | null>(null);

  useEffect(() => {
    const initializeWebRTC = async () => {
      if (localVideo.current) {
        await webRTC.getStream(
          { video: true, audio: true },
          localVideo.current,
        );
      }
    };

    initializeWebRTC();
  }, [webRTC]);

  useEffect(() => {
    if (!socket) return;    
    socket.emit("connectPeer");
    socket.on("peer", (v: PeerData) => {
      console.log("peer", v);
      
      setStrangerId(v.strangerId);
      polite.current = v.polite;
    });
  }, [socket]);

  useEffect(() => {
    if (!strangerId) return;
    webRTC.handleOnTrack(remoteVideo.current);
    webRTC.handeNegotiationNeeded(socket, strangerId);
    webRTC.handleOnIceCandidate(socket, strangerId);

    socket.on("message", ({ description, candidate }: {
      description?: RTCSessionDescription | null;
      candidate?: RTCIceCandidate | null;
    }) =>
    {
      console.log('recived message');
      
      webRTC.handelIncomingSingal(socket, strangerId, {
        description,
        candidate,
      })});
  }, [strangerId]);

  return (
    <>
      <video
        ref={localVideo}
        id="localVideo"
        autoPlay
        playsInline
        muted
      />{" "}
      <br />
      <video
        ref={remoteVideo}
        id="remoteVideo"
        autoPlay
        playsInline
        muted
      />
    </>
  );
}

export default App;
