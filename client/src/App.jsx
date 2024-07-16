import { useRef, useEffect, useState } from "react"
import usePeerConnection from "./hooks/usePeerConnection"
import useSocket from "./hooks/useSocket"
import setupStream from "./utils/openCam"

function App() {
  const [stream, setStream] = useState(null)
  const peerConnection = usePeerConnection(stream)
  const [c] = useSocket(peerConnection, stream)
  const localVideo = useRef(null)
  const remoteVideo = useRef(null)
  const makingOffer = useRef(false)
  const ignoreOffer = useRef(false)

  useEffect(() => {
    setupStream(setStream, localVideo)
  }, [])

  return (
    <div className='App'>
      <video ref={localVideo} className='video' autoPlay playsInline muted></video>
      <video ref={remoteVideo} className='video' autoPlay playsInline muted></video>
    </div>
  )
}

export default App
