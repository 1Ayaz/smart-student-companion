import React, { useState, useEffect } from "react";
import { Calendar, Clock, BookOpen, TrendingUp, Save, Trash2, CheckCircle, Circle } from "lucide-react";
import { generateStudyPlan, isGeminiConfigured } from "../gemini-api";
import { saveStudyPlan, getStudyPlans, updateStudyProgress, deleteStudyPlan } from "../firebase";
import "../styles/StudyPlanner.css";

export default function StudyPlanner({ user, onLogout }) {
    const [step, setStep] = useState("form"); // form, generating, display
    const [formData, setFormData] = useState({
        subjects: [],
        examDate: "",
        currentLevel: "intermediate",
        hoursPerDay: 3,
        additionalInfo: ""
    });
    const [subjectInput, setSubjectInput] = useState("");
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [savedPlans, setSavedPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load saved plans on mount
    useEffect(() => {
        if (user) {
            loadSavedPlans();
        }
    }, [user]);

    const loadSavedPlans = async () => {
        try {
            const plans = await getStudyPlans(user.uid);
            setSavedPlans(plans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            console.error("Failed to load plans:", err);
        }
    };

    const addSubject = () => {
        if (subjectInput.trim() && !formData.subjects.includes(subjectInput.trim())) {
            setFormData({
                ...formData,
                subjects: [...formData.subjects, subjectInput.trim()]
            });
            setSubjectInput("");
        }
    };

    const removeSubject = (subject) => {
        setFormData({
            ...formData,
            subjects: formData.subjects.filter(s => s !== subject)
        });
    };

    const handleGeneratePlan = async () => {
        if (formData.subjects.length === 0) {
            setError("Please add at least one subject");
            return;
        }
        if (!formData.examDate) {
            setError("Please select an exam date");
            return;
        }

        if (!isGeminiConfigured()) {
            setError("Gemini AI is not configured. Please add your API key to the .env file.");
            return;
        }

        setError(null);
        setLoading(true);
        setStep("generating");

        try {
            const plan = await generateStudyPlan(formData);
            setGeneratedPlan(plan);
            setStep("display");
        } catch (err) {
            setError(err.message);
            setStep("form");
        } finally {
            setLoading(false);
        }
    };

    const handleSavePlan = async () => {
        if (!generatedPlan) return;

        try {
            const planId = await saveStudyPlan(user.uid, generatedPlan);
            setGeneratedPlan({ ...generatedPlan, id: planId });
            await loadSavedPlans();
            alert("Study plan saved successfully!");
        } catch (err) {
            alert("Failed to save plan: " + err.message);
        }
    };

    const handleDeletePlan = async (planId) => {
        if (!confirm("Are you sure you want to delete this plan?")) return;

        try {
            await deleteStudyPlan(user.uid, planId);
            await loadSavedPlans();
            if (generatedPlan?.id === planId) {
                setGeneratedPlan(null);
                setStep("form");
            }
        } catch (err) {
            alert("Failed to delete plan: " + err.message);
        }
    };

    const toggleTopicCompletion = async (dateIndex, topicIndex) => {
        const updatedPlan = { ...generatedPlan };
        updatedPlan.schedule[dateIndex].topics[topicIndex].completed =
            !updatedPlan.schedule[dateIndex].topics[topicIndex].completed;

        setGeneratedPlan(updatedPlan);

        if (updatedPlan.id) {
            try {
                await updateStudyProgress(user.uid, updatedPlan.id, {
                    schedule: updatedPlan.schedule
                });
            } catch (err) {
                console.error("Failed to update progress:", err);
            }
        }
    };

    const loadPlan = (plan) => {
        setGeneratedPlan(plan);
        setStep("display");
    };

    const calculateProgress = () => {
        if (!generatedPlan) return 0;
        const allTopics = generatedPlan.schedule.flatMap(day => day.topics || []);
        const completed = allTopics.filter(t => t.completed).length;
        return allTopics.length > 0 ? Math.round((completed / allTopics.length) * 100) : 0;
    };

    return (
        <div className="study-planner">
            <div className={`planner-content-container ${savedPlans.length > 0 ? 'with-sidebar' : 'centered'}`}>
                {/* Saved Plans Sidebar */}
                {savedPlans.length > 0 && (
                    <div className="saved-plans-sidebar">
                        <div className="sidebar-header">
                            <h3>Saved Plans</h3>
                        </div>
                        <div className="sidebar-scroll">
                            {savedPlans.map(plan => (
                                <div key={plan.id} className="saved-plan-card">
                                    <div className="plan-info">
                                        <strong>{plan.subjects.join(", ")}</strong>
                                        <span className="plan-date">
                                            Exam: {new Date(plan.examDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="plan-actions">
                                        <button onClick={() => loadPlan(plan)} className="btn-icon" title="View">
                                            <BookOpen size={16} />
                                        </button>
                                        <button onClick={() => handleDeletePlan(plan.id)} className="btn-icon btn-danger" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="main-panel">
                    {step === "form" && (
                        <div className="form-container">
                            <h2>Create Your Study Plan</h2>
                            <p>Let our AI craft a personalized study schedule tailored to your goals, timeline, and learning preferences.</p>

                            {error && <div className="error-message">{error}</div>}

                            <div className="form-group">
                                <label>Subjects</label>
                                <div className="subject-input">
                                    <input
                                        type="text"
                                        value={subjectInput}
                                        onChange={(e) => setSubjectInput(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && addSubject()}
                                        placeholder="Enter a subject and press Enter"
                                    />
                                    <button onClick={addSubject} className="btn-add">Add</button>
                                </div>
                                <div className="subjects-list">
                                    {formData.subjects.map(subject => (
                                        <span key={subject} className="subject-tag">
                                            {subject}
                                            <button onClick={() => removeSubject(subject)}>×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Exam Date</label>
                                <input
                                    type="date"
                                    value={formData.examDate}
                                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="form-group">
                                <label>Current Knowledge Level</label>
                                <div className="select-wrapper">
                                    <select
                                        value={formData.currentLevel}
                                        onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })}
                                        className="knowledge-level-select"
                                    >
                                        <option value="beginner">🌱 Beginner - Just starting out</option>
                                        <option value="intermediate">📚 Intermediate - Building on basics</option>
                                        <option value="advanced">🎓 Advanced - Deep understanding</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Study Hours Per Day: {formData.hoursPerDay} hours</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="12"
                                    value={formData.hoursPerDay}
                                    onChange={(e) => setFormData({ ...formData, hoursPerDay: parseInt(e.target.value) })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Additional Information (Optional)</label>
                                <textarea
                                    value={formData.additionalInfo}
                                    onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                                    placeholder="Any specific topics to focus on, learning preferences, etc."
                                    rows="3"
                                />
                            </div>

                            <button onClick={handleGeneratePlan} className="btn-generate" disabled={loading}>
                                {loading ? "Generating..." : "Generate Study Plan"}
                            </button>
                        </div>
                    )}

                    {step === "generating" && (
                        <div className="generating-state">
                            <div className="spinner"></div>
                            <h2>Crafting Your Personalized Plan...</h2>
                            <p>Our AI is analyzing your goals to create the perfect schedule.</p>
                        </div>
                    )}

                    {step === "display" && generatedPlan && (
                        <div className="plan-display">
                            <div className="plan-header">
                                <h2>Your Study Plan</h2>
                                <div className="plan-actions-top">
                                    {!generatedPlan.id && (
                                        <button onClick={handleSavePlan} className="btn-save">
                                            <Save size={18} /> Save Plan
                                        </button>
                                    )}
                                    <button onClick={() => setStep("form")} className="btn-new">
                                        Create New Plan
                                    </button>
                                </div>
                            </div>

                            <div className="plan-stats">
                                <div className="stat-card">
                                    <Calendar size={24} />
                                    <div>
                                        <strong>{generatedPlan.daysRemaining}</strong>
                                        <span>Days Until Exam</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <Clock size={24} />
                                    <div>
                                        <strong>{generatedPlan.hoursPerDay}h</strong>
                                        <span>Per Day</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <TrendingUp size={24} />
                                    <div>
                                        <strong>{calculateProgress()}%</strong>
                                        <span>Completed</span>
                                    </div>
                                </div>
                            </div>

                            {generatedPlan.tips && generatedPlan.tips.length > 0 && (
                                <div className="tips-section">
                                    <h3>Study Tips</h3>
                                    <ul>
                                        {generatedPlan.tips.map((tip, idx) => (
                                            <li key={idx}>{tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="schedule-section">
                                <h3>Study Schedule</h3>
                                {generatedPlan.schedule.map((day, dayIdx) => (
                                    <div key={dayIdx} className={`day-card ${day.isRestDay ? 'rest-day' : ''}`}>
                                        <div className="day-header">
                                            <strong>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</strong>
                                            {day.isRestDay && <span className="rest-badge">Rest Day</span>}
                                        </div>
                                        {!day.isRestDay && day.topics && (
                                            <div className="topics-list">
                                                {day.topics.map((topic, topicIdx) => (
                                                    <div key={topicIdx} className={`topic-item ${topic.completed ? 'completed' : ''}`}>
                                                        <button
                                                            onClick={() => toggleTopicCompletion(dayIdx, topicIdx)}
                                                            className="topic-checkbox"
                                                        >
                                                            {topic.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                                                        </button>
                                                        <div className="topic-details">
                                                            <div className="topic-header">
                                                                <span className="topic-subject">{topic.subject}</span>
                                                                <span className="topic-duration">{topic.duration} min</span>
                                                            </div>
                                                            <div className="topic-name">{topic.topic}</div>
                                                            {topic.resources && topic.resources.length > 0 && (
                                                                <div className="topic-resources">
                                                                    📚 {topic.resources.join(", ")}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
