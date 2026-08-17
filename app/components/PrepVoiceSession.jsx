'use client';

import { useState, useRef, useEffect } from 'react';

export default function VivaVoiceSession() {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('Disconnected');
  const wsRef = useRef(null);
  const audioCtxRef = useRef(null);

  const startSession = async () => {
    try {
      setStatus('Fetching session configuration...');
      const res = await fetch('/api/viva-session');
      const { config } = await res.json();

      const apiKey = process.env.GEMINI_API_KEY;
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;

      setStatus('Connecting to Gemini Live...');
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setStatus('Session Live - Speak into your mic');

        //Step 1: Handshake - Send Setup Payload
        ws.send(JSON.stringify({ setup: config }));

        //Step 2: Start capture from User Microphone
        initMicrophoneStream(ws);
      };

      ws.onmessage = async (event) => {
        const response = JSON.parse(event.data);

        //Step 3: Play incoming 24kHz Audio Chunks from Gemini
        if (response.serverContent?.modelTurn?.parts) {
          for (const part of response.serverContent.modelTurn.parts) {
            if (part.inlineData?.mimeType?.startsWith('audio/pcm')) {
              playAudioChunk(part.inlineData.data);
            }
          }
        }

        //Handle native interruption (if user talks while examiner speaks)
        if (response.serverContent?.interrupted) {
          console.log('Interrupted - Stopping audio playback buffer');
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setStatus('Session Ended');
      };

      ws.onerror = (err) => {
        console.error('WebSocket Error:', err);
        setStatus('Connection Error');
      };
    } catch (err) {
      console.error(err);
      setStatus('Failed to start session');
    }
  };

  //Record microphone input & stream 16kHz PCM chunks
  const initMicrophoneStream = async (ws) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new (window.AudioContext || window?.webkitAudioContext)({ sampleRate: 16000 });
    audioCtxRef.current = audioCtx;

    const source = audioCtx.createMediaStreamSource(stream);
    const processor = audioCtx.createScriptProcessor(2048, 1, 1);

    processor.onaudioprocess = (e) => {
      if (ws.readyState === WebSocket.OPEN) {
        const inputData = e.inputBuffer.getChannelData(0);
        //Convert Float32 to Int16 PCM Buffer
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7fff;
        }

        const base64Audio = btoa(
          String.fromCharCode(...new Uint8Array(pcm16.buffer))
        );

        //Stream audio chunk to Gemini Live API
        ws.send(
          JSON.stringify({
            realtimeInput: {
              mediaChunks: [
                {
                  mimeType: 'audio/pcm;rate=16000',
                  data: base64Audio,
                },
              ],
            },
          })
        );
      }
    };

    source.connect(processor);
    processor.connect(audioCtx.destination);
  };

  //Play audio response chunks
  const playAudioChunk = (base64PCM) => {
    //Decoding and scheduling PCM24/24kHz playback via Web Audio API
    //(Standard AudioBuffer source node setup)
  };

  const endSession = () => {
    if (wsRef.current) wsRef.current.close();
    if (audioCtxRef.current) audioCtxRef.current.close();
    setIsConnected(false);
    setStatus('Disconnected');
  };

  return (
    <div className="p-6 border rounded-lg max-w-md mx-auto my-8 text-center space-y-4">
      <h2 className="text-xl font-bold">Viva Voice Defense (Gemini Live)</h2>
      <p className="text-sm text-gray-600">Status: {status}</p>

      {!isConnected ? (
        <button
          onClick={startSession}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Start Viva Session
        </button>
      ) : (
        <button
          onClick={endSession}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          End Session
        </button>
      )}
    </div>
  );
}