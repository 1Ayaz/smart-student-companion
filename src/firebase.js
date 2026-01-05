// Firebase Initialization - Zone A: App Foundation
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import {
    getFirestore,
    collection,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    getDocs,
    deleteDoc,
    serverTimestamp,
    setDoc
} from "firebase/firestore";

// Your web app's Firebase configuration - From Environment Variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ========================
// AUTHENTICATION HELPERS
// ========================

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user profile exists, if not create it
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // Create new user profile
            await setDoc(userDocRef, {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                interviewCount: 0,
                totalSessionTime: 0,
                profileComplete: true
            });
            console.log("✅ New user profile created:", user.uid);
        } else {
            // Update last login for existing user
            await updateDoc(userDocRef, {
                lastLogin: serverTimestamp()
            });
            console.log("✅ User logged in successfully:", user.uid);
        }

        return result;
    } catch (error) {
        console.error("❌ Google Sign-In error:", error);
        throw error;
    }
};

/**
 * Sign out the current user
 */
export const logoutUser = async () => {
    try {
        await signOut(auth);
        console.log("✅ User logged out successfully");
    } catch (error) {
        console.error("❌ Logout error:", error);
        throw error;
    }
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// ========================
// FIRESTORE HELPERS
// ========================

/**
 * Save interview session to Firestore
 */
export const saveInterviewSession = async (userId, sessionData) => {
    try {
        const interviewRef = await addDoc(collection(db, "users", userId, "interviews"), {
            ...sessionData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: "active"
        });

        // Update user's interview count
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            interviewCount: (await getDoc(userRef)).data().interviewCount + 1,
            updatedAt: serverTimestamp()
        });

        console.log("✅ Interview session saved:", interviewRef.id);
        return interviewRef.id;
    } catch (error) {
        console.error("❌ Save interview error:", error);
        throw error;
    }
};

/**
 * Save conversation message
 */
export const saveMessage = async (userId, interviewId, messageData) => {
    try {
        const messageRef = await addDoc(
            collection(db, "users", userId, "interviews", interviewId, "messages"),
            {
                ...messageData,
                createdAt: serverTimestamp()
            }
        );

        console.log("✅ Message saved:", messageRef.id);
        return messageRef.id;
    } catch (error) {
        console.error("❌ Save message error:", error);
        throw error;
    }
};

// ========================
// STUDY PLAN HELPERS
// ========================

/**
 * Save a study plan to Firestore
 */
export const saveStudyPlan = async (userId, planData) => {
    try {
        const planRef = await addDoc(collection(db, "users", userId, "studyPlans"), {
            ...planData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: "active"
        });

        console.log("✅ Study plan saved:", planRef.id);
        return planRef.id;
    } catch (error) {
        console.error("❌ Save study plan error:", error);
        throw error;
    }
};

/**
 * Get all study plans for a user
 */
export const getStudyPlans = async (userId) => {
    try {
        const plansSnapshot = await getDocs(collection(db, "users", userId, "studyPlans"));
        const plans = [];

        plansSnapshot.forEach((doc) => {
            plans.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log("✅ Retrieved study plans:", plans.length);
        return plans;
    } catch (error) {
        console.error("❌ Get study plans error:", error);
        throw error;
    }
};

/**
 * Update study progress for a specific plan
 */
export const updateStudyProgress = async (userId, planId, progressData) => {
    try {
        const planRef = doc(db, "users", userId, "studyPlans", planId);
        await updateDoc(planRef, {
            ...progressData,
            updatedAt: serverTimestamp()
        });

        console.log("✅ Study progress updated:", planId);
    } catch (error) {
        console.error("❌ Update progress error:", error);
        throw error;
    }
};

/**
 * Delete a study plan
 */
export const deleteStudyPlan = async (userId, planId) => {
    try {
        await deleteDoc(doc(db, "users", userId, "studyPlans", planId));
        console.log("✅ Study plan deleted:", planId);
    } catch (error) {
        console.error("❌ Delete study plan error:", error);
        throw error;
    }
};

export default app;
