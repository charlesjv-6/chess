import { activeSide } from "./script.js";

const side1Display = document.getElementById('side-1');
const side2Display = document.getElementById('side-2');

let timerSide1 = 180 * 1000;
let timerSide2 = 180 * 1000;

export function countdownTimer() {
    const interval = setInterval(() => {
        if (activeSide === 'black') {
            timerSide1 -= 10;
            side1Display.classList.add('active');
            side2Display.classList.remove('active');
        } else if (activeSide === 'white') {
            timerSide2 -= 10; 
            side2Display.classList.add('active');
            side1Display.classList.remove('active');
        }

        let minutes1, seconds1, milliseconds1;
        let minutes2, seconds2, milliseconds2;
        let display1 = '';
        let display2 = '';

        minutes1 = Math.floor(timerSide1 / (60 * 1000));
        seconds1 = Math.floor((timerSide1 % (60 * 1000)) / 1000);
        milliseconds1 = Math.floor((timerSide1 % 1000));

        minutes1 = minutes1 < 10 ? `0${minutes1}` : minutes1;
        seconds1 = seconds1 < 10 ? `0${seconds1}` : seconds1;
        milliseconds1 = milliseconds1 < 10 ? `00${milliseconds1}` : milliseconds1 < 100 ? `0${milliseconds1}` : milliseconds1;

        minutes2 = Math.floor(timerSide2 / (60 * 1000));
        seconds2 = Math.floor((timerSide2 % (60 * 1000)) / 1000);
        milliseconds2 = Math.floor((timerSide2 % 1000));

        minutes2 = minutes2 < 10 ? `0${minutes2}` : minutes2;
        seconds2 = seconds2 < 10 ? `0${seconds2}` : seconds2;
        milliseconds2 = milliseconds2 < 10 ? `00${milliseconds2}` : milliseconds2 < 100 ? `0${milliseconds2}` : milliseconds2;

        minutes1 > 0 ? display1 = `${minutes1}:${seconds1}` : display1 = `${seconds1}.${milliseconds1.toString().slice(0, 2)}`;
        minutes2 > 0 ?  display2 = `${minutes2}:${seconds2}` : display2 = `${seconds2}.${milliseconds2.toString().slice(0, 2)}`;

        side1Display.textContent = display1;
        side2Display.textContent = display2;

        if (timerSide1 <= 0 || timerSide2 <= 0) {
            clearInterval(interval);
            if (activeSide === 'white') {
                console.log('Black Won on Time');
            } else {
                console.log('White Won on Time');
            }
        }
    }, 10);
}