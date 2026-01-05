import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User as UserIcon } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import "../styles/AITutor.css";

export default function AITutor() {
    const [messages, setMessages] = useState([
        {
            role: "ai",
            text: "Hello! I'm your AI tutor. Ask me anything about your studies - concepts, homework help, explanations, or practice problems!",
            timestamp: new Date().toISOString()
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            role: "user",
            text: input,
            timestamp: new Date().toISOString()
        };

        setMessages([...messages, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            // Import Gemini AI function
            const { askTutorQuestion } = await import("../gemini-api");

            // Get AI response
            const aiResponse = await askTutorQuestion(input, messages);

            const aiMessage = {
                role: "ai",
                text: aiResponse,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("AI Tutor error:", error);
            const errorMessage = {
                role: "ai",
                text: "I apologize, but I'm having trouble connecting right now. Please make sure your Gemini API key is configured in the .env file. Error: " + error.message,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="ai-tutor">
            <div className="tutor-header">
                <div className="header-content">
                    <Bot size={32} className="tutor-icon" />
                    <div>
                        <h1>AI Tutor</h1>
                        <p>Your personal learning assistant</p>
                    </div>
                </div>
            </div>

            <div className="messages-container">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                        <div className="message-avatar">
                            {msg.role === "ai" ? <Bot size={20} /> : <UserIcon size={20} />}
                        </div>
                        <div className="message-content">
                            {msg.role === "ai" ? (
                                <div className="markdown-content">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                        components={{
                                            code({ node, inline, className, children, ...props }) {
                                                return inline ? (
                                                    <code className="inline-code" {...props}>
                                                        {children}
                                                    </code>
                                                ) : (
                                                    <pre className="code-block">
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    </pre>
                                                );
                                            }
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <p>{msg.text}</p>
                            )}
                            <span className="message-time">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="message ai">
                        <div className="message-avatar">
                            <Bot size={20} />
                        </div>
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-container">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="tutor-input"
                />
                <button onClick={handleSend} className="btn-send" disabled={!input.trim()}>
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
}
