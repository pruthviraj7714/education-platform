import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Input from '../../../components/molecule/input/Input';
import Button from '../../../components/atoms/button';
import Select from '../../../components/molecule/select/Select';  // Import the custom Select component
import { createCourse } from '../../../redux/slices/mentorSlice';
import { AppDispatch } from '../../../redux/store';
import Loader from '../../../components/molecule/loader/Loder';

function Index() {
    const methods = useForm();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            setTags((prevTags) => [...prevTags, tagInput.trim()]);
            setTagInput('');
            e.preventDefault();
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove));
    };

    const onSubmit = async (data: any) => {
        setLoading(true);
        const mentorId = sessionStorage.getItem('userId') || '';
        const authToken = sessionStorage.getItem('authToken') || '';

        let imageUrl = null;
        if (data?.image[0]) {
            const formData = new FormData();
            formData.append('image', data?.image[0]);

            try {
                const uploadResponse = await fetch('https://learning-platform-lake.vercel.app/v1/image/upload', {
                    method: 'POST',
                    body: formData,
                });

                const uploadResult = await uploadResponse.json();
                if (uploadResponse.ok) {
                    imageUrl = uploadResult?.data?.secure_url;
                } else {
                    throw new Error('Image upload failed');
                }
            } catch (error) {
                toast.error('Failed to upload image');
                setLoading(false);
                return;
            }
        }

        const courseData = {
            title: data?.title,
            description: data?.description,
            creator: mentorId,
            price: data?.price,
            tags,
            shortBio: data?.shortBio,
            imageUrl: imageUrl,
            category: data?.category,
        };

        const response = await dispatch(createCourse({ courseData, headers: { Authorization: `Bearer ${authToken}` } }));

        setLoading(false);

        if (response.meta.requestStatus === 'fulfilled') {
            toast.success('Course created successfully!');
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } else {
            toast.error('Failed to create the course');
        }
    };

    // Define options for the Select component
    const categoryOptions = [
        { value: 'ELECTRICAL', label: 'ELECTRICAL' },
        { value: 'ELECTRONICS', label: 'ELECTRONICS' },
        { value: 'NETWORKING', label: 'NETWORKING' },
        { value: 'MATERIALS_SCIENCE', label: 'MATERIALS_SCIENCE' },
    ];

    return (
        <div className="bg-[#f7f7f8] min-h-screen px-[60px]">
            <ToastContainer />

            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-100 z-50">
                    <Loader />
                </div>
            )}
            <div className="flex items-start justify-start pt-[42px] w-full">
                <div className="bg-white rounded-md w-full mb-[60px]">
                    <div className="p-6">
                        <h2 className="text-[24px] leading-[33px] font-semibold text-[#191919]">Basic Details</h2>
                    </div>
                    <div className="p-[38px] border-t border-[#E4E4E7]">
                        <FormProvider {...methods}>
                            <form onSubmit={methods.handleSubmit(onSubmit)}>
                                <Input
                                    type="text"
                                    placeholder="Enter the course title"
                                    label="Course Title"
                                    {...methods.register('title', { required: 'Course title is required' })}
                                    className="mb-6"
                                />
                                <Input
                                    type="text"
                                    placeholder="Description of the course"
                                    label="Course Description"
                                    {...methods.register('description', { required: 'Course description is required' })}
                                    className="mb-6"
                                />
                                <Input
                                    type="text"
                                    placeholder="Short bio of the course"
                                    label="Course Short Bio"
                                    {...methods.register('shortBio', { required: 'Short Bio is required' })}
                                    className="mb-6"
                                />

                                <div className="mb-6">
                                    <label className="block text-[16px] mb-[8px] font-medium text-[#191919]/70">Course Tags</label>
                                    <input
                                        type="text"
                                        placeholder="Press Enter to add a tag"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagInput}
                                        className="w-full px-5 py-5 border border-[#F1F1F3] rounded-[8px] placeholder:text-[#B3B3B3] font-normal leading-[21px] bg-[#FCFCFD] focus:outline-none"
                                    />
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-block bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded-lg cursor-pointer"
                                                onClick={() => removeTag(tag)}
                                            >
                                                {tag} &times;
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <Input
                                    type="number"
                                    placeholder="Price"
                                    label="Price"
                                    {...methods.register('price', { required: 'Price is required' })}
                                    className="mb-6"
                                />
                                <Select
                                    label="Category"
                                    options={categoryOptions}
                                    placeholder="Select Category"
                                    value={methods.getValues('category')}
                                    onChange={(value) => methods.setValue('category', value, { shouldValidate: true })}
                                    className="mb-6" name={''}
                                />
                                <Input
                                    type="file"
                                    label="Course Image"
                                    {...methods.register('image', { required: 'Course image is required' })}
                                    className="mb-6"
                                />


                                <div className="flex items-center justify-between">
                                    <Button variant="outlined" onClick={() => navigate('/dashboard')}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Save</Button>
                                </div>
                            </form>
                        </FormProvider>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Index;
