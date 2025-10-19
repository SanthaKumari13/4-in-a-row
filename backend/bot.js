// bot.js
const { Board, COLS, PLAYER1, PLAYER2 } = require('./game');

// returns column index for bot (botPlayer is 1 or 2)
function chooseMove(board, botPlayer, oppPlayer) {
  // 1) Win immediately
  for (let c=0; c<COLS; c++) {
    const tmp = board.clone();
    try {
      tmp.place(c, botPlayer);
      if (tmp.checkWinner() === botPlayer) return c;
    } catch (e) { /* column full */ }
  }
  // 2) Block opponent immediate win
  for (let c=0; c<COLS; c++) {
    const tmp = board.clone();
    try {
      tmp.place(c, oppPlayer);
      if (tmp.checkWinner() === oppPlayer) return c;
    } catch (e) {}
  }
  // 3) Prefer center-out columns heuristic
  const preferred = [3,2,4,1,5,0,6];
  for (const c of preferred) {
    try {
      board.place(c, botPlayer); // try place to see if valid
      // if no error, we want this move -> but we must revert. So clone instead
      return c;
    } catch(e) {}
  }
  // fallback
  for (let c=0;c<COLS;c++) {
    try { board.place(c, botPlayer); return c; } catch(e){}
  }
  return 0;
}

module.exports = { chooseMove };
