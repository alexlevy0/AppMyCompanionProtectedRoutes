// @ts-nocheck
import { useState, useRef, useCallback, useEffect } from "react";
import {
  AudioModule,
  useAudioRecorder,
  RecordingPresets,
  createAudioPlayer,
  useAudioRecorderState, // --- FIX: Import useAudioRecorderState ---
} from "expo-audio";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

// IMPORTANT FOR iOS:
// You MUST add the following to your iOS project's Info.plist file:
// <key>NSMicrophoneUsageDescription</key>
// <string>We need access to your microphone to enable voice conversations.</string>
// This is critical for microphone access on iOS.

// Placeholder for notifyError - replace with your actual notification utility
const notifyError = (message) => console.error("Error:", message);

const WS_BASE_URL = "wss://dipler-backend-203319928451.europe-west9.run.app";

// Utility for waiting
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Optimized audio constants
const CHUNK_DURATION_MS = 100; // 100ms chunks for reduced latency

const customRecordingPreset = {
  ...RecordingPresets.HIGH_QUALITY,
  android: {
    ...RecordingPresets.HIGH_QUALITY.android,
    outputFormat: "mpeg4",
    audioEncoder: "aac",
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
  },
  ios: {
    ...RecordingPresets.HIGH_QUALITY.ios,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
    isMeteringEnabled: true, // --- FIX: Enable metering for iOS ---
  },
  isMeteringEnabled: true, // --- FIX: Enable metering for Android ---
};

export default function useDuplexWs({ workspaceId, apiToken, onCallEnded }) {
  // Reactive state
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [sessionStats, setSessionStats] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const audioRecorder = useAudioRecorder(customRecordingPreset);
  // --- FIX: Use useAudioRecorderState to get real-time status ---
  const recorderState = useAudioRecorderState(audioRecorder);

  // References
  const socketRef = useRef(null);
  const functionCallsHandlersRef = useRef([]);
  const audioQueueRef = useRef([]);
  const currentSoundRef = useRef(null);
  const isProcessingQueueRef = useRef(false);
  const lastAudioChunkRef = useRef(null);
  const isRecordingRef = useRef(false);

  // --- FIX: Effect to update audio level from recorder state ---
  useEffect(() => {
    if (recorderState?.metering) {
      // Normalize the metering value (-160 to 0) to a 0-1 range
      const normalizedLevel = Math.max(0, 1 + recorderState.metering / 160);
      setAudioLevel(normalizedLevel);
    }
  }, [recorderState?.metering]);

  // Hook for function calls
  const onFunctionCalls = useCallback((handler) => {
    functionCallsHandlersRef.current.push(handler);
  }, []);

  // Stop all sounds
  const clearAudioPlayback = useCallback(async () => {
    audioQueueRef.current = [];
    isProcessingQueueRef.current = false;

    if (currentSoundRef.current) {
      try {
        await currentSoundRef.current.remove();
      } catch (error) {
        console.warn(
          "Error stopping audio playback, may already be stopped:",
          error
        );
      }
      currentSoundRef.current = null;
    }
  }, []);

  // Audio configuration on mount
  useEffect(() => {
    const setupAudio = async () => {
      try {
        const { granted } =
          await AudioModule.requestRecordingPermissionsAsync();
        if (!granted) {
          notifyError("Microphone permission denied. Cannot record audio.");
          return;
        }

        await AudioModule.setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });

        console.log("Audio mode set for recording successfully.");
      } catch (error) {
        console.error("Error configuring audio:", error);
        notifyError("Failed to configure audio for recording.");
      }
    };
    setupAudio();

    return () => {
      if (recorderState?.isRecording) {
        audioRecorder.stop();
      }
      clearAudioPlayback();
    };
  }, [clearAudioPlayback, audioRecorder, recorderState?.isRecording]);

  // Process audio queue in an optimized way
  const processAudioQueue = useCallback(async () => {
    if (isProcessingQueueRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    isProcessingQueueRef.current = true;
    setIsModelSpeaking(true);

    while (audioQueueRef.current.length > 0) {
      const audioData = audioQueueRef.current.shift();
      let player = null;

      try {
        player = createAudioPlayer({
          uri: `data:audio/m4a;base64,${audioData}`,
        });
        currentSoundRef.current = player;

        await new Promise((resolve, reject) => {
          const subscription = player.addListener(
            "playbackStatusUpdate",
            (status) => {
              if (status.didJustFinish) {
                subscription.remove();
                resolve();
              }
              // Note: expo-audio player doesn't have a specific error property in status
              // so we rely on the outer try/catch.
            }
          );
          player.play();
        });
      } catch (error) {
        console.error("Error playing audio chunk:", error);
        notifyError("Error playing model audio.");
      } finally {
        if (player) {
          try {
            await player.remove();
          } catch (e) {
            console.warn(
              "Error removing player, it might have been removed already."
            );
          }
        }
        currentSoundRef.current = null;
      }
    }

    isProcessingQueueRef.current = false;
    setIsModelSpeaking(false);
  }, []);

  // Add audio to the queue
  const queueAudio = useCallback(
    (audioData) => {
      audioQueueRef.current.push(audioData);
      if (!isProcessingQueueRef.current) {
        processAudioQueue();
      }
    },
    [processAudioQueue]
  );

  // Segment streaming system
  const startStreamingRecording = useCallback(async () => {
    const recordSegment = async () => {
      if (
        !socketRef.current ||
        socketRef.current.readyState !== WebSocket.OPEN
      ) {
        isRecordingRef.current = false;
        return;
      }

      try {
        await audioRecorder.prepareToRecordAsync();
        await audioRecorder.record();

        await wait(CHUNK_DURATION_MS);

        // --- FIX: Use recorderState to check if recording is active ---
        if (!recorderState?.isRecording) {
          return;
        }

        await audioRecorder.stop();
        const uri = audioRecorder.uri;

        if (uri && !isMicMuted) {
          const audioData = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          if (
            audioData &&
            audioData.length > 100 &&
            audioData !== lastAudioChunkRef.current
          ) {
            lastAudioChunkRef.current = audioData;
            const binaryString = atob(audioData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(bytes.buffer);
            }
          }
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }

        if (
          socketRef.current?.readyState === WebSocket.OPEN &&
          isRecordingRef.current
        ) {
          recordSegment();
        } else {
          isRecordingRef.current = false;
        }
      } catch (error) {
        console.error("Error in segment recording:", error);
        isRecordingRef.current = false;
        setTimeout(() => {
          if (
            socketRef.current?.readyState === WebSocket.OPEN &&
            isRecordingRef.current
          ) {
            recordSegment();
          }
        }, 1000);
      }
    };

    console.log("Starting streaming recording...");
    if (!isRecordingRef.current) {
      isRecordingRef.current = true;
      recordSegment();
    }
  }, [isMicMuted, audioRecorder, recorderState?.isRecording]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    isRecordingRef.current = false;
    if (recorderState?.isRecording) {
      try {
        await audioRecorder.stop();
      } catch (error) {
        console.warn("Error stopping active recording:", error);
      }
    }
  }, [audioRecorder, recorderState?.isRecording]);

  // Close the connection and reset all states
  const closeConnection = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.onopen = null;
      socketRef.current.onmessage = null;
      socketRef.current.onerror = null;
      socketRef.current.onclose = null;
      if (socketRef.current.readyState !== WebSocket.CLOSED) {
        socketRef.current.close();
      }
      socketRef.current = null;
    }

    stopRecording();
    clearAudioPlayback();

    setIsConnected(false);
    setIsLoading(false);
    setIsMicMuted(false);
    setIsUserSpeaking(false);
    setIsModelSpeaking(false);
    setAudioLevel(0);
    console.log("Connection closed and states reset.");
  }, [stopRecording, clearAudioPlayback]);

  // Stop the conversation
  const stopConversation = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "hangUp" }));
    }
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      closeConnection();
    }
  }, [closeConnection]);

  // Start the conversation
  const startConversation = useCallback(
    async ({
      config,
      agentId = null,
      sessionMode = "vocal",
      isVadActive,
      isSttActive,
      isLlmActive,
      isTtsActive,
    } = {}) => {
      if (!["vocal", "chatbot", "custom"].includes(sessionMode)) {
        throw new Error("⚠️ Invalid sessionMode");
      }

      if (isLoading || isConnected) {
        console.warn("Conversation already in progress.");
        return;
      }

      setConversation([]);
      setSessionStats(null);
      setValidationResult(null);
      setIsLoading(true);
      audioQueueRef.current = [];
      lastAudioChunkRef.current = null;
      clearAudioPlayback();

      try {
        if (sessionMode === "vocal") {
          await wait(500);
        }

        let authToken = apiToken || (await AsyncStorage.getItem("accessToken"));
        const isTokenExpired = (token) => false; // Replace with actual logic
        const refreshToken = async () => {
          console.warn("refreshToken not implemented.");
          return true;
        };

        if (!apiToken && (!authToken || isTokenExpired(authToken))) {
          const refreshed = await refreshToken();
          if (refreshed) {
            authToken = await AsyncStorage.getItem("accessToken");
          } else {
            notifyError("Session expired, please log in again.");
            setIsLoading(false);
            return;
          }
        }

        let WS_URL = `${WS_BASE_URL}/duplex?workspaceId=${workspaceId || ""}&`;
        if (apiToken) WS_URL += `apiToken=${encodeURIComponent(apiToken)}`;
        else if (authToken)
          WS_URL += `authToken=${encodeURIComponent(authToken)}`;
        else throw new Error("No token provided for WebSocket connection.");

        socketRef.current = new WebSocket(WS_URL);
        socketRef.current.binaryType = "arraybuffer";

        let heartbeat;
        socketRef.current.onopen = () => {
          console.log("🔌 WebSocket opened, waiting for ready signal...");
          heartbeat = setInterval(() => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify({ type: "ping" }));
            }
          }, 30000);
        };

        socketRef.current.onmessage = async (event) => {
          if (typeof event.data === "string") {
            try {
              const data = JSON.parse(event.data);
              if (data.type !== "pong")
                console.log("🤖", data.type, data.conversation?.length || "");

              switch (data.type) {
                case "ready": {
                  const startMessage = {
                    type: "start",
                    workspaceId,
                    config,
                    agentId,
                    sessionMode,
                    isVadActive,
                    isSttActive,
                    isLlmActive,
                    isTtsActive,
                  };
                  socketRef.current.send(JSON.stringify(startMessage));
                  break;
                }
                case "sessionStarted":
                  setIsConnected(true);
                  setIsLoading(false);
                  await wait(500);
                  startStreamingRecording().catch(console.error);
                  break;
                case "userSpeechStart":
                  setIsUserSpeaking(true);
                  clearAudioPlayback();
                  break;
                case "userSpeechEnd":
                  setIsUserSpeaking(false);
                  break;
                case "sttTranscription":
                case "llmChunk":
                case "llmComplete":
                case "firstSentenceInjected":
                case "conversationUpdated":
                case "inactivityReminder":
                  if (data.conversation) setConversation(data.conversation);
                  break;
                case "modelSpeechStart":
                  break;
                case "modelSpeechEnd":
                  break;
                case "modelSpeechResume":
                  setIsModelSpeaking(true);
                  break;
                case "functionCalls":
                  functionCallsHandlersRef.current.forEach((handler) =>
                    handler(data.functionCalls)
                  );
                  break;
                case "hungUp":
                  stopConversation();
                  setIsLoading(true);
                  break;
                case "stats":
                  setIsLoading(false);
                  setSessionStats(data.stats);
                  setValidationResult(data.validation);
                  onCallEnded?.(data.stats?.sessionTotalPrice);
                  break;
                case "end":
                  closeConnection();
                  break;
                case "error":
                  notifyError(data.error || "Unknown error from server.");
                  closeConnection();
                  break;
                case "pong":
                  break;
              }
            } catch (err) {
              console.error("Error parsing JSON message:", err);
            }
          } else if (event.data instanceof ArrayBuffer) {
            const bytes = new Uint8Array(event.data);
            let binary = "";
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);
            queueAudio(base64);
          }
        };

        socketRef.current.onerror = (err) => {
          console.error("WebSocket error:", err.message);
          notifyError("Connection error. Please try again.");
          clearInterval(heartbeat);
          closeConnection();
        };

        socketRef.current.onclose = (event) => {
          console.log("🔚 WebSocket closed", event.code, event.reason);
          clearInterval(heartbeat);
          closeConnection();
        };
      } catch (error) {
        console.error("Error starting conversation:", error);
        notifyError(error.message || "Failed to start conversation.");
        closeConnection();
      }
    },
    [
      workspaceId,
      apiToken,
      onCallEnded,
      clearAudioPlayback,
      queueAudio,
      startStreamingRecording,
      closeConnection,
      isLoading,
      isConnected,
    ]
  );

  // Send a message
  const sendMessage = useCallback((message) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const payload =
        typeof message === "string"
          ? { type: "sendMessage", text: message }
          : message;
      socketRef.current.send(JSON.stringify(payload));
    } else {
      notifyError("Cannot send message: Not connected.");
    }
  }, []);

  // Hang up
  const hangUp = useCallback(() => {
    stopConversation();
  }, [stopConversation]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMicMuted((prev) => {
      console.log(`Microphone muted: ${!prev}`);
      return !prev;
    });
  }, []);

  return {
    isConnected,
    isLoading,
    isUserSpeaking,
    isModelSpeaking,
    conversation,
    sessionStats,
    validationResult,
    isMicMuted,
    audioLevel,
    startConversation,
    sendMessage,
    hangUp,
    toggleMute,
    onFunctionCalls,
  };
}
