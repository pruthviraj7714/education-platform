import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../../components/molecule/loader/Loder";
import { FiArrowRight, FiTrash2, FiEdit2 } from "react-icons/fi";
import { Modal, Input } from "antd";
import { IoMdAdd } from "react-icons/io";
import Button from "../../../components/atoms/button";

interface QuizListProps {
  courseId: string;
  quiz: any;
  deleteQuiz: (quizId: string) => void;
  updateQuiz: (
    quizId: string,
    updatedData: { title: string; description: string }
  ) => void;
  loading: boolean;
  error: any;
}

const QuizList = ({
  courseId,
  quiz,
  deleteQuiz,
  updateQuiz,
  loading,
  error,
}: QuizListProps) => {
  const navigate = useNavigate();
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [quizToEdit, setQuizToEdit] = useState<{
    id: string;
    title: string;
    description: string;
  } | null>(null);

  const handleQuizClick = (quizId: string) => {
    navigate(`/quiz/${courseId}/${quizId}`);
  };

  const showDeleteConfirm = (quizId: string) => {
    setQuizToDelete(quizId);
    setDeleteVisible(true);
  };

  const handleDeleteQuiz = () => {
    if (quizToDelete) {
      deleteQuiz(quizToDelete);
      setQuizToDelete(null);
      setDeleteVisible(false);
    }
  };

  const handleUpdateQuiz = () => {
    if (quizToEdit) {
      updateQuiz(quizToEdit.id, {
        title: quizToEdit.title,
        description: quizToEdit.description,
      });
      setEditVisible(false);
      setQuizToEdit(null);
    }
  };

  const handleEditQuiz = (quizId: string) => {
    navigate(`/quiz-builder/${courseId}?isEditing=true&quizId=${quizId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center p-3">
        <h1 className="text-[20px] leading-[28px] font-semibold text-[#191919]">
          Quizzes
        </h1>
        <Button
          onClick={() => navigate(`/quiz-builder/${courseId}`)}
          className="flex items-center gap-2"
          variant="outlined"
        >
          <IoMdAdd /> Add Quiz
        </Button>
      </div>
      <div>
        {error && <p className="text-center text-red-500">Error: {error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {quiz.map((q: any) => (
            <div
              key={q._id}
              className="bg-white rounded-lg border shadow-md p-4 cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg flex flex-col justify-between relative"
            >
              <div onClick={() => handleQuizClick(q._id)}>
                <h3 className="text-xl font-bold mb-2">{q.title}</h3>
                <p className="text-gray-700">{q.description}</p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div
                  className="flex items-center text-[#ff9500] cursor-pointer"
                  onClick={() => handleQuizClick(q._id)}
                >
                  <span className="mr-2 text-lg font-semibold">Take Quiz</span>
                  <FiArrowRight size={24} />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <FiEdit2
                    size={20}
                    className="text-primary cursor-pointer"
                    onClick={() => handleEditQuiz(q._id)}
                  />
                  <FiTrash2
                    size={20}
                    className="text-primary cursor-pointer"
                    onClick={() => showDeleteConfirm(q._id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        title="Delete Quiz"
        visible={deleteVisible}
        onOk={handleDeleteQuiz}
        onCancel={() => setDeleteVisible(false)}
        okText="Delete"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this quiz?</p>
      </Modal>

      <Modal
        title="Edit Quiz"
        visible={editVisible}
        onOk={handleUpdateQuiz}
        onCancel={() => setEditVisible(false)}
        okText="Update"
        cancelText="Cancel"
      >
        <label className="block text-gray-700 font-semibold">Quiz Title</label>
        <Input
          placeholder="Quiz Title"
          value={quizToEdit?.title || ""}
          onChange={(e) =>
            setQuizToEdit((prev) =>
              prev ? { ...prev, title: e.target.value } : prev
            )
          }
        />
        <label className="block text-gray-700 font-semibold">
          Quiz Description
        </label>
        <Input.TextArea
          placeholder="Quiz Description"
          value={quizToEdit?.description || ""}
          onChange={(e) =>
            setQuizToEdit((prev) =>
              prev ? { ...prev, description: e.target.value } : prev
            )
          }
          rows={4}
        />
      </Modal>
    </div>
  );
};

export default QuizList;
