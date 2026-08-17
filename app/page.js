"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import LoginModal from "./components/LoginModal";
import { checkAndIncrementCallLimit } from "./service/firebase/firestore";

//Integrated Syllabus Modal Component
function SyllabusModal({ isOpen, onClose, onBlueprintReady, persona }) {
  const [syllabusText, setSyllabusText] = useState("");
  const [targetRole, setTargetRole] = useState("AppSec Engineer");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [isParsing, setIsParsing] = useState(false);

  if (!isOpen) return null;

  const handleParse = async () => {
    setIsParsing(true);
    try {
      const res = await fetch("/api/syllabus-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syllabusText, targetRole, difficulty, persona }),
      });
      const data = await res.json();
      if (data.blueprint) {
        onBlueprintReady(data.blueprint);
        onClose();
      } else {
        alert(data.error || "Failed to parse syllabus.");
      }
    } catch (err) {
      alert("Error parsing syllabus.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl">
        <h2 className="text-lg font-semibold text-indigo-300 mb-1">
          Configure Exam Blueprint
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Paste your syllabus topics or course outline. Agent 1 will extract core concepts and configure the examiner.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Target Role / Subject
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Syllabus / Key Topics Text
            </label>
            <textarea
              rows={5}
              value={syllabusText}
              onChange={(e) => setSyllabusText(e.target.value)}
              placeholder="e.g., OWASP Top 10, SQL Injection, IDOR, CORS Misconfigurations, JWT Security, XSS, Rate Limiting..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white px-3 py-2"
            >
              Cancel
            </button>
            <button
              onClick={handleParse}
              disabled={isParsing || !syllabusText.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
            >
              {isParsing ? "Analyzing Syllabus..." : "Generate Exam Blueprint"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function RemediationModal({ isOpen, onClose, drill, isLoading }) {
  const [showSolution, setShowSolution] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 text-slate-100 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
            <span>⚡ Remediation Drill Agent</span>
          </h3>
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Generating custom remediation exercise for your gaps...</p>
          </div>
        ) : drill ? (
          <div className="space-y-4 text-xs">
            <div>
              <h4 className="font-semibold text-slate-200 text-sm">{drill.drillTitle}</h4>
              <p className="text-slate-400 mt-1 leading-relaxed">{drill.conceptExplanation}</p>
            </div>

            {drill.vulnerableCodeSnippet && (
              <div className="space-y-1">
                <span className="font-medium text-amber-400">Target Code Snippet:</span>
                <pre className="bg-slate-950 border border-slate-800 p-3 rounded-lg overflow-x-auto text-[11px] font-mono text-slate-300">
                  {drill.vulnerableCodeSnippet}
                </pre>
              </div>
            )}

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1">
              <span className="font-semibold text-indigo-300">Exercise Task:</span>
              <p className="text-slate-300 leading-relaxed">{drill.drillInstructions}</p>
            </div>

            {showSolution ? (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-lg space-y-1">
                <span className="font-semibold text-emerald-400">Model Solution:</span>
                <p className="text-emerald-200 whitespace-pre-wrap font-mono text-[11px]">
                  {drill.modelSolution}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowSolution(true)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg font-medium transition"
              >
                Show Solution & Guidance
              </button>
            )}
          </div>
        ) : (
          <p className="text-xs text-rose-400">Failed to load drill.</p>
        )}
      </div>
    </div>
  );
}

export default function PrepLiveArena() {
  //Session Configuration & Persona State
  const [persona, setPersona] = useState("STRICT_PROFESSOR");
  const [callState, setCallState] = useState("idle"); //"idle" | "connecting" | "live" | "speaking" | "scorecard"
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [activeBlueprint, setActiveBlueprint] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState([]);

  const [latestEval, setLatestEval] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  //Agent 4: Scorecard State
  const [scorecard, setScorecard] = useState(null);
  const [isGeneratingScorecard, setIsGeneratingScorecard] = useState(false);

  //Agent 5: Remediation State
  const [activeDrill, setActiveDrill] = useState(null);
  const [isDrillModalOpen, setIsDrillModalOpen] = useState(false);
  const [isGeneratingDrill, setIsGeneratingDrill] = useState(false);

  //Auth State & Config
  const { user, signout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  //WebSockets & Audio Context Refs
  const wsRef = useRef(null);
  const inputAudioCtxRef = useRef(null);
  const outputAudioCtxRef = useRef(null);
  const processorRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const nextStartTimeRef = useRef(0);

  //Tracks current question for Agent 3 context evaluation
  const lastExaminerQuestionRef = useRef("");
  const currentTurnTextBuffer = useRef("");

  //Clean up WebSockets & Audio Nodes on Unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  //Check auth'd user to start the call
  const handleStartCall = async() => {
    console.log(scorecard)
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      //Check & increment limit in Firestore via transaction
      const { allowed, remainingCalls, tier, data } = await checkAndIncrementCallLimit(user?.uid);
      //console.log(tier)
      console.log(data)
      if(!allowed) {
        tier === "free" ?
        alert("You have reached your limit of 2 free prep session calls for this week!")
        : alert("You have reached your limit of 5 free prep session calls for this week!");
        return;
      }
      
      console.log(`Call permitted! Remaining calls this week: ${remainingCalls}`);
      
      startCall();
    } catch(error) {
      console.error("Failed to verify call limit:", err);
      alert("Unable to verify call limit. Please try again.");
    }
  };

  //Initialize Gemini Live WebSocket Session
  const startCall = async () => {
    try {
      setCallState("connecting");
      setLatestEval(null);
      setScorecard(null);
      setTranscript([]);

      //1. Fetch Session System Instructions from Next.js API route
      const configRes = await fetch(`/api/prep-session?persona=${persona}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprint: activeBlueprint }),
      });
      const { config } = await configRes.json();

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        alert("Missing NEXT_PUBLIC_GEMINI_API_KEY in .env.local");
        setCallState("idle");
        return;
      }

      //Gemini Multimodal Live API WebSocket Endpoint
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async() => {
        setCallState("live");

        //1. Force Web Audio Context to resume on user click (Browser Autoplay Policy fix)
        if (!outputAudioCtxRef.current) {
          outputAudioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        }
        if (outputAudioCtxRef.current.state === "suspended") {
          await outputAudioCtxRef.current.resume();
        }

        //Step A: Send Handshake Setup Payload
        ws.send(JSON.stringify({ setup: config }));

        //Send initial trigger turn to force Gemini to open the viva session
        const openingPrompt = activeBlueprint?.subjectTitle
          ? `The candidate has joined the call for the ${activeBlueprint.subjectTitle} viva session. Please introduce yourself briefly and ask the first scenario question.`
          : "The candidate has joined the call. Please start the prep. session now with your welcoming opener and introductory question.";

        //Step B: Explicitly trigger Gemini to speak the opening line
        ws.send(
          JSON.stringify({
            clientContent: {
              turns: [
                {
                  role: "user",
                  parts: [
                    {
                      //text: "The candidate has joined the call. Please start the interview session now with your welcoming opener and introductory question.",
                      text: openingPrompt
                    },
                  ],
                },
              ],
              turnComplete: true,
            },
          }),
        );

        //Step C: Start User Microphone Capture & Audio Streaming
        initMicrophoneStream(ws);
        //initMicrophoneStream(ws).then(()=> console.log("mic stream working and on.."));

        //Add welcome message to transcript drawer
        setTranscript((prev) => [
          ...prev,
          {
            role: "examiner",
            text: "[Session Live] Examiner connected. Begin speaking when ready...",
          },
        ]);
      };

      ws.onmessage = async (event) => {

        let rawData = event.data
        if(rawData instanceof Blob) {
            console.log("Received a raw binary blob from Gemini. Handle or ignore if using Base64 channel.");
            rawData = await rawData.text();
            //return;
        }

        let response;
        try {
            response = JSON.parse(rawData);   
            console.log(response)
        } catch (error) {
            console.error("Failed to parse string message:", rawData, error);
            return;
        }

        //Step C: Play Incoming 24kHz Native PCM Audio Chunks from Gemini
        if (response.serverContent?.modelTurn?.parts) {
          for (const part of response.serverContent.modelTurn.parts) {
            if (part.inlineData?.mimeType?.startsWith("audio/")) {
              setCallState("speaking");
              //console.log(`Received audio data (base64 len: ${part.inlineData.data.length})`);
              playAudioChunk24kHz(part.inlineData.data);
            }
            if (part.text) {
              //Append text snippet if available in stream
              lastExaminerQuestionRef.current = part.text;
              appendTranscript("examiner", part.text);
            }
          }
        }

        if(response.serverContent?.outputTranscription?.text) {
          currentTurnTextBuffer.current += response.serverContent.outputTranscription.text;
        }

        //Flush Examiner/Model Sentence when Turn Completes
        if (response.serverContent?.turnComplete) {
          const completedText = currentTurnTextBuffer.current.trim();
          if (completedText) {
            lastExaminerQuestionRef.current = completedText;
            setTranscript((prev) => [
              ...prev,
              {
                role: "examiner",
                text: completedText,
                timestamp: new Date().toLocaleTimeString(),
              },
            ]);
            currentTurnTextBuffer.current = "";   //Clear the buffer for next turn
          }
        }

        //4. Handle Candidate / User Speech Transcription (inputTranscription)
        if (response.serverContent?.inputTranscription?.text) {
          const candidateText = response.serverContent.inputTranscription.text.trim();

          if (candidateText) {
            setTranscript((prev) => [
              ...prev,
              {
                role: "candidate",
                text: candidateText,
                timestamp: new Date().toLocaleTimeString(),
              },
            ]);

            //Trigger Evaluation Agent in background
            runTurnEvaluation(candidateText);
          }
        }

        ////Capture candidate speech transcript turns if generated by WebSocket
        //if (response.serverContent?.turnComplete && response.serverContent?.userTurn?.parts) {
        //  const userText = response.serverContent.userTurn.parts.map((p) => p.text).join(" ");
        //  console.log("User just said-> ", userText);
        //  if (userText) {
        //    setTranscript((prev) => [
        //      ...prev,
        //      { role: "candidate", text: userText, timestamp: new Date().toLocaleTimeString() },
        //    ]);
        //    //Trigger Agent 3 Evaluation
        //    runTurnEvaluation(userText);
        //  }
        //}

        //Step D: Handle Native Interruption (Candidate spoke while Examiner was answering)
        if (response.serverContent?.interrupted) {
          console.log("Interrupted by candidate! Flushing audio queue...");
          flushAudioPlayback();
          setCallState("live");
        }

        //Turn Complete
        if (response.serverContent?.turnComplete) {
          setCallState("live");
        }
      };

      ws.onclose = (event) => {
        if(wsRef.current === ws) {
            console.log("WebSocket connection closed naturally by server:", event.reason);
            endCall();
        }
      };

      ws.onerror = (err) => {
        console.error("Gemini WebSocket Error:", err);
        endCall();
      };
    } catch (err) {
      console.error("Failed to start session:", err);
      setCallState("idle");
    }
  };

  //Async Turn Evaluation Execution
  const runTurnEvaluation = async (studentAnswerText) => {
    if (!studentAnswerText || !studentAnswerText.trim()) return;

    setIsEvaluating(true);
    try {
      const res = await fetch("/api/eval-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentResponse: studentAnswerText,
          currentQuestion: lastExaminerQuestionRef.current || "General Technical Viva Question",
          blueprint: activeBlueprint,
        }),
      });

      const data = await res.json();
      if (data.evaluation) {
        setLatestEval(data.evaluation);

        //Auto-probing Trigger: If answer is weak/bluffing, send context direction to Live Examiner
        if (
          (data.evaluation.isBluffingOrVague || data.evaluation.recommendedAction === "PROBE_DEEPER") &&
          wsRef.current &&
          wsRef.current.readyState === WebSocket.OPEN
        ) {
          const probeInstruction = {
            clientContent: {
              turns: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `[SYSTEM INSTRUCTION FROM EVALUATOR AGENT]: The candidate gave a shallow or vague answer. Do not accept generalities. Probe deeper using this direction: "${
                        data.evaluation.suggestedFollowUp || "Ask them to explain the precise implementation details."
                      }"`,
                    },
                  ],
                },
              ],
              turnComplete: true,
            },
          };
          wsRef.current.send(JSON.stringify(probeInstruction));
        }
      }
    } catch (err) {
      console.error("Agent 3 Evaluation Error:", err);
    } finally {
      setIsEvaluating(false);
    }
  };


  //Agent: Generate Scorecard
  const generateScorecard = async (finalTranscripts) => {
    setIsGeneratingScorecard(true);
    setCallState("scorecard");
    try {
      const res = await fetch("/api/generate-scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcripts: finalTranscripts,
          blueprint: activeBlueprint,
        }),
      });

      const data = await res.json();
      if (data.scorecard) {
        setScorecard(data.scorecard);
      }
    } catch (err) {
      console.error("Scorecard Generation Error:", err);
    } finally {
      setIsGeneratingScorecard(false);
    }
  };

  //Agent: Launch Drill
  const handleLaunchDrill = async (topicName, gaps) => {
    setIsDrillModalOpen(true);
    setIsGeneratingDrill(true);
    try {
      const res = await fetch("/api/generate-drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicName: topicName || "General Web Security",
          criticalGaps: gaps || ["Concept Implementation"],
        }),
      });

      const data = await res.json();
      if (data.drill) {
        setActiveDrill(data.drill);
      }
    } catch (err) {
      console.error("Drill Generation Error:", err);
    } finally {
      setIsGeneratingDrill(false);
    }
  };

  //Capture Microphone and Stream 16kHz PCM to Gemini
  const initMicrophoneStream = async (ws) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000,
      });
      inputAudioCtxRef.current = audioCtx;

      await audioCtx.audioWorklet.addModule('/pcm-processor.js');
      
      const source = audioCtx.createMediaStreamSource(stream);
      //const processor = audioCtx.createScriptProcessor(2048, 1, 1);
      const processor = new AudioWorkletNode(audioCtx, 'pcm-processor', {
        //numberOfInputs: 1,
        //numberOfOutputs: 1, //CRITICAL: Stop node from recycling due to empty speaker data
        //outputChannelCount: [1]
      });
      console.log("Socket open and listening actively");
      processorRef.current = processor;

      processor.port.onmessage = (e) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          //const inputData = e.inputBuffer.getChannelData(0);
          //Convert Float32 samples to Int16 PCM
          //const pcm16 = new Int16Array(inputData.length);
          
          //console.log("Socket open and listening actively");
          const pcmBuffer = e.data;
          const pcm16 = new Int16Array(pcmBuffer);
        
        //  for (let i = 0; i < inputData.length; i++) {
        //    pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7fff;
        //  }

          //Convert to Base64 string
          const base64Audio = btoa(
            String.fromCharCode(...new Uint8Array(pcm16.buffer))
          );

          //Stream audio chunk to Gemini WebSocket
          ws.send(
            JSON.stringify({
              realtimeInput: {
                audio: {
                  
                    mimeType: "audio/pcm;rate=16000",
                    data: base64Audio,
                  
                },
              },
            })
          );
        }
      };

      source.connect(processor);
      //processor.connect(audioCtx.destination);
      //console.log("Socket open and listening actively");
    } catch (err) {
      console.error("Audio Processing Initialization Error:", err);
      alert("Microphone access is required for the live prep call.");
      endCall();
    }
  };

  //Decode and Schedule 24kHz Audio Playback
  const playAudioChunk24kHz = (base64PCM) => {
    if (!outputAudioCtxRef.current) {
      outputAudioCtxRef.current = new (window.AudioContext ||
        window.webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }

    const audioCtx = outputAudioCtxRef.current;
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    //Convert Base64 back to PCM Int16 Array
    const binaryString = atob(base64PCM);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const int16Data = new Int16Array(bytes.buffer);

    //Convert Int16 to Float32 for Web Audio API
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
      float32Data[i] = int16Data[i] / 32768.0;
    }

    //Create AudioBuffer
    const audioBuffer = audioCtx.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);

    //Schedule seamlessly in sequence
    const currentTime = audioCtx.currentTime;
    const startTime = Math.max(currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + audioBuffer.duration;
  };

  //Clear Audio Playback Queue on Interruption
  const flushAudioPlayback = () => {
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
      nextStartTimeRef.current = 0;
    }
  };

  //Append items to text transcript drawer
  const appendTranscript = (role, text) => {
    setTranscript((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === role) {
        return [
          ...prev.slice(0, -1),
          { ...last, text: last.text + " " + text },
        ];
      }
      return [...prev, { role, text }];
    });
  };

  //Gracefully End Call and Teardown Connections
  const endCall = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    nextStartTimeRef.current = 0;
    currentTurnTextBuffer.current = "";

    setCallState("idle");
    
    //Trigger Scorecard Generation Agent
    generateScorecard(transcript);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6 relative font-sans overflow-hidden">
      {/* Top Bar */}
      <header className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center py-2 z-10">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <span
            className={`w-3 h-3 rounded-full ${
              callState === "live" || callState === "speaking"
                ? "bg-emerald-500 animate-pulse"
                : callState === "connecting"
                ? "bg-amber-500 animate-ping"
                : "bg-slate-600"
            }`}
          ></span>
          <h1 className="text-lg font-semibold tracking-wide text-indigo-300" onClick={()=> console.log(persona)}>
            Speak2Prep Live Call
          </h1>
        </div>

        {/* Persona Selector */}
        <select
          value={persona}
          onChange={(e) => setPersona(e.target.value)}
          disabled={callState !== "idle"}
          className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-full mb-4 md:mb-0 px-3 py-1.5 focus:outline-none disabled:opacity-50"
        >
          <option value="STRICT_PROFESSOR">Strict Professor</option>
          <option value="FRIENDLY_TUTOR">Friendly Tutor</option>
          <option value="EMPATHETIC_MANAGER">Empathetic Manager</option>
        </select>

        {/* Topic/Material Selector Window */}
        <button
          onClick={() => setIsSyllabusModalOpen(true)}
          className="text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 mb-4 md:mb-0 px-3 py-1.5 rounded-lg text-indigo-300 flex items-center gap-1.5 transition"
        >
          <span>📚 Blueprint:</span>
          <span className="font-semibold text-slate-200">
            {activeBlueprint?.subjectTitle || "Default Syllabus"}
          </span>
        </button>

        {/* User Auth Profile Badge */}
        {user ? (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 pl-2.5 rounded-xl text-xs">
            <span className="text-slate-300 font-medium max-w-25 truncate">
              {user?.displayName || user?.email}
            </span>
            {user?.photoURL ? (
              <img
                src={user?.photoURL}
                alt="Avatar"
                className="w-6 h-6 rounded-lg border border-slate-700"
              />
            ) : (
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-[10px]">
                {user?.email?.[0].toUpperCase()}
              </div>
            )}
            <button
              onClick={signout}
              title="Sign Out"
              className="text-rose-400  hover:text-rose-600 p-1 transition cursor-pointer"
            >
              Logout ➜]
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4.5 py-2.5 rounded-lg transition cursor-pointer"
          >
            Sign In
          </button>
        )}

      </header>

      {/* Agent 3 Real-time Evaluation HUD */}
      {callState !== "scorecard" && (callState === "live" || callState === "speaking") && (
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🛡️ Co-Examiner Observer Agent</span>
              {isEvaluating && <span className="text-indigo-400 animate-pulse text-[10px]">(Analyzing...)</span>}
            </span>

            {latestEval && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  latestEval.isBluffingOrVague
                    ? "bg-amber-950/60 border-amber-800 text-amber-300"
                    : "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                }`}
              >
                {latestEval.isBluffingOrVague ? "⚠️ Low Depth / Vague" : "✓ Solid Defense"}
              </span>
            )}
          </div>

          {latestEval ? (
            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <p className="text-slate-300 font-medium">{latestEval.evaluationSummary}</p>
                {latestEval.missingKeyPoints?.length > 0 && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Missing: {latestEval.missingKeyPoints.join(", ")}
                  </p>
                )}
              </div>
              <div className="text-right pl-4">
                <span className="text-lg font-bold text-indigo-400">
                  {latestEval.technicalAccuracy}/10
                </span>
                <span className="block text-[10px] text-slate-500">Depth Score</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic text-center py-1">
              Listening to answer to compute technical depth...
            </p>
          )}
        </div>
      )}

      {/* Center Interactive Call Orb */}
      <main className="flex-1 flex flex-col items-center justify-center z-10 my-8">
        <div className="relative flex items-center justify-center">
          {/* Glowing Aura Rings */}
          <div
            className={`w-64 h-64 rounded-full absolute transition-all duration-700 blur-2xl opacity-40 ${
              callState === "connecting"
                ? "bg-amber-500 scale-100 animate-ping"
                : callState === "live"
                ? "bg-emerald-500 scale-110"
                : callState === "speaking"
                ? "bg-indigo-500 scale-125 animate-pulse"
                : "bg-slate-800 scale-90"
            }`}
          />

          {/* Core Visual Sphere */}
          <div
            className={`w-48 h-48 rounded-full border border-slate-700/50 flex flex-col items-center justify-center shadow-2xl transition-all duration-500 bg-slate-900/80 backdrop-blur-md ${
              callState === "speaking"
                ? "border-indigo-400 shadow-indigo-500/30"
                : callState === "live"
                ? "border-emerald-500/50 shadow-emerald-500/20"
                : ""
            }`}
          >
            <div className="text-4xl mb-2">
              {callState === "connecting"
                ? "⏳"
                : callState === "live"
                ? "🎙️"
                : callState === "speaking"
                ? "🔊"
                : "👤"}
            </div>
            <span className="text-xs uppercase tracking-widest font-semibold text-slate-400">
              {callState === "connecting"
                ? "Connecting..."
                : callState === "live"
                ? "Listening..."
                : callState === "speaking"
                ? "Examiner Speaking"
                : "Tap Phone to Start"}
            </span>
          </div>
        </div>
      </main>


      {/* VIEW B: Agent 4 Scorecard & Agent 5 Remediation Dashboard */}
      {callState === "scorecard" && (
        <section className="my-auto w-full max-w-3xl mx-auto space-y-6">
          {isGeneratingScorecard ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h2 className="text-base font-semibold text-indigo-400">
                Agent 4: Compiling Official Viva Scorecard...
              </h2>
              <p className="text-xs text-slate-400">
                Analyzing session transcripts against blueprint metrics and technical accuracy standards.
              </p>
            </div>
          ) : scorecard ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
              {/* Scorecard Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                    Agent 4 Viva Assessment
                  </span>
                  <h2 className="text-xl font-bold text-slate-100 mt-0.5">
                    {activeBlueprint?.subjectTitle || "Web Security"} Evaluation Scorecard
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-indigo-400">
                      {scorecard.overallScore}%
                    </span>
                    <span className="block text-[10px] text-slate-400 uppercase">Overall Score</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      scorecard.verdict === "PASS"
                        ? "bg-emerald-950/80 border-emerald-800 text-emerald-300"
                        : "bg-amber-950/80 border-amber-800 text-amber-300"
                    }`}
                  >
                    {scorecard.verdict}
                  </span>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1 text-xs">
                <span className="font-semibold text-slate-300">Executive Summary:</span>
                <p className="text-slate-400 leading-relaxed">{scorecard.executiveSummary}</p>
              </div>

              {/* Strengths & Critical Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-2">
                  <h3 className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <span>✓ Identified Strengths</span>
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {scorecard.strengths?.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl space-y-2">
                  <h3 className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <span>⚠️ Concept Gaps</span>
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {scorecard.criticalGaps?.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Topic Breakdown & Remediation Launch Buttons */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Module Breakdown & Remediation Drills
                </h3>
                <div className="space-y-2">
                  {scorecard.topicBreakdown?.map((topic, i) => (
                    <div
                      key={i}
                      className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1 max-w-[65%]">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">{topic.topicName}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                              topic.status === "MASTERED"
                                ? "bg-emerald-950 border-emerald-800 text-emerald-400"
                                : "bg-amber-950 border-amber-800 text-amber-400"
                            }`}
                          >
                            {topic.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{topic.feedback}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-200">{topic.score}%</span>
                        <button
                          onClick={() => handleLaunchDrill(topic.topicName, scorecard.criticalGaps)}
                          className="bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 px-3 py-1.5 rounded-lg text-[11px] font-medium transition"
                        >
                          ⚡ Practice Drill
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Restart Call Action */}
              <div className="pt-2 text-center">
                <button
                  onClick={() => setCallState("idle")}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-6 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Roast me again!
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-rose-400">
              Failed to generate scorecard. <button onClick={() => setCallState("idle")}>Try again</button>
            </div>
          )}
        </section>
      )}

      {/* Call Control Footer */}
      <footer className="w-full max-w-lg flex flex-col items-center gap-4 z-10">
        <div className="flex items-center gap-6 w-full justify-center">
          <div className="flex flex-col items-center">
            {/* Transcript Toggle */}
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="p-3 bg-slate-700 hover:bg-slate-500 border border-slate-400 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
              title="Toggle Transcript Drawer"
            >
              💬
            </button>
            <p className="text-gray-400 text-xs my-2"> Show Transcript </p>
          </div>

          {/* Primary Call Action Button */}
          {callState === "idle" || callState === "scorecard" ? (
            <div className="flex flex-col items-center">
              <button
                disabled={callState==="scorecard" ? true : false}
                onClick={handleStartCall}
                className="w-20 h-20 bg-gray-700 hover:bg-gray-500 border border-slate-400 text-white rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center text-3xl transition transform hover:scale-105 cursor-pointer disabled:cursor-default"
              >
                📞
              </button>
              <p className="text-gray-400 text-sm my-2"> Start call </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <button
                onClick={endCall}
                className="w-20 h-20 bg-rose-600 hover:bg-rose-500 border border-rose-300 text-white rounded-full shadow-lg shadow-rose-600/30 flex items-center justify-center text-3xl transition animate-pulse transform hover:scale-105 cursor-pointer"
              >
                🛑
              </button>
              <p className="text-gray-400 text-sm my-2"> End call & View Score </p>
            </div>
          )}

          <div className="flex flex-col items-center">
            {/* Reset Session Button */}
            <button
              onClick={() => setTranscript([])}
              className="p-3 bg-slate-700 hover:bg-slate-500 border border-slate-400 rounded-full text-slate-400 hover:text-rose-400 transition cursor-pointer"
              title="Clear Transcript"
            >
              🔄
            </button>
            <p className="text-gray-400 text-xs my-2"> Reset Transcript </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Native Bidirectional Audio streaming over Gemini Multimodal Live API
        </p>
      </footer>

      {/* Syllabus Modal */}
      <SyllabusModal
        isOpen={isSyllabusModalOpen}
        onClose={() => setIsSyllabusModalOpen(false)}
        onBlueprintReady={(bp) => setActiveBlueprint(bp)}
        activeBlueprint={activeBlueprint}
        persona={persona}
      />

      {/* Remediation Drill Modal */}
      <RemediationModal
        isOpen={isDrillModalOpen}
        onClose={() => setIsDrillModalOpen(false)}
        drill={activeDrill}
        isLoading={isGeneratingDrill}
      />

      {/* Auth Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Collapsible Live Transcript Drawer */}
      {showTranscript && (
        <div className="absolute inset-x-0 bottom-0 top-20 bg-slate-900/95 backdrop-blur-lg z-20 p-6 flex flex-col border-t border-slate-800 rounded-t-3xl transition-all">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Live Call Transcript
            </h2>
            <button
              onClick={() => setShowTranscript(false)}
              className="text-slate-400 hover:text-white text-sm"
            >
              ✕ Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {transcript.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                No conversation transcript yet. Tap 📞 to begin!
              </p>
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