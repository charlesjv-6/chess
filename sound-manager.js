export function playSound(index) {
    const soundFiles = [
        './sounds/capture.mp3',
        './sounds/move-self.mp3',
        './sounds/notify.mp3'
    ]
    const audio = new Audio(soundFiles[index]);
    audio.play();
}
