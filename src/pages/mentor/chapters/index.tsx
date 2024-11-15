import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getChapter } from '../../../redux/slices/mentorSlice';
import { RootState } from '../../../redux/store';
import Loader from '../../../components/molecule/loader/Loder';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const Chapters = () => {
    const { courseId, chapterId } = useParams<{ courseId: string; chapterId: string }>();
    const dispatch = useDispatch();
    const { chapter, loading: isLoading, error } = useSelector((state: RootState) => state.mentor.chapterData);
    const navigate = useNavigate();

    useEffect(() => {
        if (courseId && chapterId) {
            const authToken = sessionStorage.getItem('authToken');
            if (authToken) {
                dispatch(getChapter({ courseId, chapterId, authToken }) as any);
            }
        }
    }, [courseId, chapterId, dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(`Error: ${error}`);
        }
    }, [error]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader />
            </div>
        );
    }

    const handleBack = () => {
        navigate(`/course-details/${courseId}`);
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <ToastContainer />
            <button
                onClick={handleBack}
                className="flex items-center gap-2 text-primary hover:text-orange-500 mb-6 transition-all">
                <FaArrowLeft className="text-lg" />
                <span>Back to Course</span>
            </button>
            {chapter?.title ? (
                <>
                    <h1 className="text-3xl font-bold mb-4 text-gray-800">{chapter?.title}</h1>
                    <div
                        className="text-lg text-gray-600 leading-relaxed ql-editor"
                        dangerouslySetInnerHTML={{ __html: chapter?.content }}
                    />
                </>
            ) : (
                <div>No chapter found.</div>
            )}
        </div>
    );
};

export default Chapters;
