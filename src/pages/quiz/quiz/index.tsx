import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { getQuizById, submitQuiz } from '../../../redux/slices/quizSlice';
import { AppDispatch } from '../../../redux/store';
import Loader from '../../../components/molecule/loader/Loder';
import { FaQuestionCircle, FaCheckCircle, FaArrowLeft, FaTrophy, FaEdit, FaTimes } from 'react-icons/fa';
import Button from '../../../components/atoms/button';
import { Modal, Input, Radio } from 'antd';
import axios from 'axios';
const mentorApiUrl = import.meta.env.VITE_MENTOR_API_URL;

type Props = {};

function QuizDetail({ }: Props) {
    const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { loading, error, quiz, questions } = useSelector((state: RootState) => state.quiz);

    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string | string[] }>({});
    const [totalMarks, setTotalMarks] = useState<number | null>(null);
    const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editQuestion, setEditQuestion] = useState<any>(null);

    useEffect(() => {
        if (courseId && quizId) {
            dispatch(getQuizById({ courseId, quizId }));
        }
    }, [courseId, quizId, dispatch]);

    const handleOptionChange = (questionId: string, option: string) => {
        setSelectedAnswers((prevAnswers) => {
            const currentAnswer = prevAnswers[questionId];
            const questionType = questions.find(q => q._id === questionId)?.questionType;

            if (questionType === 'SINGLE_CHOICE') {
                return {
                    ...prevAnswers,
                    [questionId]: option,
                };
            } else {
                const isChecked = Array.isArray(currentAnswer) && currentAnswer.includes(option);
                return {
                    ...prevAnswers,
                    [questionId]: isChecked
                        ? (currentAnswer as string[]).filter((ans) => ans !== option)
                        : [...(currentAnswer as string[] || []), option],
                };
            }
        });
    };

    const handleSubmit = async () => {
        const formattedAnswers = Object.keys(selectedAnswers).map((questionId) => {
            const answer = selectedAnswers[questionId];
            const questionType = questions.find(q => q._id === questionId)?.questionType;

            return {
                questionId,
                answer: questionType === 'SINGLE_CHOICE' ? answer : Array.isArray(answer) ? answer : [answer],
            };
        });

        const response = await dispatch(submitQuiz({
            courseId: courseId!,
            quizId: quizId!,
            answers: formattedAnswers,
        }));

        if (response.payload) {
            const submissions = response?.payload?.submissions;
            const marks = submissions.reduce((acc: number, submission: { isCorrect: boolean }) => {
                return acc + (submission.isCorrect ? 5 : 0);
            }, 0);

            setTotalMarks(marks);
            setQuizSubmitted(true);
        }
    };

    const handleEditClick = (question: any) => {
        setEditQuestion(question);
        setIsModalVisible(true);
    };

    const editQuestionApi = async (courseId: string, quizId: string, updatedQuestion: any) => {
        const authToken = sessionStorage.getItem('authToken');

        try {
            const response = await axios.put(
                `${mentorApiUrl}/quiz/${courseId}/${quizId}`,

                {
                    questions: [
                        {
                            questionId: updatedQuestion._id,
                            questionType: updatedQuestion.questionType,
                            content: updatedQuestion.content,
                            solution: updatedQuestion.solution,
                        }
                    ]
                },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error updating question:", error);
            throw error;
        }
    };

    const handleModalOk = async () => {
        if (editQuestion && courseId && quizId) {
            try {
                const updatedData = await editQuestionApi(courseId, quizId, editQuestion);
                console.log("Updated question data from API:", updatedData);

                setIsModalVisible(false);
                setEditQuestion(null);
                dispatch(getQuizById({ courseId, quizId }));
            } catch (error) {
                console.error("Failed to update question", error);
            }
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setEditQuestion(null);
    };

    const handleInputChange = (field: string, value: any) => {
        setEditQuestion((prev: any) => {
            if (field === 'textAnswer' && prev.questionType === 'TEXT') {
                return {
                    ...prev,
                    solution: {
                        ...prev.solution,
                        solution: value,
                    },
                };
            } else {
                return {
                    ...prev,
                    [field]: value,
                };
            }
        });
    };

    const handleOptionsChange = (index: number, value: string) => {
        const updatedOptions = [...editQuestion.solution.options];
        updatedOptions[index] = value;
        setEditQuestion((prev: any) => ({
            ...prev,
            solution: { ...prev.solution, options: updatedOptions },
        }));
    };

    if (loading) return <div className='flex justify-center items-center h-[70vh]'><Loader /></div>;
    if (error) return <div className='text-red-500 text-center'>Error: {error}</div>;

    const handleAddOption = () => {
        setEditQuestion((prev: any) => ({
            ...prev,
            solution: {
                ...prev.solution,
                options: [...(prev.solution.options || []), ''],
            },
        }));
    };

    const handleSolutionChange = (option: string) => {
        setEditQuestion((prev: any) => {
            const updatedSolution =
                prev.questionType === 'MULTIPLE_CHOICE'
                    ? Array.isArray(prev.solution.solution)
                        ? prev.solution.solution.includes(option)
                            ? prev.solution.solution.filter((opt: string) => opt !== option)
                            : [...prev.solution.solution, option]
                        : [option]
                    : option;

            return {
                ...prev,
                solution: {
                    ...prev.solution,
                    solution: updatedSolution,
                },
            };
        });
    };

    const handleRemoveOption = (index: number) => {
        setEditQuestion((prev: any) => {
            const updatedOptions = prev.solution.options.filter((_: any, i: number) => i !== index);
            return {
                ...prev,
                solution: {
                    ...prev.solution,
                    options: updatedOptions,
                },
            };
        });
    };


    return (
        <div className="mx-[80px] my-[30px] p-6 bg-white rounded-lg shadow-md border">
            <button
                onClick={() => navigate(`/course-details/${courseId}`)}
                className="flex items-center gap-2 text-primary hover:text-orange-500 mb-6 transition-all">
                <FaArrowLeft className="text-lg" />
                <span>Go Back</span>
            </button>
            {quiz.length > 0 ? (
                <>
                    <h1 className="text-2xl font-bold mb-4">{quiz[0]?.title}</h1>
                    <p className="text-gray-700 mb-6">{quiz[0]?.description}</p>

                    {quizSubmitted ? (
                        <div className="mt-6 text-lg font-semibold text-primary">
                            Total Marks: {totalMarks}
                            <p className="mt-2 flex items-center">
                                {totalMarks !== null && totalMarks > 0 ? "Well done!" : "Try again!"}
                                <FaTrophy className="text-primary ml-2" />
                            </p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold mb-2">
                                <FaQuestionCircle className="inline mr-2 text-primary" />
                                Questions:
                            </h2>
                            <ul className="space-y-4">
                                {questions?.map((question) => (
                                    <li key={question._id} className="p-4 border rounded-lg border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <p className="text-lg font-medium">{question?.content}</p>
                                            <FaEdit
                                                className="text-primary cursor-pointer"
                                                onClick={() => handleEditClick(question)}
                                            />
                                        </div>
                                        <ul className="mt-2 space-y-2">
                                            {question.questionType === 'TEXT' ? (
                                                <Input
                                                    placeholder="Answer"
                                                    value={selectedAnswers[question._id] as string || ''}
                                                    onChange={(e) => handleOptionChange(question._id, e.target.value)}
                                                />
                                            ) : (
                                                question?.solution?.options?.map((option) => (
                                                    <li key={option} className="flex items-center">
                                                        <label className="flex items-center cursor-pointer">
                                                            <input
                                                                type={question.questionType === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                                                                checked={Array.isArray(selectedAnswers[question._id])
                                                                    ? selectedAnswers[question._id]?.includes(option)
                                                                    : selectedAnswers[question._id] === option}
                                                                onChange={() => handleOptionChange(question._id, option)}
                                                                className="form-checkbox h-5 w-5 text-primary rounded"
                                                            />
                                                            <span className="ml-2 text-gray-600">{option}</span>
                                                            {Array.isArray(selectedAnswers[question._id]) &&
                                                                selectedAnswers[question._id]?.includes(option) && (
                                                                    <FaCheckCircle className="ml-2 text-green-500" />
                                                                )}
                                                        </label>
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                            <div className='mt-4 flex justify-end items-center'>
                                <Button onClick={handleSubmit}>
                                    Submit Answers
                                </Button>
                            </div>
                        </>
                    )}
                </>
            ) : (
                <p className="text-center text-gray-500">No quiz data available.</p>
            )}

            <Modal
                title="Edit Question"
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                <Input
                    placeholder="Question Content"
                    value={editQuestion?.content || ''}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    className="mb-4"
                />
                <Radio.Group
                    value={editQuestion?.questionType}
                    onChange={(e) => handleInputChange('questionType', e.target.value)}
                    className="mb-4"
                >
                    <Radio value="SINGLE_CHOICE">Single Choice</Radio>
                    <Radio value="MULTIPLE_CHOICE">Multiple Choice</Radio>
                    <Radio value="TEXT">Text</Radio>
                </Radio.Group>

                {editQuestion?.questionType !== 'TEXT' && (
                    <>
                        {editQuestion?.solution?.options?.map((option: string, index: number) => (
                            <div key={index} className="mb-2 flex items-center">
                                {editQuestion?.questionType === 'MULTIPLE_CHOICE' && (
                                    <FaTimes
                                        className="mr-2 cursor-pointer text-red-600 text-lg"
                                        onClick={() => handleRemoveOption(index)}
                                    />
                                )}
                                <Input
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => handleOptionsChange(index, e.target.value)}
                                    className="mr-2"
                                />
                                <Radio
                                    value={option}
                                    checked={editQuestion.solution.solution === option ||
                                        (Array.isArray(editQuestion.solution.solution) && editQuestion.solution.solution.includes(option))}
                                    onChange={() => handleSolutionChange(option)}
                                />
                                <span className="ml-1 text-gray-600">Correct</span>

                            </div>
                        ))}
                        {editQuestion?.questionType === 'MULTIPLE_CHOICE' && (
                            <Button onClick={handleAddOption}>Add Option</Button>
                        )}
                    </>
                )}

                {editQuestion?.questionType === 'TEXT' && (
                    <Input
                        placeholder="Answer"
                        value={editQuestion?.solution?.solution || ''}
                        onChange={(e) => handleInputChange('textAnswer', e.target.value)}
                        className="mb-4"
                    />
                )}
            </Modal>



        </div>
    );
}

export default QuizDetail;
