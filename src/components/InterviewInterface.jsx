import React, { useState, useRef, useEffect } from "react";
import { Upload, LogOut } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PerplexitySphere from "./PerplexitySphere";
import "../styles/InterviewInterface.css";

export default function InterviewInterface({
    user,
    onLogout,
    onUploadResume,
    sessionId: initialSessionId
}) {
    // UI State
    const [uploading, setUploading] = useState(false);
    const [resumeUploaded, setResumeUploaded] = useState(!!initialSessionId);
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [sessionId, setSessionId] = useState(initialSessionId);

    // AI & Speech State
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [conversation, setConversation] = useState([]);

    const recognitionRef = useRef(null);
    const genAI = useRef(null);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Initialize Gemini 2.0 Flash
    useEffect(() => {
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (apiKey) {
                genAI.current = new GoogleGenerativeAI(apiKey);
                console.log('✅ Gemini initialized in InterviewInterface');
            }
        } catch (error) {
            console.error('❌ Gemini initialization failed:', error);
        }
    }, []);

    // Silence detection timer
    const silenceTimerRef = useRef(null);
    const lastTranscriptRef = useRef('');

    // Initialize Speech Recognition
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported in this browser.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        // Settings for more robust capture with auto-detection
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            console.log('🎤 Listening started');
            setIsListening(true);
            setIsProcessing(false);
        };

        recognition.onresult = (event) => {
            let fullTranscript = '';
            let isFinal = false;

            for (let i = 0; i < event.results.length; ++i) {
                fullTranscript += event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    isFinal = true;
                }
            }

            console.log('📝 Transcript:', fullTranscript);
            setTranscript(fullTranscript);
            lastTranscriptRef.current = fullTranscript;

            // AUTO-SUBMIT: Clear previous timer and start new one
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
            }

            // If we have a final result and transcript, set timer for auto-submit
            if (fullTranscript.trim().length > 0) {
                silenceTimerRef.current = setTimeout(() => {
                    console.log('🔄 Auto-submitting after silence...');
                    if (recognitionRef.current && isListening) {
                        recognitionRef.current.stop();
                        handleUserResponse(fullTranscript);
                    }
                }, 2000); // 2 seconds of silence triggers auto-submit
            }
        };

        recognition.onerror = (event) => {
            console.error('❌ Recognition error:', event.error);
            if (event.error === 'not-allowed') {
                alert('Microphone access denied. Please allow microphone permissions.');
            }
            setIsListening(false);
            setIsProcessing(false);

            // Clear timer on error
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
            }
        };

        recognition.onend = () => {
            console.log('🎤 Listening ended');
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        };
    }, [interviewStarted, isSpeaking, isProcessing]);

    // Request Mic Permission and Start as requested
    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('✅ Microphone permission granted');
            stream.getTracks().forEach(track => track.stop());

            if (recognitionRef.current) {
                recognitionRef.current.start();
            }
        } catch (error) {
            console.error('❌ Microphone error:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    // Handle user's spoken response
    const handleUserResponse = async (userText) => {
        if (!userText.trim()) return;

        console.log('🔄 Processing user response:', userText);
        setIsProcessing(true);
        setIsListening(false);

        // Clear silence timer
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }

        try {
            const newConversation = [
                ...conversation,
                { role: 'user', text: userText }
            ];
            setConversation(newConversation);

            const aiResponse = await getAIResponse(userText, newConversation);

            setConversation([
                ...newConversation,
                { role: 'ai', text: aiResponse }
            ]);

            await speakText(aiResponse);
            setTranscript('');

            // AUTO-RESTART: Automatically start listening again after AI speaks
            console.log('🎤 Auto-restarting listening for next response...');
            setTimeout(() => {
                if (!isSpeaking && !isProcessing) {
                    startListening();
                }
            }, 500);

        } catch (error) {
            console.error('❌ Error processing response:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Get AI response from Gemini
    const getAIResponse = async (userMessage, conversationHistory) => {
        try {
            if (!genAI.current) throw new Error("Gemini not initialized");

            const model = genAI.current.getGenerativeModel({
                model: "gemini-2.0-flash"
            });

            const context = conversationHistory
                .map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.text}`)
                .join('\n');

            const prompt = `You are an AI interviewer conducting a job interview. The candidate's resume has been uploaded (Session: ${sessionId}).

Previous conversation:
${context}

Candidate's latest response: ${userMessage}

Ask a relevant follow-up interview question or provide feedback. Keep responses concise (under 50 words).`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('❌ Gemini API Error:', error);
            return "I apologize, but I encountered an error connecting to my brain. Could you repeat that?";
        }
    };

    // Text to Speech with Voice Selection
    const speakText = (text) => {
        return new Promise((resolve) => {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);

            // Premium Voice Settings
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            utterance.volume = 1.0;

            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice =>
                voice.name.includes('Female') ||
                voice.name.includes('Samantha') ||
                voice.name.includes('Google UK English Female') ||
                voice.lang.includes('en')
            );

            if (femaleVoice) {
                utterance.voice = femaleVoice;
                console.log('🎙️ Using voice:', femaleVoice.name);
            }

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                setIsSpeaking(false);
                resolve();
            };
            utterance.onerror = (error) => {
                console.error('❌ Speech error:', error);
                setIsSpeaking(false);
                resolve();
            };

            window.speechSynthesis.speak(utterance);
        });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation, transcript]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            alert("Please upload a PDF file");
            return;
        }

        setUploading(true);
        try {
            const result = await onUploadResume(file);
            setSessionId(result.sessionId);
            setResumeUploaded(true);
        } catch (error) {
            alert("Failed to upload resume: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleStartInterview = async () => {
        setInterviewStarted(true);
        const greeting = "Great! I've analyzed your resume. Let's begin the interview. Tell me about yourself.";

        setConversation([{ role: "ai", text: greeting }]);

        // Wait for voices to load if necessary as requested
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.addEventListener('voiceschanged', () => {
                speakText(greeting).then(() => {
                    setTimeout(startListening, 500);
                });
            }, { once: true });
        } else {
            await speakText(greeting);
            setTimeout(startListening, 500);
        }
    };

    const handleStopInterview = () => {
        setInterviewStarted(false);
        window.speechSynthesis.cancel();
        if (recognitionRef.current) recognitionRef.current.stop();
        window.location.reload(); // Reset state
    };

    const toggleListening = () => {
        if (isListening) {
            if (transcript.trim()) {
                handleUserResponse(transcript);
            }
            recognitionRef.current?.stop();
        } else {
            startListening();
        }
    };

    // Determine sphere state
    const sphereState = isSpeaking ? "speaking" : isListening ? "listening" : "idle";

    return (
        <div className="interview-container">
            {/* Header */}
            <div className="interview-header">
                <div className="header-left">
                    <h2 className="header-title">Smart Interview</h2>
                    <span className="user-email">{user?.email}</span>
                </div>
                <button onClick={onLogout} className="logout-button">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>

            {/* Background Sphere - Reactive */}
            <PerplexitySphere state={sphereState} />

            {/* Center Content - Split Text Layout */}
            {!interviewStarted && (
                <>
                    <div className="center-text-left">
                        <h3 className="split-title">Start Your</h3>
                    </div>
                    <div className="center-text-right">
                        <h3 className="split-title">AI Interview</h3>
                    </div>
                    <p className="split-subtitle">Upload your resume and let the sphere guide you</p>
                </>
            )}

            {/* Messages Display */}
            {interviewStarted && conversation.length > 0 && (
                <div className="messages-sidebar">
                    <div className="messages-list">
                        {conversation.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`message ${msg.role === "user" ? "message-user" : "message-ai"}`}
                            >
                                <div className="message-content">
                                    <span className="message-role">
                                        {msg.role === "user" ? "You" : "AI"}
                                    </span>
                                    <p className="message-text">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {transcript && (
                            <div className="message message-user current-transcript">
                                <div className="message-content">
                                    <span className="message-role">Listening...</span>
                                    <p className="message-text italic">{transcript}</p>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            )}

            {/* Bottom Control */}
            <div className="bottom-control">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf"
                    style={{ display: "none" }}
                />

                {!resumeUploaded ? (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="primary-action-button"
                        disabled={uploading}
                    >
                        <Upload size={24} />
                        <span>{uploading ? "Uploading..." : "Upload Resume"}</span>
                    </button>
                ) : !interviewStarted ? (
                    <button
                        onClick={handleStartInterview}
                        className="primary-action-button start-button"
                    >
                        <span>Start Interview</span>
                    </button>
                ) : (
                    <div className="active-controls">
                        <button
                            onClick={toggleListening}
                            className={`control-btn ${isListening ? 'active' : ''}`}
                            disabled={isProcessing || isSpeaking}
                        >
                            {isListening ? "🎤 Listening" : "🎙️ Speak"}
                        </button>
                        <button
                            onClick={handleStopInterview}
                            className="control-btn end-btn"
                        >
                            End Interview
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
