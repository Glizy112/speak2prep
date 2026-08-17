"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginModal({ isOpen, onClose }) {
  const { signin } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignin = async () => {
    setIsAuthenticating(true);
    try {
      await signin();
      onClose();
    } catch (err) {
      alert("Failed to sign in. Please try again.");
      console.error("Some error", err);
    }
    finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-slate-100 shadow-2xl space-y-5 text-center">
        <div className="space-y-1">
          <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/40 rounded-2xl flex items-center justify-center mx-auto text-2xl">
            🎙️
          </div>
          <h2 className="text-lg font-bold text-slate-100 mt-3">Welcome to Speak2Prep</h2>
          <p className="text-xs text-slate-400">
            Sign in with your Google account to start your interactive AI preparation.
          </p>
        </div>

        <button
          onClick={handleGoogleSignin}
          disabled={isAuthenticating}
          className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition shadow-md disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {isAuthenticating ? "Connecting..." : "Continue with Google"}
        </button>

        <button
          onClick={onClose}
          className="text-sm text-slate-400 hover:text-rose-300 transition cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}