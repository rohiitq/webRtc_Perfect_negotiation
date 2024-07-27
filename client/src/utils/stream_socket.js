export async function openCamWorker(localVideo) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 'video': true })
    if (localVideo.current) localVideo.current.srcObject = stream
    return stream
  } catch (err) {
    console.log("err opening cam", err)
  }
}

export default async function handelSocketNdStream({io, localVideo}) {
  const streamInstance = await openCamWorker(localVideo)
  const socketInstance = await io("http://localhost:8080", {
    transports: ['websocket'],
  })
  return { streamInstance, socketInstance };
}