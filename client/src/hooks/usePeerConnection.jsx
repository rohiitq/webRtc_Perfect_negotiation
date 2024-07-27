import { useEffect, useState } from "react"

export default function createPeerConnection(stream) {
    const config = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
    const peerConnection = new RTCPeerConnection(config)
    stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
    });
    if (peerConnection) console.log("created peer connection")
    return peerConnection
}

export async function sendOffer(pc, makingOffer, socket) {
    try {
        makingOffer.current = true;
        await pc.setLocalDescription();
        socket.emit('message', { description: pc.localDescription });
        console.log("sent offer")
    } catch (err) {
        console.error(err);
    } finally {
        makingOffer.current = false;
    }
}

export async function reciveMessage({pc, polite, ignoreOffer,  description, candidate, socket, makingOffer }) {
    try {
        console.log("recived message", description, candidate);
        if (description) {
            const offerCollision = description.type === 'offer' &&
                (makingOffer.current || pc.signalingState !== 'stable');

            ignoreOffer.current = !polite && offerCollision;
            if (ignoreOffer.current) {
                return;
            }

            await pc.setRemoteDescription(description);
            if (description.type === 'offer') {
                await pc.setLocalDescription();
                socket.emit('message', { description: pc.localDescription });
                console.log("sent answer");
            }
        } else if (candidate) {
            try {
                await pc.addIceCandidate(candidate);
                console.log("added ice candidate");
            } catch (err) {
                if (!ignoreOffer) {
                    throw err;
                }
            }
        }
    } catch (err) {
        console.error(err);
    }
}

export function sendIce(pc, socket) {
    pc.onicecandidate = ({ candidate }) => {
        socket.emit('message', { 'candidate': candidate })

    }
}