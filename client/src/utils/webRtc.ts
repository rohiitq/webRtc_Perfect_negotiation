import { Socket } from "socket.io-client";

export default class WebRTC {
    pc: RTCPeerConnection;
    stream: MediaStream | null;
    makingOffer: boolean;
    ignoreOffer: boolean;
    polite: boolean;

    constructor() {
        this.pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.mystunserver.tld" }],
        });
        this.stream = null;
        this.makingOffer = false;
        this.ignoreOffer = false;
        this.polite = false;
    }

    async getStream(
        { video, audio }: { video: boolean; audio: boolean },
        localVideo: HTMLVideoElement | null
    ) {
        if (!this.stream) {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: video,
                audio: audio,
            });

            if (localVideo) {
                localVideo.srcObject = this.stream;
            }

            for (const track of this.stream.getTracks()) {
                this.pc.addTrack(track, this.stream);
            }
        }
        return this.stream;
    }

    handleOnTrack(remoteVideo: HTMLVideoElement | null) {
        if (!remoteVideo) return;
        this.pc.ontrack = ({ track, streams }) => {
            track.onunmute = () => {
                if (remoteVideo.srcObject) {
                    return;
                }
                remoteVideo.srcObject = streams[0];
            };
        };
    }

    handeNegotiationNeeded(socket: Socket, strangerId: string) {
        this.pc.onnegotiationneeded = async () => {
            try {
                this.makingOffer = true;
                await this.pc.setLocalDescription();
                console.log("offer send");

                socket.emit("message", {
                    description: this.pc.localDescription,
                    to: strangerId,
                });
            } catch (err) {
                console.error(err);
            } finally {
                this.makingOffer = false;
            }
        };
    }

    handleOnIceCandidate(socket: Socket, strangerId: string) {
        this.pc.onicecandidate = ({ candidate }) =>
            socket.emit("message", { candidate, to: strangerId });
    }

    async handelIncomingSingal(
        socket: Socket,
        strangerId: string,
        {
            description,
            candidate,
        }: {
            description?: RTCSessionDescription | null;
            candidate?: RTCIceCandidate | null;
        }
    ) {
        if (description === undefined && candidate === undefined) return;

        try {
            if (description) {
                const offerCollision =
                    description.type === "offer" &&
                    (this.makingOffer || this.pc.signalingState !== "stable");

                this.ignoreOffer = !this.polite && offerCollision;
                if (this.ignoreOffer) return;

                await this.pc.setRemoteDescription(description);
                console.log("received offer");
                if (description.type === "offer") {
                    await this.pc.setLocalDescription();
                    socket.emit("message", {
                        description: this.pc.localDescription,
                        to: strangerId,
                    });
                    console.log("sent answer");
                }
            } else if (candidate) {
                try {
                    await this.pc.addIceCandidate(candidate);
                    console.log("added ice candidate");
                } catch (err) {
                    if (!this.ignoreOffer) {
                        throw err;
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
    }
}
