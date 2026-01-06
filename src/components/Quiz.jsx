import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, RotateCw, Trophy, AlertCircle } from "lucide-react";
import "../styles/Quiz.css";

export default function Quiz({
    questions,
    onComplete,
    moduleInfo,
    previousAttempts = []
}) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    const handleAnswerSelect = (answer) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [currentQuestionIndex]: answer
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setShowExplanation(false);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setShowExplanation(false);
        }
    };

    const handleSubmit = () => {
        // Calculate score
        let correctCount = 0;
        questions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correctAnswer) {
                correctCount++;
            }
        });

        const finalScore = Math.round((correctCount / totalQuestions) * 100);
        setScore(finalScore);
        setShowResults(true);

        // Call onComplete callback with results
        if (onComplete) {
            onComplete({
                score: finalScore,
                totalQuestions,
                correctAnswers: correctCount,
                answers: selectedAnswers,
                passed: finalScore >= 70
            });
        }
    };

    const handleRetake = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
        setScore(0);
        setShowExplanation(false);
    };

    const getBestScore = () => {
        if (previousAttempts.length === 0) return null;
        return Math.max(...previousAttempts.map(a => a.score));
    };

    const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
    const allAnswered = Object.keys(selectedAnswers).length === totalQuestions;

    if (showResults) {
        const passed = score >= 70;
        const bestScore = getBestScore();
        const isNewBest = !bestScore || score > bestScore;

        return (
            <div className="quiz-results">
                <div className={`results-header ${passed ? 'passed' : 'failed'}`}>
                    {passed ? (
                        <>
                            <Trophy size={64} className="results-icon" />
                            <h2>Congratulations! 🎉</h2>
                            <p>You passed the quiz!</p>
                        </>
                    ) : (
                        <>
                            <AlertCircle size={64} className="results-icon" />
                            <h2>Keep Trying!</h2>
                            <p>You need 70% to pass</p>
                        </>
                    )}
                </div>

                <div className="score-display">
                    <div className="score-circle">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" className="score-bg" />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                className="score-fill"
                                style={{
                                    strokeDasharray: `${score * 2.827} 282.7`,
                                    stroke: passed ? '#4ade80' : '#f87171'
                                }}
                            />
                        </svg>
                        <div className="score-text">
                            <span className="score-number">{score}%</span>
                            <span className="score-label">{Object.keys(selectedAnswers).filter((idx) => selectedAnswers[idx] === questions[idx].correctAnswer).length}/{totalQuestions}</span>
                        </div>
                    </div>
                </div>

                {bestScore && (
                    <div className="best-score-info">
                        {isNewBest ? (
                            <p className="new-best">🏆 New Best Score!</p>
                        ) : (
                            <p>Previous Best: {bestScore}%</p>
                        )}
                    </div>
                )}

                <div className="results-breakdown">
                    <h3>Review Your Answers</h3>
                    {questions.map((q, idx) => {
                        const userAnswer = selectedAnswers[idx];
                        const isCorrect = userAnswer === q.correctAnswer;

                        return (
                            <div key={idx} className={`answer-review ${isCorrect ? 'correct' : 'incorrect'}`}>
                                <div className="review-header">
                                    {isCorrect ? (
                                        <CheckCircle size={20} className="icon-correct" />
                                    ) : (
                                        <XCircle size={20} className="icon-incorrect" />
                                    )}
                                    <span className="question-number">Question {idx + 1}</span>
                                </div>
                                <p className="review-question">{q.question}</p>
                                <div className="review-answers">
                                    <p className="your-answer">
                                        Your answer: <strong>{userAnswer ? q.options[userAnswer] : "Not answered"}</strong>
                                    </p>
                                    {!isCorrect && (
                                        <p className="correct-answer">
                                            Correct answer: <strong>{q.options[q.correctAnswer]}</strong>
                                        </p>
                                    )}
                                </div>
                                <p className="explanation">{q.explanation}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="results-actions">
                    <button onClick={handleRetake} className="btn-retake">
                        <RotateCw size={18} />
                        Retake Quiz
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <div className="quiz-info">
                    <h3>{moduleInfo?.subject} - {moduleInfo?.topic}</h3>
                    <p>Question {currentQuestionIndex + 1} of {totalQuestions}</p>
                </div>
                <div className="quiz-progress">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="progress-text">{Math.round(progress)}%</span>
                </div>
            </div>

            {previousAttempts.length > 0 && (
                <div className="previous-attempts">
                    <p>Previous attempts: {previousAttempts.length} | Best score: {getBestScore()}%</p>
                </div>
            )}

            <div className="question-card">
                <h4 className="question-text">{currentQuestion.question}</h4>

                <div className="options-list">
                    {Object.entries(currentQuestion.options).map(([key, value]) => (
                        <button
                            key={key}
                            onClick={() => handleAnswerSelect(key)}
                            className={`option-button ${selectedAnswers[currentQuestionIndex] === key ? 'selected' : ''}`}
                        >
                            <span className="option-key">{key}</span>
                            <span className="option-text">{value}</span>
                        </button>
                    ))}
                </div>

                {isAnswered && (
                    <button
                        onClick={() => setShowExplanation(!showExplanation)}
                        className="btn-show-explanation"
                    >
                        {showExplanation ? "Hide" : "Show"} Explanation
                    </button>
                )}

                {showExplanation && (
                    <div className="explanation-box">
                        <p><strong>Correct Answer: {currentQuestion.correctAnswer}</strong></p>
                        <p>{currentQuestion.explanation}</p>
                    </div>
                )}
            </div>

            <div className="quiz-navigation">
                <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="btn-nav"
                >
                    ← Previous
                </button>

                <div className="question-dots">
                    {questions.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setCurrentQuestionIndex(idx);
                                setShowExplanation(false);
                            }}
                            className={`dot ${idx === currentQuestionIndex ? 'active' : ''} ${selectedAnswers[idx] !== undefined ? 'answered' : ''}`}
                            title={`Question ${idx + 1}`}
                        />
                    ))}
                </div>

                {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                        onClick={handleNext}
                        className="btn-nav"
                    >
                        Next →
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={!allAnswered}
                        className="btn-submit"
                    >
                        Submit Quiz
                    </button>
                )}
            </div>

            {!allAnswered && currentQuestionIndex === totalQuestions - 1 && (
                <p className="warning-text">Please answer all questions before submitting</p>
            )}
        </div>
    );
}
