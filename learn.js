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
};
const LEARN_EMOJI = { add: "➕", subtract: "➖", multiply: "✖️" };
const OP_CHAR = { add: "+", subtract: "−", multiply: "×" };

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
    const carry = c < cols - 1 ? data.carries[c + 1] : 0;
    const sum = ad + bd + carry;
    const ansDigit = data.ansDigits[c];
    const newCarry = data.carries[c];
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
      if (newCarry > 0) {
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
  const carry = col < data.numCols - 1 ? data.carries[col + 1] : 0;
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
    const origA = currentA[c],
      bd = data.bDigits[c];
    const needBorrow = data.borrows[c];
    const colLabel =
      c === cols - 1 ? "ones" : c === cols - 2 ? "tens" : "hundreds";

    if (needBorrow) {
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
        // Update display: modify the digits
        currentA[c] += 10;
        currentA[c - 1] -= 1;
        setBorrowDisplay(
          ws,
          c,
          currentA[c],
          currentA[c - 1],
          data.aDigits[c - 1],
        );
        speech(
          ws,
          `Borrow! ${data.aDigits[c - 1]} becomes <strong style="color:#E74C3C">${currentA[c - 1]}</strong>, and ${data.aDigits[c]} becomes <strong style="color:#27AE60">${currentA[c]}</strong>.`,
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
  currentA[col] += 10;
  currentA[col - 1] -= 1;

  const ws = document.getElementById("learn-workspace");
  setBorrowDisplay(
    ws,
    col,
    currentA[col],
    currentA[col - 1],
    data.aDigits[col - 1],
  );

  document.getElementById("try-feedback").innerHTML =
    `<span class="fb-correct">✅ Borrowed! ${data.aDigits[col]} becomes ${currentA[col]}!</span>`;

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
  if (tryData.op === "multiply") return; // handled separately
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
    const carry = col < data.numCols - 1 ? data.carries[col + 1] : 0;
    expected = data.aDigits[col] + data.bDigits[col] + carry;
  } else {
    expected = (currentA || data.modifiedA)[col] - data.bDigits[col];
  }

  if (val === expected) {
    const ansDigit = op === "add" ? data.ansDigits[col] : expected;
    setAnswerDigit(ws, col, ansDigit);

    if (op === "add" && data.carries[col] > 0) {
      setCarryDigit(ws, col - 1, data.carries[col]);
      fb.innerHTML = `<span class="fb-correct">✅ ${expected}! Write ${ansDigit}, carry ${data.carries[col]}!</span>`;
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
      const carry = col < data.numCols - 1 ? data.carries[col + 1] : 0;
      const hint =
        carry > 0
          ? `Hint: ${data.aDigits[col]} + ${data.bDigits[col]} + ${carry} (carry) = ?`
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
