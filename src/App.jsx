import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { onAuthChange, signInWithGoogle, logoutUser } from "./firebase";
import PerplexitySphere from "./components/PerplexitySphere";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import StudyTimer from "./components/StudyTimer";
import Flashcards from "./components/Flashcards";
import AITutor from "./components/AITutor";
import StudyPlanner from "./components/StudyPlanner";
import InterviewInterface from "./components/InterviewInterface";
import { uploadFileToAWS } from "./aws-api";
import "./App.css";

// Wrapper to conditionally show sphere
function AppContent({ user, handleGoogleSignIn, handleLogout, interviewProps }) {
    const location = useLocation();

    return (
        <div className="app">
            {/* 3D Background - Only on Login page (Interview has its own sphere) */}
            {!user && <PerplexitySphere state="idle" />}

            {/* Auth or Main App */}
            {!user ? (
                <AuthScreen onGoogleSignIn={handleGoogleSignIn} />
            ) : (
                <div className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard user={user} onLogout={handleLogout} />} />
                        <Route path="/study-timer" element={<StudyTimer user={user} onLogout={handleLogout} />} />
                        <Route path="/flashcards" element={<Flashcards user={user} onLogout={handleLogout} />} />
                        <Route path="/ai-tutor" element={<AITutor user={user} onLogout={handleLogout} />} />
                        <Route path="/study-planner" element={<StudyPlanner user={user} onLogout={handleLogout} />} />
                        <Route path="/interview" element={
                            <InterviewInterface
                                user={user}
                                onLogout={handleLogout}
                                onUploadResume={interviewProps.handleUploadResume}
                                sessionId={interviewProps.sessionId}
                            />
                        } />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            )}
        </div>
    );
}

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Interview State with Persistence
    const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId'));
    const [isUploading, setIsUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(() => localStorage.getItem('uploadComplete') === 'true');

    // Monitor auth state
    useEffect(() => {
        const unsubscribe = onAuthChange((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleGoogleSignIn = async () => {
        await signInWithGoogle();
    };

    const handleLogout = async () => {
        await logoutUser();
        setSessionId(null);
        setUploadComplete(false);
        localStorage.removeItem('sessionId');
        localStorage.removeItem('uploadComplete');
    };

    const handleUploadResume = async (file) => {
        try {
            setIsUploading(true);
            console.log('Starting upload...');

            const result = await uploadFileToAWS(file);

            console.log('Upload successful!', result);
            setSessionId(result.sessionId);
            setUploadComplete(true);

            // Store in localStorage as backup
            localStorage.setItem('sessionId', result.sessionId);
            localStorage.setItem('uploadComplete', 'true');

            return result;
        } catch (error) {
            console.error('Upload failed:', error.message);
            setUploadComplete(false);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    const interviewProps = {
        handleUploadResume,
        sessionId,
        isUploading,
        uploadComplete
    };

    return (
        <Router>
            <AppContent
                user={user}
                handleGoogleSignIn={handleGoogleSignIn}
                handleLogout={handleLogout}
                interviewProps={interviewProps}
            />
        </Router>
    );
}

export default App;
