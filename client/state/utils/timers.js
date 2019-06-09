export const gameTimer = (ths, serverInfo) => {
  if(serverInfo.paused) {
    return;
  }

  if(ths.timer > 0) {
    ths.timer -= ths.game.time.elapsed/1000;
    ths.timerText.text = Math.ceil(ths.timer);
  } else {
    ths.timerText.text = "Time's up!";
  }
}    

export const controllerTimer = (ths, serverInfo) => {
  // If we're paused, or the timer has already run out, stop counting down (and sending timer signals)
  if(serverInfo.paused || ths.timer <= 0) {
    return;
  }

  // Perform countdown, if we're VIP
  if(serverInfo.vip) {
    ths.timer -= ths.game.time.elapsed/1000;

    if(ths.timer <= 0) {
      serverInfo.socket.emit('timer-complete', {})
    }
  }
} 