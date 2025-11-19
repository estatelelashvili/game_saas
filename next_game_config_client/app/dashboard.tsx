"use client"; // Important for Next.js App Router

import React, { useState, useMemo, FC, useEffect } from "react";
import {
  doc,
  collection,
  setDoc,
  Firestore,
  CollectionReference,
  DocumentData,
} from "firebase/firestore";
import { useMutation, UseMutationResult } from "@tanstack/react-query"; // Explicitly importing UseMutationResult type

// --- NEW IMPORTS ---
import { useAppDispatch, useAppSelector } from "./store/hooks"; // Import corrected typed hooks
// --- END NEW IMPORTS ---

import {
  showNotification,
  clearNotification,
  NotificationType,
} from "./store/notificationSlice";
import { useFirebase } from "./lib/FirebaseProvider";

// --- 1. Type Definitions (Re-defined/moved from the original file for clarity) ---

// Assuming this interface matches your notificationSlice state structure
interface NotificationState {
  message: string;
  type: NotificationType;
}

// Game Data Types
type GameType = "clicker" | "quiz" | "memory";

interface ClickerData {
  durationSeconds: number;
  targetScore: number;
  buttonText: string;
}

interface QuizData {
  question: string;
  answer: string;
  timeLimit: number;
}

type GameSpecificData = ClickerData | QuizData | Record<string, unknown>;

interface GameConfig {
  configId: string;
  title: string;
  gameType: GameType;
  data: GameSpecificData;
  createdAt: string;
  createdBy: string | null;
}

interface MutationPayload {
  title: string;
  gameType: GameType;
  data: GameSpecificData;
}
interface MutationResult {
  configId: string;
}

// --- 2. UI Components (Typed) ---

const Notification: FC = () => {
  // USE CORRECTED HOOK
  const dispatch = useAppDispatch();
  // Use the typed selector and assert the structure of the notification state
  const { message, type } = useAppSelector(
    (state) => state.notification as NotificationState
  );

  if (!message) return null;

  const colorMap: Record<NotificationType, string> = {
    success: "bg-green-100 text-green-800 border-green-400",
    error: "bg-red-100 text-red-800 border-red-400",
    info: "bg-blue-100 text-blue-800 border-blue-400",
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => dispatch(clearNotification()), 5000);
      return () => clearTimeout(timer);
    }
  }, [message, dispatch]);

  return (
    <div
      className={`p-4 border-l-4 rounded-lg shadow-lg mb-6 ${colorMap[type]}`}
    >
      <p className="font-medium">{message}</p>
    </div>
  );
};

const LoadingSpinner: FC = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

// --- 3. Dashboard Component (Typed) ---

export default function Dashboard() {
  // USE CORRECTED HOOK
  const dispatch = useAppDispatch();

  const { db, userId, appId, firebaseReady } = useFirebase();

  // State Hooks with explicit types
  const [gameType, setGameType] = useState<GameType>("clicker");
  const [title, setTitle] = useState<string>("New Clicker Challenge");
  const [durationSeconds, setDurationSeconds] = useState<string>("10");
  const [targetScore, setTargetScore] = useState<string>("10");
  const [buttonText, setButtonText] = useState<string>("Smash Me!");
  const [question, setQuestion] = useState<string>("What color is the sun?");
  const [answer, setAnswer] = useState<string>("yellow");
  const [timeLimit, setTimeLimit] = useState<string>("30");
  const [generatedLink, setGeneratedLink] = useState<string>("");

  const gameData: GameSpecificData = useMemo(() => {
    if (gameType === "clicker") {
      return {
        durationSeconds: Number(durationSeconds),
        targetScore: Number(targetScore),
        buttonText,
      } as ClickerData;
    }
    if (gameType === "quiz") {
      return { question, answer, timeLimit: Number(timeLimit) } as QuizData;
    }
    return {};
  }, [
    gameType,
    durationSeconds,
    targetScore,
    buttonText,
    question,
    answer,
    timeLimit,
  ]);

  const saveConfigToFirestore = async (
    config: MutationPayload
  ): Promise<MutationResult> => {
    if (!db) throw new Error("Firestore connection is not ready.");

    const configId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Date.now().toString() + Math.random().toString(36).substring(2, 9);

    const configPath = `artifacts/${appId}/public/data/game_configs`;
    const configCollectionRef: CollectionReference<DocumentData> = collection(
      db as Firestore,
      configPath
    );
    const configDocRef = doc(configCollectionRef, configId);

    const dataToSave: GameConfig = {
      configId,
      title: config.title,
      gameType: config.gameType,
      data: config.data,
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };

    await setDoc(configDocRef, dataToSave);
    return { configId };
  };

  // Corrected destructuring for useMutation result to ensure type inference works correctly.
  // We explicitly type the result to UseMutationResult to aid TypeScript, although
  // it's often optional. The original code should have worked, so this modification
  // ensures maximum compatibility with recent TanStack Query versions.
  const {
    mutate,
    isPending,
    isSuccess,
  }: UseMutationResult<MutationResult, Error, MutationPayload> = useMutation<
    MutationResult,
    Error,
    MutationPayload
  >({
    mutationFn: saveConfigToFirestore,
    onSuccess: (data) => {
      const configId = data.configId;
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://example.com";
      const link = `${baseUrl}/game/${configId}`;

      setGeneratedLink(link);
      dispatch(
        showNotification({
          message: "Configuration successfully saved to Firestore!",
          type: "success",
        })
      );

      if (typeof window !== "undefined") {
        window.open(link, "_blank");
      }
    },
    onError: (error: Error) => {
      console.error("Firestore Save Error:", error);
      dispatch(
        showNotification({
          message: `Failed to save config: ${error.message}`,
          type: "error",
        })
      );
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firebaseReady) {
      dispatch(
        showNotification({
          message: "Firebase is still connecting...",
          type: "info",
        })
      );
      return;
    }

    mutate({ title, gameType, data: gameData });
  };

  const renderGameSpecificFields = (): React.ReactNode => {
    if (gameType === "clicker") {
      return (
        <>
          <label className="block text-sm font-medium text-gray-700">
            Button Text
          </label>
          <input
            type="text"
            value={buttonText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setButtonText(e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            required
          />

          <label className="block text-sm font-medium text-gray-700 mt-3">
            Target Score
          </label>
          <input
            type="number"
            value={targetScore}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTargetScore(e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            min="1"
            required
          />

          <label className="block text-sm font-medium text-gray-700 mt-3">
            Duration (Seconds)
          </label>
          <input
            type="number"
            value={durationSeconds}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDurationSeconds(e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            min="1"
            required
          />
        </>
      );
    }

    if (gameType === "quiz") {
      return (
        <>
          <label className="block text-sm font-medium text-gray-700">
            Question
          </label>
          <textarea
            value={question}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setQuestion(e.target.value)
            }
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            required
          />

          <label className="block text-sm font-medium text-gray-700 mt-3">
            Correct Answer
          </label>
          <input
            type="text"
            value={answer}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAnswer(e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            required
          />

          <label className="block text-sm font-medium text-gray-700 mt-3">
            Time Limit (Seconds)
          </label>
          <input
            type="number"
            value={timeLimit}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTimeLimit(e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            min="5"
            required
          />
        </>
      );
    }

    return <p className="text-gray-500">Select a game type to configure.</p>;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-2xl space-y-6">
        <h1 className="text-3xl font-bold text-indigo-700">
          Next.js Game Configuration Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          User ID:{" "}
          <span className="font-mono text-xs bg-gray-200 p-1 rounded break-all">
            {userId || "N/A"}
          </span>
          <br />
          Status:{" "}
          <span
            className={
              firebaseReady ? "text-green-600 font-semibold" : "text-yellow-600"
            }
          >
            {firebaseReady ? "Connected" : "Connecting..."}
          </span>
        </p>
        <Notification />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Game Type
            </label>
            <select
              value={gameType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setGameType(e.target.value as GameType)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            >
              <option value="clicker">Clicker Challenge</option>
              <option value="quiz">Timed Quiz</option>
              <option value="memory">Memory Match (Placeholder)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Game Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTitle(e.target.value)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              required
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border">
            <h2 className="font-semibold text-gray-800 mb-3">
              Game-Specific Settings
            </h2>
            {renderGameSpecificFields()}
          </div>

          <button
            type="submit"
            disabled={!firebaseReady || isPending}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150"
          >
            {isPending ? (
              <>
                <LoadingSpinner />
                Saving Config...
              </>
            ) : (
              "Generate Config & Open Client"
            )}
          </button>
        </form>

        {generatedLink && isSuccess && (
          <div className="bg-green-50 p-4 rounded-md border border-green-300 break-words">
            <p className="text-sm font-medium text-green-700 mb-2">
              Game Client Link Generated (Click to Copy):
            </p>
            <input
              value={generatedLink}
              readOnly
              onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                (e.target as HTMLInputElement).select();
                document.execCommand("copy");
                dispatch(
                  showNotification({
                    message: "Link copied to clipboard!",
                    type: "info",
                  })
                );
              }}
              className="w-full bg-white p-2 border border-dashed border-green-500 rounded text-sm cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
}
