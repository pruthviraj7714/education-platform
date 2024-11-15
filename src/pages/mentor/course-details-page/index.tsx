import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCourseChapter } from '../../../redux/slices/mentorSlice';
import { RootState } from '../../../redux/store';
import { useParams } from 'react-router-dom';
import ChapterList from '../../../components/molecule/chapter-list/ChapterList';
import Loader from '../../../components/molecule/loader/Loder';
import { Tabs } from 'antd';  // Import Ant Design Tabs
import Quiz from '../../../pages/quiz/quiz-dashboard';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface Chapter {
    title: string;
    content: string;
    _id?: string;
}

const { TabPane } = Tabs;

function CourseDetailsPage() {
    const dispatch = useDispatch();
    const { courseId } = useParams<{ courseId: string }>();
    const authToken = sessionStorage.getItem('authToken');
    const { chapters: initialChapters, loading, error } = useSelector((state: RootState) => state.mentor);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (authToken && courseId) {
            dispatch(getCourseChapter({ courseId, authToken }) as any);
        }
    }, [dispatch, courseId, authToken]);

    useEffect(() => {
        if (Array.isArray(initialChapters)) {
            const formattedChapters: Chapter[] = initialChapters.map(chapter => ({
                title: chapter?.title,
                content: chapter?.content,
                _id: chapter?._id,
            }));
            setChapters(formattedChapters);
        }
    }, [initialChapters]);

    return (
        <div>
            {loading && (
                <div className="flex items-center justify-center h-screen">
                    <Loader />
                </div>
            )}
            <div className='my-6 mx-[62px]'>
                <button
                    onClick={() => navigate(`/dashboard`)}
                    className="flex items-center gap-2 text-primary hover:text-orange-500 mb-6 transition-all">
                    <FaArrowLeft className="text-lg" />
                    <span>Go Back</span>
                </button>
            </div>
            {error && <p>Error: {error}</p>}
            {!loading && !error && (
                <Tabs className='px-[62px]' defaultActiveKey="1" style={{ width: '100%' }}>
                    <TabPane tab="Chapters" key="1">
                        <ChapterList chapters={chapters} setChapters={setChapters} />
                    </TabPane>
                    <TabPane tab="Quiz" key="2">
                        {courseId && <Quiz courseId={courseId} />}
                    </TabPane>
                </Tabs>
            )}
        </div>
    );
}

export default CourseDetailsPage;
