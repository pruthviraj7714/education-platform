import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import chapter from "../../../assets/chapter.svg";
import student from "../../../assets/student.svg";
import { FaTrash } from "react-icons/fa";
import { Switch } from "antd";

interface CourseCardProps {
  title: string;
  tags: string[];
  chapters: number;
  quizes: number;
  price: number;
  imageUrl: string;
  description: string;
  courseId: string;
  isPublished?: boolean; // Optional prop
  isFree?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, data: any) => void;
  onTogglePublishStatus?: () => void;
  onTogglePriceStatus?: () => void;
  onClick?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  tags,
  chapters,
  quizes,
  price,
  imageUrl,
  description,
  courseId,
  isPublished = false,
  isFree = false,
  onDelete,
  onTogglePublishStatus,
  onTogglePriceStatus,
  onClick,
}) => {
  const location = useLocation();
  const isLearnerDashboard = location.pathname === "/learner/dashboard" || "/learner/courses";
  const [isTruncated, setIsTruncated] = useState(true);
  const maxDescriptionLength = 40;

  const toggleDescription = () => {
    setIsTruncated(!isTruncated);
  };

  const truncatedDescription =
    isTruncated && description.length > maxDescriptionLength
      ? `${description.substring(0, maxDescriptionLength)}...`
      : description;

  return (
    <div className="max-w-sm bg-white border p-4 border-gray-200 rounded-lg shadow-lg">
      <div onClick={onClick} className="cursor-pointer">
        <div className="h-48">
          <img
            className="w-full h-full object-cover rounded-lg"
            src={imageUrl}
            alt={title}
          />
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap mt-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-2 mb-2 uppercase font-semibold tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>

          <h2 className="mt-2 text-lg font-semibold text-[#0E2A46]">{title}</h2>

          <p className="mt-2 text-sm text-gray-600">{truncatedDescription}</p>
          <button
            onClick={toggleDescription}
            className="mt-1 text-blue-600 text-xs focus:outline-none"
          >
            {isTruncated ? "Read More" : "Read Less"}
          </button>

          <div className="flex items-center mt-2 space-x-2 text-xs text-gray-600">
            <img src={chapter} alt="Chapters" className="w-4 h-4" />
            <span>{chapters} Chapters</span>
            <img src={student} alt="Students" className="w-4 h-4" />
            <span>{quizes} Quizes</span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-lg font-semibold">₹{price}</span>
          </div>
        </div>
      </div>

      {!isLearnerDashboard && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5">
            <Switch
              checked={isPublished}
              onChange={onTogglePublishStatus}
              checkedChildren="Published"
              unCheckedChildren="Unpublished"
            />
            <Switch
              checked={isFree}
              onChange={onTogglePriceStatus}
              checkedChildren="Free"
              unCheckedChildren="paid"
            />
          </div>
          <div className="flex items-center space-x-4">
            <FaTrash
              onClick={() => onDelete && onDelete(courseId)}
              className="cursor-pointer text-red-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCard;
