const words = require("../words");

function getRandomWords(count) {
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function checkGuess(guess, word) {
  return guess.trim().toLowerCase() === word.trim().toLowerCase();
}

function buildHint(word, hintsRevealed) {
  const letters = word.split("");
  const revealableIndices = letters
    .map((l, i) => (l !== " " ? i : null))
    .filter((i) => i !== null);

  const toReveal = revealableIndices.slice(0, hintsRevealed);

  return letters
    .map((l, i) => {
      if (l === " ") return " ";
      if (toReveal.includes(i)) return l;
      return "_";
    })
    .join(" ");
}

function calcPoints(drawTime, timeLeft) {
  const ratio = timeLeft / drawTime;
  return Math.max(50, Math.round(200 * ratio));
}

module export defualt { getRandomWords, checkGuess, buildHint, calcPoints };