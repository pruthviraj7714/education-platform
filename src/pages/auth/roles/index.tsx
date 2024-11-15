import { useState } from "react";
import role from "../../../assets/images/roles.webp";
import mentor from "../../../assets/mentor.svg";
import learner from "../../../assets/leaner.svg";
import Button from "../../../components/atoms/button";
// import { IoChevronBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

function RoleSelection() {
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleNext = () => {
        if (selectedRole) {
            navigate("/signup", { state: { role: selectedRole } });
        } else {
            alert("Please select a role to continue.");
        }
    };

    return (
        <div className="bg-background-light min-h-screen flex items-center justify-center">
            <div className="grid grid-cols-4 justify-center items-center gap-[100px] border rounded-[10px] shadow">
                <div className="col-span-2 max-w-[640px] pl-[60px]">
                    <div className="text-start">
                        <h2 className="text-4xl text-secondary font-[550] leading-[46px]">Select your role</h2>
                        <p className="text-secondary-light mt-[6px] leading-[25px] text-[18px] font-normal">
                            Please select your role to continue
                        </p>
                    </div>

                    {/* Mentor Role Selection */}
                    <div
                        onClick={() => setSelectedRole("creator")}
                        className={`mt-[40px] gap-4 flex items-center bg-primary-light shadow py-6 px-[40px] rounded-[8px] cursor-pointer ${selectedRole === 'creator' ? 'border-2 border-blue-500' : ''}`}
                    >
                        <div><img src={mentor} alt="Mentor" /></div>
                        <div>
                            <h2 className="text-[16px] leading-[25px]">Mentor</h2>
                            <p className="text-[#4C4C4D] text-[14px] leading-[21px]">
                                Share your knowledge and experience with others.
                            </p>
                        </div>
                    </div>

                    {/* Learner Role Selection */}
                    <div
                        onClick={() => setSelectedRole("learner")}
                        className={`mt-[20px] gap-4 flex items-center bg-primary-light shadow py-6 px-[40px] rounded-[8px] cursor-pointer ${selectedRole === 'learner' ? 'border-2 border-blue-500' : ''}`}
                    >
                        <div><img src={learner} alt="Learner" /></div>
                        <div>
                            <h2 className="text-[16px] leading-[25px]">Learner</h2>
                            <p className="text-[#4C4C4D] text-[14px] leading-[21px]">
                                Learn new skills and gain knowledge from mentors.
                            </p>
                        </div>
                    </div>

                    <div className="mt-[56px]">
                        <Button className="w-full" onClick={handleNext}>
                            Next
                        </Button>
                        {/* <div onClick={() => navigate("/signup")} className='mt-6 flex items-center justify-center gap-1 cursor-pointer'>
                            <IoChevronBackOutline size={20} />
                            <h3 className='text-[#191919] text-[18px] leading-[25px]'>Back to Sign Up</h3>
                        </div> */}
                    </div>
                </div>

                <div className="col-span-2 pl-[66px]">
                    <img className="object-cover max-h-[650px]" src={role} alt="Role Selection" />
                </div>
            </div>
        </div>
    );
}

export default RoleSelection;
