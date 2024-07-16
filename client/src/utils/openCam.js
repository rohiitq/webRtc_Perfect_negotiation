export async function openCam(localVideo) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 'video': true })
        if (localVideo) {
            localVideo.current.srcObject = stream
        }
        return stream
    } catch (error) {
        console.log("err while opening cam", error)
    }
}

export default async function setupStream(setStream, localVideo) {
    try {
      const streamInstance = await openCam(localVideo)
      setStream(streamInstance)
    } catch (err) {
      console.log('err setting up stream', err)
    }
  }