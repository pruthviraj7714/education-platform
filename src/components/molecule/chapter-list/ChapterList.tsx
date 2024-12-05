import { useState } from "react";
import { GoPencil } from "react-icons/go";
import Button from "../../../components/atoms/button";
import CourseDetails from "../../../components/molecule/course-details/CourseDetails";
import { IoMdAdd, IoMdTrash } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  updateChapter,
  deleteChapter,
} from "../../../redux/slices/mentorSlice";
import { AppDispatch } from "../../../redux/store";
import { Switch } from "antd";

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

interface ChapterListProps {
  chapters: Chapter[];
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
}

const ChapterList: React.FC<ChapterListProps> = ({ chapters, setChapters }) => {
  const [editingChapterIndex, setEditingChapterIndex] = useState<number | null>(
    null
  );
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  console.log(chapters);


  const addChapter = () => {
    setIsAddingChapter(true);
    setEditingChapterIndex(null);
  };

  const editChapter = (index: number) => {
    setEditingChapterIndex(index);
    setIsAddingChapter(false);
  };

  const handleSaveChapter = async (
    newChapter: Chapter,
    event?: React.FormEvent<HTMLFormElement>
  ) => {
    event?.preventDefault();
    const authToken = sessionStorage.getItem("authToken");

    if (!authToken) {
      console.error("Authentication token missing!");
      return;
    }

    try {
      if (isAddingChapter && courseId) {
        const addedChapter = await dispatch(
          updateChapter({
            chapterData: newChapter,
            courseId,
            chapterId: newChapter?._id as string,
            headers: { Authorization: `Bearer ${authToken}` },
          })
        ).unwrap();

        //@ts-ignore
        setChapters((prev) => [...prev, addedChapter]);
      } else if (editingChapterIndex !== null && courseId) {
        const chapterToUpdate = chapters[editingChapterIndex];

        if (!chapterToUpdate) {
          console.error("Invalid chapter selected for editing!");
          return;
        }

        const updatedChapter = await dispatch(
          updateChapter({
            chapterId: chapterToUpdate._id || "",
            chapterData: newChapter,
            courseId,
            headers: { Authorization: `Bearer ${authToken}` },
          })
        ).unwrap();

        //@ts-ignore
        setChapters((prev) =>
          prev.map((chapter, index) =>
            index === editingChapterIndex ? updatedChapter : chapter
          )
        );
      }

      setIsAddingChapter(false);
      setEditingChapterIndex(null);
    } catch (error) {
      console.error("Failed to save chapter:", error);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    const authToken = sessionStorage.getItem("authToken") || "";
    if (courseId && chapterId) {
      try {
        await dispatch(
          deleteChapter({
            chapterId,
            courseId,
            headers: { Authorization: `Bearer ${authToken}` },
          })
        ).unwrap();
        setChapters(chapters.filter((chapter) => chapter._id !== chapterId));
      } catch (error) {
        console.error("Failed to delete chapter:", error);
      }
    }
  };

  const handleTogglePublishStatus = async (chapterIndex: number) => {
    const authToken = sessionStorage.getItem("authToken");
  
    if (!authToken) {
      console.error("Authentication token missing!");
      return;
    }
  
    const updatedChapters = [...chapters];
    const chapterToUpdate = { ...updatedChapters[chapterIndex] };
    chapterToUpdate.isPublished = !chapterToUpdate.isPublished;
  
    try {
      const updatedChapter = await dispatch(
        updateChapter({
          chapterId: chapterToUpdate._id || "",
          chapterData: chapterToUpdate,
          courseId: courseId as string,
          headers: { Authorization: `Bearer ${authToken}` },
        })
      ).unwrap();
      
        //@ts-ignore
      updatedChapters[chapterIndex] = updatedChapter;
      setChapters(updatedChapters);
    } catch (error) {
      console.error("Failed to update publish status:", error);
    }
  };
  
  const handleTogglePriceStatus = async (chapterIndex: number) => {
    const authToken = sessionStorage.getItem("authToken");
  
    if (!authToken) {
      console.error("Authentication token missing!");
      return;
    }
  
    const updatedChapters = [...chapters];
    const chapterToUpdate = { ...updatedChapters[chapterIndex] };
    chapterToUpdate.isFree = !chapterToUpdate.isFree;
  
    try {
      const updatedChapter = await dispatch(
        updateChapter({
          chapterId: chapterToUpdate._id || "",
          chapterData: chapterToUpdate,
          courseId: courseId as string,
          headers: { Authorization: `Bearer ${authToken}` },
        })
      ).unwrap();
      
        //@ts-ignore
      updatedChapters[chapterIndex] = updatedChapter;
      setChapters(updatedChapters);
    } catch (error) {
      console.error("Failed to update price status:", error);
    }
  };
  

  const handleViewChapter = (courseId: string, chapterId: string) => {
    navigate(`/chapters/${courseId}/${chapterId}`);
  };

  return (
    <div className="bg-white rounded-md w-full">
      <div className="space-y-4 border-[#E4E4E7]">
        {isAddingChapter || editingChapterIndex !== null ? (
          <CourseDetails
            chapter={
              isAddingChapter
                ? { title: "", content: "" }
                : chapters[editingChapterIndex!]
            }
        //@ts-ignore
            onSave={handleSaveChapter}
            totalChapters={chapters.length}
          />
        ) : (
          <>
            <div className="flex items-center justify-between p-3">
              <h2 className="text-[20px] leading-[28px] font-semibold text-[#191919]">
                Chapter List
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  className="flex items-center gap-2"
                  variant="outlined"
                  onClick={addChapter}
                >
                  <IoMdAdd /> Add Chapter
                </Button>
              </div>
            </div>
            <ul className="space-y-4 pt-4">
              {chapters.map((chapter, index) => (
                <li
                  key={chapter._id}
                  className="cursor-pointer p-4 flex justify-between items-center border-b border-[#E4E4E7] pb-4"
                >
                  <span
                    onClick={() =>
                      handleViewChapter(courseId || "", chapter._id || "")
                    }
                  >
                    {chapter.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => editChapter(index)}>
                      <GoPencil />
                    </Button>

                    <Switch
                      checked={chapters[index]?.isPublished}
                      onChange={() => handleTogglePublishStatus(index)}
                      checkedChildren="Published"
                      unCheckedChildren="Unpublished"
                    />
                    <Switch
                      checked={chapters[index].isFree}
                      onChange={() => handleTogglePriceStatus(index)}
                      checkedChildren="Free"
                      unCheckedChildren="paid"
                    />

                    <Button
                      onClick={() => handleDeleteChapter(chapter._id || "")}
                    >
                      <IoMdTrash />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default ChapterList;
