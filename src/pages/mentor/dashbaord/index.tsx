import { useEffect, startTransition, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { GoPlus } from "react-icons/go";
import Button from "../../../components/atoms/button";
import CourseCard from "../../../components/molecule/course-card/CourseCard";
import Loader from "../../../components/molecule/loader/Loder";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteCourse,
  fetchCoursesByCreator,
  updateCourse,
} from "../../../redux/slices/mentorSlice";
import { AppDispatch } from "../../../redux/store";

function Index() {
  const methods = useForm();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const authToken = sessionStorage.getItem("authToken") || "";
  const creatorId = sessionStorage.getItem("userId") || "";
  const [currentPage, setCurrentPage] = useState(1);

  interface Course {
    imageUrl: string;
    _id: string;
    title: string;
    price: number;
    tags: string[];
    isFree: boolean;
    description: string;
    chapterIds: string[];
    isPublished: boolean;
    quizIds: string[];
  }

  const {
    creatorCourses: { courses : creatorCourses, totalPages: total },
    loading,
    error,
  } = useSelector((state: any) => state.mentor);

  const handleDeleteCourse = async (courseId: string) => {
    startTransition(() => {
      dispatch(
        deleteCourse({
          courseId,
          headers: { Authorization: `Bearer ${authToken}` },
        })
      ).then(() =>
        dispatch(
          fetchCoursesByCreator({ creatorId, authToken, currentPage })
        )
      );
    });
  };

  const handleEditCourse = async (courseId: string, updatedData: any) => {
    startTransition(() => {
      dispatch(
        updateCourse({
          courseId,
          courseData: updatedData,
          headers: { Authorization: `Bearer ${authToken}` },
        })
      ).then(() =>
        dispatch(
          fetchCoursesByCreator({ creatorId, authToken, currentPage })
        )
      );
    });
  };

  const handleTogglePublishStatus = async (
    courseId: string,
    currentStatus: boolean
  ) => {
    const updatedData = { isPublished: !currentStatus };
    handleEditCourse(courseId, updatedData);
  };

  const handleTogglePriceStatus = async (
    courseId: string,
    currentStatus: boolean
  ) => {
    const updatedData = { isFree: !currentStatus };
    handleEditCourse(courseId, updatedData);
  };

  useEffect(() => {
    if (creatorId && authToken) {
      startTransition(() => {
        dispatch(
          fetchCoursesByCreator({ creatorId, authToken, currentPage })
        );
      });
    }
  }, [creatorId, authToken]);

  const handleNavigateToCourseDetails = (courseId: string) => {
    navigate(`/course-details/${courseId}`);
  };

  return (
    <div className="min-h-screen">
      <div className="flex sm:flex-row flex-col justify-between items-center gap-3 px-[40px]">
        <h1 className="text-[#202224] text-[24px] leading-[40px] font-semibold">
          My Courses
        </h1>
        <Button variant="outlined" onClick={() => navigate("/create-course")}>
          <div className="flex items-center gap-1 text-sm">
            <GoPlus size={20} /> Create Course
          </div>
        </Button>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit((data) => console.log(data))}>
          <div
            className={`mt-[30px] px-[40px] max-w-7xl mx-auto gap-6 ${loading ? "flex justify-center items-center min-h-[55vh]" : "grid sm:grid-cols-3 items-center justify-center"}`}
          >
            {loading ? (
              <Loader />
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : creatorCourses?.length > 0 ? (
              creatorCourses?.map((course: Course) => (
                <CourseCard
                  key={course?._id}
                  title={course?.title}
                  tags={course?.tags}
                  chapters={course?.chapterIds?.length}
                  quizes={course?.quizIds?.length}
                  price={course?.price}
                  imageUrl={course?.imageUrl}
                  description={course?.description}
                  isPublished={course?.isPublished}
                  onDelete={handleDeleteCourse}
                  onEdit={handleEditCourse}
                  isFree={course?.isFree}
                  onTogglePublishStatus={() =>
                    handleTogglePublishStatus(course?._id, course?.isPublished)
                  }
                  onTogglePriceStatus={() =>
                    handleTogglePriceStatus(course?._id, course?.isFree)
                  }
                  onClick={() => handleNavigateToCourseDetails(course?._id)}
                  courseId={course?._id}
                />
              ))
            ) : (
              <p>No courses found.</p>
            )}
          </div>
        </form>
      </FormProvider>
      <div className="flex justify-center items-center mt-5 ">
        <div className="flex items-center justify-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 border rounded ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Previous
          </button>

          {Array.from({ length: total }, (_, index) => index + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 border rounded ${page === currentPage ? "bg-blue-500 text-white" : ""}`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === total}
            className={`px-4 py-2 border rounded ${currentPage === total ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Index;
