import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs } from "antd";
import { FaArrowLeft } from "react-icons/fa";
import { BiLoader } from "react-icons/bi";
import {
  fetchCoursesByCreator,
  getCourseChapter,
} from "../../../redux/slices/mentorSlice";
import { AppDispatch, RootState } from "../../../redux/store";
import ChapterList from "../../../components/molecule/chapter-list/ChapterList";
import Quiz from "../../../pages/quiz/quiz-dashboard";
import ContentList from "../order-dashboard";
import useQuiz from "../../../hooks/usequiz";
import DetailsTab from "../course-details-page/DetailsTab";

const { TabPane } = Tabs;

interface Chapter {
  title: string;
  content: string;
  _id?: string;
}

const CourseDetailsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [currentCourse, setCurrentCourse] = useState<any>(null);
  const { courseId } = useParams<{ courseId: string }>();
  const [isCreator, setIsCreator] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const authToken = sessionStorage.getItem("authToken");

  const {
    chapters: initialChapters,
    loading,
    error,
    creatorCourses: courses,
  } = useSelector((state: RootState) => state.mentor);
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    error: quizError,
    handleDeleteQuiz,
    isLoading: quizLoding,
    quiz,
    handleUpdateQuiz,
  } = useQuiz(courseId as string);


  useEffect(() => {
    if (user && user.roles.includes("creator")) {
      setIsCreator(true);
      dispatch(fetchCoursesByCreator({ creatorId: user.userId, authToken : authToken! }));
    }
  }, [user, dispatch, authToken]);

  useEffect(() => {
    if (courses && courseId) {
      //@ts-ignore
      const course = courses.find((c) => c._id === courseId);
      if (course) {
        setCurrentCourse(course);
      }
    }
  }, [courses,courseId]);

  useEffect(() => {
    if (authToken && courseId) {
      dispatch(getCourseChapter({ courseId, authToken }) as any);
    }
  }, [dispatch,courseId]);

  useEffect(() => {
    if (Array.isArray(initialChapters)) {
      const formattedChapters: Chapter[] = initialChapters.map((chapter) => ({
        title: chapter?.title,
        content: chapter?.content,
        _id: chapter?._id,
      }));
      setChapters(formattedChapters);
    }
  }, [initialChapters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <BiLoader className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => {
            if (!isCreator) {
              navigate("/learner/dashboard");
              return;
            } else {
              navigate("/dashboard");
              return;
            }
          }}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-all"
        >
          <FaArrowLeft className="text-lg" />
          <span>Go Back</span>
        </button>

        {error && <p>Error: {error}</p>}
        <Tabs
          className="px-[62px]"
          defaultActiveKey="1"
          style={{ width: "100%" }}
        >
          {isCreator && (
            <TabPane tab="Details" key="1">
              <DetailsTab course={currentCourse} authToken={authToken!} creatorId={user?.userId!} />
            </TabPane>
          )}
          <TabPane tab="Chapters" key="2">
            <ChapterList chapters={chapters} setChapters={setChapters} />
          </TabPane>
          <TabPane tab="Quiz" key="3">
            {courseId && (
              <Quiz
                courseId={courseId}
                quiz={quiz}
                deleteQuiz={handleDeleteQuiz}
                updateQuiz={handleUpdateQuiz}
                loading={quizLoding}
                error={quizError}
              />
            )}
          </TabPane>
          <TabPane tab="Order" key="4">
            {courseId && (
              <ContentList
                chapters={chapters}
                courseId={courseId}
                quizes={quiz}
                creatorId={user?.userId!}
                prevOrder={
                  //@ts-ignore
                  courses.find((c) => c._id === courseId)?.contentOrder ?? []
                }
              />
            )}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
