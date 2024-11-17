import { FormProvider, useForm } from "react-hook-form";
import Input from "../../../components/molecule/input/Input";
import Button from "../../../components/atoms/button";
import { useEffect, useState } from "react";
import { updateCourse } from "../../../redux/slices/mentorSlice";
import { toast } from "react-toastify";
import { Select, Tag } from "antd";
import { LuLoader2 } from "react-icons/lu";
import { AppDispatch } from "src/redux/store";
import { useDispatch } from "react-redux";

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
export default function DetailsTab({
  course,
  isCreator,
  authToken,
}: {
  course: any;
  isCreator: boolean;
  authToken: string;
}) {
  const methods = useForm<CourseFormData>();
  const [tags, setTags] = useState<string[]>([]);
  const [addTags, setAddTags] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const [removeTags, setRemoveTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    let newImage = course?.imageUrl;

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
      addTags: tags,
      ...(removeTags.length > 0 && { removeTags }),
      imageUrl: newImage,
      image: newImage,
    };

    try {
      await dispatch(
        updateCourse({
          courseId: course._id,
          courseData: updatedData as any,
          headers: { Authorization: `Bearer ${authToken}` },
        })
      ).unwrap();
      toast.success("Course updated successfully!");
    } catch (error) {
      toast.error("Failed to update course");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (course) {
      methods.reset({
        title: course.title,
        description: course.description,
        shortBio: course.shortBio,
        tags: course.tags || [],
        //@ts-ignore
        category: course.category,
        image: null,
      });
      setTags(course.tags);
    }
  }, [course]);

  return (
    <div>
      {isCreator && (
        <div className="mx-14 flex cursor-pointer max-w-7xl justify-between items-center my-4 ">
          <div className="leading-[28px] font-semibold text-[#191919] text-xl">
            Course Details
          </div>
        </div>
      )}

      <div
        className={`bg-white rounded-lg shadow-sm mx-10 mb-8 overflow-hidden transition-transform duration-700 ease-in-out`}
      >
        <div className="p-6">
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="space-y-4">
                {course?.imageUrl && (
                  <div className="w-60 h-40 overflow-hidden rounded-lg">
                    <img
                      src={course.imageUrl}
                      alt="Course"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  label="Course Image"
                  {...methods.register("image")}
                />

                <Input
                  type="text"
                  label="Course Title"
                  placeholder="Enter the course title"
                  {...methods.register("title")}
                />

                <Input
                  type="text"
                  label="Short Bio"
                  placeholder="Enter a short bio"
                  {...methods.register("shortBio")}
                />

                <Input
                  type="textarea"
                  label="Description"
                  placeholder="Enter course description"
                  {...methods.register("description")}
                />

                <Select
                  placeholder="Select Category"
                  {...methods.register("category")}
                  options={CATEGORY_OPTIONS}
                  defaultValue={course?.category}
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
                  className={`px-6 py-2 ${isLoading ? "bg-gray-500 hover:bg-gray-500 text-black" : "text-white bg-primary rounded-md hover:bg-primary/80"} transition-all`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-1.5">
                      <span>Updating</span>
                      <LuLoader2 className="animate-spin" />
                    </div>
                  ) : (
                    "Update Course"
                  )}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
