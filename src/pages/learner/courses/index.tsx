import { useEffect } from "react";
import { LuLoader2 } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import CourseCard from "../../../components/molecule/course-card/CourseCard";
import Loader from "../../../components/molecule/loader/Loder";
import { fetchEnrolledCourses } from "../../../redux/slices/enrollSlice";
import { AppDispatch, RootState } from "../../../redux/store";
import { useNavigate } from "react-router-dom";

function Index() {
  const { enrolledCourses, error, loading } = useSelector(
    (state: RootState) => state.enroll
  );
  const authToken = sessionStorage.getItem("authToken") || "";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    if (authToken) {
      dispatch(fetchEnrolledCourses(authToken));
    }
  }, [authToken]);

  const handleNavigateToCourseDetails = (courseId: string) => {
    navigate(`/learner/course-page/${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LuLoader2 className="animate-spin size-10 text-orange-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-10 py-6 border-b border-gray-200 bg-white shadow-sm">
        <h1 className="text-gray-800 text-2xl font-semibold">My Courses</h1>
      </div>
      <div
        className={`mt-8 px-10 max-w-7xl mx-auto ${
          loading
            ? "flex justify-center items-center min-h-[55vh]"
            : "grid sm:grid-cols-3 gap-6"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader />
            <p className="text-gray-600 mt-4">Loading courses...</p>
          </div>
        ) : error ? (
          <p className="text-red-600 text-center">{error}</p>
        ) : enrolledCourses.length > 0 ? (
          enrolledCourses.map((course: any) => (
            <CourseCard
              key={course?._id}
              title={course?.title}
              tags={course?.tags}
              chapters={course?.chapterIds?.length}
              quizes={course?.quizIds?.length}
              price={course?.price}
              imageUrl={course?.imageUrl}
              description={course?.description}
              onClick={() => handleNavigateToCourseDetails(course?._id)}
              courseId={course?._id}
            />
          ))
        ) : (
          <div className="text-center col-span-full">
            <p className="text-gray-500 text-lg">No courses found.</p>
            <button
              onClick={() => console.log("Explore Courses")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition"
            >
              Explore Courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Index;
