import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Input from "../../../components/molecule/input/Input";
import CourseCard from "../../../components/molecule/course-card/CourseCard";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCourses,
  searchCourses,
  fetchTagsAndCategories,
} from "../../../redux/slices/mentorSlice";
import { AppDispatch, RootState } from "../../../redux/store";
import Loader from "../../../components/molecule/loader/Loder";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Modal } from "antd";
import {
  enrollCourse,
  fetchEnrolledCourses,
} from "../../../redux/slices/enrollSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Index() {
  const methods = useForm();
  const dispatch = useDispatch<AppDispatch>();

  interface Course {
    imageUrl: string;
    _id: string;
    title: string;
    price: number;
    tags: string[];
    description: string;
    chapterIds: string[];
    quizIds: string[];
  }

  const {
    courses: { courses, totalPages: total },
    loading,
    error,
  } = useSelector((state: any) => state.mentor);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ [key: string]: string[] }>({});
  const [selectedCategories] = useState<string[]>([]);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const authToken = sessionStorage.getItem("authToken");
  const { enrolledCourses } = useSelector((state: RootState) => state.enroll);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  useEffect(() => {
    if (authToken) {
      dispatch(fetchEnrolledCourses(authToken));
    }
  }, [authToken]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const newTimeout = setTimeout(() => {
      dispatch(searchCourses({ keyword: query, tags: selectedTags.join(",") }));
    }, 500);

    setDebounceTimeout(newTimeout);
  };

  const handleTagChange = (tag: string) => {
    setSelectedTags((prevSelectedTags) =>
      prevSelectedTags.includes(tag)
        ? prevSelectedTags.filter((t) => t !== tag)
        : [...prevSelectedTags, tag]
    );
  };

  useEffect(() => {
    dispatch(fetchCourses({ currentPage: currentPage }));
    dispatch(fetchTagsAndCategories()).then((response) => {
      if (response.payload && typeof response.payload === "object") {
        setCategories(
          response.payload as unknown as { [key: string]: string[] }
        );
      }
    });
  }, [dispatch, currentPage]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const enrollIntoCourse = async (courseId: string) => {
    const response = await dispatch(
      enrollCourse({
        authToken: authToken!,
        courseId,
      })
    );
    if (response.meta.requestStatus === "fulfilled") {
      toast.success("Course enrollment successful!");
      navigate(`/learner/course-page/${courseId}`);
    } else {
      toast.error("Failed to enroll into the course");
    }
  };

  return (
    <div className="min-h-screen flex">
      <button
        className="sm:hidden fixed top-[21px] left-4 z-50 text-2xl p-2 bg-primary text-white rounded-md"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
      </button>

      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0 fixed sm:relative sm:w-[240px] bg-white p-6 border-r border-gray-200 overflow-y-auto transition-transform duration-300 ease-in-out z-40`}
      >
        <h2 className="text-lg font-semibold mb-4">Filter</h2>
        <div className="flex flex-col gap-2">
          {Object.entries(categories).map(([category, tags]) => (
            <div
              key={category}
              className="bg-gray-100 rounded-md p-4 mb-2 shadow"
            >
              <h3
                className="text-md font-semibold cursor-pointer flex items-center justify-between"
                onClick={() => toggleCategory(category)}
              >
                {category}
                {openCategories[category] ? <FaChevronUp /> : <FaChevronDown />}
              </h3>
              {openCategories[category] && (
                <div className="flex flex-col pl-4 gap-2 mt-2">
                  {tags.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => handleTagChange(tag)}
                        className="h-5 w-5 rounded text-orange-500 border-gray-300"
                      />
                      <span className="text-gray-700 font-medium">{tag}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="flex sm:flex-row flex-col justify-start items-center gap-3">
          <h1 className="text-[#202224] text-[28px] leading-[40px] font-semibold">
            Explore Courses
          </h1>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit((data) => console.log(data))}>
            <div className="flex justify-center items-center mt-8">
              <Input
                label="Search"
                type="text"
                name="search"
                placeholder="Search in your courses..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-[340px] sm:w-[580px]"
              />
            </div>

            <div
              className={`${loading ? "flex justify-center items-center min-h-[55vh]" : "grid sm:grid-cols-3 gap-4 items-center justify-center mt-[30px]"}`}
            >
              {loading ? (
                <Loader />
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                courses
                  ?.filter(
                    (course: Course) =>
                      (selectedTags.length > 0
                        ? course.tags.some((tag) => selectedTags.includes(tag))
                        : true) &&
                      (selectedCategories.length > 0
                        ? selectedCategories.some((category) =>
                            course.tags.includes(category)
                          )
                        : true)
                  )
                  .map((course: Course) => (
                    <CourseCard
                      key={course?._id}
                      title={course?.title}
                      tags={course?.tags}
                      chapters={course.chapterIds.length}
                      quizes={course.quizIds.length}
                      price={course?.price}
                      imageUrl={course?.imageUrl}
                      description={course?.description}
                      courseId={course?._id}
                      onClick={() => {
                        const isEnrolled = enrolledCourses.some((course) => {
                          return course._id === course?._id;
                        });

                        if (isEnrolled) {
                          navigate(`/learner/course-page/${course._id}`);
                        } else {
                          setIsEnrollModalOpen(true),
                            setSelectedCourseId(course?._id);
                        }
                      }}
                    />
                  ))
              )}

              {isEnrollModalOpen && (
                <Modal
                  title="Confirm Enrollment"
                  visible={isEnrollModalOpen}
                  onOk={() => enrollIntoCourse(selectedCourseId!)}
                  onCancel={() => setIsEnrollModalOpen(false)}
                  okText="Yes, Enroll"
                  cancelText="No, Cancel"
                >
                  <p>
                    You're about to enroll in this course. Are you sure you want
                    to proceed?
                  </p>
                </Modal>
              )}
            </div>
          </form>
        </FormProvider>
        <div className="flex justify-center items-center ">
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
    </div>
  );
}

export default Index;
