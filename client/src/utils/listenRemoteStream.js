export default function listenRemoteStream(peerConnection, remoteVideo) {
    if (peerConnection) {
        peerConnection.addEventListener('track', async (event) => {
            const [remoteStream] = event.streams;
            remoteVideo.srcObject = remoteStream;
        });
    }
}