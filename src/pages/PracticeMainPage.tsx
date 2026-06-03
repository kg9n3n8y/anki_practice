import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Board } from "../components/Board";
import { fudalist } from "../data/fudalist";
import { beepCorrect, beepIncorrect } from "../lib/beep";
import { evaluateAnswer } from "../lib/confirmAnswer";
import {
  allBoardCards,
  countFaceUp,
  countOnBoard,
  generateBoard,
  setAllFaceDown,
} from "../lib/placement";
import { buildQuestionList } from "../lib/quiz";
import { modeLabel } from "../lib/poemImage";
import { loadTeigi, appendResult } from "../lib/storage";
import type { GeneratedBoard } from "../types/board";
import type { BoardCard } from "../types/board";
import type { FeedbackKind, PracticePhase } from "../types/board";
import { fudaDisplayWidth } from "../lib/fudaDisplaySize";
import type { Poem, PracticeSettings } from "../types";

type LocationState = {
  settings?: PracticeSettings;
};

export function PracticeMainPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const settings = (location.state as LocationState | null)?.settings;

  const initialBoard = useMemo(() => {
    if (!settings) return null;
    const teigi = settings.useTeigi ? loadTeigi() : null;
    return generateBoard(fudalist, settings, teigi);
  }, [settings]);

  const [phase, setPhase] = useState<PracticePhase>("memorize");
  const [board, setBoard] = useState<GeneratedBoard | null>(initialBoard);
  const [secondsLeft, setSecondsLeft] = useState(
    () => (settings?.memorizeMinutes ?? 15) * 60,
  );

  const [questions, setQuestions] = useState<Poem[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackKind>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [confirmStartedAt, setConfirmStartedAt] = useState<number | null>(null);
  const [confirmSeconds, setConfirmSeconds] = useState(0);
  const [answering, setAnswering] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 960,
  );

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!settings) {
      navigate("/practice/start", { replace: true });
    }
  }, [settings, navigate]);

  useEffect(() => {
    if (phase !== "memorize" || secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, secondsLeft]);

  useEffect(() => {
    if (phase === "memorize" && secondsLeft === 0 && board) {
      beginConfirm(board);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, phase]);

  const beginConfirm = useCallback((b: GeneratedBoard) => {
    const poems = allBoardCards(b).map((c) => c.poem);
    const qs = buildQuestionList(
      poems,
      fudalist,
      b.settings.confirmOrder,
    );
    setBoard(setAllFaceDown(b));
    setQuestions(qs);
    setQuestionIndex(0);
    setCorrectCount(0);
    setConfirmStartedAt(Date.now());
    setPhase("confirm");
  }, []);

  const goNextQuestion = useCallback(() => {
    setQuestionIndex((i) => (questions.length ? (i + 1) % questions.length : 0));
    setFeedback(null);
    setFeedbackMessage("");
    setAnswering(false);
  }, [questions.length]);

  const handleAnswer = useCallback(
    (tapped: BoardCard | "none") => {
      if (!board || phase !== "confirm" || answering) return;
      const q = questions[questionIndex];
      if (!q) return;

      setAnswering(true);
      const result = evaluateAnswer(board, q, tapped);
      const newCorrect = result.correct ? correctCount + 1 : correctCount;
      setBoard(result.board);
      if (result.correct) {
        setCorrectCount(newCorrect);
        beepCorrect();
        setFeedback("correct");
      } else {
        beepIncorrect();
        setFeedback("incorrect");
        setFeedbackMessage(result.message);
      }

      window.setTimeout(() => {
        const total = countOnBoard(result.board);
        const up = countFaceUp(result.board);
        if (up >= total) {
          const elapsed = confirmStartedAt
            ? Math.round((Date.now() - confirmStartedAt) / 1000)
            : 0;
          setConfirmSeconds(elapsed);
          appendResult({
            at: new Date().toISOString(),
            mode: result.board.settings.mode,
            cardCount: result.board.settings.cardCount,
            memorizeMinutes: result.board.settings.memorizeMinutes,
            questionCount: questions.length,
            correctCount: newCorrect,
            confirmSeconds: elapsed,
          });
          setPhase("result");
          setAnswering(false);
        } else {
          goNextQuestion();
        }
      }, 700);
    },
    [
      board,
      phase,
      answering,
      questions,
      questionIndex,
      correctCount,
      confirmStartedAt,
      goNextQuestion,
    ],
  );

  if (!settings || !board) {
    return (
      <p className="app-placeholder">
        設定がありません。
        <Link to="/practice/start">スタート画面へ</Link>
      </p>
    );
  }

  const fudaWidth = fudaDisplayWidth(settings.cardCount, viewportWidth);
  const currentQuestion = questions[questionIndex];
  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;

  if (phase === "result") {
    const rate = questions.length
      ? Math.round((correctCount / questions.length) * 100)
      : 0;
    return (
      <section className="app-card">
        <h2>結果</h2>
        <p>
          正答率: {correctCount} / {questions.length}（{rate}%）
        </p>
        <p>確認モード: {confirmSeconds} 秒</p>
        <div className="app-nav">
          <Link to="/practice/start" className="app-button">
            もう一度
          </Link>
          <Link to="/" className="app-button secondary">
            トップへ
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="practice-main">
      <div className="practice-toolbar app-card">
        {phase === "memorize" && (
          <>
            <span className="timer">
              残り {mm}:{ss.toString().padStart(2, "0")}
            </span>
            <button
              type="button"
              className="app-button"
              onClick={() => beginConfirm(board)}
            >
              完了
            </button>
          </>
        )}
        {phase === "confirm" && currentQuestion && (
          <>
            <div className="confirm-prompt">
              <span className="confirm-label">決まり字</span>
              <strong className="confirm-kimariji">{currentQuestion.kimariji}</strong>
            </div>
            <button
              type="button"
              className="app-button secondary"
              disabled={answering}
              onClick={() => handleAnswer("none")}
            >
              なし
            </button>
            {feedback && (
              <span
                className={`feedback feedback--${feedback}`}
                role="status"
              >
                {feedback === "correct" ? "⭕️" : "❌"}
                {feedbackMessage && ` ${feedbackMessage}`}
              </span>
            )}
          </>
        )}
        <Link to="/practice/start" className="app-button secondary">
          中止
        </Link>
      </div>

      <Board
        opponent={board.opponent}
        self={board.self}
        mode={settings.mode}
        fudaWidth={fudaWidth}
        interactive={phase === "confirm"}
        onCardClick={(card) => handleAnswer(card)}
      />

      <p className="practice-meta app-placeholder">
        {modeLabel(settings.mode)} / {settings.cardCount}枚
        {phase === "confirm" &&
          ` / 表 ${countFaceUp(board)} / ${countOnBoard(board)}`}
      </p>
    </div>
  );
}
