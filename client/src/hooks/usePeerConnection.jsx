import { useEffect, useState } from "react"

export default function usePeerConnection(stream) {
    const [pc, setPc] = useState(null)
    function getPc() {
        const config = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
        const peerConnection = new RTCPeerConnection(config)
        stream.getTracks().forEach(track => {
            peerConnection.addTrack(track, stream);
        });

        return peerConnection
    }

    useEffect(() => {
        if(stream){
            const peerConnection = getPc()
            setPc(peerConnection)
        
            return () => {
                peerConnection.close()
            }
        }
    }, [stream])

    return pc
}