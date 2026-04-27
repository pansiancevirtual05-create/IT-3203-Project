

//making a variable to store the quiz data, which is-- 
// an array of objects. Each object represents a-- 
// question, the options, and the correct answer.
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
// making variables to store the quiz container, submit button, reset button, and--
//  result container elements from the HTML document.
const quizContainer = document.getElementById("quiz-questions");
const submitButton = document.getElementById("submit");
const resetButton = document.getElementById("reset");
const resultContainer = document.getElementById("result");
const passingScore = Math.ceil(quizData.length * 0.5); // Set passing score to 50% of total questions
// a function to compare two arrays for equality, used-
// for checking checkbox answers where order doesn't matter.
function arraysEqual(a, b) {
  return a.length === b.length && a.every(value => b.includes(value)); // Check if every element in 'a' is also in 'b' and they have the same length
}
// a function to get the question type if that is text box or multiple choice, defaulting to "radio" if not specified.
function getQuestionType(questionData) {
  return questionData.type || "radio";
}
// a function to check if a question has been answered, which varies based on the question type.
function isQuestionAnswered(questionData, index) {
  if (getQuestionType(questionData) === "text") { // For text questions, check if the input is not empty
    const input = document.querySelector(`input[name="question${index}"]`); // Select the text input for the current question
    return input && input.value.trim() !== ""; // Return true if the input exists and is not just whitespace
  }
  return document.querySelector(`input[name="question${index}"]:checked`) !== null; // For radio and checkbox questions, check if at least one option is selected
}
// a function to check if all questions have been answered, which is used to enable or disable the submit button.
function areAllQuestionsAnswered() {
  return quizData.every((questionData, index) => 
    isQuestionAnswered(questionData, index)// 
  );
}
// a function to update the state of the submit button based on whether all questions have been answered, and to clear previous results when the user starts changing answers again.
function updateSubmitState() {
  submitButton.disabled = !areAllQuestionsAnswered(); 
  if (!submitButton.disabled) {
    resultContainer.innerHTML = "";
  }
}
// a function to get the user's answer for a given question, which handles different input types (text, checkbox, radio).
function getUserAnswer(questionData, index) {
  const questionType = getQuestionType(questionData);
  if (questionType === "text") {
    const input = document.querySelector(`input[name="question${index}"]`);
    return input ? input.value.trim() : "";
  }
// For checkbox questions, gather all checked inputs and return their values as an array.
  if (questionType === "checkbox") {
    return Array.from(
      document.querySelectorAll(`input[name="question${index}"]:checked`)
    ).map((input) => input.value);
  }
// For radio questions, return the value of the selected option, or an empty string if none are selected.
  const selected = document.querySelector(`input[name="question${index}"]:checked`);
  return selected ? selected.value : "";
}
// a function to check if the user's answer is correct, which also handles different question types appropriately.
function isCorrectAnswer(questionData, userAnswer) {
  const questionType = getQuestionType(questionData);
// For text questions, compare the user's answer to the correct answer in a case-insensitive manner. For checkbox questions, compare the sorted arrays of selected options and correct answers. For radio questions, compare the user's answer directly to the correct answer.
  if (questionType === "text") {
    return userAnswer.toLowerCase() === questionData.correctAnswer.toLowerCase();
  }
// For checkbox questions, we need to check if the user's selected options match the correct answers regardless of order. We can do this by sorting both arrays and then comparing them for equality.
  if (questionType === "checkbox") {
    return arraysEqual([...userAnswer].sort(), [...questionData.correctAnswer].sort()); // Use the arraysEqual function to compare the sorted arrays of user answers and correct answers
  }

  return userAnswer === questionData.correctAnswer; // For radio questions, a simple equality check is sufficient.
}
// a function to format the user's answer for display in the results, which handles both text and array answers.
function formatAnswer(answer) {
  if (Array.isArray(answer)) {
    return answer.length ? answer.join(", ") : "No answer selected";
  }

  return answer || "No answer provided";
}
// a function to load the quiz questions into the quiz container, which dynamically creates the necessary input elements based on the question type and sets up event listeners to track changes and update the submit button state.
function loadQuiz() {
  quizContainer.innerHTML = "";

  quizData.forEach((questionData, index) => {
    const questionElement = document.createElement("div");
    questionElement.classList.add("question");
// Determine the question type and generate the appropriate input elements for text, checkbox, or radio questions.
    const questionType = getQuestionType(questionData);
    let inputHtml; // For text questions, create a single text input. For checkbox questions, create a checkbox for each option. For radio questions, create a radio button for each option.
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
// Set the inner HTML of the question element to include the question prompt and the generated input elements, then append it to the quiz container.
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
// a function to calculate the user's score by comparing their answers to the correct answers for each question, and to generate a detailed results summary that includes whether each question was answered correctly, the user's answer, and the correct answer.
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
// a function to render the results summary after the user submits their answers, which displays the total score, whether they passed or failed, and a detailed breakdown of each question's results.
function renderResults(score, questionResults) {
  const passed = score >= passingScore;
  const resultClass = passed ? "pass" : "fail";
  const resultText = passed ? "Pass" : "Fail";

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
//a function to reset the quiz, clearing the results and reloading the quiz.
function resetQuiz() {
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
// Loads the quiz when the page is first loaded, which initializes the quiz interface and sets up the necessary event listeners for user interaction.

loadQuiz();
