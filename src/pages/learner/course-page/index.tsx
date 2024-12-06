import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getChapter,
  getCourseChapter,
} from "../../../redux/slices/mentorSlice";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2Icon,
  Menu,
} from "lucide-react";
import { getQuiz, submitQuiz } from "../../../redux/slices/quizSlice";
import { Button } from "antd";
import { FaQuestionCircle } from "react-icons/fa";

interface Chapter {
  _id: string;
  title: string;
  content: string;
  type: "CHAPTER";
}

interface Solution {
  solution: string;
  options: string[];
}

interface Question {
  _id: string;
  content: string;
  questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT";
  explanation: string;
  solution: Solution;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  type: "QUIZ";
  questions: Question[];
}

interface QuizState {
  submitted: boolean;
  totalMarks: number | null;
  selectedAnswers: Record<string, string | string[]>;
  showExplanations: boolean;
}

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const authToken = sessionStorage.getItem("authToken") || "";
  const { enrolledCourses } = useSelector((state: RootState) => state.enroll);
  const { chapter, loading: chapterLoading } = useSelector(
    (state: RootState) => state.mentor.chapterData
  );
  const {
    quiz,
    questions,
    loading: quizLoading,
  } = useSelector((state: RootState) => state.quiz);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [currentCourse, setCurrentCourse] = useState<any>(null);
  const [orderedContent, setOrderedContent] = useState<(Chapter | Quiz)[]>([]);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [quizState, setQuizState] = useState<QuizState>({
    submitted: false,
    totalMarks: null,
    selectedAnswers: {},
    showExplanations: false,
  });

  useEffect(() => {
    if (!courseId || !authToken) return;
    dispatch(getCourseChapter({ courseId, authToken }));
  }, [courseId, authToken, dispatch]);

  useEffect(() => {
    if (!enrolledCourses?.length || !courseId) return;

    const course = enrolledCourses.find((c) => c._id === courseId);
    if (!course) return;

    setCurrentCourse(course);

    const initialContent = [
      //@ts-ignore
      ...(course?.chapterIds?.map((id) => ({
        _id: id,
        title: "",
        content: "",
        type: "CHAPTER" as const,
      })) || []),
      //@ts-ignore
      ...(course?.quizIds?.map((id) => ({
        _id: id,
        title: "",
        description: "",
        type: "QUIZ" as const,
        questions: [],
      })) || []),
    ];

    //@ts-ignore
    const ordered = course?.contentOrder
      .map((id: string) => initialContent.find((item) => item._id === id))
      .filter((item: Chapter | Quiz) => Boolean(item));

    setOrderedContent(ordered);
  }, [enrolledCourses, courseId]);

  useEffect(() => {
    const currentContent = orderedContent[currentContentIndex];
    if (!currentContent || !courseId || !authToken) return;

    if (currentContent.type === "CHAPTER") {
      dispatch(
        getChapter({ courseId, chapterId: currentContent._id, authToken })
      );
    } else {
      dispatch(getQuiz(courseId));
    }
  }, [currentContentIndex, orderedContent, courseId, authToken, dispatch]);

  const handleQuizSubmit = async () => {
    if (!courseId || !quiz) return;

    const formattedAnswers = Object.keys(quizState.selectedAnswers).map(
      (questionId) => {
        const answer = quizState.selectedAnswers[questionId];
        const questionType = questions.find(
          (q) => q._id === questionId
        )?.questionType;

        return {
          questionId,
          answer:
            questionType === "SINGLE_CHOICE"
              ? answer
              : Array.isArray(answer)
                ? answer
                : [answer],
        };
      }
    );

    try {
      const response = await dispatch(
        submitQuiz({
          courseId: courseId,
          //@ts-ignore
          quizId: quiz[currentQuizIndex]._id,
          answers: formattedAnswers,
        })
      );

      if (response.payload) {
        const submissions = response?.payload?.submissions;
        const marks = submissions?.reduce(
          (acc: number, submission: { isCorrect: boolean }) => {
            return acc + (submission.isCorrect ? 5 : 0);
          },
          0
        );

        setQuizState((prev) => ({
          ...prev,
          submitted: true,
          totalMarks: marks,
          showExplanations: true,
        }));
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };
  const handleAnswerSelect = (
    questionId: string,
    answer: string | string[]
  ) => {
    setQuizState((prev) => ({
      ...prev,
      selectedAnswers: {
        ...prev.selectedAnswers,
        [questionId]: answer,
      },
    }));
  };
  const handleNavigation = (direction: "next" | "prev") => {
    setCurrentContentIndex((prev) => {
      const newIndex =
        direction === "next"
          ? Math.min(prev + 1, orderedContent.length - 1)
          : Math.max(prev - 1, 0);

      const currentContent = orderedContent[prev];
      const nextContent = orderedContent[newIndex];

      if (currentContent?.type === "QUIZ" && nextContent?.type !== "QUIZ") {
        setQuizState({
          submitted: false,
          totalMarks: null,
          selectedAnswers: {},
          showExplanations: false,
        });
      }

      if (direction === "next" && nextContent?.type === "QUIZ") {
        setCurrentQuizIndex((prevIndex) =>
          Math.min(prevIndex + 1, (quiz || []).length - 1)
        );
      } else if (direction === "prev" && currentContent?.type === "QUIZ") {
        setCurrentQuizIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      }

      return newIndex;
    });
  };

  const renderQuizQuestion = (question: Question) => {
    const selectedAnswer = quizState.selectedAnswers[question?._id];
    const isCorrect =
      quizState.submitted &&
      (Array.isArray(selectedAnswer)
        ? selectedAnswer.includes(question?.solution.solution)
        : selectedAnswer === question?.solution.solution);

    if (!question) return null;
    return (
      <div
        key={question._id}
        className={`p-4 border rounded-lg space-y-4 ${
          quizState.submitted
            ? isCorrect
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
            : ""
        }`}
      >
        <p className="font-medium">{question?.content}</p>

        {question.questionType === "SINGLE_CHOICE" && (
          <div className="space-y-2">
            {question.solution.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={question._id}
                  value={option}
                  checked={quizState.selectedAnswers[question._id] === option}
                  onChange={() => handleAnswerSelect(question._id, option)}
                  disabled={quizState.submitted}
                  className="w-4 h-4"
                />
                <label
                  className={`${
                    quizState.submitted && option === question.solution.solution
                      ? "text-green-600 font-medium"
                      : ""
                  }`}
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        )}

        {quizState.submitted && quizState.showExplanations && (
          <div className="mt-2 p-3 bg-gray-50 rounded border">
            <p className="font-medium text-sm">
              {isCorrect ? "✓ Correct" : "✗ Incorrect"}
            </p>
            <p className="text-sm mt-1 text-gray-600">{question.explanation}</p>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    const currentContent = orderedContent[currentContentIndex];

    if (!currentContent) {
      return <div>No content available</div>;
    }

    if (currentContent.type === "CHAPTER") {
      return chapterLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2Icon className="animate-spin w-8 h-8" />
        </div>
      ) : (
        <div
          className="prose prose-stone dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: chapter?.content || "" }}
        />
      );
    }

    return quizLoading ? (
      <div className="flex items-center justify-center h-full">
        <Loader2Icon className="animate-spin w-8 h-8" />
      </div>
    ) : (
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold">
            {quiz[currentQuizIndex]?.title}
          </h2>
          <p className="text-gray-600 mt-2">
            {quiz[currentQuizIndex]?.description}
          </p>
        </div>

        <div className="space-y-6">
          {renderQuizQuestion(questions[currentQuizIndex] as any)}
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          {!quizState.submitted ? (
            <Button
              onClick={handleQuizSubmit}
              disabled={Object.keys(quizState.selectedAnswers).length === 0}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Submit Quiz
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-100 dark:bg-green-600 rounded">
                <p className="font-bold">
                  Your Score: {quizState.totalMarks} / {questions.length * 5}
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
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-10 h-screen bg-gradient-to-br from-neutral-200 to-neutral-300 text-black shadow-xl transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-72" : "w-0 sm:w-16 lg:w-20"
        } overflow-hidden`}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-4 rounded-full hover:bg-neutral-200 transition-colors duration-200"
        >
          <Menu className="w-6 h-6 text-orange-300" />
          <span className="sr-only">Toggle sidebar</span>
        </button>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-neutral-300">
            <h2 className="font-bold text-xl truncate transition-all duration-300">
              {sidebarOpen ? currentCourse?.title : ""}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            {orderedContent.map((item, index) => (
              <button
                key={item._id}
                className={`w-full text-left px-6 py-3 flex items-center gap-4 transition-all duration-200 ${
                  currentContentIndex === index
                    ? "bg-white bg-opacity-20 border-l-4 border-yellow-400"
                    : "hover:bg-white hover:bg-opacity-10"
                }`}
                onClick={() => {
                  item.type === "QUIZ" &&
                    index > currentQuizIndex &&
                    setCurrentQuizIndex((prev) => prev + 1);
                  item.type === "QUIZ" &&
                    index < currentQuizIndex &&
                    setCurrentQuizIndex((prev) => prev - 1);
                  setCurrentContentIndex(index);
                }}
              >
                {item.type === "CHAPTER" ? (
                  <BookOpen className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <FaQuestionCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <span
                  className={`truncate transition-all duration-200 ${
                    sidebarOpen
                      ? "opacity-100"
                      : "opacity-0 sm:opacity-100 lg:group-hover:opacity-100"
                  }`}
                >
                  {item?.title || `${item.type} ${index + 1}`}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 "
            >
              <Menu className="w-6 h-6 text-gray-600" />
              <span className="sr-only">Toggle sidebar</span>
            </button>

            <h1 className="text-lg sm:text-2xl font-semibold text-gray-800 truncate">
              {chapterLoading
                ? null
                : chapter?.title ||
                  `${orderedContent[currentContentIndex]?.type || ""} ${
                    currentContentIndex + 1
                  }`}
            </h1>

            <div className="flex gap-2">
              <button
                onClick={() => handleNavigation("prev")}
                disabled={currentContentIndex === 0}
                className={`p-2 rounded-full ${
                  currentContentIndex === 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-200"
                } transition-colors duration-200`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleNavigation("next")}
                disabled={currentContentIndex === orderedContent.length - 1}
                className={`p-2 rounded-full ${
                  currentContentIndex === orderedContent.length - 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-200"
                } transition-colors duration-200`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100">
          <span className="!text-red-400 !text-sm mb-3">
            This content is copyrighted and sharing the content is illegal and a
            punishable offence. Any violation is a punishable offense and would
            result in a complaint with the Cyber Security Cell. These show up in
            Background Checks.
          </span>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
