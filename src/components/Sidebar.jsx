import React from "react";
import { NavLink } from "react-router-dom";
import {
    Home,
    Clock,
    BookOpen,
    MessageSquare,
    TrendingUp,
    FolderOpen,
    Calendar,
    Briefcase,
    LogOut,
    User
} from "lucide-react";
import "../styles/Sidebar.css";

export default function Sidebar({ user, onLogout }) {
    const menuItems = [
        { path: "/", icon: Home, label: "Dashboard" },
        { path: "/study-timer", icon: Clock, label: "Study Timer" },
        { path: "/flashcards", icon: BookOpen, label: "Flashcards" },
        { path: "/ai-tutor", icon: MessageSquare, label: "AI Tutor" },
        { path: "/interview", icon: Briefcase, label: "Interview Prep" },
        { path: "/progress", icon: TrendingUp, label: "Progress" },
        { path: "/resources", icon: FolderOpen, label: "Resources" },
        { path: "/calendar", icon: Calendar, label: "Calendar" },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <div className="logo-icon">SSC</div>
                    <h2>Smart Student<br />Companion</h2>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
                    ) : (
                        <div className="user-avatar-placeholder">
                            <User size={20} />
                        </div>
                    )}
                    <div className="user-info">
                        <p className="user-name">{user?.displayName || "Student"}</p>
                        <p className="user-email">{user?.email}</p>
                    </div>
                </div>
                <button onClick={onLogout} className="logout-btn">
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
