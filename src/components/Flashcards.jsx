import React, { useState } from "react";
import { Plus, Trash2, RotateCw } from "lucide-react";
import "../styles/Flashcards.css";

export default function Flashcards() {
    const [flashcards, setFlashcards] = useState([
        { id: 1, front: "What is React?", back: "A JavaScript library for building user interfaces" },
        { id: 2, front: "What is a component?", back: "A reusable piece of UI that can have its own state and props" }
    ]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [newCard, setNewCard] = useState({ front: "", back: "" });

    const handleFlip = () => setIsFlipped(!isFlipped);

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    };

    const handlePrevious = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    };

    const handleAddCard = () => {
        if (newCard.front && newCard.back) {
            setFlashcards([...flashcards, { ...newCard, id: Date.now() }]);
            setNewCard({ front: "", back: "" });
            setShowForm(false);
        }
    };

    const handleDeleteCard = (id) => {
        setFlashcards(flashcards.filter(card => card.id !== id));
        if (currentIndex >= flashcards.length - 1) {
            setCurrentIndex(Math.max(0, flashcards.length - 2));
        }
    };

    const currentCard = flashcards[currentIndex];

    return (
        <div className="flashcards">
            <div className="flashcards-header">
                <h1>Flashcards</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-add-card">
                    <Plus size={20} />
                    <span>Add Card</span>
                </button>
            </div>

            {showForm && (
                <div className="card-form">
                    <input
                        type="text"
                        placeholder="Front (Question)"
                        value={newCard.front}
                        onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                        className="form-input"
                    />
                    <textarea
                        placeholder="Back (Answer)"
                        value={newCard.back}
                        onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                        className="form-textarea"
                        rows="3"
                    />
                    <div className="form-actions">
                        <button onClick={handleAddCard} className="btn-primary">Save Card</button>
                        <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                    </div>
                </div>
            )}

            {flashcards.length > 0 ? (
                <>
                    <div className="flashcard-container">
                        <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
                            <div className="flashcard-inner">
                                <div className="flashcard-front">
                                    <p>{currentCard?.front}</p>
                                </div>
                                <div className="flashcard-back">
                                    <p>{currentCard?.back}</p>
                                </div>
                            </div>
                        </div>
                        <p className="flip-hint">Click to flip</p>
                    </div>

                    <div className="flashcard-controls">
                        <button onClick={handlePrevious} className="btn-nav">← Previous</button>
                        <span className="card-counter">{currentIndex + 1} / {flashcards.length}</span>
                        <button onClick={handleNext} className="btn-nav">Next →</button>
                    </div>

                    <div className="flashcard-list">
                        <h3>All Cards</h3>
                        <div className="cards-grid">
                            {flashcards.map((card, index) => (
                                <div key={card.id} className={`card-item ${index === currentIndex ? 'active' : ''}`}>
                                    <div className="card-content" onClick={() => { setCurrentIndex(index); setIsFlipped(false); }}>
                                        <p>{card.front}</p>
                                    </div>
                                    <button onClick={() => handleDeleteCard(card.id)} className="btn-delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="empty-state">
                    <p>No flashcards yet. Create your first one!</p>
                </div>
            )}
        </div>
    );
}
