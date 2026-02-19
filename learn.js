/* ═══════════════════════════════════════════════════════════════════════════
   Math Kids – Learn Mode
   Interactive lessons for carrying (addition), borrowing (subtraction),
   and grouping (multiplication).
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── State ──────────────────────────────────────────────────────────────────
let learnOp = null;
let learnSteps = [];
let learnIdx = 0;
let learnCanAdvance = true;
let demoSubIdx = 0;
let demoSubs = [];
let tryData = null; // state for interactive try-it

const LEARN_COLORS = {
  add: "#27AE60",
  subtract: "#E74C3C",
  multiply: "#8E44AD",
  divide: "#E67E22",
};
const LEARN_EMOJI = { add: "➕", subtract: "➖", multiply: "✖️", divide: "➗" };
const OP_CHAR = { add: "+", subtract: "−", multiply: "×", divide: "÷" };

// ─── Entry & Navigation ─────────────────────────────────────────────────────

function startLearnMode(op) {
  soundClick();
  learnOp = op;
  learnIdx = 0;
  switch (op) {
    case "add":
      learnSteps = buildAdditionLesson();
      break;
    case "subtract":
      learnSteps = buildSubtractionLesson();
      break;
    case "multiply":
      learnSteps = buildMultiplicationLesson();
      break;
    case "divide":
      learnSteps = buildDivisionLesson();
      break;
  }
  document.getElementById("learn-progress-fill").style.background =
    LEARN_COLORS[op];
  renderLearnStep();
  showScreen("learn");
}

function renderLearnStep() {
  const ws = document.getElementById("learn-workspace");
  ws.innerHTML = "";
  ws.onclick = null;
  learnCanAdvance = true;
  demoSubs = [];
  demoSubIdx = 0;
  tryData = null;

  learnSteps[learnIdx].render(ws);
  updateLearnUI();
}

function updateLearnUI() {
  const prev = document.getElementById("learn-prev");
  const next = document.getElementById("learn-next");
  prev.classList.toggle("hidden", learnIdx === 0);
  next.disabled = !learnCanAdvance;
  next.textContent =
    learnIdx >= learnSteps.length - 1 ? "Finish! 🎉" : "Next →";
  next.style.background = LEARN_COLORS[learnOp];
  document.getElementById("learn-progress").textContent =
    `Step ${learnIdx + 1} of ${learnSteps.length}`;
  document.getElementById("learn-progress-fill").style.width =
    `${((learnIdx + 1) / learnSteps.length) * 100}%`;
}

function nextLearnStep() {
  soundClick();
  if (learnIdx < learnSteps.length - 1) {
    learnIdx++;
    renderLearnStep();
  } else {
    soundPerfect();
    launchConfetti(100);
    showScreen("learn-menu");
  }
}

function prevLearnStep() {
  soundClick();
  if (learnIdx > 0) {
    learnIdx--;
    renderLearnStep();
  }
}

function exitLearn() {
  soundClick();
  showScreen("learn-menu");
}

// ─── Demo Sub-step System ───────────────────────────────────────────────────

function setupDemo(ws, substeps) {
  learnCanAdvance = false;
  demoSubs = substeps;
  demoSubIdx = 0;
  // Run first sub-step immediately
  demoSubs[0]();
  demoSubIdx = 1;
  // Tap/click to advance remaining
  ws.onclick = (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") return;
    advanceDemo(ws);
  };
}

function advanceDemo(ws) {
  if (demoSubIdx < demoSubs.length) {
    demoSubs[demoSubIdx]();
    demoSubIdx++;
  }
  if (demoSubIdx >= demoSubs.length) {
    ws.onclick = null;
    learnCanAdvance = true;
    updateLearnUI();
    const tap = ws.querySelector(".tap-prompt");
    if (tap) {
      tap.textContent = "✅ Done! Click Next →";
      tap.classList.add("done");
    }
    soundCorrect();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  ADDITION LESSON
// ═══════════════════════════════════════════════════════════════════════════

function buildAdditionLesson() {
  return [
    { render: (ws) => renderAddIntro(ws) },
    { render: (ws) => renderAddDemo(ws, 47, 35) },
    { render: (ws) => renderAddDemo(ws, 186, 247) },
    { render: (ws) => renderAddTryIt(ws) },
    { render: (ws) => renderAddTryIt(ws) },
    { render: (ws) => renderSummary(ws, "add") },
  ];
}

function renderAddIntro(ws) {
  ws.innerHTML = `
    <div class="learn-intro">
      <div class="learn-mascot">🤓</div>
      <h2 class="learn-title" style="color:${LEARN_COLORS.add}">How to Carry in Addition</h2>
      <div class="learn-card">
        <p>When we add two numbers in a column and the answer is <strong>10 or more</strong>, we can't fit it in one place!</p>
        <div class="learn-visual-box">
          <div class="visual-example">
            <span class="digit-box">8</span> + <span class="digit-box">5</span> = <span class="digit-box big">13</span>
          </div>
          <p class="visual-caption">13 has <strong>two digits</strong>! We write the <strong style="color:#27AE60">3</strong> and <strong>carry</strong> the <strong style="color:#E74C3C">1</strong> to the next column.</p>
        </div>
        <div class="carry-visual">
          <div class="carry-arrow">
            <span class="carry-num" style="color:#E74C3C">1</span> ↗ carried!
          </div>
          <div class="carry-answer">
            <span class="carry-num" style="color:#27AE60">3</span> ↓ written
          </div>
        </div>
      </div>
      <p class="learn-cta">Let's see it in action! Click <strong>Next</strong> →</p>
    </div>`;
}

function renderAddDemo(ws, a, b) {
  const data = computeAddData(a, b);
  ws.innerHTML = `
    <h2 class="learn-step-title" style="color:${LEARN_COLORS.add}">Watch: ${a} + ${b}</h2>
    ${buildColumnHTML(data, "+")}
    <div class="speech-bubble" id="demo-speech">Let's add ${a} + ${b}. We start from the right!</div>
    <div class="tap-prompt">👆 Tap to continue</div>`;

  const cols = data.numCols;
  const subs = [];

  // Process columns right to left
  for (let c = cols - 1; c >= 0; c--) {
    const ad = data.aDigits[c],
      bd = data.bDigits[c];
    const carry = data.carries[c] || 0;
    const sum = ad + bd + carry;
    const ansDigit = data.ansDigits[c];
    const newCarry = c > 0 ? data.carries[c - 1] : 0;
    const colLabel =
      c === cols - 1 ? "ones" : c === cols - 2 ? "tens" : "hundreds";

    // Highlight column
    subs.push(() => {
      clearColHighlights(ws);
      highlightCol(ws, c, "active");
      const carryText = carry > 0 ? ` + ${carry} (carry)` : "";
      speech(
        ws,
        `${colLabel.charAt(0).toUpperCase() + colLabel.slice(1)} column: ${ad} + ${bd}${carryText} = ${sum}`,
      );
      soundClick();
    });

    // Show result
    subs.push(() => {
      setAnswerDigit(ws, c, ansDigit);
      if (newCarry > 0 && c > 0) {
        setCarryDigit(ws, c - 1, newCarry);
        speech(
          ws,
          `${sum} is ${sum >= 10 ? "more than 9" : "the answer"}! Write <strong style="color:#27AE60">${ansDigit}</strong>${newCarry > 0 ? ` and carry <strong style="color:#E74C3C">${newCarry}</strong>` : ""}.`,
        );
      } else {
        speech(
          ws,
          `${ad} + ${bd}${carry ? " + " + carry : ""} = ${ansDigit}. Write it down!`,
        );
      }
      highlightCol(ws, c, "done");
      soundCorrect();
    });
  }

  // Final celebration
  subs.push(() => {
    clearColHighlights(ws);
    ws.querySelectorAll(".answer-cell").forEach((el) =>
      el.classList.add("celebrate"),
    );
    speech(ws, `🎉 ${a} + ${b} = <strong>${a + b}</strong>! Great job!`);
    launchConfetti(40);
  });

  setupDemo(ws, subs);
}

function renderAddTryIt(ws) {
  const { a, b } = generateAddProblem();
  const data = computeAddData(a, b);
  learnCanAdvance = false;

  ws.innerHTML = `
    <h2 class="learn-step-title" style="color:${LEARN_COLORS.add}">🎯 Your Turn: ${a} + ${b}</h2>
    ${buildColumnHTML(data, "+", true)}
    <div class="try-prompt" id="try-prompt">Start from the right! What is the sum for the <strong>ones</strong> column?</div>
    <div class="try-input-row">
      <input type="number" id="try-input" class="try-input" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="?" />
      <button class="btn try-check-btn" style="background:${LEARN_COLORS.add}" onclick="checkTryAnswer()">Check ✓</button>
    </div>
    <div class="try-feedback" id="try-feedback"></div>`;

  tryData = { a, b, data, col: data.numCols - 1, phase: "sum", op: "add" };
  updateTryPromptAdd();
  setTimeout(() => document.getElementById("try-input").focus(), 100);
}

function updateTryPromptAdd() {
  const { data, col } = tryData;
  const carry = data.carries[col] || 0;
  const ad = data.aDigits[col],
    bd = data.bDigits[col];
  const colName =
    col === data.numCols - 1
      ? "ones"
      : col === data.numCols - 2
        ? "tens"
        : "hundreds";
  const carryText = carry > 0 ? ` + ${carry} (carry)` : "";
  document.getElementById("try-prompt").innerHTML =
    `<strong>${colName.charAt(0).toUpperCase() + colName.slice(1)}</strong> column: What is ${ad} + ${bd}${carryText}?`;
}

// ═══════════════════════════════════════════════════════════════════════════
//  SUBTRACTION LESSON
// ═══════════════════════════════════════════════════════════════════════════

function buildSubtractionLesson() {
  return [
    { render: (ws) => renderSubIntro(ws) },
    { render: (ws) => renderSubDemo(ws, 52, 37) },
    { render: (ws) => renderSubDemo(ws, 304, 156) },
    { render: (ws) => renderSubTryIt(ws) },
    { render: (ws) => renderSubTryIt(ws) },
    { render: (ws) => renderSummary(ws, "subtract") },
  ];
}

function renderSubIntro(ws) {
  ws.innerHTML = `
    <div class="learn-intro">
      <div class="learn-mascot">🤔</div>
      <h2 class="learn-title" style="color:${LEARN_COLORS.subtract}">How to Borrow in Subtraction</h2>
      <div class="learn-card">
        <p>Sometimes the <strong>top number</strong> in a column is <strong>smaller</strong> than the bottom number. We can't subtract!</p>
        <div class="learn-visual-box">
          <div class="visual-example">
            <span class="digit-box">3</span> − <span class="digit-box">8</span> = <span class="digit-box big" style="color:#E74C3C">🤷</span>
          </div>
          <p class="visual-caption">3 is less than 8! We need to <strong style="color:#E74C3C">borrow</strong> from the next column.</p>
        </div>
        <div class="borrow-visual">
          <div class="borrow-step">
            <span class="borrow-before">5 <strong>3</strong></span>
            <span class="borrow-arrow">→ borrow →</span>
            <span class="borrow-after">4 <strong>13</strong></span>
          </div>
          <p class="borrow-explain">5 gives 1 to become <strong>4</strong>, and 3 becomes <strong>13</strong>!</p>
        </div>
      </div>
      <p class="learn-cta">Let's practice! Click <strong>Next</strong> →</p>
    </div>`;
}

function renderSubDemo(ws, a, b) {
  const data = computeSubData(a, b);
  ws.innerHTML = `
    <h2 class="learn-step-title" style="color:${LEARN_COLORS.subtract}">Watch: ${a} − ${b}</h2>
    ${buildColumnHTML(data, "−")}
    <div class="speech-bubble" id="demo-speech">Let's subtract ${a} − ${b}. Start from the right!</div>
    <div class="tap-prompt">👆 Tap to continue</div>`;

  const cols = data.numCols;
  const subs = [];
  // Clone modified digits for tracking borrows during animation
  const currentA = [...data.aDigits];

  for (let c = cols - 1; c >= 0; c--) {
    const bd = data.bDigits[c];
    const colLabel =
      c === cols - 1 ? "ones" : c === cols - 2 ? "tens" : "hundreds";

    if (data.borrows[c]) {
      // Show borrow needed
      subs.push(() => {
        clearColHighlights(ws);
        highlightCol(ws, c, "active");
        speech(
          ws,
          `${colLabel.charAt(0).toUpperCase() + colLabel.slice(1)}: ${currentA[c]} − ${bd}... We can't! ${currentA[c]} is smaller than ${bd}. We need to borrow!`,
        );
        soundClick();
      });

      // Show borrow animation
      subs.push(() => {
        // Cascade borrow through zeros
        const origDigit = currentA[c];
        currentA[c] += 10;
        let j = c - 1;
        while (j >= 0 && currentA[j] === 0) {
          currentA[j] = 9;
          setBorrowDisplayAt(ws, j, 9, data.aDigits[j]);
          j--;
        }
        if (j >= 0) {
          const origLeft = currentA[j];
          currentA[j] -= 1;
          setBorrowDisplayAt(ws, j, currentA[j], origLeft);
        }
        // Update the current column display
        const aCell = ws.querySelector(`.a-cell[data-col="${c}"]`);
        if (aCell) {
          aCell.innerHTML = `<span class="crossed">${origDigit}</span><span class="borrowed-val">${currentA[c]}</span>`;
          aCell.classList.add("borrowed");
        }
        const borrowSource = j >= 0 ? j : c - 1;
        speech(
          ws,
          `Borrow! ${origDigit} becomes <strong style="color:#27AE60">${currentA[c]}</strong>. We borrowed through to the ${borrowSource === 0 ? "hundreds" : "tens"} column.`,
        );
        soundClick();
      });

      // Show subtraction result
      subs.push(() => {
        const result = currentA[c] - bd;
        setAnswerDigit(ws, c, result);
        speech(ws, `Now ${currentA[c]} − ${bd} = <strong>${result}</strong>!`);
        highlightCol(ws, c, "done");
        soundCorrect();
      });
    } else {
      // Simple subtraction
      subs.push(() => {
        clearColHighlights(ws);
        highlightCol(ws, c, "active");
        const result = currentA[c] - bd;
        speech(
          ws,
          `${colLabel.charAt(0).toUpperCase() + colLabel.slice(1)}: ${currentA[c]} − ${bd} = ${result}`,
        );
        soundClick();
      });
      subs.push(() => {
        setAnswerDigit(ws, c, currentA[c] - bd);
        highlightCol(ws, c, "done");
        soundCorrect();
      });
    }
  }

  // Final
  subs.push(() => {
    clearColHighlights(ws);
    ws.querySelectorAll(".answer-cell").forEach((el) =>
      el.classList.add("celebrate"),
    );
    speech(ws, `🎉 ${a} − ${b} = <strong>${a - b}</strong>! You got it!`);
    launchConfetti(40);
  });

  setupDemo(ws, subs);
}

function renderSubTryIt(ws) {
  const { a, b } = generateSubProblem();
  const data = computeSubData(a, b);
  learnCanAdvance = false;

  ws.innerHTML = `
    <h2 class="learn-step-title" style="color:${LEARN_COLORS.subtract}">🎯 Your Turn: ${a} − ${b}</h2>
    ${buildColumnHTML(data, "−", true)}
    <div class="try-prompt" id="try-prompt"></div>
    <div class="try-input-row" id="try-input-row">
      <input type="number" id="try-input" class="try-input" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="?" />
      <button class="btn try-check-btn" style="background:${LEARN_COLORS.subtract}" onclick="checkTryAnswer()">Check ✓</button>
    </div>
    <div class="try-borrow-row hidden" id="try-borrow-row">
      <button class="btn try-borrow-btn" onclick="doBorrow()">🔄 Borrow!</button>
    </div>
    <div class="try-feedback" id="try-feedback"></div>`;

  const currentA = [...data.aDigits];
  tryData = {
    a,
    b,
    data,
    col: data.numCols - 1,
    phase: "check-borrow",
    op: "subtract",
    currentA,
  };
  updateTryPromptSub();
  setTimeout(() => document.getElementById("try-input").focus(), 100);
}

function updateTryPromptSub() {
  const { data, col, currentA, phase } = tryData;
  const bd = data.bDigits[col];
  const ad = currentA[col];
  const colName =
    col === data.numCols - 1
      ? "ones"
      : col === data.numCols - 2
        ? "tens"
        : "hundreds";

  if (phase === "check-borrow" && ad < bd) {
    document.getElementById("try-prompt").innerHTML =
      `<strong>${colName}</strong>: ${ad} − ${bd}... ${ad} is smaller! We need to borrow!`;
    document.getElementById("try-input-row").classList.add("hidden");
    document.getElementById("try-borrow-row").classList.remove("hidden");
  } else {
    document.getElementById("try-prompt").innerHTML =
      `<strong>${colName.charAt(0).toUpperCase() + colName.slice(1)}</strong> column: What is ${ad} − ${bd}?`;
    document.getElementById("try-input-row").classList.remove("hidden");
    document.getElementById("try-borrow-row").classList.add("hidden");
    tryData.phase = "calculate";
  }
}

function doBorrow() {
  soundClick();
  const { data, col, currentA } = tryData;
  const origDigit = currentA[col];
  currentA[col] += 10;

  const ws = document.getElementById("learn-workspace");
  // Cascade borrow through zeros
  let j = col - 1;
  while (j >= 0 && currentA[j] === 0) {
    currentA[j] = 9;
    setBorrowDisplayAt(ws, j, 9, data.aDigits[j]);
    j--;
  }
  if (j >= 0) {
    const origLeft = currentA[j];
    currentA[j] -= 1;
    setBorrowDisplayAt(ws, j, currentA[j], origLeft);
  }
  // Update current column display
  const aCell = ws.querySelector(`.a-cell[data-col="${col}"]`);
  if (aCell) {
    aCell.innerHTML = `<span class="crossed">${origDigit}</span><span class="borrowed-val">${currentA[col]}</span>`;
    aCell.classList.add("borrowed");
  }

  document.getElementById("try-feedback").innerHTML =
    `<span class="fb-correct">✅ Borrowed! ${origDigit} becomes ${currentA[col]}!</span>`;

  tryData.phase = "calculate";
  updateTryPromptSub();
  setTimeout(() => {
    document.getElementById("try-feedback").innerHTML = "";
    document.getElementById("try-input").focus();
  }, 1200);
}

// ═══════════════════════════════════════════════════════════════════════════
//  MULTIPLICATION LESSON
// ═══════════════════════════════════════════════════════════════════════════

function buildMultiplicationLesson() {
  return [
    { render: (ws) => renderMulIntro(ws) },
    { render: (ws) => renderGroupsDemo(ws, 3, 4) },
    { render: (ws) => renderGroupsDemo(ws, 5, 3) },
    { render: (ws) => renderBreakApart(ws, 12, 3) },
    { render: (ws) => renderMulTryIt(ws) },
    { render: (ws) => renderSummary(ws, "multiply") },
  ];
}

function renderMulIntro(ws) {
  ws.innerHTML = `
    <div class="learn-intro">
      <div class="learn-mascot">🧠</div>
      <h2 class="learn-title" style="color:${LEARN_COLORS.multiply}">Multiplication = Making Groups!</h2>
      <div class="learn-card">
        <p><strong>Multiplication</strong> is a fast way to add <strong>equal groups</strong>!</p>
        <div class="learn-visual-box">
          <div class="group-intro-visual">
            <div class="intro-group"><span class="dot-emoji">🍎</span><span class="dot-emoji">🍎</span><span class="dot-emoji">🍎</span></div>
            <div class="intro-group"><span class="dot-emoji">🍎</span><span class="dot-emoji">🍎</span><span class="dot-emoji">🍎</span></div>
          </div>
          <p class="visual-caption"><strong>2 groups</strong> of <strong>3 apples</strong> = 2 × 3 = <strong style="color:#8E44AD">6 apples!</strong></p>
        </div>
        <p style="margin-top:12px">For bigger numbers, we can <strong>break them apart</strong> to make it easier!</p>
      </div>
      <p class="learn-cta">Let's explore! Click <strong>Next</strong> →</p>
    </div>`;
}

function renderGroupsDemo(ws, groups, perGroup) {
  const total = groups * perGroup;
  const DOT_COLORS = [
    "#E74C3C",
    "#3498DB",
    "#27AE60",
    "#F39C12",
    "#8E44AD",
    "#1ABC9C",
  ];

  ws.innerHTML = `
    <h2 class="learn-step-title" style="color:${LEARN_COLORS.multiply}">${groups} × ${perGroup} = Making Groups!</h2>
    <div class="groups-container" id="groups-area"></div>
    <div class="groups-equation" id="groups-eq"></div>
    <div class="speech-bubble" id="demo-speech">${groups} × ${perGroup} means <strong>${groups} groups</strong> of <strong>${perGroup}</strong>!</div>
    <div class="tap-prompt">👆 Tap to continue</div>`;

  const area = document.getElementById("groups-area");
  const subs = [];
  let runningTotal = 0;

  // Build groups one at a time
  for (let g = 0; g < groups; g++) {
    subs.push(() => {
      const box = document.createElement("div");
      box.className = "group-box appear";
      box.style.borderColor = DOT_COLORS[g % DOT_COLORS.length];
      let dots = "";
      for (let d = 0; d < perGroup; d++) {
        dots += `<span class="dot-circle" style="background:${DOT_COLORS[g % DOT_COLORS.length]}"></span>`;
      }
      box.innerHTML = `<div class="group-dots">${dots}</div><div class="group-count">${perGroup}</div>`;
      area.appendChild(box);
      runningTotal += perGroup;
      soundClick();

      const plus =
        g > 0
          ? Array(g + 1)
              .fill(perGroup)
              .join(" + ") +
            " = " +
            runningTotal
          : `${perGroup}`;
      document.getElementById("groups-eq").innerHTML =
        `<span class="eq-highlight">${plus}</span>`;
      speech(
        ws,
        `Group ${g + 1}: ${perGroup} more! Total so far: <strong>${runningTotal}</strong>`,
      );
    });
  }

  // Final
  subs.push(() => {
    document.getElementById("groups-eq").innerHTML =
      `<span class="eq-final">${groups} × ${perGroup} = <strong>${total}</strong> 🎉</span>`;
    speech(
      ws,
      `${groups} groups of ${perGroup} = <strong>${total}</strong>! Multiplication is just fast adding!`,
    );
    soundCorrect();
    launchConfetti(30);
  });

  setupDemo(ws, subs);
}

function renderBreakApart(ws, a, b) {
  const tens = Math.floor(a / 10) * 10;
  const ones = a % 10;
  const total = a * b;

  ws.innerHTML = `
    <h2 class="learn-step-title" style="color:${LEARN_COLORS.multiply}">Break Apart: ${a} × ${b}</h2>
    <div class="break-container" id="break-area">
      <div class="break-problem">${a} × ${b} = ?</div>
    </div>
    <div class="speech-bubble" id="demo-speech">${a} looks big! Let's <strong>break it apart</strong> into easier pieces.</div>
    <div class="tap-prompt">👆 Tap to continue</div>`;

  const area = document.getElementById("break-area");
  const subs = [];

  // Show the split
  subs.push(() => {
    area.innerHTML = `
      <div class="break-problem">${a} × ${b}</div>
      <div class="break-split appear">
        <div class="break-piece piece-tens">
          <div class="piece-label">${tens} × ${b}</div>
          <div class="piece-result">= ?</div>
        </div>
        <span class="break-plus-sign">+</span>
        <div class="break-piece piece-ones">
          <div class="piece-label">${ones} × ${b}</div>
          <div class="piece-result">= ?</div>
        </div>
      </div>`;
    speech(
      ws,
      `Split ${a} into ${tens} and ${ones}: <strong>(${tens} × ${b}) + (${ones} × ${b})</strong>`,
    );
    soundClick();
  });

  // Solve tens piece
  subs.push(() => {
    area.querySelector(".piece-tens .piece-result").textContent =
      `= ${tens * b}`;
    area.querySelector(".piece-tens").classList.add("solved");
    speech(ws, `${tens} × ${b} = <strong>${tens * b}</strong>. That's easy!`);
    soundClick();
  });

  // Solve ones piece
  subs.push(() => {
    area.querySelector(".piece-ones .piece-result").textContent =
      `= ${ones * b}`;
    area.querySelector(".piece-ones").classList.add("solved");
    speech(ws, `${ones} × ${b} = <strong>${ones * b}</strong>. Easy too!`);
    soundClick();
  });

  // Combine
  subs.push(() => {
    area.innerHTML += `
      <div class="break-final appear">
        <div class="final-sum">${tens * b} + ${ones * b} = <strong>${total}</strong></div>
        <div class="final-answer">${a} × ${b} = <strong>${total}</strong> 🎉</div>
      </div>`;
    speech(
      ws,
      `${tens * b} + ${ones * b} = <strong>${total}</strong>! Breaking apart makes big multiplications easy!`,
    );
    soundCorrect();
    launchConfetti(30);
  });

  setupDemo(ws, subs);
}

function renderMulTryIt(ws) {
  const groups = 2 + Math.floor(Math.random() * 4); // 2-5
  const perGroup = 2 + Math.floor(Math.random() * 5); // 2-6
  const total = groups * perGroup;
  const DOT_COLORS = [
    "#E74C3C",
    "#3498DB",
    "#27AE60",
    "#F39C12",
    "#8E44AD",
    "#1ABC9C",
  ];

  learnCanAdvance = false;

  let groupsHTML = "";
  for (let g = 0; g < groups; g++) {
    let dots = "";
    for (let d = 0; d < perGroup; d++) {
      dots += `<span class="dot-circle" style="background:${DOT_COLORS[g % DOT_COLORS.length]}"></span>`;
    }
    groupsHTML += `<div class="group-box" style="border-color:${DOT_COLORS[g % DOT_COLORS.length]}"><div class="group-dots">${dots}</div><div class="group-count">${perGroup}</div></div>`;
  }

  ws.innerHTML = `
    <h2 class="learn-step-title" style="color:${LEARN_COLORS.multiply}">🎯 Count the Groups!</h2>
    <div class="groups-container">${groupsHTML}</div>
    <div class="try-prompt" id="try-prompt">${groups} groups of ${perGroup}. How many in total?</div>
    <div class="try-input-row">
      <input type="number" id="try-input" class="try-input" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="?" />
      <button class="btn try-check-btn" style="background:${LEARN_COLORS.multiply}" onclick="checkMulTryAnswer(${total})">Check ✓</button>
    </div>
    <div class="try-feedback" id="try-feedback"></div>`;

  tryData = { op: "multiply", expected: total, attempts: 0, groups, perGroup };
  setTimeout(() => document.getElementById("try-input").focus(), 100);
}

function checkMulTryAnswer(expected) {
  const input = document.getElementById("try-input");
  const val = parseInt(input.value, 10);
  const fb = document.getElementById("try-feedback");

  if (isNaN(val) || input.value.trim() === "") {
    input.focus();
    return;
  }

  if (val === expected) {
    fb.innerHTML = `<span class="fb-correct">🎉 Correct! ${tryData.groups} × ${tryData.perGroup} = ${expected}!</span>`;
    soundCorrect();
    launchConfetti(40);
    learnCanAdvance = true;
    updateLearnUI();
    input.disabled = true;
  } else {
    tryData.attempts++;
    if (tryData.attempts >= 3) {
      fb.innerHTML = `<span class="fb-wrong">The answer is ${expected}. ${tryData.groups} × ${tryData.perGroup} = ${tryData.groups} groups of ${tryData.perGroup} = ${expected}!</span>`;
      soundWrong();
      learnCanAdvance = true;
      updateLearnUI();
      input.disabled = true;
    } else {
      const hint = `Try counting: ${Array(tryData.groups).fill(tryData.perGroup).join(" + ")} = ?`;
      fb.innerHTML = `<span class="fb-wrong">Not quite! ${hint}</span>`;
      soundWrong();
      input.value = "";
      input.focus();
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  SHARED: Try-It Answer Checker (Addition & Subtraction)
// ═══════════════════════════════════════════════════════════════════════════

function checkTryAnswer() {
  if (!tryData) return;
  if (tryData.op === "multiply" || tryData.op === "divide") return; // handled separately
  const input = document.getElementById("try-input");
  const val = parseInt(input.value, 10);
  const fb = document.getElementById("try-feedback");
  if (isNaN(val) || input.value.trim() === "") {
    input.focus();
    return;
  }

  const { data, col, op, currentA } = tryData;
  const ws = document.getElementById("learn-workspace");

  let expected;
  if (op === "add") {
    const carry = data.carries[col] || 0;
    expected = data.aDigits[col] + data.bDigits[col] + carry;
  } else {
    expected = (currentA || data.modifiedA)[col] - data.bDigits[col];
  }

  if (val === expected) {
    const ansDigit = op === "add" ? data.ansDigits[col] : expected;
    setAnswerDigit(ws, col, ansDigit);

    const producedCarry = col > 0 ? data.carries[col - 1] || 0 : 0;
    if (op === "add" && producedCarry > 0) {
      setCarryDigit(ws, col - 1, producedCarry);
      fb.innerHTML = `<span class="fb-correct">✅ ${expected}! Write ${ansDigit}, carry ${producedCarry}!</span>`;
    } else {
      fb.innerHTML = `<span class="fb-correct">✅ Correct! ${ansDigit}!</span>`;
    }
    soundCorrect();
    input.value = "";

    // Move to next column
    tryData.col--;
    if (
      tryData.col < 0 ||
      (tryData.col === 0 &&
        op === "add" &&
        data.aDigits[0] === 0 &&
        data.bDigits[0] === 0)
    ) {
      // Auto-fill leading carry digit if the result has an extra leading column
      if (
        op === "add" &&
        data.aDigits[0] === 0 &&
        data.bDigits[0] === 0 &&
        data.ansDigits[0] > 0
      ) {
        setAnswerDigit(ws, 0, data.ansDigits[0]);
      }
      // Done!
      setTimeout(() => {
        const result =
          op === "add" ? tryData.a + tryData.b : tryData.a - tryData.b;
        fb.innerHTML = `<span class="fb-correct">🎉 ${tryData.a} ${OP_CHAR[op]} ${tryData.b} = ${result}! Amazing!</span>`;
        ws.querySelectorAll(".answer-cell").forEach((el) =>
          el.classList.add("celebrate"),
        );
        launchConfetti(50);
        learnCanAdvance = true;
        updateLearnUI();
        input.disabled = true;
      }, 600);
    } else {
      setTimeout(() => {
        fb.innerHTML = "";
        if (op === "subtract") {
          tryData.phase = "check-borrow";
          updateTryPromptSub();
        } else {
          updateTryPromptAdd();
        }
        input.focus();
      }, 1000);
    }
  } else {
    soundWrong();
    if (op === "add") {
      const carryHint = data.carries[col] || 0;
      const hint =
        carryHint > 0
          ? `Hint: ${data.aDigits[col]} + ${data.bDigits[col]} + ${carryHint} (carry) = ?`
          : `Hint: ${data.aDigits[col]} + ${data.bDigits[col]} = ?`;
      fb.innerHTML = `<span class="fb-wrong">Not quite! ${hint}</span>`;
    } else {
      const ad = (currentA || data.modifiedA)[col];
      fb.innerHTML = `<span class="fb-wrong">Not quite! What is ${ad} − ${data.bDigits[col]}?</span>`;
    }
    input.value = "";
    input.focus();
  }
}

// Enter key support for try-it inputs
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Enter" &&
    document.getElementById("try-input") === document.activeElement
  ) {
    e.preventDefault();
    if (tryData && tryData.op === "multiply") {
      checkMulTryAnswer(tryData.expected);
    } else if (tryData && tryData.op === "divide") {
      checkDivTryAnswer(tryData.expected, tryData.a, tryData.b);
    } else {
      checkTryAnswer();
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════
//  SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

function renderSummary(ws, op) {
  const messages = {
    add: {
      title: "Carrying in Addition",
      tip: "When a column adds to 10 or more, write the ones digit and carry the rest!",
    },
    subtract: {
      title: "Borrowing in Subtraction",
      tip: "When the top is smaller, borrow 10 from the next column!",
    },
    multiply: {
      title: "Grouping in Multiplication",
      tip: "Break big numbers into tens and ones to make it easy!",
    },
    divide: {
      title: "Sharing in Division",
      tip: "Division is sharing equally! Think: how many groups of the divisor fit inside the number?",
    },
  };
  const m = messages[op];
  ws.innerHTML = `
    <div class="learn-intro">
      <div class="learn-mascot">🏆</div>
      <h2 class="learn-title" style="color:${LEARN_COLORS[op]}">Lesson Complete!</h2>
      <div class="learn-card summary-card">
        <h3>${m.title}</h3>
        <p class="summary-tip">💡 ${m.tip}</p>
        <div class="summary-stars">⭐⭐⭐⭐⭐</div>
        <p>You did an <strong>amazing</strong> job! Keep practicing!</p>
      </div>
      <p class="learn-cta">Click <strong>Finish</strong> to go back, or try another lesson!</p>
    </div>`;
  soundPerfect();
  launchConfetti(80);
}

// ═══════════════════════════════════════════════════════════════════════════
//  COLUMN MATH HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function computeAddData(a, b) {
  const result = a + b;
  const maxLen = String(result).length;
  const aD = String(a).padStart(maxLen, "0").split("").map(Number);
  const bD = String(b).padStart(maxLen, "0").split("").map(Number);
  const rD = String(result).padStart(maxLen, "0").split("").map(Number);

  const carries = new Array(maxLen).fill(0);
  let carry = 0;
  for (let i = maxLen - 1; i >= 0; i--) {
    const sum = aD[i] + bD[i] + carry;
    carry = Math.floor(sum / 10);
    if (i > 0) carries[i - 1] = carry;
  }

  return { aDigits: aD, bDigits: bD, ansDigits: rD, carries, numCols: maxLen };
}

function computeSubData(a, b) {
  const result = a - b;
  const maxLen = String(a).length;
  const aD = String(a).padStart(maxLen, "0").split("").map(Number);
  const bD = String(b).padStart(maxLen, "0").split("").map(Number);
  const rD = String(result).padStart(maxLen, "0").split("").map(Number);

  const borrows = new Array(maxLen).fill(false);
  const modifiedA = [...aD];
  for (let i = maxLen - 1; i >= 0; i--) {
    if (modifiedA[i] < bD[i]) {
      borrows[i] = true;
      modifiedA[i] += 10;
      // Find next non-zero column to borrow from
      let j = i - 1;
      while (j >= 0 && modifiedA[j] === 0) {
        modifiedA[j] = 9;
        j--;
      }
      if (j >= 0) modifiedA[j] -= 1;
    }
  }

  return {
    aDigits: aD,
    bDigits: bD,
    ansDigits: rD,
    borrows,
    modifiedA,
    numCols: maxLen,
  };
}

function buildColumnHTML(data, opChar, interactive) {
  const n = data.numCols;
  let html = '<div class="col-math">';

  // Carry / borrow row
  html +=
    '<div class="col-row carry-row"><div class="col-cell col-op-cell"></div>';
  for (let i = 0; i < n; i++) {
    html += `<div class="col-cell carry-cell" data-col="${i}"></div>`;
  }
  html += "</div>";

  // First number
  html += '<div class="col-row"><div class="col-cell col-op-cell"></div>';
  for (let i = 0; i < n; i++) {
    const d = data.aDigits[i] > 0 || i > 0 ? data.aDigits[i] : "";
    html += `<div class="col-cell digit-cell a-cell" data-col="${i}">${d}</div>`;
  }
  html += "</div>";

  // Second number with operator
  html += `<div class="col-row"><div class="col-cell col-op-cell op-char">${opChar}</div>`;
  for (let i = 0; i < n; i++) {
    const d = data.bDigits[i] > 0 || i > 0 ? data.bDigits[i] : "";
    html += `<div class="col-cell digit-cell b-cell" data-col="${i}">${d}</div>`;
  }
  html += "</div>";

  // Line
  html += '<div class="col-line-row"><div class="col-cell col-op-cell"></div>';
  for (let i = 0; i < n; i++)
    html += '<div class="col-cell col-line-cell"></div>';
  html += "</div>";

  // Answer row
  html +=
    '<div class="col-row answer-row"><div class="col-cell col-op-cell"></div>';
  for (let i = 0; i < n; i++) {
    html += `<div class="col-cell answer-cell" data-col="${i}"></div>`;
  }
  html += "</div>";

  html += "</div>";
  return html;
}

function highlightCol(ws, col, cls) {
  ws.querySelectorAll(`[data-col="${col}"]`).forEach((el) =>
    el.classList.add(`col-${cls}`),
  );
}

function clearColHighlights(ws) {
  ws.querySelectorAll(".col-active, .col-done").forEach((el) => {
    el.classList.remove("col-active", "col-done");
  });
}

function setAnswerDigit(ws, col, digit) {
  const cell = ws.querySelector(`.answer-cell[data-col="${col}"]`);
  if (cell) {
    cell.textContent = digit;
    cell.classList.add("revealed");
  }
}

function setCarryDigit(ws, col, digit) {
  const cell = ws.querySelector(`.carry-cell[data-col="${col}"]`);
  if (cell) {
    cell.textContent = digit;
    cell.classList.add("carry-visible");
  }
}

function setBorrowDisplay(ws, col, newVal, newLeft, origLeft) {
  // Cross out original digit and show new one
  const aCell = ws.querySelector(`.a-cell[data-col="${col}"]`);
  if (aCell) {
    aCell.innerHTML = `<span class="crossed">${aCell.textContent}</span><span class="borrowed-val">${newVal}</span>`;
    aCell.classList.add("borrowed");
  }
  // Update left neighbor
  if (col > 0) {
    const leftCell = ws.querySelector(`.a-cell[data-col="${col - 1}"]`);
    if (leftCell && !leftCell.classList.contains("borrowed")) {
      leftCell.innerHTML = `<span class="crossed">${origLeft}</span><span class="borrowed-val">${newLeft}</span>`;
      leftCell.classList.add("borrowed");
    }
  }
}

function setBorrowDisplayAt(ws, col, newVal, origVal) {
  const cell = ws.querySelector(`.a-cell[data-col="${col}"]`);
  if (cell) {
    cell.innerHTML = `<span class="crossed">${origVal}</span><span class="borrowed-val">${newVal}</span>`;
    cell.classList.add("borrowed");
  }
}

function speech(ws, html) {
  const el =
    ws.querySelector("#demo-speech") || ws.querySelector(".speech-bubble");
  if (el) el.innerHTML = html;
}

// ─── Problem Generators ─────────────────────────────────────────────────────

function generateAddProblem() {
  // Ensure at least one carry
  let a, b;
  do {
    a = 20 + Math.floor(Math.random() * 70); // 20-89
    b = 10 + Math.floor(Math.random() * 70); // 10-79
  } while ((a % 10) + (b % 10) < 10); // ensure ones carry
  return { a, b };
}

function generateSubProblem() {
  // Ensure at least one borrow
  let a, b;
  do {
    a = 30 + Math.floor(Math.random() * 60); // 30-89
    b = 10 + Math.floor(Math.random() * (a - 11)); // ensure b < a
  } while (a % 10 >= b % 10); // ensure ones borrow needed
  return { a, b };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Times Tables – Learn & Quiz (1–20)
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── State ──────────────────────────────────────────────────────────────────
let currentTable = null;
let tableQuizQuestions = [];
let tableQuizIdx = 0;
let tableQuizScore = 0;
let tableQuizAttempts = 0; // tracks wrong attempts on current question

// Colour palette for table numbers
const TABLE_COLORS = [
  "#E74C3C",
  "#E67E22",
  "#F1C40F",
  "#2ECC71",
  "#1ABC9C",
  "#3498DB",
  "#2980B9",
  "#9B59B6",
  "#8E44AD",
  "#E91E63",
  "#FF5722",
  "#FF9800",
  "#CDDC39",
  "#4CAF50",
  "#009688",
  "#00BCD4",
  "#03A9F4",
  "#673AB7",
  "#795548",
  "#607D8B",
];

// ─── Build grid on load ─────────────────────────────────────────────────────
(function initTablesGrid() {
  const grid = document.getElementById("tables-grid");
  if (!grid) return;
  for (let i = 1; i <= 20; i++) {
    const btn = document.createElement("button");
    btn.className = "btn-table";
    btn.textContent = i;
    btn.style.background = TABLE_COLORS[i - 1];
    btn.onclick = () => selectTable(i);
    grid.appendChild(btn);
  }
})();

// ─── Navigation ─────────────────────────────────────────────────────────────
function openTablesMenu() {
  soundClick();
  showScreen("tables-menu");
}

function selectTable(n) {
  soundClick();
  currentTable = n;
  renderTable(n);
  showScreen("tables");
}

// ─── Render full table ──────────────────────────────────────────────────────
function renderTable(n) {
  document.getElementById("table-title").textContent = `× ${n} Table`;
  const display = document.getElementById("table-display");
  display.innerHTML = "";
  display.classList.remove("hidden");

  const color = TABLE_COLORS[n - 1];

  for (let i = 1; i <= 10; i++) {
    const row = document.createElement("div");
    row.className = "table-row fade-row";
    row.style.animationDelay = `${(i - 1) * 0.06}s`;
    row.innerHTML = `
      <span class="table-n" style="color:${color}">${n}</span>
      <span class="table-x">×</span>
      <span class="table-m">${i}</span>
      <span class="table-eq">=</span>
      <span class="table-ans" style="color:${color}">${n * i}</span>
    `;
    display.appendChild(row);
  }

  // Reset UI
  document.getElementById("table-actions").classList.remove("hidden");
  document.getElementById("btn-test-me").classList.remove("hidden");
  document.getElementById("btn-back-tables").classList.remove("hidden");
  const qa = document.getElementById("table-quiz-area");
  qa.classList.add("hidden");
  qa.innerHTML = "";
}

// ─── Quiz mode ──────────────────────────────────────────────────────────────
function startTableQuiz() {
  soundClick();
  const n = currentTable;

  // Build & shuffle questions
  tableQuizQuestions = [];
  for (let i = 1; i <= 10; i++) {
    tableQuizQuestions.push({ m: i, answer: n * i });
  }
  for (let i = tableQuizQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tableQuizQuestions[i], tableQuizQuestions[j]] = [
      tableQuizQuestions[j],
      tableQuizQuestions[i],
    ];
  }

  tableQuizIdx = 0;
  tableQuizScore = 0;

  // Hide table, show quiz
  document.getElementById("table-display").classList.add("hidden");
  document.getElementById("table-actions").classList.add("hidden");
  document.getElementById("btn-back-tables").classList.add("hidden");

  const qa = document.getElementById("table-quiz-area");
  qa.classList.remove("hidden");
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const qa = document.getElementById("table-quiz-area");
  const q = tableQuizQuestions[tableQuizIdx];
  const n = currentTable;
  const color = TABLE_COLORS[n - 1];
  tableQuizAttempts = 0;

  qa.innerHTML = `
    <div class="quiz-progress-bar">
      <div class="quiz-progress-track">
        <div class="quiz-progress-fill" style="width:${(tableQuizIdx / tableQuizQuestions.length) * 100}%; background:${color}"></div>
      </div>
      <span class="quiz-progress-text">${tableQuizIdx + 1} / ${tableQuizQuestions.length}</span>
    </div>
    <div class="quiz-score-row">Score: ${tableQuizScore}</div>
    <div class="quiz-problem-card">
      <span class="quiz-n" style="color:${color}">${n}</span>
      <span class="quiz-x">×</span>
      <span class="quiz-m">${q.m}</span>
      <span class="quiz-eq">=</span>
      <input type="number" class="quiz-input" id="quiz-ans-input"
        inputmode="numeric" pattern="[0-9]*" autocomplete="off" />
    </div>
    <button class="btn btn-check quiz-check-btn" id="quiz-check-btn" onclick="checkTableQuizAnswer()">Check</button>
    <div class="quiz-feedback" id="quiz-feedback"></div>
  `;

  const inp = document.getElementById("quiz-ans-input");
  setTimeout(() => inp.focus(), 120);
  inp.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkTableQuizAnswer();
  });
}

function checkTableQuizAnswer() {
  const inp = document.getElementById("quiz-ans-input");
  const fb = document.getElementById("quiz-feedback");
  const val = parseInt(inp.value, 10);
  const q = tableQuizQuestions[tableQuizIdx];

  if (isNaN(val) || inp.value.trim() === "") return;

  if (val === q.answer) {
    // Correct
    if (tableQuizAttempts === 0) tableQuizScore++; // only score on first attempt
    inp.disabled = true;
    document.getElementById("quiz-check-btn").disabled = true;
    soundCorrect();
    fb.innerHTML = `<span class="fb-correct">✅ ${currentTable} × ${q.m} = ${q.answer}</span>`;

    setTimeout(() => {
      tableQuizIdx++;
      if (tableQuizIdx < tableQuizQuestions.length) {
        renderQuizQuestion();
      } else {
        showTableQuizResults();
      }
    }, 1000);
  } else {
    // Wrong
    tableQuizAttempts++;
    soundWrong();
    inp.value = "";
    inp.classList.add("shake");
    setTimeout(() => inp.classList.remove("shake"), 400);

    if (tableQuizAttempts >= 2) {
      // Show answer after 2 wrong attempts
      fb.innerHTML = `<span class="fb-wrong">The answer is <strong>${q.answer}</strong></span>`;
      inp.disabled = true;
      document.getElementById("quiz-check-btn").disabled = true;
      setTimeout(() => {
        tableQuizIdx++;
        if (tableQuizIdx < tableQuizQuestions.length) {
          renderQuizQuestion();
        } else {
          showTableQuizResults();
        }
      }, 1500);
    } else {
      fb.innerHTML = `<span class="fb-wrong">❌ Try again!</span>`;
      setTimeout(() => inp.focus(), 50);
    }
  }
}

function showTableQuizResults() {
  const qa = document.getElementById("table-quiz-area");
  const total = tableQuizQuestions.length;
  const pct = Math.round((tableQuizScore / total) * 100);
  const color = TABLE_COLORS[currentTable - 1];

  let msg, stars;
  if (pct === 100) {
    msg = "Perfect! You know this table! 🏆";
    stars = "⭐⭐⭐";
    soundPerfect();
    launchConfetti(100);
  } else if (pct >= 80) {
    msg = "Great job! Almost perfect!";
    stars = "⭐⭐";
    soundCorrect();
    launchConfetti(40);
  } else if (pct >= 50) {
    msg = "Good effort! Keep practicing!";
    stars = "⭐";
    soundCorrect();
  } else {
    msg = "Keep trying! Practice makes perfect!";
    stars = "";
  }

  qa.innerHTML = `
    <div class="quiz-results">
      <div class="quiz-stars">${stars}</div>
      <h2 class="quiz-score-big" style="color:${color}">${tableQuizScore} / ${total}</h2>
      <p class="quiz-msg">${msg}</p>
      <div class="quiz-result-btns">
        <button class="btn btn-quiz" onclick="startTableQuiz()">🔄 Try Again</button>
        <button class="btn btn-study" onclick="selectTable(currentTable)">📖 Study Table</button>
      </div>
    </div>
  `;

  // Show back button again
  document.getElementById("btn-back-tables").classList.remove("hidden");
}

/* ═══════════════════════════════════════════════════════════════════════════
   DIVISION LESSON – Sharing & Splitting
   ═══════════════════════════════════════════════════════════════════════════ */

function buildDivisionLesson() {
  return [
    { render: (ws) => renderDivIntro(ws) },
    { render: (ws) => renderDivSharingDemo(ws, 12, 3) },
    { render: (ws) => renderDivSharingDemo(ws, 20, 4) },
    { render: (ws) => renderDivGroupingDemo(ws, 15, 5) },
    { render: (ws) => renderDivConnectionDemo(ws) },
    { render: (ws) => renderDivTryIt(ws) },
    { render: (ws) => renderDivTryIt(ws) },
    { render: (ws) => renderSummary(ws, "divide") },
  ];
}

// ─── Intro ──────────────────────────────────────────────────────────────────
function renderDivIntro(ws) {
  ws.innerHTML = `
    <div class="learn-intro">
      <div class="learn-mascot">🍪</div>
      <h2 class="learn-title" style="color:${LEARN_COLORS.divide}">What is Division?</h2>
      <div class="learn-card">
        <p>Division means <strong>sharing equally</strong>!</p>
        <p>Imagine you have <strong>12 cookies</strong> 🍪 and <strong>3 friends</strong>. How many cookies does each friend get?</p>
        <div class="learn-visual-box">
          <div class="visual-example">
            <span class="digit-box" style="font-size:1.4rem">12</span>
            <span>÷</span>
            <span class="digit-box">3</span>
            <span>=</span>
            <span class="digit-box big" style="background:#FFF3E0;border-color:#E67E22;color:#E67E22">4</span>
          </div>
          <p class="visual-caption">12 cookies shared among 3 friends = <strong style="color:#E67E22">4 cookies each!</strong></p>
        </div>
        <p style="margin-top:10px">Division is the <strong>opposite of multiplication</strong>:</p>
        <div class="div-connection-box">
          <span>3 × 4 = 12</span> ↔ <span>12 ÷ 3 = 4</span>
        </div>
      </div>
      <p class="learn-cta">Let's see how sharing works! Click <strong>Next</strong> →</p>
    </div>`;
}

// ─── Sharing Demo (visual distribution) ─────────────────────────────────────
function renderDivSharingDemo(ws, total, groups) {
  const each = total / groups;
  const ITEM = "🍪";
  const PLATE_COLORS = [
    "#E74C3C",
    "#3498DB",
    "#27AE60",
    "#F39C12",
    "#8E44AD",
    "#1ABC9C",
  ];

  ws.innerHTML = `
    <h2 class="learn-step-title" style="color:${LEARN_COLORS.divide}">Share: ${total} ÷ ${groups}</h2>
    <div class="div-pile" id="div-pile"></div>
    <div class="div-plates" id="div-plates"></div>
    <div class="groups-equation" id="div-equation"></div>
    <div class="speech-bubble" id="demo-speech">We have ${total} ${ITEM} to share equally among ${groups} plates!</div>
    <div class="tap-prompt">👆 Tap to continue</div>`;

  const pile = document.getElementById("div-pile");
  const plates = document.getElementById("div-plates");

  // Build pile of items
  let pileItems = "";
  for (let i = 0; i < total; i++) {
    pileItems += `<span class="pile-item" id="pile-${i}">${ITEM}</span>`;
  }
  pile.innerHTML = `<div class="pile-label">Pile: ${total} ${ITEM}</div><div class="pile-items">${pileItems}</div>`;

  // Build empty plates
  let platesHTML = "";
  for (let g = 0; g < groups; g++) {
    platesHTML += `<div class="div-plate" id="plate-${g}" style="border-color:${PLATE_COLORS[g % PLATE_COLORS.length]}">
      <div class="plate-items" id="plate-items-${g}"></div>
      <div class="plate-count" style="color:${PLATE_COLORS[g % PLATE_COLORS.length]}">0</div>
    </div>`;
  }
  plates.innerHTML = platesHTML;

  const subs = [];
  let distributed = 0;

  // Distribute one round at a time (one to each plate)
  for (let round = 0; round < each; round++) {
    subs.push(() => {
      for (let g = 0; g < groups; g++) {
        const idx = round * groups + g;
        const pileEl = document.getElementById(`pile-${idx}`);
        if (pileEl) pileEl.classList.add("pile-given");

        const plateItems = document.getElementById(`plate-items-${g}`);
        plateItems.innerHTML += `<span class="plate-item appear-item">${ITEM}</span>`;
        const countEl = document
          .getElementById(`plate-${g}`)
          .querySelector(".plate-count");
        countEl.textContent = round + 1;
      }
      distributed = (round + 1) * groups;
      const remaining = total - distributed;

      pile.querySelector(".pile-label").textContent =
        remaining > 0 ? `Pile: ${remaining} left` : "Pile: empty!";

      speech(
        ws,
        `Round ${round + 1}: Give 1 to each plate. Each plate now has <strong>${round + 1}</strong>.`,
      );
      soundClick();
    });
  }

  // Final celebration
  subs.push(() => {
    document.getElementById("div-equation").innerHTML =
      `<span class="eq-final" style="color:${LEARN_COLORS.divide}">${total} ÷ ${groups} = <strong>${each}</strong> 🎉</span>`;
    speech(
      ws,
      `🎉 ${total} shared equally among ${groups} = <strong>${each} each</strong>! That's division!`,
    );
    soundCorrect();
    launchConfetti(30);
  });

  setupDemo(ws, subs);
}

// ─── Grouping Demo (how many groups?) ───────────────────────────────────────
function renderDivGroupingDemo(ws, total, perGroup) {
  const numGroups = total / perGroup;
  const ITEM = "⭐";
  const GROUP_COLORS = [
    "#E74C3C",
    "#3498DB",
    "#27AE60",
    "#F39C12",
    "#8E44AD",
    "#1ABC9C",
  ];

  ws.innerHTML = `
    <h2 class="learn-step-title" style="color:${LEARN_COLORS.divide}">Group: ${total} ÷ ${perGroup}</h2>
    <div class="div-pile" id="div-pile"></div>
    <div class="groups-container" id="div-groups-area"></div>
    <div class="groups-equation" id="div-equation"></div>
    <div class="speech-bubble" id="demo-speech">${total} ÷ ${perGroup} also means: how many groups of ${perGroup} can we make?</div>
    <div class="tap-prompt">👆 Tap to continue</div>`;

  const pile = document.getElementById("div-pile");
  let pileItems = "";
  for (let i = 0; i < total; i++) {
    pileItems += `<span class="pile-item" id="gpile-${i}">${ITEM}</span>`;
  }
  pile.innerHTML = `<div class="pile-label">${total} ${ITEM} — make groups of ${perGroup}</div><div class="pile-items">${pileItems}</div>`;

  const area = document.getElementById("div-groups-area");
  const subs = [];

  for (let g = 0; g < numGroups; g++) {
    subs.push(() => {
      // Mark items as used
      for (let d = 0; d < perGroup; d++) {
        const idx = g * perGroup + d;
        const el = document.getElementById(`gpile-${idx}`);
        if (el) el.classList.add("pile-given");
      }

      const box = document.createElement("div");
      box.className = "group-box appear";
      box.style.borderColor = GROUP_COLORS[g % GROUP_COLORS.length];
      let dots = "";
      for (let d = 0; d < perGroup; d++) {
        dots += `<span class="dot-circle" style="background:${GROUP_COLORS[g % GROUP_COLORS.length]}">${ITEM}</span>`;
      }
      box.innerHTML = `<div class="group-dots">${dots}</div><div class="group-count">${perGroup}</div>`;
      area.appendChild(box);

      const remaining = total - (g + 1) * perGroup;
      pile.querySelector(".pile-label").textContent =
        remaining > 0 ? `${remaining} left — keep grouping!` : "All grouped!";

      speech(
        ws,
        `Group ${g + 1}! That's ${g + 1} group${g > 0 ? "s" : ""} of ${perGroup} so far.`,
      );
      soundClick();
    });
  }

  subs.push(() => {
    document.getElementById("div-equation").innerHTML =
      `<span class="eq-final" style="color:${LEARN_COLORS.divide}">${total} ÷ ${perGroup} = <strong>${numGroups}</strong> groups! 🎉</span>`;
    speech(
      ws,
      `🎉 We made <strong>${numGroups} groups</strong> of ${perGroup}! So ${total} ÷ ${perGroup} = ${numGroups}!`,
    );
    soundCorrect();
    launchConfetti(30);
  });

  setupDemo(ws, subs);
}

// ─── Division ↔ Multiplication Connection ───────────────────────────────────
function renderDivConnectionDemo(ws) {
  ws.innerHTML = `
    <div class="learn-intro">
      <div class="learn-mascot">💡</div>
      <h2 class="learn-title" style="color:${LEARN_COLORS.divide}">The Secret Trick!</h2>
      <div class="learn-card">
        <p>Division and multiplication are <strong>best friends</strong>! They're opposites!</p>
        <div class="learn-visual-box">
          <div class="div-trick-grid">
            <div class="trick-row">
              <span class="trick-mul">4 × 5 = 20</span>
              <span class="trick-arrow">↔</span>
              <span class="trick-div">20 ÷ 5 = 4</span>
            </div>
            <div class="trick-row">
              <span class="trick-mul">3 × 7 = 21</span>
              <span class="trick-arrow">↔</span>
              <span class="trick-div">21 ÷ 7 = 3</span>
            </div>
            <div class="trick-row">
              <span class="trick-mul">6 × 8 = 48</span>
              <span class="trick-arrow">↔</span>
              <span class="trick-div">48 ÷ 8 = 6</span>
            </div>
          </div>
        </div>
        <p style="margin-top:12px"><strong>Trick:</strong> When you see ${"`"}20 ÷ 5 = ?${"`"}, think:</p>
        <div class="div-think-bubble">
          🤔 "5 × <strong>what</strong> = 20?"<br>
          5 × <strong style="color:#E67E22">4</strong> = 20 → answer is <strong style="color:#E67E22">4</strong>!
        </div>
        <p style="margin-top:8px">If you know your times tables, division is easy! 🏆</p>
      </div>
      <p class="learn-cta">Now try it yourself! Click <strong>Next</strong> →</p>
    </div>`;
}

// ─── Division Try-It ────────────────────────────────────────────────────────
function renderDivTryIt(ws) {
  // Generate a clean division problem
  const divisors = [2, 3, 4, 5, 6, 7, 8, 9];
  const b = divisors[Math.floor(Math.random() * divisors.length)];
  const quotient = 2 + Math.floor(Math.random() * 9); // 2-10
  const a = b * quotient;
  const expected = quotient;

  learnCanAdvance = false;

  // Build visual items to help
  const ITEM = "🟡";
  let pileHTML = "";
  for (let i = 0; i < a; i++) {
    pileHTML += `<span class="pile-item mini-pile">${ITEM}</span>`;
  }

  ws.innerHTML = `
    <h2 class="learn-step-title" style="color:${LEARN_COLORS.divide}">🎯 Your Turn: ${a} ÷ ${b}</h2>
    <div class="div-try-visual">
      <div class="div-try-pile">${pileHTML}</div>
      <p class="div-try-hint-text">Share ${a} items into ${b} equal groups. How many in each?</p>
    </div>
    <div class="div-think-bubble" style="margin:10px 0">
      💡 Think: ${b} × <strong>?</strong> = ${a}
    </div>
    <div class="try-input-row">
      <input type="number" id="try-input" class="try-input" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="?" />
      <button class="btn try-check-btn" style="background:${LEARN_COLORS.divide}" onclick="checkDivTryAnswer(${expected}, ${a}, ${b})">Check ✓</button>
    </div>
    <div class="try-feedback" id="try-feedback"></div>`;

  tryData = { op: "divide", expected, a, b, attempts: 0 };
  setTimeout(() => document.getElementById("try-input").focus(), 100);
}

function checkDivTryAnswer(expected, a, b) {
  const input = document.getElementById("try-input");
  const fb = document.getElementById("try-feedback");
  const val = parseInt(input.value, 10);

  if (isNaN(val) || input.value.trim() === "") {
    input.focus();
    return;
  }

  if (val === expected) {
    fb.innerHTML = `<span class="fb-correct">🎉 Correct! ${a} ÷ ${b} = ${expected}! Because ${b} × ${expected} = ${a}!</span>`;
    soundCorrect();
    launchConfetti(40);
    learnCanAdvance = true;
    updateLearnUI();
    input.disabled = true;
  } else {
    tryData.attempts++;
    if (tryData.attempts >= 3) {
      fb.innerHTML = `<span class="fb-wrong">The answer is <strong>${expected}</strong>. ${b} × ${expected} = ${a}, so ${a} ÷ ${b} = ${expected}!</span>`;
      soundWrong();
      learnCanAdvance = true;
      updateLearnUI();
      input.disabled = true;
    } else {
      const hint =
        tryData.attempts === 1
          ? `Think: ${b} × ? = ${a}`
          : `Almost! The answer is close to ${expected}.`;
      fb.innerHTML = `<span class="fb-wrong">Not quite! ${hint}</span>`;
      soundWrong();
      input.value = "";
      input.focus();
    }
  }
}
