import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import Input from '../../../components/molecule/input/Input';
import CourseCard from '../../../components/molecule/course-card/CourseCard';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, searchCourses, fetchTagsAndCategories } from '../../../redux/slices/mentorSlice';
import { AppDispatch } from '../../../redux/store';
import Loader from '../../../components/molecule/loader/Loder';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Index() {
    const methods = useForm();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    interface Course {
        imageUrl: string;
        _id: string;
        title: string;
        price: number;
        tags: string[];
        description: string;
        chapterIds: string[];
        quizIds: string[];
    }

    const { courses, loading, error } = useSelector((state: any) => state.mentor);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [categories, setCategories] = useState<{ [key: string]: string[] }>({});
    const [selectedCategories] = useState<string[]>([]);
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({});

    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        const newTimeout = setTimeout(() => {
            dispatch(searchCourses({ keyword: query, tags: selectedTags.join(',') }));
        }, 500);

        setDebounceTimeout(newTimeout);
    };

    const handleTagChange = (tag: string) => {
        setSelectedTags((prevSelectedTags) =>
            prevSelectedTags.includes(tag)
                ? prevSelectedTags.filter((t) => t !== tag)
                : [...prevSelectedTags, tag]
        );
    };

    useEffect(() => {
        dispatch(fetchCourses());
        dispatch(fetchTagsAndCategories()).then((response) => {
            if (response.payload && typeof response.payload === 'object') {
                setCategories(response.payload as unknown as { [key: string]: string[] });
            }
        });
    }, [dispatch]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleCategory = (category: string) => {
        setOpenCategories((prev) => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    const handleNavigateToCourseDetails = (courseId: string) => {
        navigate(`/course-details/${courseId}`);
    };

    return (
        <div className="min-h-screen flex">
            <button
                className="sm:hidden fixed top-[21px] left-4 z-50 text-2xl p-2 bg-primary text-white rounded-md"
                onClick={toggleSidebar}
            >
                {isSidebarOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
            </button>

            <div
                className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } sm:translate-x-0 fixed sm:relative sm:w-[240px] bg-white p-6 border-r border-gray-200 overflow-y-auto transition-transform duration-300 ease-in-out z-40`}
            >
                <h2 className="text-lg font-semibold mb-4">Filter</h2>
                <div className="flex flex-col gap-2">
                    {Object.entries(categories).map(([category, tags]) => (
                        <div key={category} className="bg-gray-100 rounded-md p-4 mb-2 shadow">
                            <h3
                                className="text-md font-semibold cursor-pointer flex items-center justify-between"
                                onClick={() => toggleCategory(category)}
                            >
                                {category}
                                {openCategories[category] ? <FaChevronUp /> : <FaChevronDown />}
                            </h3>
                            {openCategories[category] && (
                                <div className="flex flex-col pl-4 gap-2 mt-2">
                                    {tags.map((tag) => (
                                        <label key={tag} className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedTags.includes(tag)}
                                                onChange={() => handleTagChange(tag)}
                                                className="h-5 w-5 rounded text-orange-500 border-gray-300"
                                            />
                                            <span className="text-gray-700 font-medium">{tag}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 p-6">
                <div className="flex sm:flex-row flex-col justify-start items-center gap-3">
                    <h1 className="text-[#202224] text-[28px] leading-[40px] font-semibold">Explore Courses</h1>
                </div>

                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit((data) => console.log(data))}>
                        <div className="flex justify-center items-center mt-8">
                            <Input
                                label="Search"
                                type="text"
                                name="search"
                                placeholder="Search in your courses..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-[340px] sm:w-[580px]"
                            />
                        </div>

                        <div className={`${loading ? 'flex justify-center items-center min-h-[55vh]' : 'grid sm:grid-cols-3 gap-4 items-center justify-center mt-[30px]'}`}>
                            {loading ? (
                                <Loader />
                            ) : error ? (
                                <p className="text-red-500">{error}</p>
                            ) : (
                                courses
                                    .filter((course: Course) =>
                                        (selectedTags.length > 0
                                            ? course.tags.some((tag) => selectedTags.includes(tag))
                                            : true) &&
                                        (selectedCategories.length > 0
                                            ? selectedCategories.some((category) => course.tags.includes(category))
                                            : true)
                                    )
                                    .map((course: Course) => (
                                        <CourseCard
                                            key={course?._id}
                                            title={course?.title}
                                            tags={course?.tags}
                                            chapters={course.chapterIds.length}
                                            quizes={course.quizIds.length}
                                            price={course?.price}
                                            imageUrl={course?.imageUrl}
                                            description={course?.description}
                                            courseId={course?._id}
                                            onClick={() => handleNavigateToCourseDetails(course?._id)}
                                        />
                                    ))
                            )}
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
}

export default Index;
