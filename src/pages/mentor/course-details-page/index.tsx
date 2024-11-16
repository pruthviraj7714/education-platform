import { startTransition, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { Select, Tabs, Tag } from "antd";
import { FaArrowLeft, FaEdit, FaSave } from "react-icons/fa";
import { BiLoader } from "react-icons/bi";
import { toast } from "react-toastify";

import {
  fetchCourses,
  fetchCoursesByCreator,
  getCourseChapter,
  updateCourse,
} from "../../../redux/slices/mentorSlice";
import { AppDispatch, RootState } from "../../../redux/store";

import ChapterList from "../../../components/molecule/chapter-list/ChapterList";
import Input from "../../../components/molecule/input/Input";
import Button from "../../../components/atoms/button";
import Quiz from "../../../pages/quiz/quiz-dashboard";

const { TabPane } = Tabs;

interface Chapter {
  title: string;
  content: string;
  _id?: string;
}

interface CourseFormData {
  title: string;
  description: string;
  shortBio: string;
  category: string;
  image: FileList | null;
  tags: string[];
}

const CATEGORY_OPTIONS = [
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "NETWORKING", label: "Networking" },
  { value: "MATERIALS_SCIENCE", label: "Materials Science" },
];

const CourseDetailsPage = () => {
  const methods = useForm<CourseFormData>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [addTags, setAddTags] = useState("");
  const [removeTags, setRemoveTags] = useState<string[]>([]);
  const [currentCourse, setCurrentCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const {
    chapters: initialChapters,
    loading,
    error,
    creatorCourses: courses,
  } = useSelector((state: RootState) => state.mentor);
  const { user } = useSelector((state: RootState) => state.auth);

  const authToken = sessionStorage.getItem("authToken");

  useEffect(() => {
    if (user?.userId && authToken && user.roles.includes("creator")) {
      dispatch(fetchCoursesByCreator({ creatorId: user.userId, authToken }));
    } else {
      dispatch(fetchCourses());
    }
    if (user?.roles.includes("creator")) {
      setIsCreator(true);
    }
  }, [dispatch, authToken, user?.userId]);

  useEffect(() => {
    if (courses && courseId) {
      //@ts-ignore
      const course = courses.find((c) => c._id === courseId);
      if (course) {
        setCurrentCourse(course);
        methods.reset({
          title: course.title,
          description: course.description,
          shortBio: course.shortBio,
          tags: course.tags || [],
          //@ts-ignore
          category: course.category,
          image: null, // Reset to null for file input
        });
        console.log(course.tags);
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
        initialChapters.map(({ title, content, _id }) => ({
          title,
          content,
          _id,
        }))
      );
    }
  }, [initialChapters]);

  const handleAddTags = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && addTags.trim() !== "") {
      e.preventDefault();
      setTags((prevTags) => [...new Set([...prevTags, addTags.trim()])]);
      setAddTags("");
    }
  };

  const handleRemoveTags = (tagToRemove: string) => {
    setRemoveTags((prevTags) => {
      if (!prevTags.includes(tagToRemove)) {
        return [...prevTags, tagToRemove];
      }
      return prevTags;
    });

    setTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove));
  };

  const onSubmit = async (data: CourseFormData) => {
    if (!courseId) return;

    setIsLoading(true);
    let newImage = currentCourse?.imageUrl;

    if (data.image && data.image[0]) {
      const formData = new FormData();
      formData.append("image", data.image[0]);
      try {
        const response = await fetch(
          "https://learning-platform-lake.vercel.app/v1/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );
        const result = await response.json();
        if (response.ok) {
          newImage = result?.data?.secure_url;
        } else {
          throw new Error("Image upload failed");
        }
      } catch (error) {
        toast.error("Failed to upload image");
        setIsLoading(false);
        return;
      }
    }

    const updatedData = {
      ...data,
      addTags:tags,
      ...(removeTags.length > 0 && { removeTags }),
      imageUrl: newImage,
      image: newImage,
    };

    startTransition(() => {
      dispatch(
        updateCourse({
          courseId,
          courseData: updatedData as any,
          headers: { Authorization: `Bearer ${authToken}` },
        })
      );
    });

    setIsLoading(false);
    setIsEditMode(false);
  };

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
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-all"
        >
          <FaArrowLeft className="text-lg" />
          <span>Go Back</span>
        </button>

        {isCreator && (
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="p-6 flex justify-between items-center border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800">
                Course Details
              </h2>
              <Button
                className="flex items-center gap-2"
                onClick={() => setIsEditMode(!isEditMode)}
              >
                {isEditMode ? (
                  <FaSave className="text-lg" />
                ) : (
                  <FaEdit className="text-lg" />
                )}
                <span>{isEditMode ? "Save Mode" : "Edit"}</span>
              </Button>
            </div>

            <div className="p-6">
              <FormProvider {...methods}>
                <form
                  onSubmit={methods.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    {isEditMode ? (
                      <Input
                        type="file"
                        label="Course Image"
                        {...methods.register("image")}
                      />
                    ) : (
                      currentCourse?.imageUrl && (
                        <div className="w-60 h-40 overflow-hidden rounded-lg">
                          <img
                            src={currentCourse.imageUrl}
                            alt="Course"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )
                    )}

                    <Input
                      type="text"
                      label="Course Title"
                      placeholder="Enter the course title"
                      {...methods.register("title")}
                      disabled={!isEditMode}
                    />

                    <Input
                      type="text"
                      label="Short Bio"
                      placeholder="Enter a short bio"
                      {...methods.register("shortBio")}
                      disabled={!isEditMode}
                    />

                    <Input
                      type="textarea"
                      label="Description"
                      placeholder="Enter course description"
                      {...methods.register("description")}
                      disabled={!isEditMode}
                    />

                    <Select
                      placeholder="Select Category"
                      {...methods.register("category")}
                      options={CATEGORY_OPTIONS}
                      disabled={!isEditMode}
                      defaultValue={currentCourse?.category}
                      className="w-full"
                    />

                    <div className="flex flex-col gap-2">
                      <label htmlFor="tags">Tags</label>
                      <div className="flex gap-2 items-center">
                        <input
                          id="tags"
                          type="text"
                          value={addTags}
                          placeholder="Add new tag"
                          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          onChange={(e) => setAddTags(e.target.value)}
                          onKeyDown={handleAddTags}
                        />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {tags.map((tag) => (
                          <Tag
                            key={tag}
                            closable
                            onClose={() => handleRemoveTags(tag)}
                            className="rounded-full px-3 py-1 bg-primary/10 text-primary"
                          >
                            {tag}
                          </Tag>
                        ))}
                        {tags.length === 0 && (
                          <p className="text-gray-500">No tags added</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="px-6 py-2 text-white bg-primary rounded-md hover:bg-primary/80 transition-all"
                      disabled={isLoading}
                    >
                      Update Course
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </div>
          </div>
        )}

        <div>
          <Tabs className="px-[62px]" defaultActiveKey="1">
            <TabPane tab="Chapters" key="1">
              <ChapterList chapters={chapters} setChapters={setChapters} />
            </TabPane>
            <TabPane tab="Quiz" key="2">
              {courseId && <Quiz courseId={courseId} />}
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
