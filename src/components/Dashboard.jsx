import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Clock,
    BookOpen,
    MessageSquare,
    TrendingUp,
    Briefcase,
    Target,
    Award,
    Flame,
    LogOut,
    User,
    Calendar
} from "lucide-react";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "../styles/Dashboard.css";

export default function Dashboard({ user, onLogout }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [stats, setStats] = useState({
        studyTime: 0,
        flashcardsReviewed: 0,
        interviewSessions: 0,
        streak: 0
    });

    useEffect(() => {
        loadUserStats();
    }, []);

    const loadUserStats = async () => {
        try {
            const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setStats({
                    studyTime: data.totalSessionTime || 0,
                    flashcardsReviewed: data.flashcardsReviewed || 0,
                    interviewSessions: data.interviewCount || 0,
                    streak: data.streak || 0
                });
            }
        } catch (error) {
            console.error("Error loading stats:", error);
        }
    };

    const tabs = [
        { id: "dashboard", label: "Dashboard", icon: Target },
        { id: "study-timer", label: "Study Timer", icon: Clock, path: "/study-timer" },
        { id: "flashcards", label: "Flashcards", icon: BookOpen, path: "/flashcards" },
        { id: "ai-tutor", label: "AI Tutor", icon: MessageSquare, path: "/ai-tutor" },
        { id: "study-planner", label: "Study Planner", icon: Calendar, path: "/study-planner" },
        { id: "interview", label: "Interview Prep", icon: Briefcase, path: "/interview" },
        { id: "progress", label: "Progress", icon: TrendingUp, path: "/progress" }
    ];

    const features = [
        {
            title: "Study Timer",
            description: "Focus with Pomodoro technique",
            icon: Clock,
            path: "/study-timer",
            color: "#E67E22"
        },
        {
            title: "Flashcards",
            description: "Create and review flashcards",
            icon: BookOpen,
            path: "/flashcards",
            color: "#D35400"
        },
        {
            title: "AI Tutor",
            description: "Get instant help with any topic",
            icon: MessageSquare,
            path: "/ai-tutor",
            color: "#E67E22"
        },
        {
            title: "Study Planner",
            description: "AI-powered personalized study schedules",
            icon: Calendar,
            path: "/study-planner",
            color: "#D35400"
        },
        {
            title: "Interview Prep",
            description: "Practice with AI interviewer",
            icon: Briefcase,
            path: "/interview",
            color: "#E67E22"
        },
        {
            title: "Progress",
            description: "Track your learning journey",
            icon: TrendingUp,
            path: "/progress",
            color: "#D35400"
        }
    ];

    const quickStats = [
        { label: "Study Time", value: `${Math.floor(stats.studyTime / 60)}h`, icon: Clock },
        { label: "Flashcards", value: stats.flashcardsReviewed, icon: Target },
        { label: "Interviews", value: stats.interviewSessions, icon: Award },
        { label: "Day Streak", value: stats.streak, icon: Flame }
    ];

    const handleTabClick = (tab) => {
        setActiveTab(tab.id);
        if (tab.path) {
            navigate(tab.path);
        }
    };

    return (
        <div className="dashboard-container">
            {/* Top Navigation Bar */}
            <div className="top-nav">
                <div className="nav-left">
                    <div className="logo-section">
                        <div className="logo-icon">SSC</div>
                        <h1 className="app-name">Smart Student Companion</h1>
                    </div>
                </div>

                <div className="nav-right">
                    <div className="user-section">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName} className="user-avatar-small" />
                        ) : (
                            <div className="user-avatar-placeholder-small">
                                <User size={16} />
                            </div>
                        )}
                        <span className="user-name-small">{user?.displayName}</span>
                    </div>
                    <button onClick={onLogout} className="logout-btn-small">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <div>
                        <h2 className="dashboard-title">Welcome back, {auth.currentUser?.displayName}!</h2>
                        <p className="dashboard-subtitle">Ready to continue your learning journey?</p>
                    </div>
                </div>

                <div className="quick-stats">
                    {quickStats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="stat-icon">
                                <stat.icon size={24} />
                            </div>
                            <div className="stat-info">
                                <p className="stat-value">{stat.value}</p>
                                <p className="stat-label">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="features-section">
                    <h3 className="section-title">Your Learning Tools</h3>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="feature-card"
                                onClick={() => navigate(feature.path)}
                            >
                                <div className="feature-icon" style={{ background: feature.color }}>
                                    <feature.icon size={28} />
                                </div>
                                <h4 className="feature-title">{feature.title}</h4>
                                <p className="feature-description">{feature.description}</p>
                                <div className="feature-arrow">→</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="motivation-section">
                    <div className="motivation-card">
                        <h3>💡 Today's Tip</h3>
                        <p>Break your study sessions into 25-minute focused blocks with 5-minute breaks. This Pomodoro technique helps maintain concentration and prevents burnout.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
