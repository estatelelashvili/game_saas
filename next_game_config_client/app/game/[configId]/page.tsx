"use client";

import React, { FC, useState, useEffect, useCallback, useMemo } from "react";
// UPDATED IMPORTS: Adjusted relative paths to point to app/store and app/lib
import { useAppDispatch } from "../../store/hooks";
import { showNotification } from "../../store/notificationSlice";
import { useFirebase } from "../../lib/FirebaseProvider";
import { doc, getDoc, Firestore, DocumentData } from "firebase/firestore";

// --- Type Definitions ---
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
}

interface PageProps {
  params: Promise<{
    configId: string;
  }>;
}

// --- Shared Components ---

const LoadingScreen: FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white p-8">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-400 mb-4"></div>
    <h1 className="text-2xl font-bold">{message}</h1>
    <p className="text-sm text-gray-400 mt-2">Loading game configuration...</p>
  </div>
);

const ErrorScreen: FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-red-800 text-white p-8">
    <h1 className="text-3xl font-bold mb-4">Error Loading Game</h1>
    <p className="text-lg">{message}</p>
    <p className="text-sm mt-4">
      Please check the configuration ID and try again.
    </p>
  </div>
);

// --- Game Implementations ---

// 1. Clicker Game Component
const ClickerGame: FC<{ config: GameConfig }> = ({ config }) => {
  const data = config.data as ClickerData;
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(data.durationSeconds);
  const [gameStatus, setGameStatus] = useState<
    "pending" | "running" | "finished"
  >("pending");

  const handleStart = () => {
    setScore(0);
    setTimeLeft(data.durationSeconds);
    setGameStatus("running");
  };

  const handleClick = () => {
    if (gameStatus === "running") {
      setScore((prev) => prev + 1);
    }
  };

  // Timer logic
  useEffect(() => {
    if (gameStatus !== "running") return;

    if (timeLeft <= 0 || score >= data.targetScore) {
      setGameStatus("finished");
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameStatus, timeLeft, score, data.targetScore]);

  const statusMessage = useMemo(() => {
    if (gameStatus === "finished") {
      if (score >= data.targetScore) {
        return `🎉 SUCCESS! Scored ${score} in ${
          data.durationSeconds - timeLeft
        }s.`;
      }
      return `⏳ TIME UP! Score: ${score}. Try again!`;
    }
    if (gameStatus === "running" && score >= data.targetScore) {
      setGameStatus("finished");
      return `🎉 SUCCESS! Scored ${score} in ${
        data.durationSeconds - timeLeft
      }s.`;
    }
    return `Click the button ${data.targetScore} times in ${data.durationSeconds} seconds!`;
  }, [gameStatus, score, data.targetScore, data.durationSeconds, timeLeft]);

  const buttonDisabled = gameStatus !== "running";

  return (
    <div className="p-8 space-y-6 max-w-lg mx-auto bg-white shadow-2xl rounded-xl border border-indigo-200">
      <h2 className="text-3xl font-extrabold text-indigo-600 text-center">
        {config.title}
      </h2>

      <div className="flex justify-between text-lg font-semibold border-b pb-3">
        <p>
          Score: <span className="text-indigo-500 text-2xl">{score}</span>
        </p>
        <p>
          Target:{" "}
          <span className="text-green-500 text-2xl">{data.targetScore}</span>
        </p>
        <p>
          Time:{" "}
          <span
            className={`text-2xl ${
              timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-gray-700"
            }`}
          >
            {timeLeft}s
          </span>
        </p>
      </div>

      <p
        className={`text-center font-bold p-3 rounded-lg ${
          gameStatus === "finished"
            ? "bg-yellow-100 text-yellow-800"
            : "text-gray-600"
        }`}
      >
        {statusMessage}
      </p>

      {gameStatus !== "running" && (
        <button
          onClick={handleStart}
          className="w-full py-4 text-xl font-bold text-white bg-green-500 rounded-lg shadow-lg hover:bg-green-600 transition duration-150 transform hover:scale-[1.01]"
        >
          {gameStatus === "finished" ? "Play Again" : "Start Game"}
        </button>
      )}

      {gameStatus === "running" && (
        <button
          onClick={handleClick}
          disabled={buttonDisabled}
          className="w-full py-12 text-3xl font-extrabold text-white bg-indigo-500 rounded-lg shadow-xl hover:bg-indigo-600 active:bg-indigo-700 transition duration-100 transform active:scale-[0.98] disabled:opacity-50"
        >
          {data.buttonText}
        </button>
      )}
    </div>
  );
};

// 2. Quiz Game Component (Simplified Placeholder)
const QuizGame: FC<{ config: GameConfig }> = ({ config }) => {
  const data = config.data as QuizData;
  const [inputAnswer, setInputAnswer] = useState("");
  const [feedback, setFeedback] = useState<"pending" | "correct" | "incorrect">(
    "pending"
  );
  const [timeLeft, setTimeLeft] = useState(data.timeLimit);
  const [gameActive, setGameActive] = useState(true);

  const checkAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameActive) return;

    const normalizedInput = inputAnswer.trim().toLowerCase();
    const normalizedCorrect = data.answer.trim().toLowerCase();

    if (normalizedInput === normalizedCorrect) {
      setFeedback("correct");
      setGameActive(false);
    } else {
      setFeedback("incorrect");
    }
  };

  // Timer logic
  useEffect(() => {
    if (!gameActive) return;
    if (timeLeft <= 0) {
      setGameActive(false);
      setFeedback("incorrect"); // Time out is incorrect
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameActive, timeLeft]);

  const statusClasses = {
    pending: "bg-gray-100 text-gray-700",
    correct: "bg-green-100 text-green-700",
    incorrect: "bg-red-100 text-red-700",
  };

  const statusText = {
    pending: "Type your answer below and submit!",
    correct: "✅ Correct! Well done!",
    incorrect: `❌ Incorrect or Time Out. The answer was: ${data.answer}`,
  };

  return (
    <div className="p-8 space-y-6 max-w-lg mx-auto bg-white shadow-2xl rounded-xl border border-red-200">
      <h2 className="text-3xl font-extrabold text-red-600 text-center">
        {config.title}
      </h2>

      <div className="text-lg font-semibold flex justify-between">
        <p>
          Time Left:{" "}
          <span
            className={`text-2xl font-bold ${
              timeLeft <= 5 && gameActive
                ? "text-red-500 animate-pulse"
                : "text-gray-700"
            }`}
          >
            {timeLeft}s
          </span>
        </p>
        <p className={`p-2 rounded ${statusClasses[feedback]}`}>
          {statusText[feedback]}
        </p>
      </div>

      <div className="p-6 bg-red-50 rounded-lg border border-red-300">
        <p className="text-xl font-medium text-gray-800">{data.question}</p>
      </div>

      <form onSubmit={checkAnswer} className="space-y-4">
        <input
          type="text"
          value={inputAnswer}
          onChange={(e) => setInputAnswer(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500"
          placeholder="Type your answer here..."
          disabled={!gameActive}
          required
        />
        <button
          type="submit"
          disabled={!gameActive || feedback === "correct"}
          className="w-full py-3 font-bold text-white bg-red-600 rounded-lg shadow-lg hover:bg-red-700 transition duration-150 disabled:opacity-50"
        >
          Submit Answer
        </button>
      </form>

      {(feedback === "correct" || feedback === "incorrect") && (
        <button
          onClick={() => {
            setInputAnswer("");
            setFeedback("pending");
            setTimeLeft(data.timeLimit);
            setGameActive(true);
          }}
          className="w-full py-2 text-sm font-semibold text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition"
        >
          Reset Challenge
        </button>
      )}
    </div>
  );
};

// 3. Main Page Component
export default function GameClientPage({ params }: PageProps) {
  const { configId } = React.use(params);
  const { db, firebaseReady } = useFirebase();
  const dispatch = useAppDispatch();

  const [config, setConfig] = useState<GameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    if (!db || !configId) {
      return;
    }

    const configPath = `artifacts/default-app-id/public/data/game_configs`;
    const configDocRef = doc(db as Firestore, configPath, configId);

    try {
      const docSnap = await getDoc(configDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as GameConfig;
        setConfig(data);
      } else {
        setError(`No game configuration found for ID: ${configId}`);
      }
    } catch (err) {
      console.error("Error fetching config:", err);
      setError(
        "Failed to fetch game configuration due to a network or database error."
      );
    } finally {
      setLoading(false);
    }
  }, [db, configId]);

  useEffect(() => {
    if (firebaseReady) {
      fetchConfig();
    }
  }, [firebaseReady, fetchConfig]);

  if (loading) {
    return <LoadingScreen message="Initializing Game..." />;
  }

  if (error) {
    dispatch(showNotification({ message: error, type: "error" }));
    return <ErrorScreen message={error} />;
  }

  if (!config) {
    return (
      <ErrorScreen
        message={`Configuration ID "${configId}" not found or failed to load.`}
      />
    );
  }

  let GameComponent;
  if (config.gameType === "clicker") {
    GameComponent = ClickerGame;
  } else if (config.gameType === "quiz") {
    GameComponent = QuizGame;
  } else {
    return (
      <ErrorScreen message={`Unsupported game type: ${config.gameType}`} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <GameComponent config={config} />
    </div>
  );
}
