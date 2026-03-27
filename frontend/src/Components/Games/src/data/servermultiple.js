require("dotenv").config();

const express = require("express");
const router = express.Router();
const axios = require('axios');

// Check environment variables
const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = process.env.GROK_API_URL || "https://api.x.ai/v1/chat/completions";

if (!GROK_API_KEY) {
  console.warn("GROK_API_KEY not set — explanations will not be generated until configured.");
}

// Base Baybayin → Latin dictionary
const baseBaybayin = {
  "ᜀ": "a", "ᜁ": "i", "ᜂ": "ii", "ᜃ": "ka", "ᜄ": "ga", "ᜅ": "nga",
  "ᜆ": "ta", "ᜇ": "da", "ᜈ": "na", "ᜉ": "pa", "ᜊ": "ba", "ᜋ": "ma",
  "ᜌ": "ya", "ᜎ": "la", "ᜏ": "wa", "ᜐ": "sa", "ᜑ": "ha"
};

// Vowel diacritics
const diacritics = { "ᜒ": "i", "ᜓ": "u", "᜔": "" };

// Typing questions (for reference)
const typingQuestions = {
  Easy: [{ question: "What is the LATIN equivalent of 'ᜊ'?" }, { question: "What is the LATIN equivalent of 'ᜃ'?" }],
  Medium: [{ question: "What is the LATIN equivalent of 'ᜋ'?" }, { question: "What is the LATIN equivalent of 'ᜎ'?" }],
  Hard: [{ question: "What is the LATIN equivalent of 'ᜌ'?" }, { question: "What is the LATIN equivalent of 'ᜐ'?" }]
};

// Multiple choice questions
const multipleChoiceQuestions = {
  Easy: [
    { 
      question: "Choose the Baybayin equivalent of 'a'", 
      options: ["ᜀ", "ᜁ", "ᜂ", "ᜊ"], 
      answer: "ᜀ" 
    },
    { 
      question: "Choose the Baybayin equivalent of 'ba'", 
      options: ["ᜊ", "ᜃ", "ᜎ", "ᜁ"], 
      answer: "ᜊ" 
    },
    { 
      question: "Choose the Baybayin equivalent of 'ka'", 
      options: ["ᜃ", "ᜎ", "ᜆ", "ᜀ"], 
      answer: "ᜃ" 
    },
    { 
      question: "Choose the Baybayin equivalent of 'la'", 
      options: ["ᜎ", "ᜌ", "ᜊ", "ᜃ"], 
      answer: "ᜎ" 
    }
  ],

  Medium: [
    { 
      question: "Choose the Baybayin equivalent of 'lupa'", 
      options: ["ᜎᜓᜉᜀ", "ᜎᜅ᜔", "ᜊᜆ", "ᜊᜒᜇ᜔"], 
      answer: "ᜎᜓᜉᜀ" 
    },
    { 
      question: "Choose the Baybayin equivalent of 'langit'", 
      options: ["ᜎᜅᜒᜆ᜔", "ᜊᜆ", "ᜎᜓᜉᜀ", "ᜊᜒᜇ᜔"], 
      answer: "ᜎᜅᜒᜆ᜔" 
    },
    { 
      question: "Choose the Baybayin equivalent of 'bata'", 
      options: ["ᜊᜆ", "ᜎᜓᜉᜀ", "ᜊᜒᜇ᜔", "ᜎᜅᜒᜆ᜔"], 
      answer: "ᜊᜆ" 
    },
    { 
      question: "Choose the Baybayin equivalent of 'bida'", 
      options: ["ᜊᜒᜇ᜔", "ᜊᜆ", "ᜎᜓᜉᜀ", "ᜎᜅᜒᜆ᜔"], 
      answer: "ᜊᜒᜇ᜔" 
    }
  ],

  Hard: [
    { 
      question: "Choose the Baybayin equivalent of 'lupang'", 
      options: ["ᜎᜓᜉᜀ ᜋᜅ᜔", "ᜊᜆ ᜎᜅᜒᜆ᜔", "ᜎᜓᜉᜀ ᜎᜓᜎᜒᜐ᜔"], 
      answer: "ᜎᜓᜉᜀ ᜋᜅ᜔" 
    },
    { 
      question: "Choose the Baybayin equivalent of 'bata langit'", 
      options: ["ᜊᜆ ᜎᜅᜒᜆ᜔", "ᜎᜓᜉᜀ ᜋᜅ᜔", "ᜊᜒᜇ᜔ ᜎᜓᜎᜒᜐ᜔"], 
      answer: "ᜊᜆ ᜎᜅᜒᜆ᜔" 
    },
    { 
      question: "Choose the Baybayin equivalent of 'lupa ulit'", 
      options: ["ᜎᜓᜉᜀ ᜎᜓᜎᜒᜐ᜔", "ᜊᜆ ᜎᜅᜒᜆ᜔", "ᜎᜓᜉᜀ ᜋᜅ᜔"], 
      answer: "ᜎᜓᜉᜀ ᜎᜓᜎᜒᜐ᜔" 
    }
  ]
};

// Helper: Transliterate Baybayin → Latin
function transliterateBaybayin(char) {
  let baseChar = char[0];
  let modifier = char[1] || "";
  let latin = baseBaybayin[baseChar];
  if (!latin) return null;
  if (modifier in diacritics) latin = latin.replace("a", diacritics[modifier]);
  return latin;
}

// Helper: Map Latin → Baybayin
function getBaybayinFromLatin(latin) {
  latin = latin.toLowerCase().trim();
  if (!latin) return "?";
  const consonant = latin[0];
  const vowel = latin[1] || "a";
  const baseCharEntry = Object.entries(baseBaybayin).find(([_, val]) => val[0] === consonant);
  if (!baseCharEntry) return "?";
  const baseChar = baseCharEntry[0];
  let diacritic = "";
  if (vowel === "i" || vowel === "e") diacritic = "ᜒ";
  else if (vowel === "o" || vowel === "u") diacritic = "ᜓ";
  else if (vowel === "") diacritic = "᜔";
  return baseChar + diacritic;
}

// Get random typing question
router.get("/question/:difficulty", (req, res) => {
  const difficulty = req.params.difficulty || "Medium";
  const questions = typingQuestions[difficulty] || typingQuestions.Medium;
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  res.json({ question: randomQuestion.question });
});

// Get random multiple choice question
router.get("/multiple/:difficulty", (req, res) => {
  const difficulty = req.params.difficulty || "Medium";
  const questions = multipleChoiceQuestions[difficulty] || multipleChoiceQuestions.Medium;
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  res.json({ question: randomQuestion.question, options: randomQuestion.options, answer: randomQuestion.answer });
});

// Check user's answer (Typing or Multiple Choice)
router.post("/check", async (req, res) => {
  try {
    const { question, userAnswer } = req.body;
    if (!question || !userAnswer) return res.status(400).json({ error: "Missing question or answer" });

    const baybayinCharMatch = question.match(/'(.+?)'/);
    const baybayinChar = baybayinCharMatch ? baybayinCharMatch[1] : null;
    const correctAnswer = baybayinChar ? transliterateBaybayin(baybayinChar) : null;
    const correct = correctAnswer ? userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase() : false;

    const baybayinUser = getBaybayinFromLatin(userAnswer);
    let explanation = `Your answer "${userAnswer}" is ${correct ? "correct" : "incorrect"}.\n`;
    if (!correct && correctAnswer) {
      explanation += `The correct answer is "${correctAnswer}" (${baybayinChar}), your input corresponds to '${baybayinUser}'`;
    }

    // Grok explanation
    if (GROK_API_KEY && baybayinChar && correctAnswer) {
      try {
        const apiPayload = {
          model: "grok-2-latest",
          messages: [
            { role: "system", content: "You are an educational assistant. Explain why the user answer is correct or incorrect for Baybayin-to-Latin transliteration." },
            { role: "user", content: `Baybayin Character: ${baybayinChar}\nCorrect Answer: ${correctAnswer}\nUser Answer: ${userAnswer}` }
          ],
          temperature: 0.5
        };
        const response = await axios.post(GROK_API_URL, apiPayload, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROK_API_KEY}` }, timeout: 15000 });
        const aiMessage = response.data?.choices?.[0]?.message?.content;
        if (aiMessage) explanation = aiMessage.trim();
      } catch (err) {
        console.warn("Failed to generate explanation via Grok:", err.message);
      }
    }

    return res.json({ correct, reason: explanation });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ correct: false, reason: "Server error." });
  }
});

module.exports = router;
