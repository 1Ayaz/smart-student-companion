import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";
import "../styles/StudyTimer.css";

export default function StudyTimer() {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [sessions, setSessions] = useState(0);

    useEffect(() => {
        let interval = null;
        if (isActive && (minutes > 0 || seconds > 0)) {
            interval = setInterval(() => {
                if (seconds === 0) {
                    if (minutes === 0) {
                        handleTimerComplete();
                    } else {
                        setMinutes(minutes - 1);
                        setSeconds(59);
                    }
                } else {
                    setSeconds(seconds - 1);
                }
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, minutes, seconds]);

    const handleTimerComplete = () => {
        setIsActive(false);
        if (!isBreak) {
            setSessions(sessions + 1);
            setMinutes(5);
            setIsBreak(true);
        } else {
            setMinutes(25);
            setIsBreak(false);
        }
        setSeconds(0);
    };

    const toggle = () => setIsActive(!isActive);

    const reset = () => {
        setIsActive(false);
        setMinutes(isBreak ? 5 : 25);
        setSeconds(0);
    };

    return (
        <div className="study-timer">
            <div className="timer-header">
                <h1>{isBreak ? "Break Time" : "Focus Time"}</h1>
                <p>Session {sessions + 1}</p>
            </div>

            <div className="timer-display">
                <div className="timer-circle">
                    <svg className="timer-svg" viewBox="0 0 200 200">
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                        />
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke="#E67E22"
                            strokeWidth="8"
                            strokeDasharray={`${2 * Math.PI * 90}`}
                            strokeDashoffset={`${2 * Math.PI * 90 * (1 - ((minutes * 60 + seconds) / ((isBreak ? 5 : 25) * 60)))}`}
                            transform="rotate(-90 100 100)"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="timer-text">
                        <span className="timer-time">
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="timer-controls">
                <button onClick={toggle} className="btn-timer-primary">
                    {isActive ? <Pause size={24} /> : <Play size={24} />}
                    <span>{isActive ? "Pause" : "Start"}</span>
                </button>
                <button onClick={reset} className="btn-timer-secondary">
                    <RotateCcw size={20} />
                </button>
            </div>

            <div className="timer-stats">
                <div className="stat-item">
                    <span className="stat-number">{sessions}</span>
                    <span className="stat-label">Completed</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">{sessions * 25}</span>
                    <span className="stat-label">Minutes</span>
                </div>
            </div>
        </div>
    );
}
