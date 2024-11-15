import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import chapter from '../../../assets/chapter.svg';
import student from '../../../assets/student.svg';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Modal, Form, Input, Tag, Switch } from 'antd';

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
    onDelete?: (id: string) => void;
    onEdit?: (id: string, data: any) => void;
    onTogglePublishStatus?: () => void;
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
    onDelete,
    onEdit,
    onTogglePublishStatus,
    onClick,
}) => {
    const location = useLocation();
    const isLearnerDashboard = location.pathname === '/learner/dashboard';
    const [isTruncated, setIsTruncated] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [existingTags, setExistingTags] = useState<string[]>(tags);
    const [newTag, setNewTag] = useState('');
    const [tagsToRemove, setTagsToRemove] = useState<string[]>([]);
    const maxDescriptionLength = 40;

    const toggleDescription = () => {
        setIsTruncated(!isTruncated);
    };

    const truncatedDescription =
        isTruncated && description.length > maxDescriptionLength
            ? `${description.substring(0, maxDescriptionLength)}...`
            : description;

    const handleEdit = () => {
        form.setFieldsValue({
            title,
            description,
            addTags: '',
        });
        setExistingTags(tags);
        setTagsToRemove([]);
        setNewTag('');
        setIsModalVisible(true);
    };

    const handleTagRemove = (tag: string) => {
        setTagsToRemove(prev => [...prev, tag]);
        setExistingTags(existingTags.filter(existingTag => existingTag !== tag));
    };

    const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newTag.trim()) {
            setExistingTags(prev => [...prev, newTag.trim()]);
            setNewTag('');
            e.preventDefault();
        }
    };

    const handleOk = () => {
        form.validateFields()
            .then(values => {
                const updatedCourseData = {
                    title: values.title,
                    description: values.description,
                    addTags: existingTags.filter(tag => !tags.includes(tag)),
                    removeTags: tagsToRemove,
                };

                if (onEdit) {
                    onEdit(courseId, updatedCourseData);
                }
                setIsModalVisible(false);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

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

                <div className='mt-4'>
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
                        {isTruncated ? 'Read More' : 'Read Less'}
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
                    <div>
                        <Switch
                            checked={isPublished}
                            onChange={onTogglePublishStatus}
                            checkedChildren="Published"
                            unCheckedChildren="Unpublished"
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <FaEdit onClick={handleEdit} className="cursor-pointer text-blue-500" />
                        <FaTrash
                            onClick={() => onDelete && onDelete(courseId)}
                            className="cursor-pointer text-red-500"
                        />
                    </div>
                </div>
            )}

            <Modal
                title="Edit Course"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Save"
                cancelText="Cancel"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="title" label="Title" initialValue={title}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description" initialValue={description}>
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item label="Tags">
                        {existingTags.map((tag, index) => (
                            <Tag
                                closable
                                onClose={() => handleTagRemove(tag)}
                                key={index}
                                className="mb-1"
                            >
                                {tag}
                            </Tag>
                        ))}
                        <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={handleTagInput}
                            placeholder="Press Enter to add tag"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CourseCard;
