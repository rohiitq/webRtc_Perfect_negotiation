export async function handelMessage({message}) {
    const message = JSON.parse(message)

    switch (message.type) {
        case 'offer':
            await handleOffer(message)
            break
        case 'answer':
            await handleAnswer(message)
            break
        case 'candidate':
            await handleCandidate(message)
            break
        default:
            break
    }
}

function handelMessage(pc, message) {
    
}