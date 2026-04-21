


const quizData = [
  {
    question: "1. Who created HTML?",
    options: [
      "Brendan Eich",
      "Sir Tim Berners-Lee",
      "Hakon Wium Lie",
      "Steve Jobs"
    ],
    correctAnswer: "Sir Tim Berners-Lee"
  },

  {
    question: "2. What is HTML used for?",
    options: [
      "Structuring web pages",
      "Styling web pages",
      "Programming web applications",
      "Managing databases"
    ],
    correctAnswer: "Structuring web pages"
  },

  {
    question: "3. In the 1990s, the __ was the main organization managing HTML standards.",
    type: "text",
    correctAnswer: "W3C"
  },

  {
    question: "4. What year was HTML developed in?",
    options: ["1989", "1993", "1991", "1995"],
    correctAnswer: "1991"
  },

  {
    question: "5. Which top two browsers dominating the market as of 2026?.",
    type: "checkbox",
    options: [
      "Google Chrome",
      "Mozilla Firefox",
      "Safari",
      "Microsoft Edge"
    ],
    correctAnswer: ["Google Chrome", "Safari"]
  }
];

const quizContainer = document.getElementById("quiz-questions");
const submitButton = document.getElementById("submit");
const resetButton = document.getElementById("reset");
const resultContainer = document.getElementById("result");
const passingScore = Math.ceil(quizData.length * 0.6);

function arraysEqual(a, b) {
  return a.length === b.length && a.every(value => b.includes(value));
}

function getQuestionType(questionData) {
  return questionData.type || "radio";
}

function isQuestionAnswered(questionData, index) {
  if (getQuestionType(questionData) === "text") {
    const input = document.querySelector(`input[name="question${index}"]`);
    return input && input.value.trim() !== "";
  }
  return document.querySelector(`input[name="question${index}"]:checked`) !== null;
}

function areAllQuestionsAnswered() {
  return quizData.every((questionData, index) =>
    isQuestionAnswered(questionData, index)
  );
}

function updateSubmitState() {
  submitButton.disabled = !areAllQuestionsAnswered();
  if (!submitButton.disabled) {
    resultContainer.innerHTML = "";
  }
}

function getUserAnswer(questionData, index) {
  const questionType = getQuestionType(questionData);

  if (questionType === "text") {
    const input = document.querySelector(`input[name="question${index}"]`);
    return input ? input.value.trim() : "";
  }

  if (questionType === "checkbox") {
    return Array.from(
      document.querySelectorAll(`input[name="question${index}"]:checked`)
    ).map((input) => input.value);
  }

  const selected = document.querySelector(`input[name="question${index}"]:checked`);
  return selected ? selected.value : "";
}

function isCorrectAnswer(questionData, userAnswer) {
  const questionType = getQuestionType(questionData);

  if (questionType === "text") {
    return userAnswer.toLowerCase() === questionData.correctAnswer.toLowerCase();
  }

  if (questionType === "checkbox") {
    return arraysEqual([...userAnswer].sort(), [...questionData.correctAnswer].sort());
  }

  return userAnswer === questionData.correctAnswer;
}

function formatAnswer(answer) {
  if (Array.isArray(answer)) {
    return answer.length ? answer.join(", ") : "No answer selected";
  }

  return answer || "No answer provided";
}

function loadQuiz() {
  quizContainer.innerHTML = "";

  quizData.forEach((questionData, index) => {
    const questionElement = document.createElement("div");
    questionElement.classList.add("question");

    const questionType = getQuestionType(questionData);
    let inputHtml;
    if (questionType === "text") {
      inputHtml = `<input type="text" name="question${index}" autocomplete="off">`;
    } else if (questionType === "checkbox") {
      inputHtml = questionData.options.map((option) => `
        <label>
          <input type="checkbox" name="question${index}" value="${option}">
          ${option}
        </label>
      `).join("");
    } else {
      inputHtml = questionData.options.map((option) => `
        <label>
          <input type="radio" name="question${index}" value="${option}">
          ${option}
        </label>
      `).join("");
    }

    questionElement.innerHTML = `
      <p>${questionData.question}</p>
      ${inputHtml}
    `;
    quizContainer.appendChild(questionElement);
  });

  quizContainer.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", updateSubmitState);
  });

  updateSubmitState();
}
//
function calculateScore() {
  let score = 0;
  const questionResults = quizData.map((questionData, index) => {
    const userAnswer = getUserAnswer(questionData, index);
    const isCorrect = isCorrectAnswer(questionData, userAnswer);

    if (isCorrect) {
      score++;
    }

    return {
      question: questionData.question,
      userAnswer,
      correctAnswer: questionData.correctAnswer,
      isCorrect
    };
  });

  return { score, questionResults };
}

function renderResults(score, questionResults) {
  const passed = score >= passingScore;
  const resultClass = passed ? "pass" : "fail";
  const resultText = passed ? "Pass" : "Fail";

  // detailed score summary so the user can review each answer immediately.
  resultContainer.innerHTML = `
    <div class="results-summary ${resultClass}">
      <h2>${resultText}</h2>
      <p>Total Score: <span>${score} / ${quizData.length}</span></p>
    </div>
    <div class="question-results">
      ${questionResults.map((result, index) => `
        <div class="question-result ${result.isCorrect ? "correct" : "incorrect"}">
          <h3>Question ${index + 1}: ${result.isCorrect ? "Correct" : "Incorrect"}</h3>
          <p><strong>Prompt:</strong> ${result.question}</p>
          <p><strong>Score:</strong> ${result.isCorrect ? "1 / 1" : "0 / 1"}</p>
          <p><strong>Your answer:</strong> ${formatAnswer(result.userAnswer)}</p>
          <p><strong>Correct answer:</strong> ${formatAnswer(result.correctAnswer)}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function resetQuiz() {
  // Rebuild the quiz so all previous selections, typed answers, and result messages are cleared.
  resultContainer.innerHTML = "";
  loadQuiz();
}

submitButton.addEventListener("click", () => {
  if (!areAllQuestionsAnswered()) {
    resultContainer.innerHTML = '<p class="warning-message">Please answer all questions before submitting.</p>';
    return;
  }

  const { score, questionResults } = calculateScore();
  renderResults(score, questionResults);
});

resetButton.addEventListener("click", resetQuiz);

loadQuiz();
