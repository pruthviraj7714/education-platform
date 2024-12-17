import { useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Button from "../../../components/atoms/button";
import { updateCourse } from "../../../redux/slices/mentorSlice";
import { RxDragHandleDots2 } from "react-icons/rx";
import { AppDispatch } from "src/redux/store";

interface ContentOrderProps {
  courseId: string;
  chapters: any[];
  quizes: any[];
  prevOrder: string[];
  onUpdateContentList?: (newOrder: string[]) => void;
}

export default function ContentList({
  courseId,
  chapters,
  quizes,
  prevOrder,
  onUpdateContentList,
}: ContentOrderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const authToken = sessionStorage.getItem("authToken");

  const updateLocalContentItems = (items: any[]) => {
    const allItems = [
      ...(chapters.map((c) => ({ ...c, type: "chapter" })) ?? []),
      ...(quizes.map((q) => ({ ...q, type: "quiz" })) ?? []),
    ];

    const orderedItems = items
      ?.map((id) => allItems.find((item) => item._id === id))
      .filter(Boolean);

    const remainingItems = allItems.filter((item) => !items.includes(item._id));

    setContentItems([...orderedItems, ...remainingItems]);
  };

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, item: any) => {
    setIsDragging(true);
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", item._id || "");
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, targetItem: any) => {
    e.preventDefault();
    if (!draggedItem) return;

    const newItems = [...contentItems];
    const draggedIndex = newItems.findIndex(
      (item) => item._id === draggedItem._id
    );
    const targetIndex = newItems.findIndex(
      (item) => item._id === targetItem._id
    );

    if (draggedIndex === -1 || targetIndex === -1) return;

    newItems.splice(draggedIndex, 1);

    const dropPosition =
      e.clientY <
      e.currentTarget.getBoundingClientRect().top +
        e.currentTarget.offsetHeight / 2
        ? targetIndex
        : targetIndex + 1;

    newItems.splice(dropPosition, 0, draggedItem);

    setContentItems(newItems);
    setIsDragging(false);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedItem(null);
  };

  const updateContentOrder = async () => {
    setIsLoading(true);
    try {
      const contentOrder = contentItems.map((item) => item._id.toString());

      const response = await dispatch(
        updateCourse({
          courseId,
          courseData: {
            //@ts-ignore
            contentOrder: contentOrder,
          },
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
      ).unwrap();

      //@ts-ignore
      const updatedOrder: any[] = response.contentOrder;

      if (onUpdateContentList) {
        onUpdateContentList(updatedOrder);
      }
      updateLocalContentItems(updatedOrder);

      toast.success("Content order updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update content order");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateLocalContentItems(prevOrder);
  }, [prevOrder, chapters, quizes]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Content Order</h1>
        <Button onClick={updateContentOrder} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Order"}
        </Button>
      </div>
      <ul className="space-y-2">
        {contentItems.map((item) => (
          <li
            key={item._id}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, item)}
            onDragEnd={handleDragEnd}
            className={`p-4 bg-white rounded-lg border shadow-sm cursor-grab transition-colors ${
              isDragging && draggedItem?._id === item._id ? "opacity-50" : ""
            }`}
          >
            {item.type === "chapter" ? (
              <div className="flex justify-between items-center">
                <span
                  // onClick={() => handleViewChapter(item._id || "")}
                  className=" flex items-center gap-1"
                >
                  <RxDragHandleDots2 size={30} />
                  {item.title}
                </span>
                <span className="text-sm text-gray-500">Chapter</span>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div
                  // onClick={() => handleQuizClick(item._id || "")}
                  className="flex items-center gap-1 "
                >
                  <RxDragHandleDots2 size={30} />
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center text-orange-500">
                  <span className="mr-2 text-sm font-semibold">Take Quiz</span>
                  <FiArrowRight size={16} />
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
