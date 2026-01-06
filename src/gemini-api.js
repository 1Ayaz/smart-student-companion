import { GoogleGenerativeAI } from "@google/generative-ai";

/* ======================================================
   ENV CONFIG
====================================================== */
const API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();

export function isGeminiConfigured() {
    return Boolean(API_KEY);
}

/* ======================================================
   INIT GEMINI
====================================================== */
let genAI = null;
let model = null;

if (!API_KEY) {
    console.warn("❌ Gemini API key missing. Add VITE_GEMINI_API_KEY to .env");
} else {
    try {
        genAI = new GoogleGenerativeAI(API_KEY);
        // Using gemini-2.0-flash as identified by the user
        model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        console.log("✅ Gemini initialized with gemini-2.0-flash (v2.0.3)");
    } catch (error) {
        console.error("❌ Gemini initialization failed:", error);
    }
}

// Helper to debug available models in the browser
export async function listModels() {
    if (!API_KEY) return "No API Key";
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();
        return data.models ? data.models.map(m => m.name) : data;
    } catch (e) {
        return "Error fetching models: " + e.message;
    }
}
window.listGeminiModels = listModels; // Expose to console


/* ======================================================
   SAFETY GUARD
====================================================== */
function ensureModel() {
    if (!model) {
        throw new Error("Gemini is not configured properly");
    }
}

/* ======================================================
   AI TUTOR
====================================================== */
export async function askTutorQuestion(question, history = []) {
    ensureModel();

    const context = history
        .slice(-5)
        .map(m => `${m.role === "user" ? "Student" : "Tutor"}: ${m.text}`)
        .join("\n");

    const prompt = `
You are a friendly, clear AI tutor.

${context ? `Previous conversation:\n${context}\n\n` : ""}
Student question: ${question}

Explain clearly, step by step, with examples.
`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini Tutor Error:", error);
        throw new Error("AI Tutor Error: " + (error.message || "Unknown error"));
    }
}

/* ======================================================
   STUDY PLANNER
====================================================== */
export async function generateStudyPlan(userInput) {
    ensureModel();

    const { subjects, examDate, currentLevel, hoursPerDay, additionalInfo, syllabusData } = userInput;

    const today = new Date();
    const exam = new Date(examDate);
    const daysRemaining = Math.max(
        1,
        Math.ceil((exam - today) / (1000 * 60 * 60 * 24))
    );

    // Build syllabus context for better planning
    let syllabusContext = "";
    if (syllabusData && Object.keys(syllabusData).length > 0) {
        syllabusContext = "\n\nSYLLABUS DETAILS:\n";
        Object.entries(syllabusData).forEach(([subject, data]) => {
            syllabusContext += `${subject}: ${data.topics.join(", ")}\n`;
        });
    }

    const prompt = `
Create a COMPLETE study plan in PURE JSON.

STRICT RULES:
- JSON ONLY (no text, no markdown)
- Each topic MUST include "completed": false AND "moduleId": "unique-id"
- Include 1 rest day per week
- Be realistic and balanced
- Use the syllabus details to create specific, relevant topics
- Generate unique moduleId for each topic (format: subject_topic_index)

FORMAT:
{
  "tips": [],
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "isRestDay": false,
      "topics": [
        {
          "subject": "",
          "topic": "",
          "duration": 60,
          "resources": [],
          "completed": false,
          "moduleId": "subject_topic_1"
        }
      ]
    }
  ]
}

INPUT:
Subjects: ${subjects.join(", ")}
Days Remaining: ${daysRemaining}
Level: ${currentLevel}
Hours per day: ${hoursPerDay}
Additional Info: ${additionalInfo || "None"}${syllabusContext}
`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Safe JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Invalid JSON from Gemini");
        }

        const plan = JSON.parse(jsonMatch[0]);

        return {
            ...plan,
            subjects,
            examDate,
            hoursPerDay,
            currentLevel,
            daysRemaining,
            syllabusData: syllabusData || {},
            generatedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Study Plan Error:", error);
        throw new Error("Study Plan Error: " + (error.message || "Unknown error"));
    }
}

/* ======================================================
   NOTES GENERATION
====================================================== */
export async function generateModuleNotes(subject, topic, syllabusContext = "", level = "intermediate") {
    ensureModel();

    const prompt = `
You are an expert educator creating comprehensive study notes.

SUBJECT: ${subject}
TOPIC: ${topic}
STUDENT LEVEL: ${level}
${syllabusContext ? `SYLLABUS CONTEXT: ${syllabusContext}` : ""}

Create detailed, well-structured study notes in MARKDOWN format.

REQUIREMENTS:
- Start with a clear overview
- Break down into logical sections with headers (##, ###)
- Include key concepts, definitions, and explanations
- Add examples where relevant
- Use bullet points and numbered lists for clarity
- Include code blocks if applicable (use \`\`\` syntax)
- Add important formulas or equations
- End with a summary of key takeaways

Make it comprehensive but digestible for a ${level} student.
`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Notes Generation Error:", error);
        throw new Error("Notes Generation Error: " + (error.message || "Unknown error"));
    }
}

/* ======================================================
   QUIZ GENERATION
====================================================== */
export async function generateModuleQuiz(subject, topic, notesContent = "", difficulty = "intermediate") {
    ensureModel();

    const notesContext = notesContent ? `\n\nNOTES CONTENT:\n${notesContent.substring(0, 2000)}` : "";

    const prompt = `
Create a quiz in PURE JSON format.

SUBJECT: ${subject}
TOPIC: ${topic}
DIFFICULTY: ${difficulty}${notesContext}

STRICT RULES:
- JSON ONLY (no text, no markdown)
- Create 7-10 multiple choice questions
- Each question should have 4 options (A, B, C, D)
- Include the correct answer
- Add a brief explanation for each answer
- Questions should test understanding, not just memorization

FORMAT:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctAnswer": "A",
      "explanation": "Explanation of why A is correct"
    }
  ]
}
`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Safe JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Invalid JSON from Gemini");
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("Quiz Generation Error:", error);
        throw new Error("Quiz Generation Error: " + (error.message || "Unknown error"));
    }
}

/* ======================================================
   FLASHCARD GENERATION
====================================================== */
export async function generateModuleFlashcards(subject, topic, notesContent = "") {
    ensureModel();

    const notesContext = notesContent ? `\n\nNOTES CONTENT:\n${notesContent.substring(0, 2000)}` : "";

    const prompt = `
Create flashcards in PURE JSON format.

SUBJECT: ${subject}
TOPIC: ${topic}${notesContext}

STRICT RULES:
- JSON ONLY (no text, no markdown)
- Create 8-12 flashcards
- Each flashcard has a front (question/term) and back (answer/definition)
- Cover key concepts, definitions, and important facts
- Keep front and back concise but informative

FORMAT:
{
  "flashcards": [
    {
      "front": "Question or term",
      "back": "Answer or definition"
    }
  ]
}
`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Safe JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Invalid JSON from Gemini");
        }

        const data = JSON.parse(jsonMatch[0]);
        return data.flashcards || [];
    } catch (error) {
        console.error("Flashcard Generation Error:", error);
        throw new Error("Flashcard Generation Error: " + (error.message || "Unknown error"));
    }
}

/* ======================================================
   PROGRESS ANALYSIS (OPTIONAL)
====================================================== */
export async function analyzeProgress(progressData) {
    ensureModel();

    const prompt = `
Analyze study progress and return JSON ONLY.

INPUT:
${JSON.stringify(progressData, null, 2)}

FORMAT:
{
  "status": "on-track|behind|ahead",
  "assessment": "",
  "recommendations": [],
  "motivation": "",
  "adjustments": ""
}
`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Invalid JSON from Gemini");
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("Progress Analysis Error:", error);
        throw new Error("Analysis Error: " + (error.message || "Unknown error"));
    }
}
