import { useState, useEffect, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Button from '../../../components/atoms/button';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createChapter } from '../../../redux/slices/mentorSlice';
import { AppDispatch } from '../../../redux/store';
import TabPane from 'antd/es/tabs/TabPane';
import { Tabs } from 'antd';

const modules = {
    toolbar: [
        [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image', 'clean'],
    ],
};

interface Chapter {
    _id?: string;
    title: string;
    content: string;
    chapterNumber?: number;
}

interface CourseDetailsProps {
    chapter: Chapter | null;
    onSave: (chapter: Chapter) => void;
    totalChapters: number; // Add this prop to track total chapters
}

function CourseDetails({ chapter, onSave, totalChapters }: CourseDetailsProps) {
    const [editorContent, setEditorContent] = useState<string>(chapter?.content || '');
    const [chapterTitle, setChapterTitle] = useState<string>(chapter?.title || '');
    const { courseId } = useParams<{ courseId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const editorRef = useRef<ReactQuill>(null);

    const handleImageUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            console.log('File selected for upload:', file);
            const response = await fetch('https://learning-platform-lake.vercel.app/v1/image/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Image upload failed:', errorData);
                throw new Error('Image upload failed');
            }

            const data = await response.json();
            console.log("Upload Response:", JSON.stringify(data, null, 2));

            const imageUrl = data?.data?.secure_url || data?.data?.url;
            if (imageUrl) {
                console.log('Image URL found:', imageUrl);
                return imageUrl;
            } else {
                console.error('Image upload response does not contain a valid URL:', data);
                return null;
            }
        } catch (error) {
            console.error('Error during image upload:', error);
            return null;
        }
    };

    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
                console.log('File selected:', file);
                try {
                    const imageUrl = await handleImageUpload(file);
                    console.log("Extracted Image URL:", imageUrl);

                    if (imageUrl && editorRef.current) {
                        const quill = editorRef.current.getEditor();
                        const range = quill.getSelection(true);
                        if (range) {
                            quill.insertEmbed(range.index, 'image', imageUrl);
                            quill.setSelection({ index: range.index + 1, length: 0 });
                        } else {
                            console.error('No selection found in the editor.');
                        }
                    } else {
                        console.error('Image upload response does not contain a valid URL.');
                    }
                } catch (error) {
                    console.error('Error during image upload:', error);
                }
            }
        };
    }, [handleImageUpload]);

    useEffect(() => {
        if (editorRef.current) {
            const quill = editorRef.current.getEditor();
            const toolbar = quill.getModule('toolbar');
            if (toolbar) {
                toolbar.addHandler('image', imageHandler);
            }
        }
    }, [imageHandler]);

    useEffect(() => {
        if (chapter) {
            setEditorContent(chapter.content || '');
            setChapterTitle(chapter.title || '');
        } else {
            setEditorContent('');
            setChapterTitle('');
        }
    }, [chapter]);

    const handleSave = async () => {
        const authToken = sessionStorage.getItem('authToken');
        if (!authToken || !courseId) {
            console.error('Authorization token or courseId missing');
            return;
        }
        const chapterData: Chapter = {
            _id: chapter ? chapter._id : undefined,
            title: chapterTitle,
            content: editorContent,
            chapterNumber: totalChapters + 1,
        };

        try {
            if(onSave) {
                onSave(chapterData);
            }else {
                await dispatch(
                    createChapter({
                        chapterData: {
                            ...chapterData,
                        },
                        courseId,
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    })
                );
                console.log('Chapter created successfully');
            }
        } catch (error) {
            console.error('Failed to create chapter', error);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="max-w-full mx-auto bg-white rounded-md p-5">
            <div className='mb-5'>
                <label htmlFor="chapter-title" className="block text-16 mb-2 font-medium text-[#191919]/70">Chapter Title</label>
                <input
                    placeholder='Enter Chapter Title'
                    type="text"
                    className='w-full px-5 py-5 border border-[#ccc] rounded-[8px] placeholder:text-[#B3B3B3] font-normal leading-[21px] focus:outline-none'
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                />
            </div>

            <Tabs defaultActiveKey="1">
                <TabPane tab="Editor" key="1">
                    <ReactQuill
                        ref={editorRef}
                        modules={modules}
                        value={editorContent}
                        onChange={setEditorContent}
                        className='h-[300px]'
                    />
                </TabPane>
                <TabPane tab="Preview" key="2">
                    <div className="border p-3 rounded-md ql-editor">
                        <h3 className="font-semibold text-lg">{chapterTitle}</h3>
                        <div dangerouslySetInnerHTML={{ __html: editorContent }} />
                    </div>
                </TabPane>
            </Tabs>

            <div className='flex justify-between pt-[60px]'>
                <Button onClick={handleCancel} variant='outlined'>Cancel</Button>
                <Button onClick={handleSave}>Save Chapter</Button>
            </div>
        </div>
    );
}

export default CourseDetails;
