import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getQuiz, deleteQuiz, updateQuiz } from "../redux/slices/quizSlice";
import { AppDispatch, RootState } from "../redux/store";

const useQuiz = (courseId: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const { quiz, error } = useSelector((state: RootState) => state.quiz);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (courseId) {
      dispatch(getQuiz(courseId));
    }
  }, [courseId, dispatch]);

  const handleUpdateQuiz = async (quizData: any) => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      await dispatch(
        updateQuiz({
          courseId,
          quizId: quizData.id,
          updatedData: {
            title: quizData.title,
            description: quizData.description,
          },
        })
      ).unwrap();
      toast.success("Quiz updated successfully!");
    } catch (err) {
      toast.error("Failed to update quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await dispatch(deleteQuiz({ courseId, quizId })).unwrap();
      toast.success("Quiz deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete quiz");
    }
  };

  return {
    quiz,
    error,
    isLoading,
    handleUpdateQuiz,
    handleDeleteQuiz,
  };
};

export default useQuiz;
