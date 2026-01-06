import React, { useState, useEffect } from "react";
import { X, BookOpen, FileText, Brain, Layers, ChevronLeft, ChevronRight, CheckCircle, Save, RotateCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Quiz from "./Quiz";
import {
    getModuleNotes,
    saveModuleNotes,
    getQuizResults,
    saveQuizResult,
    getModuleFlashcards,
    saveModuleFlashcards,
    updateModuleProgress,
    getModuleProgress,
    addFlashcardsToCollection
} from "../firebase";
import {
    generateModuleNotes,
    generateModuleQuiz,
    generateModuleFlashcards
} from "../gemini-api";
import "../styles/ModuleViewer.css";

export default function ModuleViewer({
    module,
    user,
    planId,
    onClose,
    onComplete,
    onNavigate,
    hasNext,
    hasPrevious,
    syllabusData
}) {
    const [activeTab, setActiveTab] = useState("overview");
    const [notes, setNotes] = useState("");
    const [notesLoading, setNotesLoading] = useState(false);
    const [notesEditing, setNotesEditing] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizResults, setQuizResults] = useState([]);
    const [flashcards, setFlashcards] = useState([]);
    const [flashcardsLoading, setFlashcardsLoading] = useState(false);
    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [moduleProgress, setModuleProgress] = useState(null);
    const [saving, setSaving] = useState(false);

    const moduleId = module.moduleId || `${module.subject}_${module.topic}`.replace(/\s+/g, "_");

    useEffect(() => {
        loadModuleData();
    }, [moduleId]);

    const loadModuleData = async () => {
        try {
            // Load progress
            const progress = await getModuleProgress(user.uid, planId, moduleId);
            setModuleProgress(progress);

            // Load notes
            await loadNotes();

            // Load quiz results
            const results = await getQuizResults(user.uid, planId, moduleId);
            setQuizResults(results);
        } catch (error) {
            console.error("Error loading module data:", error);
        }
    };

    const loadNotes = async () => {
        setNotesLoading(true);
        try {
            const savedNotes = await getModuleNotes(user.uid, planId, moduleId);

            if (savedNotes && savedNotes.content) {
                setNotes(savedNotes.content);
            } else {
                // Auto-generate notes
                const syllabusContext = syllabusData?.[module.subject]?.topics.join(", ") || "";
                const generatedNotes = await generateModuleNotes(
                    module.subject,
                    module.topic,
                    syllabusContext,
                    "intermediate"
                );
                setNotes(generatedNotes);

                // Save generated notes
                await saveModuleNotes(user.uid, planId, moduleId, {
                    content: generatedNotes,
                    isGenerated: true
                });
            }
        } catch (error) {
            console.error("Error loading notes:", error);
            setNotes("Failed to load notes. Please try again.");
        } finally {
            setNotesLoading(false);
        }
    };

    const handleSaveNotes = async () => {
        setSaving(true);
        try {
            await saveModuleNotes(user.uid, planId, moduleId, {
                content: notes,
                isGenerated: false
            });
            setNotesEditing(false);
            alert("Notes saved successfully!");
        } catch (error) {
            console.error("Error saving notes:", error);
            alert("Failed to save notes");
        } finally {
            setSaving(false);
        }
    };

    const handleRegenerateNotes = async () => {
        if (!confirm("Are you sure you want to regenerate the notes? Your current notes will be replaced.")) {
            return;
        }

        setNotesLoading(true);
        try {
            const syllabusContext = syllabusData?.[module.subject]?.topics.join(", ") || "";
            const generatedNotes = await generateModuleNotes(
                module.subject,
                module.topic,
                syllabusContext,
                "intermediate"
            );
            setNotes(generatedNotes);

            await saveModuleNotes(user.uid, planId, moduleId, {
                content: generatedNotes,
                isGenerated: true
            });

            alert("Notes regenerated successfully!");
        } catch (error) {
            console.error("Error regenerating notes:", error);
            alert("Failed to regenerate notes");
        } finally {
            setNotesLoading(false);
        }
    };

    const loadQuiz = async () => {
        setQuizLoading(true);
        try {
            const generatedQuiz = await generateModuleQuiz(
                module.subject,
                module.topic,
                notes,
                "intermediate"
            );
            setQuiz(generatedQuiz);
        } catch (error) {
            console.error("Error generating quiz:", error);
            alert("Failed to generate quiz");
        } finally {
            setQuizLoading(false);
        }
    };

    const handleQuizComplete = async (results) => {
        try {
            await saveQuizResult(user.uid, planId, moduleId, results);

            // Reload quiz results
            const updatedResults = await getQuizResults(user.uid, planId, moduleId);
            setQuizResults(updatedResults);

            // Update module progress if passed
            if (results.passed) {
                await updateModuleProgress(user.uid, planId, moduleId, {
                    completed: true,
                    quizPassed: true,
                    lastQuizScore: results.score,
                    completedAt: new Date().toISOString()
                });

                const progress = await getModuleProgress(user.uid, planId, moduleId);
                setModuleProgress(progress);
            }
        } catch (error) {
            console.error("Error saving quiz results:", error);
        }
    };

    const loadFlashcards = async () => {
        setFlashcardsLoading(true);
        try {
            let savedFlashcards = await getModuleFlashcards(user.uid, planId, moduleId);

            if (!savedFlashcards || savedFlashcards.length === 0) {
                // Generate flashcards
                const generatedFlashcards = await generateModuleFlashcards(
                    module.subject,
                    module.topic,
                    notes
                );
                savedFlashcards = generatedFlashcards;

                // Save generated flashcards
                await saveModuleFlashcards(user.uid, planId, moduleId, generatedFlashcards);
            }

            setFlashcards(savedFlashcards);
        } catch (error) {
            console.error("Error loading flashcards:", error);
            alert("Failed to load flashcards");
        } finally {
            setFlashcardsLoading(false);
        }
    };

    const handleAddFlashcardsToCollection = async () => {
        try {
            const flashcardsWithSubject = flashcards.map(card => ({
                ...card,
                subject: module.subject,
                topic: module.topic
            }));

            await addFlashcardsToCollection(user.uid, flashcardsWithSubject);
            alert(`${flashcards.length} flashcards added to your collection!`);
        } catch (error) {
            console.error("Error adding flashcards:", error);
            alert("Failed to add flashcards to collection");
        }
    };

    const handleMarkComplete = async () => {
        const bestScore = quizResults.length > 0 ? Math.max(...quizResults.map(r => r.score)) : 0;

        if (bestScore < 70) {
            alert("You need to pass the quiz with at least 70% to mark this module as complete.");
            return;
        }

        try {
            await updateModuleProgress(user.uid, planId, moduleId, {
                completed: true,
                quizPassed: true,
                lastQuizScore: bestScore,
                completedAt: new Date().toISOString()
            });

            const progress = await getModuleProgress(user.uid, planId, moduleId);
            setModuleProgress(progress);

            if (onComplete) {
                onComplete(moduleId);
            }

            alert("Module marked as complete! 🎉");
        } catch (error) {
            console.error("Error marking complete:", error);
            alert("Failed to mark module as complete");
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);

        if (tab === "quiz" && !quiz) {
            loadQuiz();
        }

        if (tab === "flashcards" && flashcards.length === 0) {
            loadFlashcards();
        }
    };

    const bestQuizScore = quizResults.length > 0 ? Math.max(...quizResults.map(r => r.score)) : null;
    const canMarkComplete = bestQuizScore && bestQuizScore >= 70;
    const isCompleted = moduleProgress?.completed || false;

    return (
        <div className="module-viewer-overlay">
            <div className="module-viewer">
                <div className="module-header">
                    <div className="module-title-section">
                        <h2>{module.topic}</h2>
                        <p className="module-subject">{module.subject} • {module.duration} min</p>
                    </div>
                    <div className="module-actions">
                        {isCompleted && (
                            <span className="completed-badge">
                                <CheckCircle size={18} />
                                Completed
                            </span>
                        )}
                        <button onClick={onClose} className="btn-close">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="module-tabs">
                    <button
                        onClick={() => handleTabChange("overview")}
                        className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
                    >
                        <BookOpen size={18} />
                        Overview
                    </button>
                    <button
                        onClick={() => handleTabChange("notes")}
                        className={`tab-button ${activeTab === "notes" ? "active" : ""}`}
                    >
                        <FileText size={18} />
                        Notes
                    </button>
                    <button
                        onClick={() => handleTabChange("quiz")}
                        className={`tab-button ${activeTab === "quiz" ? "active" : ""}`}
                    >
                        <Brain size={18} />
                        Quiz
                        {bestQuizScore && <span className="quiz-score-badge">{bestQuizScore}%</span>}
                    </button>
                    <button
                        onClick={() => handleTabChange("flashcards")}
                        className={`tab-button ${activeTab === "flashcards" ? "active" : ""}`}
                    >
                        <Layers size={18} />
                        Flashcards
                    </button>
                </div>

                <div className="module-content">
                    {activeTab === "overview" && (
                        <div className="overview-tab">
                            <div className="overview-section">
                                <h3>Module Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Subject:</span>
                                        <span className="info-value">{module.subject}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Duration:</span>
                                        <span className="info-value">{module.duration} minutes</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Status:</span>
                                        <span className="info-value">
                                            {isCompleted ? "✅ Completed" : "📖 In Progress"}
                                        </span>
                                    </div>
                                    {bestQuizScore && (
                                        <div className="info-item">
                                            <span className="info-label">Best Quiz Score:</span>
                                            <span className="info-value">{bestQuizScore}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {module.resources && module.resources.length > 0 && (
                                <div className="overview-section">
                                    <h3>Recommended Resources</h3>
                                    <ul className="resources-list">
                                        {module.resources.map((resource, idx) => (
                                            <li key={idx}>{resource}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="overview-section">
                                <h3>Learning Path</h3>
                                <ol className="learning-path">
                                    <li>📚 Read the notes carefully</li>
                                    <li>🧠 Take the quiz to test your understanding</li>
                                    <li>🗂️ Review flashcards for key concepts</li>
                                    <li>✅ Mark module as complete once you pass the quiz</li>
                                </ol>
                            </div>

                            {!isCompleted && (
                                <div className="complete-section">
                                    <button
                                        onClick={handleMarkComplete}
                                        disabled={!canMarkComplete}
                                        className="btn-mark-complete"
                                    >
                                        <CheckCircle size={20} />
                                        Mark as Complete
                                    </button>
                                    {!canMarkComplete && (
                                        <p className="complete-hint">
                                            Pass the quiz with 70% or higher to mark this module as complete
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "notes" && (
                        <div className="notes-tab">
                            {notesLoading ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Generating notes with AI...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="notes-actions">
                                        {!notesEditing ? (
                                            <>
                                                <button onClick={() => setNotesEditing(true)} className="btn-edit">
                                                    Edit Notes
                                                </button>
                                                <button onClick={handleRegenerateNotes} className="btn-regenerate">
                                                    <RotateCw size={16} />
                                                    Regenerate with AI
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={handleSaveNotes} disabled={saving} className="btn-save">
                                                    <Save size={16} />
                                                    {saving ? "Saving..." : "Save Notes"}
                                                </button>
                                                <button onClick={() => setNotesEditing(false)} className="btn-cancel">
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {notesEditing ? (
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="notes-editor"
                                            rows="20"
                                        />
                                    ) : (
                                        <div className="notes-preview markdown-content">
                                            <ReactMarkdown>{notes}</ReactMarkdown>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === "quiz" && (
                        <div className="quiz-tab">
                            {quizLoading ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Generating quiz questions...</p>
                                </div>
                            ) : quiz ? (
                                <Quiz
                                    questions={quiz.questions}
                                    onComplete={handleQuizComplete}
                                    moduleInfo={module}
                                    previousAttempts={quizResults}
                                />
                            ) : (
                                <div className="empty-state">
                                    <p>Quiz not loaded yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "flashcards" && (
                        <div className="flashcards-tab">
                            {flashcardsLoading ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Generating flashcards...</p>
                                </div>
                            ) : flashcards.length > 0 ? (
                                <>
                                    <div className="flashcard-viewer">
                                        <div
                                            className={`flashcard ${isFlipped ? "flipped" : ""}`}
                                            onClick={() => setIsFlipped(!isFlipped)}
                                        >
                                            <div className="flashcard-inner">
                                                <div className="flashcard-front">
                                                    <p>{flashcards[currentFlashcardIndex].front}</p>
                                                </div>
                                                <div className="flashcard-back">
                                                    <p>{flashcards[currentFlashcardIndex].back}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="flip-hint">Click to flip</p>
                                    </div>

                                    <div className="flashcard-controls">
                                        <button
                                            onClick={() => {
                                                setCurrentFlashcardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
                                                setIsFlipped(false);
                                            }}
                                            className="btn-nav-flashcard"
                                        >
                                            ← Previous
                                        </button>
                                        <span className="flashcard-counter">
                                            {currentFlashcardIndex + 1} / {flashcards.length}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setCurrentFlashcardIndex((prev) => (prev + 1) % flashcards.length);
                                                setIsFlipped(false);
                                            }}
                                            className="btn-nav-flashcard"
                                        >
                                            Next →
                                        </button>
                                    </div>

                                    <button onClick={handleAddFlashcardsToCollection} className="btn-add-to-collection">
                                        Add All to My Flashcards
                                    </button>
                                </>
                            ) : (
                                <div className="empty-state">
                                    <p>No flashcards available</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="module-footer">
                    <button
                        onClick={() => onNavigate("previous")}
                        disabled={!hasPrevious}
                        className="btn-navigate"
                    >
                        <ChevronLeft size={18} />
                        Previous Module
                    </button>
                    <button
                        onClick={() => onNavigate("next")}
                        disabled={!hasNext}
                        className="btn-navigate"
                    >
                        Next Module
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
