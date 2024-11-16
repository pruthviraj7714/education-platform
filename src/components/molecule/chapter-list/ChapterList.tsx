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
  getCourseChapter,
} from "../../../redux/slices/mentorSlice";
import { AppDispatch } from "../../../redux/store";

interface Chapter {
  _id?: string;
  title: string;
  content: string;
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
    if (event) event.preventDefault();
    const authToken = sessionStorage.getItem("authToken") || "";

    if (isAddingChapter) {
      setChapters([...chapters, newChapter]);
    } else if (editingChapterIndex !== null) {
      const chapterToUpdate = chapters[editingChapterIndex];
      if (chapterToUpdate && courseId) {
        try {
          const updatedChapter = await dispatch(
            updateChapter({
              chapterId: chapterToUpdate._id || "",
              chapterData: newChapter,
              courseId,
              headers: { Authorization: `Bearer ${authToken}` },
            })
          ).unwrap();

          const updatedChapters = [...chapters];
          updatedChapters[editingChapterIndex] = updatedChapter;
          setChapters(updatedChapters);
        } catch (error) {
          console.error("Failed to update chapter:", error);
        }
      }
    }
    try {
      if (courseId && authToken) {
        const fetchedChapters = await dispatch(
          getCourseChapter({ courseId, authToken })
        ).unwrap();
        setChapters(fetchedChapters);
      } else {
        console.error("Missing courseId or authToken");
      }
    } catch (error) {
      console.error("Failed to fetch chapters after saving:", error);
    }

    setIsAddingChapter(false);
    setEditingChapterIndex(null);
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
            onSave={handleSaveChapter}
            totalChapters={chapters.length}
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
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
