import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getQuiz, deleteQuiz, updateQuiz } from '../../../redux/slices/quizSlice';
import Loader from '../../../components/molecule/loader/Loder';
import { FiArrowRight, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { AppDispatch, RootState } from '../../../redux/store';
import { Modal, Input } from 'antd';
import { IoMdAdd } from 'react-icons/io';
import Button from '../../../components/atoms/button';

interface QuizListProps {
    courseId: string;
}

const QuizList = ({ courseId }: QuizListProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { quiz, loading, error } = useSelector((state: RootState) => state.quiz);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [editVisible, setEditVisible] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
    const [quizToEdit, setQuizToEdit] = useState<{ id: string; title: string; description: string } | null>(null);

    useEffect(() => {
        if (courseId) {
            dispatch(getQuiz(courseId));
        }
    }, [dispatch, courseId]);

    const handleQuizClick = (quizId: string) => {
        navigate(`/quiz/${courseId}/${quizId}`);
    };

    const showDeleteConfirm = (quizId: string) => {
        setQuizToDelete(quizId);
        setDeleteVisible(true);
    };

    const handleDeleteQuiz = () => {
        if (quizToDelete && courseId) {
            dispatch(deleteQuiz({ courseId, quizId: quizToDelete }));
            setQuizToDelete(null);
            setDeleteVisible(false);
        } else {
            console.error('courseId or quizId is undefined');
        }
    };

    const handleCancelDelete = () => {
        setDeleteVisible(false);
        setQuizToDelete(null);
    };

    const handleUpdateQuiz = () => {
        if (quizToEdit && courseId) {
            dispatch(updateQuiz({
                courseId,
                quizId: quizToEdit.id,
                updatedData: { title: quizToEdit.title, description: quizToEdit.description }
            }));
            setEditVisible(false);
            setQuizToEdit(null);
        }
    };

    const handleEditChange = (field: string, value: string) => {
        if (quizToEdit) {
            setQuizToEdit({ ...quizToEdit, [field]: value });
        }
    };

    const handleCancelEdit = () => {
        setEditVisible(false);
        setQuizToEdit(null);
    };

    const handleEditQuiz = (quizId: string) => {
        navigate(`/quiz-builder/${courseId}?isEditing=true&quizId=${quizId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <Loader />
            </div>
        );
    }

    return (
        <div className="">
            {error && <p className="text-center text-red-500">Error: {error}</p>}
            <div className='flex justify-between items-center'>
                <h1 className="text-[20px] leading-[28px] font-semibold text-[#191919]">Quizzes</h1>
                <Button onClick={() => navigate(`/quiz-builder/${courseId}`)} className='flex items-center gap-2' variant='outlined'><IoMdAdd /> Add Quiz</Button>
            </div>
            <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                    {quiz.map((q) => (
                        <div
                            key={q._id}
                            className="bg-white rounded-lg border shadow-md p-4 cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg flex flex-col justify-between relative"
                        >
                            <div onClick={() => handleQuizClick(q._id)}>
                                <h3 className="text-xl font-bold mb-2">{q.title}</h3>
                                <p className="text-gray-700">{q.description}</p>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <div className="flex items-center text-[#ff9500] cursor-pointer" onClick={() => handleQuizClick(q._id)}>
                                    <span className="mr-2 text-lg font-semibold">Take Quiz</span>
                                    <FiArrowRight size={24} />
                                </div>
                                <div className='flex items-center justify-center gap-2'>
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
                onCancel={handleCancelDelete}
                okText="Delete"
                cancelText="Cancel"
            >
                <p>Are you sure you want to delete this quiz?</p>
            </Modal>

            <Modal
                title="Edit Quiz"
                visible={editVisible}
                onOk={handleUpdateQuiz}
                onCancel={handleCancelEdit}
                okText="Update"
                cancelText="Cancel"
            >
                <label className='block text-gray-700 font-semibold' htmlFor="">Quiz Title</label>
                <Input
                    placeholder="Quiz Title"
                    value={quizToEdit?.title || ''}
                    onChange={(e) => handleEditChange('title', e.target.value)}
                    className="mb-2"
                />
                <label className='block text-gray-700 font-semibold' htmlFor="">Quiz Description</label>
                <Input.TextArea
                    placeholder="Quiz Description"
                    value={quizToEdit?.description || ''}
                    onChange={(e) => handleEditChange('description', e.target.value)}
                    rows={4}
                />
            </Modal>
        </div>
    );
};

export default QuizList;
