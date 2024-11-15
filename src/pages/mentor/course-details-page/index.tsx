import { startTransition, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchCoursesByCreator, 
  getCourseChapter, 
  updateCourse 
} from "../../../redux/slices/mentorSlice";
import { AppDispatch, RootState } from "../../../redux/store";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs } from "antd";
import { FormProvider, useForm } from "react-hook-form";
import { FaArrowLeft, FaEdit, FaSave } from "react-icons/fa";
import ChapterList from "../../../components/molecule/chapter-list/ChapterList";
import Input from "../../../components/molecule/input/Input";
import Button from "../../../components/atoms/button";
import Quiz from "../../../pages/quiz/quiz-dashboard";
import { BiLoader } from "react-icons/bi";

interface Chapter {
  title: string;
  content: string;
  _id?: string;
}

interface CourseFormData {
  title: string;
  description: string;
  shortBio: string;
  price: number;
  image: FileList | null;
  tags: string[];
}

const { TabPane } = Tabs;

const CourseDetailsPage = () => {
  const methods = useForm<CourseFormData>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();

  const authToken = sessionStorage.getItem("authToken");
  const [isEditMode, setIsEditMode] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [currentCourse, setCurrentCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const { chapters: initialChapters, loading, error, courses } = useSelector(
    (state: RootState) => state.mentor
  );
  const { loading: authLoading, user, success } = useSelector((state: RootState) => state.auth);


  useEffect(() => {
    if (user?.userId && authToken) {
      dispatch(fetchCoursesByCreator({ creatorId: user.userId, authToken }));
    }
  }, [dispatch, authToken]);

  useEffect(() => {
    console.log(courses);
    if (courses && courseId) {
      const course = courses.find((c) => c._id === courseId);
      if (course) {
        setCurrentCourse(course);
        methods.reset({
          title: course.title,
          description: course.description,
          shortBio: course.shortBio,
          price: course.price,
          image: null,
          tags: course.tags,
        });
        setTags(course.tags);
      }
    }
  }, [courses, courseId, methods]);

  useEffect(() => {
    if (authToken && courseId) {
      dispatch(getCourseChapter({ courseId, authToken }));
    }
  }, [dispatch, courseId, authToken]);

  useEffect(() => {
    if (Array.isArray(initialChapters)) {
      setChapters(
        initialChapters.map(({ title, content, _id }) => ({ title, content, _id }))
      );
    }
  }, [initialChapters]);

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() && isEditMode) {
      setTags((prevTags) => [...prevTags, tagInput.trim()]);
      setTagInput("");
      e.preventDefault();
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (isEditMode) {
      setTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove));
    }
  };

  const onSubmit = (data: CourseFormData) => {
    if (!courseId) return;

    const updatedData = { ...data, tags, _id: courseId };
    startTransition(() => {
      dispatch(
        updateCourse({
          courseId,
          courseData: updatedData,
          headers: { Authorization: `Bearer ${authToken}` },
        })
      ).then(() =>
        dispatch(
          fetchCoursesByCreator({
            creatorId: currentCourse.creator,
            authToken: authToken as string,
          })
        )
      );
    });
    setIsEditMode(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <BiLoader />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div>
      <div className="my-6 mx-[62px]">
        <button
          onClick={() => navigate(`/dashboard`)}
          className="flex items-center gap-2 text-primary hover:text-orange-500 mb-6 transition-all"
        >
          <FaArrowLeft className="text-lg" />
          <span>Go Back</span>
        </button>
      </div>

      <div className="bg-white rounded-md w-full mb-[60px]">
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-[24px] font-semibold text-[#191919]">Course Details</h2>
          <Button className="flex items-center gap-1.5" onClick={() => setIsEditMode(!isEditMode)}>
            {isEditMode ? <FaSave /> : <FaEdit />}
            {isEditMode ? "Save Mode" : "Edit"}
          </Button>
        </div>

        <div className="p-[38px] border-t border-[#E4E4E7]">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Input
                type="text"
                placeholder="Enter the course title"
                label="Course Title"
                {...methods.register("title")}
                className="mb-6"
                disabled={!isEditMode}
              />
              <Input
                type="text"
                placeholder="Description of the course"
                label="Course Description"
                {...methods.register("description")}
                className="mb-6"
                disabled={!isEditMode}
              />
              <Input
                type="text"
                placeholder="Short bio of the course"
                label="Course Short Bio"
                {...methods.register("shortBio")}
                className="mb-6"
                disabled={!isEditMode}
              />
              <div className="mb-6">
                <label className="block text-[16px] font-medium mb-2">Course Tags</label>
                <input
                  type="text"
                  placeholder={isEditMode ? "Press Enter to add a tag" : ""}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInput}
                  disabled={!isEditMode}
                  className="w-full px-4 py-2 border rounded"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 py-1 text-sm rounded ${
                        isEditMode
                          ? "bg-blue-100 text-blue-700 cursor-pointer"
                          : "bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => removeTag(tag)}
                    >
                      {tag} {isEditMode && <>&times;</>}
                    </span>
                  ))}
                </div>
              </div>

              <Input
                type="number"
                placeholder="Price"
                label="Price"
                {...methods.register("price")}
                className="mb-6"
                disabled={!isEditMode}
              />

              {isEditMode && (
                <div className="flex justify-between">
                  <Button variant="outlined" onClick={() => navigate("/dashboard")}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              )}
            </form>
          </FormProvider>
        </div>
      </div>

      <Tabs className="px-[62px]" defaultActiveKey="1">
        <TabPane tab="Chapters" key="1">
          <ChapterList chapters={chapters} setChapters={setChapters} />
        </TabPane>
        <TabPane tab="Quiz" key="2">
          {courseId && <Quiz courseId={courseId} />}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default CourseDetailsPage;
