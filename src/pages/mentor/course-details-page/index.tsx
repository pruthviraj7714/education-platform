import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Tabs } from "antd";
import { FaArrowLeft } from "react-icons/fa";
import { BiLoader } from "react-icons/bi";
import {
  fetchCourseById,
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
  _id?: string;
  chapterNumber: number;
  content: string;
  createdAt: Date;
  creatorId: string;
  isFree: boolean;
  isPublished: boolean;
  title: string;
  updatedAt: Date;
  courseId: string;
}

const CourseDetailsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const authToken = sessionStorage.getItem("authToken");
  const [searchParams] = useSearchParams();
  const activeTabKey = searchParams.get("activeTab");

  const {
    chapters: initialChapters,
    loading,
    error,
  } = useSelector((state: RootState) => state.mentor);
  const { user } = useSelector((state: RootState) => state.auth);

  const isCreator = useMemo(() => {
    return user?.roles?.includes("creator");
  }, []);

  const [currentCourse, setCurrentCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const {
    error: quizError,
    handleDeleteQuiz,
    isLoading: quizLoading,
    quiz,
    handleUpdateQuiz,
  } = useQuiz(courseId as string);

  const updateContentList = (newContentOrder: string[]) => {
    setCurrentCourse((prevCourse : any) => ({
      ...prevCourse,
      contentOrder: newContentOrder
    }));
  };

  useEffect(() => {
    if (user?.roles?.includes("creator")) {
      dispatch(
        fetchCourseById({
          courseId: courseId as string,
        })
      ).then((res) => setCurrentCourse(res.payload));
    }
  }, [user, dispatch, authToken]);


  useEffect(() => {
    if (authToken && courseId) {
      dispatch(getCourseChapter({ courseId, authToken }));
    }
  }, [dispatch, courseId]);

  useEffect(() => {
    if (Array.isArray(initialChapters)) {
      //@ts-ignore
      const formattedChapters: Chapter[] = initialChapters.map(
        //@ts-ignore
        (chapter: Chapter) => ({
          title: chapter?.title || "",
          content: chapter?.content || "",
          _id: chapter?._id,
          isFree: chapter?.isFree as boolean,
          isPublished: chapter.isPublished as boolean,
        })
      );
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

  const handleGoBack = () => {
    const dashboardRoute = isCreator ? "/dashboard" : "/learner/dashboard";
    navigate(dashboardRoute);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-all"
        >
          <FaArrowLeft className="text-lg" />
          <span>Go Back</span>
        </button>

        <Tabs
          className="px-[62px]"
          defaultActiveKey={activeTabKey ? activeTabKey : "1"}
          style={{ width: "100%" }}
        >
          {isCreator && (
            <TabPane tab="Details" key="1">
              <DetailsTab course={currentCourse} authToken={authToken || ""} />
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
                loading={quizLoading}
                error={quizError}
              />
            )}
          </TabPane>
          {isCreator && (
            <TabPane tab="Order" key="4">
              {courseId && (
                <ContentList
                  chapters={chapters}
                  courseId={courseId}
                  quizes={quiz}
                  prevOrder={
                    //@ts-ignore
                    currentCourse?.contentOrder ?? []
                  }
                  onUpdateContentList={updateContentList}
                />
              )}
            </TabPane>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
