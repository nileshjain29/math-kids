/* ═══════════════════════════════════════════════════════════════════════════
   Math Kids – Progressive Web App
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── State ──────────────────────────────────────────────────────────────────
let operation = "add";
let digitChoice = 1;
let totalQuestions = 5;
let currentQ = 0;
let score = 0;
let attempts = 0;
const maxAttempts = 3;
let numA = 0,
  numB = 0,
  correctAnswer = 0;
let streak = 0; // consecutive correct answers

// ─── Sound Effects (Web Audio API – no files needed) ────────────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function playTone(freq, duration, type, vol) {
  ensureAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type || "sine";
  o.frequency.value = freq;
  g.gain.value = vol || 0.18;
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  o.connect(g).connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + duration);
}

function soundCorrect() {
  ensureAudio();
  // happy ascending arpeggio
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.18, "sine", 0.16), i * 80);
  });
}

function soundWrong() {
  ensureAudio();
  playTone(220, 0.35, "sawtooth", 0.1);
  setTimeout(() => playTone(180, 0.35, "sawtooth", 0.08), 120);
}

function soundClick() {
  ensureAudio();
  playTone(880, 0.06, "sine", 0.08);
}

function soundStreak() {
  ensureAudio();
  [784, 988, 1175, 1319, 1568].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.15, "triangle", 0.14), i * 60);
  });
}

function soundPerfect() {
  ensureAudio();
  const notes = [523, 659, 784, 1047, 784, 1047, 1319, 1568];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.22, "sine", 0.14), i * 100);
  });
}

function soundGameOver() {
  ensureAudio();
  [784, 659, 523, 440].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.25, "triangle", 0.12), i * 120);
  });
}

// ─── Confetti System ────────────────────────────────────────────────────────
const confettiCanvas = document.getElementById("confetti-canvas");
const confettiCtx = confettiCanvas ? confettiCanvas.getContext("2d") : null;
let confettiPieces = [];
let confettiRunning = false;

function resizeConfetti() {
  if (!confettiCanvas) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeConfetti);
resizeConfetti();

function launchConfetti(count) {
  if (!confettiCtx) return;
  confettiCanvas.style.display = "block";
  const colors = [
    "#E8D44D",
    "#E74C3C",
    "#27AE60",
    "#4A90D9",
    "#9B59B6",
    "#F39C12",
    "#1ABC9C",
  ];
  for (let i = 0; i < (count || 60); i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: -10 - Math.random() * 200,
      w: 6 + Math.random() * 6,
      h: 10 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 3,
      rot: Math.random() * 360,
      rv: (Math.random() - 0.5) * 8,
    });
  }
  if (!confettiRunning) {
    confettiRunning = true;
    animateConfetti();
  }
}

function animateConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiPieces.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.04;
    p.rot += p.rv;
    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rot * Math.PI) / 180);
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    confettiCtx.restore();
  });
  confettiPieces = confettiPieces.filter(
    (p) => p.y < confettiCanvas.height + 20,
  );
  if (confettiPieces.length > 0) {
    requestAnimationFrame(animateConfetti);
  } else {
    confettiRunning = false;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiCanvas.style.display = "none";
  }
}

// ─── Emoji Pop ──────────────────────────────────────────────────────────────
function showEmoji(emoji) {
  const el = document.getElementById("emoji-pop");
  el.textContent = emoji;
  el.classList.remove("pop-animate");
  void el.offsetWidth; // reflow
  el.classList.add("pop-animate");
}

// ─── Streak Badge ───────────────────────────────────────────────────────────
function updateStreak(correct) {
  const badge = document.getElementById("streak-badge");
  if (correct) {
    streak++;
    if (streak >= 3) {
      badge.textContent =
        streak >= 5
          ? `🔥 ${streak} in a row! SUPERSTAR!`
          : `🔥 ${streak} in a row!`;
      badge.classList.remove("hidden");
      badge.classList.remove("streak-animate");
      void badge.offsetWidth;
      badge.classList.add("streak-animate");
      soundStreak();
    }
  } else {
    streak = 0;
    badge.classList.add("hidden");
  }
}

// ─── DOM refs ───────────────────────────────────────────────────────────────
const app = document.getElementById("app");
const screens = document.querySelectorAll(".screen");
const levelTitle = document.getElementById("level-title");
const progressText = document.getElementById("progress-text");
const scoreText = document.getElementById("score-text");
const progressFill = document.getElementById("progress-fill");
const numAEl = document.getElementById("num-a");
const numBEl = document.getElementById("num-b");
const opSymbol = document.getElementById("op-symbol");
const answerInput = document.getElementById("answer-input");
const btnCheck = document.getElementById("btn-check");
const btnNext = document.getElementById("btn-next");
const feedbackEl = document.getElementById("feedback");
const hintEl = document.getElementById("hint");
const attemptsEl = document.getElementById("attempts-left");
const finalScoreEl = document.getElementById("final-score");
const resultMsgEl = document.getElementById("result-msg");

// ─── Helpers ────────────────────────────────────────────────────────────────
function showScreen(name) {
  screens.forEach((s) => s.classList.remove("active"));
  document.getElementById(`screen-${name}`).classList.add("active");
}

function opSym(op) {
  return { add: "+", subtract: "\u2212", multiply: "\u00D7" }[op];
}

function opLabel(op) {
  return {
    add: "Addition",
    subtract: "Subtraction",
    multiply: "Multiplication",
  }[op];
}

function range(dc) {
  if (dc === 1) return [1, 9];
  if (dc === 2) return [10, 99];
  return [100, 999];
}

function randInt(lo, hi) {
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function genNumbers() {
  const [lo, hi] = range(digitChoice);
  let a = randInt(lo, hi),
    b = randInt(lo, hi);
  if (operation === "subtract" && a < b) [a, b] = [b, a];
  return [a, b];
}

function compute(a, b, op) {
  if (op === "add") return a + b;
  if (op === "subtract") return a - b;
  return a * b;
}

// ─── Stars ──────────────────────────────────────────────────────────────────
function drawStar(ctx, cx, cy, size, color) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? size : size * 0.4;
    const angle = ((i * 36 - 90) * Math.PI) / 180;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawBannerStars() {
  const canvas = document.getElementById("star-banner");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const colors = [
    "#E8D44D",
    "#E74C3C",
    "#27AE60",
    "#4A90D9",
    "#9B59B6",
    "#E8D44D",
    "#E74C3C",
    "#27AE60",
    "#4A90D9",
  ];
  colors.forEach((c, i) => drawStar(ctx, 22 + i * 38, 20, 13, c));
}

function drawResultStars(filled) {
  const canvas = document.getElementById("result-stars");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 5; i++) {
    drawStar(ctx, 40 + i * 58, 30, 22, i < filled ? "#E8D44D" : "#D5DDE8");
  }
}

// ─── Hints ──────────────────────────────────────────────────────────────────
function getHint(a, b, op, att) {
  const ans = compute(a, b, op);

  if (op === "add") {
    if (att === 1) return `Try counting up from ${a}, then add ${b} more!`;
    if (att === 2) {
      if (b > 1) {
        const p = Math.floor(b / 2);
        return `Break it up! ${a} + ${p} = ${a + p}, now add ${b - p} more.`;
      }
      return `What is one more than ${a}?`;
    }
    return `The answer is between ${ans - 2} and ${ans + 2}.`;
  }
  if (op === "subtract") {
    if (att === 1) return `Start at ${a} and count backwards ${b} times!`;
    if (att === 2) {
      if (b > 1) {
        const p = Math.floor(b / 2);
        return `Break it up! ${a} - ${p} = ${a - p}, now take away ${b - p} more.`;
      }
      return `What is one less than ${a}?`;
    }
    return `The answer is between ${ans - 2} and ${ans + 2}.`;
  }
  // multiply
  if (att === 1)
    return `Multiply means repeated addition! ${a} × ${b} = ${a} added ${b} times.`;
  if (att === 2) {
    const part = b > 1 ? a * (b - 1) : 0;
    return `${a} × ${b - 1} = ${part}. Now add one more ${a}.`;
  }
  return `The answer is between ${ans - 3} and ${ans + 3}.`;
}

// ─── Navigation callbacks ───────────────────────────────────────────────────
function goTo(screen) {
  soundClick();
  showScreen(screen);
  if (screen === "welcome") drawBannerStars();
}

function selectOperation(op) {
  soundClick();
  operation = op;
  app.dataset.op = op;
  levelTitle.textContent = opLabel(op);
  showScreen("level");
}

function selectLevel(lvl) {
  soundClick();
  digitChoice = lvl;
  showScreen("count");
}

function selectCount(n) {
  soundClick();
  totalQuestions = n;
  currentQ = 0;
  score = 0;
  streak = 0;
  nextProblem();
}

// ─── Problem flow ───────────────────────────────────────────────────────────
function nextProblem() {
  currentQ++;
  if (currentQ > totalQuestions) {
    showResults();
    return;
  }
  [numA, numB] = genNumbers();
  correctAnswer = compute(numA, numB, operation);
  attempts = 0;
  renderProblem();
}

function renderProblem() {
  showScreen("problem");

  progressText.textContent = `Problem ${currentQ} of ${totalQuestions}`;
  scoreText.textContent = `Score: ${score}`;
  progressFill.style.width = `${((currentQ - 1) / totalQuestions) * 100}%`;

  numAEl.textContent = numA;
  numBEl.textContent = numB;
  opSymbol.textContent = opSym(operation);

  answerInput.value = "";
  answerInput.disabled = false;
  btnCheck.disabled = false;
  btnNext.classList.add("hidden");
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  hintEl.textContent = "";
  attemptsEl.textContent = `Attempts left: ${maxAttempts}`;

  // Focus after a tiny delay so virtual keyboard opens on mobile
  setTimeout(() => answerInput.focus(), 80);
}

// ─── Answer check ───────────────────────────────────────────────────────────
function checkAnswer() {
  const raw = answerInput.value.trim();
  if (!raw) return;
  const userAns = parseInt(raw, 10);
  if (isNaN(userAns)) {
    feedbackEl.textContent = "Please type a number!";
    feedbackEl.className = "feedback warn";
    answerInput.value = "";
    return;
  }

  attempts++;

  if (userAns === correctAnswer) {
    score++;
    updateStreak(true);
    const msgs = [
      "Awesome! That's correct!",
      "Great job! You got it!",
      "Well done! You're a math star!",
      "Perfect! Keep it up!",
      "Correct! You're amazing!",
    ];
    feedbackEl.textContent = msgs[Math.floor(Math.random() * msgs.length)];
    feedbackEl.className = "feedback correct bounce";
    const emojis = ["🎉", "🌟", "👏", "🏆", "💯", "🥳", "✨"];
    showEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
    soundCorrect();
    launchConfetti(streak >= 3 ? 80 : 30);
    hintEl.textContent = "";
    attemptsEl.textContent = "";
    answerInput.disabled = true;
    btnCheck.disabled = true;
    btnNext.classList.remove("hidden");
    scoreText.textContent = `Score: ${score}`;
    // Bounce the board
    const board = document.getElementById("problem-board");
    board.classList.add("board-correct");
    setTimeout(() => board.classList.remove("board-correct"), 600);
  } else {
    updateStreak(false);
    soundWrong();
    const remaining = maxAttempts - attempts;
    if (remaining > 0) {
      feedbackEl.textContent = `Not quite! ${remaining} ${remaining === 1 ? "try" : "tries"} left.`;
      feedbackEl.className = "feedback wrong shake";
      showEmoji(remaining === 1 ? "😬" : "🤔");
      hintEl.textContent = "Hint: " + getHint(numA, numB, operation, attempts);
      attemptsEl.textContent = `Attempts left: ${remaining}`;
      answerInput.value = "";
      answerInput.focus();
      // Shake the board
      const board = document.getElementById("problem-board");
      board.classList.add("board-shake");
      setTimeout(() => board.classList.remove("board-shake"), 500);
    } else {
      const sym = opSym(operation);
      feedbackEl.textContent = `The answer is: ${numA} ${sym} ${numB} = ${correctAnswer}`;
      feedbackEl.className = "feedback wrong";
      hintEl.textContent = "Don't worry, you'll get it next time!";
      showEmoji("😊");
      attemptsEl.textContent = "";
      answerInput.disabled = true;
      btnCheck.disabled = true;
      btnNext.classList.remove("hidden");
    }
  }
}

// Enter key submits answer
answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    checkAnswer();
  }
});

// ─── Results ────────────────────────────────────────────────────────────────
function showResults() {
  showScreen("results");
  const pct = (score / totalQuestions) * 100;
  const filledStars = Math.round((score / totalQuestions) * 5);
  drawResultStars(filledStars);

  finalScoreEl.textContent = `You scored ${score} out of ${totalQuestions}`;

  let msg, cls;
  if (pct === 100) {
    msg = "PERFECT SCORE! You're a math genius!";
    cls = "green";
    soundPerfect();
    launchConfetti(120);
  } else if (pct >= 80) {
    msg = "Excellent work! Almost perfect!";
    cls = "green";
    soundCorrect();
    launchConfetti(60);
  } else if (pct >= 60) {
    msg = "Good job! Keep practising!";
    cls = "blue";
    soundCorrect();
  } else if (pct >= 40) {
    msg = "Nice try! More practice and you'll do great!";
    cls = "orange";
    soundGameOver();
  } else {
    msg = "Keep going! Practice makes perfect!";
    cls = "orange";
    soundGameOver();
  }

  resultMsgEl.textContent = msg;
  resultMsgEl.className = `result-msg ${cls}`;
}

// ─── Init ───────────────────────────────────────────────────────────────────
drawBannerStars();

// Register Service Worker for offline / PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
