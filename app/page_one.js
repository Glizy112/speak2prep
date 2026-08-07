// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.js file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-39.5"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/8 px-5 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-39.5"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }

// "use client";
// import { useState, useRef } from "react";

// export default function VivaArena() {
//   const [persona, setPersona] = useState("STRICT_PROFESSOR");
//   const [isRecording, setIsRecording] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [transcript, setTranscript] = useState([
//     {
//       role: "examiner",
//       text: "Welcome to Speak2Prep. I'm your AppSec examiner today. Let's start: Imagine you discover an endpoint using user IDs in the query payload (/api/v1/orders?userId=1042). An attacker can change that ID to read other customers' orders. What vulnerability is this, and how would you fix it permanently?",
//     },
//   ]);

//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);

//   // Start Browser Audio Recording
//   const startRecording = async () => {
//     audioChunksRef.current = [];
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     mediaRecorderRef.current = new MediaRecorder(stream);

//     mediaRecorderRef.current.ondataavailable = (event) => {
//       if (event.data.size > 0) audioChunksRef.current.push(event.data);
//     };

//     mediaRecorderRef.current.start();
//     setIsRecording(true);
//   };

//   // Stop Recording and Send to API
//   const stopRecordingAndSend = async () => {
//     if (!mediaRecorderRef.current) return;
//     setIsRecording(false);
//     setLoading(true);

//     mediaRecorderRef.current.stop();
//     mediaRecorderRef.current.onstop = async () => {
//       const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      
//       const formData = new FormData();
//       formData.append("audio", audioBlob);
//       formData.append("persona", persona);
      
//       // Map existing transcript to Gemini history format
//       const history = transcript.map((msg) => ({
//         role: msg.role === "examiner" ? "model" : "user",
//         parts: [{ text: msg.text }],
//       }));
//       formData.append("history", JSON.stringify(history));

//       try {
//         const res = await fetch("/api/prep-turn", {
//           method: "POST",
//           body: formData,
//         });
//         const data = await res.json();

//         if (data.userText && data.aiText) {
//           setTranscript((prev) => [
//             ...prev,
//             { role: "candidate", text: data.userText },
//             { role: "examiner", text: data.aiText },
//           ]);
//         }
//       } catch (err) {
//         console.error("Error submitting response:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-6 font-sans">
//       {/* Header */}
//       <header className="w-full max-w-3xl flex justify-between items-center py-4 border-b border-slate-800">
//         <h1 className="text-2xl font-bold tracking-tight text-indigo-400">Speak2Prep <span className="text-xs bg-indigo-900 text-indigo-200 px-2 py-1 rounded">AI Examiner</span></h1>
        
//         {/* Persona Selector */}
//         <select
//           value={persona}
//           onChange={(e) => setPersona(e.target.value)}
//           className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
//         >
//           <option value="STRICT_PROFESSOR">Strict Professor Mode</option>
//           <option value="FRIENDLY_TUTOR">Friendly Tutor Mode</option>
//           <option value="EMPATHETIC_MANAGER">Empathetic Manager Mode</option>
//         </select>
//       </header>

//       {/* Main Arena: Rolling Transcript */}
//       <main className="w-full max-w-3xl flex-1 overflow-y-auto py-6 space-y-4">
//         {transcript.map((msg, idx) => (
//           <div
//             key={idx}
//             className={`p-4 rounded-xl max-w-[85%] ${
//               msg.role === "examiner"
//                 ? "bg-slate-900 border border-slate-800 text-slate-200 mr-auto"
//                 : "bg-indigo-600 text-white ml-auto"
//             }`}
//           >
//             <div className="text-xs font-semibold mb-1 opacity-70 uppercase tracking-wider">
//               {msg.role === "examiner" ? `Examiner (${persona.replace("_", " ")})` : "You (Candidate)"}
//             </div>
//             <p className="text-sm leading-relaxed">{msg.text}</p>
//           </div>
//         ))}

//         {loading && (
//           <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl mr-auto max-w-[85%] animate-pulse text-slate-400 text-sm">
//             Examiner is analyzing your answer and preparing follow-up...
//           </div>
//         )}
//       </main>

//       {/* Controls: Microphone Push-to-Talk */}
//       <footer className="w-full max-w-3xl pt-4 border-t border-slate-800 flex flex-col items-center gap-3">
//         {!isRecording ? (
//           <button
//             onClick={startRecording}
//             disabled={loading}
//             className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z"></path></svg>
//             Press to Speak Response
//           </button>
//         ) : (
//           <button
//             onClick={stopRecordingAndSend}
//             className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-lg transition animate-pulse flex items-center justify-center gap-2"
//           >
//             <span className="w-3 h-3 bg-white rounded-full"></span>
//             Stop & Submit Answer
//           </button>
//         )}
//         <p className="text-xs text-slate-500">Audio recorded via microphone and transcribed instantly with ElevenLabs Scribe v2.</p>
//       </footer>
//     </div>
//   );
// }


"use client";
import { useState, useRef, useEffect } from "react";

export default function AudioCallArena() {
  const [persona, setPersona] = useState("STRICT_PROFESSOR");
  const [callState, setCallState] = useState("idle"); // "idle" | "listening" | "thinking" | "speaking"
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState([]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Auto-play audio base64 returned by ElevenLabs
  const playAudio = (base64String) => {
    return new Promise((resolve) => {
      const audio = new Audio(`data:audio/mp3;base64,${base64String}`);
      setCallState("speaking");
      audio.onended = () => {
        setCallState("idle");
        resolve();
      };
      audio.play().catch((err) => {
        console.error("Audio playback error:", err);
        setCallState("idle");
        resolve();
      });
    });
  };

  // Start Voice Capture
  const startListening = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setCallState("listening");
    } catch (err) {
      alert("Microphone access is required for the audio call.");
    }
  };

  // Stop Recording & Trigger 2-Way Voice Pipeline
  const stopListeningAndSend = async () => {
    if (!mediaRecorderRef.current) return;
    setCallState("thinking");

    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("persona", persona);

      const history = transcript.map((msg) => ({
        role: msg.role === "examiner" ? "model" : "user",
        parts: [{ text: msg.text }],
      }));
      formData.append("history", JSON.stringify(history));

      try {
        const res = await fetch("/api/viva-turn", { method: "POST", body: formData });
        const data = await res.json();

        if (data.userText && data.aiText) {
          setTranscript((prev) => [
            ...prev,
            { role: "candidate", text: data.userText },
            { role: "examiner", text: data.aiText },
          ]);

          // Play AI Voice back to the user out loud
          if (data.audioBase64) {
            await playAudio(data.audioBase64);
          } else {
            setCallState("idle");
          }
        } else {
          setCallState("idle");
        }
      } catch (err) {
        console.error("Call error:", err);
        setCallState("idle");
      }
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6 relative font-sans overflow-hidden">
      {/* Top Header */}
      <header className="w-full max-w-lg flex justify-between items-center py-2 z-10">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
          <h1 className="text-lg font-semibold tracking-wide text-indigo-300">Speak2Prep Live Call</h1>
        </div>

        <select
          value={persona}
          onChange={(e) => setPersona(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-full px-3 py-1.5 focus:outline-none"
        >
          <option value="STRICT_PROFESSOR">Strict Professor</option>
          <option value="FRIENDLY_TUTOR">Friendly Tutor</option>
          <option value="EMPATHETIC_MANAGER">Empathetic Manager</option>
        </select>
      </header>

      {/* Center Call Screen: Animated Aura Sphere */}
      <main className="flex-1 flex flex-col items-center justify-center z-10 my-8">
        <div className="relative flex items-center justify-center">
          {/* Outer Glowing Rings based on Call State */}
          <div
            className={`w-64 h-64 rounded-full absolute transition-all duration-700 blur-2xl opacity-40 ${
              callState === "listening"
                ? "bg-rose-500 scale-125"
                : callState === "thinking"
                ? "bg-amber-500 scale-110 animate-ping"
                : callState === "speaking"
                ? "bg-indigo-500 scale-125 animate-pulse"
                : "bg-slate-700 scale-90"
            }`}
          />

          {/* Core Interactive Sphere */}
          <div
            className={`w-48 h-48 rounded-full border border-slate-700/50 flex flex-col items-center justify-center shadow-2xl transition-all duration-500 bg-slate-900/80 backdrop-blur-md ${
              callState === "speaking" ? "border-indigo-400 shadow-indigo-500/30" : ""
            }`}
          >
            <div className="text-4xl mb-2">
              {callState === "listening" ? "🎙️" : callState === "thinking" ? "🧠" : callState === "speaking" ? "🔊" : "👤"}
            </div>
            <span className="text-xs uppercase tracking-widest font-semibold text-slate-400">
              {callState === "listening"
                ? "Listening..."
                : callState === "thinking"
                ? "Evaluating..."
                : callState === "speaking"
                ? "Examiner Speaking"
                : "Tap Mic to Respond"}
            </span>
          </div>
        </div>
      </main>

      {/* Call Control Footer */}
      <footer className="w-full max-w-lg flex flex-col items-center gap-4 z-10">
        <div className="flex items-center gap-6 w-full justify-center">
          {/* Transcript Toggle */}
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full text-slate-400 hover:text-white transition"
            title="Toggle Transcript"
          >
            💬
          </button>

          {/* Primary Action Button */}
          {callState !== "listening" ? (
            <button
              onClick={startListening}
              disabled={callState === "thinking" || callState === "speaking"}
              className="w-20 h-20 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center text-2xl transition transform hover:scale-105"
            >
              🎙️
            </button>
          ) : (
            <button
              onClick={stopListeningAndSend}
              className="w-20 h-20 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-lg shadow-rose-600/30 flex items-center justify-center text-2xl transition animate-pulse transform hover:scale-105"
            >
              ⏹️
            </button>
          )}

          {/* End Call Placeholder */}
          <button
            onClick={() => setTranscript([])}
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full text-slate-400 hover:text-rose-400 transition"
            title="Reset Session"
          >
            🔄
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Powered by Gemini 2.5 Flash Lite & ElevenLabs Voice Pipeline
        </p>
      </footer>

      {/* Collapsible Transcript Drawer */}
      {showTranscript && (
        <div className="absolute inset-x-0 bottom-0 top-20 bg-slate-900/95 backdrop-blur-lg z-20 p-6 flex flex-col border-t border-slate-800 rounded-t-3xl transition-all">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Live Transcript Drawer</h2>
            <button onClick={() => setShowTranscript(false)} className="text-slate-400 hover:text-white text-sm">
              ✕ Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {transcript.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No conversation transcript yet. Start speaking!</p>
            ) : (
              transcript.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-xs leading-relaxed max-w-[85%] ${
                    msg.role === "examiner"
                      ? "bg-slate-800 text-slate-200 mr-auto border border-slate-700"
                      : "bg-indigo-600 text-white ml-auto"
                  }`}
                >
                  <p className="font-semibold mb-1 opacity-70">
                    {msg.role === "examiner" ? "Examiner" : "You"}
                  </p>
                  <p>{msg.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}