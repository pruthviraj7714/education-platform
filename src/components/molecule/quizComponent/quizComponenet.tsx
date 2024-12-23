import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { FaQuestionCircle } from "react-icons/fa";
import { Button } from "antd";

interface Question {
  _id: string;
  content: string;
  questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT";
  explanation: string;
  solution: {
    solution: string;
    options: string[];
  };
}

interface QuizProps {
  questions: Question[];
  onSubmit: (answers: { questionId: string; answer: string | string[] }[]) => Promise<{
    submissions: { isCorrect: boolean }[];
  }>;
  onQuizComplete?: () => void;
}

interface QuizState {
  currentQuestionIndex: number;
  answers: Record<string, string | string[]>;
  isSubmitted: boolean;
  score: number | null;
  showExplanations: boolean;
}

const QuizComponent = ({ questions, onSubmit, onQuizComplete }: QuizProps) => {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    isSubmitted: false,
    score: null,
    showExplanations: false,
  });

  console.log(questions);

  const currentQuestion = questions[quizState.currentQuestionIndex];

  const handleAnswerSelect = (answer: string | string[]) => {
    setQuizState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion._id]: answer,
      },
    }));
  };

  const navigateQuestion = (direction: "next" | "prev") => {
    setQuizState((prev) => ({
      ...prev,
      currentQuestionIndex:
        direction === "next"
          ? Math.min(prev.currentQuestionIndex + 1, questions.length - 1)
          : Math.max(prev.currentQuestionIndex - 1, 0),
    }));
  };

  const handleQuizSubmit = async () => {
    const formattedAnswers = Object.entries(quizState.answers).map(([questionId, answer]) => ({
      questionId,
      answer: Array.isArray(answer) ? answer : answer,
    }));

    try {
      const result = await onSubmit(formattedAnswers);
      
      
      const totalScore = result.submissions.reduce(
        (acc, submission) => acc + (submission.isCorrect ? 5 : 0),
        0
      );

      setQuizState((prev) => ({
        ...prev,
        isSubmitted: true,
        score: totalScore,
        showExplanations: true,
      }));

      onQuizComplete?.();
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  const isAnswerCorrect = (questionId: string) => {
    if (!quizState.isSubmitted) return null;
    const answer = quizState.answers[questionId];
    const question = questions.find((q) => q._id === questionId);
    return Array.isArray(answer)
      ? answer.includes(question?.solution.solution || "")
      : answer === question?.solution.solution;
  };

  const renderQuestion = (question: Question) => {
    const isCorrect = isAnswerCorrect(question._id);

    return (
      <div
        className={`p-6 border rounded-lg space-y-4 ${
          quizState.isSubmitted
            ? isCorrect
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
            : "bg-white"
        }`}
      >
        <div className="flex items-center gap-2">
          <FaQuestionCircle className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-medium">{question.content}</h3>
        </div>

        <div className="space-y-3">
          {question.solution.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                ${
                  quizState.answers[question._id] === option
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }
                ${
                  quizState.isSubmitted && option === question.solution.solution
                    ? "border-green-500 bg-green-50"
                    : ""
                }
              `}
            >
              <input
                type="radio"
                name={question._id}
                value={option}
                checked={quizState.answers[question._id] === option}
                onChange={() => handleAnswerSelect(option)}
                disabled={quizState.isSubmitted}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-3">{option}</span>
            </label>
          ))}
        </div>

        {quizState.showExplanations && quizState.isSubmitted && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-medium text-sm mb-2">
              {isCorrect ? "✓ Correct" : "✗ Incorrect"}
            </p>
            <p className="text-sm text-gray-600">{question.explanation}</p>
          </div>
        )}
      </div>
    );
  };

  const renderQuizNavigation = () => (
    <div className="flex justify-between items-center mt-6 pt-4 border-t">
      <div className="flex gap-2">
        <Button
          onClick={() => navigateQuestion("prev")}
          disabled={quizState.currentQuestionIndex === 0}
        >
          Previous
        </Button>
        <Button
          onClick={() => navigateQuestion("next")}
          disabled={quizState.currentQuestionIndex === questions.length - 1}
        >
          Next
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {!quizState.isSubmitted ? (
          <Button
            onClick={handleQuizSubmit}
            disabled={Object.keys(quizState.answers).length < questions.length}
          >
            Submit Quiz
          </Button>
        ) : (
          <>
            <div className="p-4 bg-green-100 rounded-lg">
              <p className="font-bold">
                Score: {quizState.score} / {questions.length * 5}
              </p>
            </div>
            <Button
              onClick={() =>
                setQuizState((prev) => ({
                  ...prev,
                  showExplanations: !prev.showExplanations,
                }))
              }
            >
              {quizState.showExplanations ? "Hide" : "Show"} Explanations
            </Button>
          </>
        )}
      </div>
    </div>
  );

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-7">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-bold">Question {quizState.currentQuestionIndex + 1} of {questions.length}</h2>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {currentQuestion.questionType}
        </span>
      </div>

      {renderQuestion(currentQuestion)}
      {renderQuizNavigation()}

      <div className="mt-4 text-sm text-gray-500">
        Progress: {Object.keys(quizState.answers).length} of {questions.length} questions answered
      </div>
    </div>
  );
};

export default QuizComponent;