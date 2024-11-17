import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../../../components/atoms/button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Input, Select, Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfile } from "../../../redux/slices/authSlice";
import Loader from "../../../components/molecule/loader/Loder";
import { MdEdit } from "react-icons/md";
import { FaCode } from "react-icons/fa";
import {
  FaUser,
  FaEnvelope,
  FaBirthdayCake,
  FaVenusMars,
  FaUserTag,
} from "react-icons/fa";

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);

  const [age, setAge] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newAge, setNewAge] = useState("");
  const [addSkills, setAddSkills] = useState("");
  const [removeSkills, setRemoveSkills] = useState<string[]>([]);
  const [gender, setGender] = useState("");

  const authToken = sessionStorage.getItem("authToken");

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      await dispatch(getUserProfile() as any);
      setLoading(false);
    };

    fetchUserProfile();
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setNewName(user?.name || "N/A");
      setNewEmail(user.email || "N/A");
      setAge(user.age || "Not provided");
      setSkills(user.skills || []);
      setGender(user.gender || "Not provided");
    }
  }, [user]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const updatedData: any = {
        email: newEmail,
        name: newName,
        ...(newAge && { age: newAge }),
        addSkills: skills, // Use skills array directly here
        ...(removeSkills.length > 0 && { removeSkills }), // Ensure removeSkills is included if there are skills to remove
        ...(gender && { gender }),
      };

      await axios.put(
        "https://login-service-phi.vercel.app/v1/user/updateProfile",
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (newAge) setAge(newAge);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    setNewAge(age || "");
    setGender(gender || "");
    setIsEditing(true);
    setAddSkills("");
    setRemoveSkills([]);
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && addSkills.trim() !== "") {
      e.preventDefault();
      setSkills((prevSkills) => [
        ...new Set([...prevSkills, addSkills.trim()]),
      ]);
      setAddSkills("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setRemoveSkills((prevSkills) => {
      if (!prevSkills.includes(skillToRemove)) {
        return [...prevSkills, skillToRemove];
      }
      return prevSkills;
    });

    setSkills((prevSkills) =>
      prevSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  return (
    <div className="bg-[#f7f7f8] min-h-screen px-[20px] sm:px-[60px]">
      <ToastContainer />
      {loading && (
        <div className="flex justify-center items-center h-screen">
          <Loader />
        </div>
      )}
      <div className="w-full">
        <div className="flex justify-between items-center pt-[30px]">
          <h2 className="text-[24px] leading-[33px] font-semibold text-[#191919]">
            Profile Details
          </h2>
          {!isEditing && (
            <Button
              onClick={startEditing}
              variant="outlined"
              className="flex items-center"
            >
              <MdEdit className="mr-2" />
              Update Profile
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="bg-white rounded-lg shadow-md mt-4 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Name:</label>
                <Input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-5 py-5 border border-[#F1F1F3] rounded-[8px] placeholder:text-[#B3B3B3] font-normal leading-[21px] bg-[#FCFCFD] focus:outline-none "
                />
              </div>
              <div>
                <label className="block mb-2">Email:</label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-5 py-5 border border-[#F1F1F3] rounded-[8px] placeholder:text-[#B3B3B3] font-normal leading-[21px] bg-[#FCFCFD] focus:outline-none "
                />
              </div>
              <div>
                <label className="block mb-2 mt-4">Age:</label>
                <Input
                  type="number"
                  value={newAge}
                  onChange={(e) => setNewAge(e.target.value)}
                  placeholder="Enter your age"
                  className="w-full px-5 py-5 border border-[#F1F1F3] rounded-[8px] placeholder:text-[#B3B3B3] font-normal leading-[21px] bg-[#FCFCFD] focus:outline-none "
                />
              </div>
              <div>
                <label className="block mb-2 mt-4">Gender:</label>
                <Select
                  value={gender}
                  onChange={(value: any) => setGender(value)}
                  placeholder="Select your gender"
                  className="w-full h-[60px]"
                >
                  <Select.Option value="male">Male</Select.Option>
                  <Select.Option value="female">Female</Select.Option>
                  <Select.Option value="other">Other</Select.Option>
                </Select>
              </div>
              <div>
                <label className="block mb-2 mt-4">Add Skills:</label>
                <Input
                  type="text"
                  value={addSkills}
                  onChange={(e) => setAddSkills(e.target.value)}
                  onKeyPress={handleAddSkill}
                  placeholder="Enter skills to add and press Enter"
                  className="w-full px-5 py-5 border border-[#F1F1F3] rounded-[8px] placeholder:text-[#B3B3B3] font-normal leading-[21px] bg-[#FCFCFD] focus:outline-none "
                />
                <div className="mt-2">
                  {skills.map((skill) => (
                    <Tag
                      key={skill}
                      closable
                      onClose={() => handleRemoveSkill(skill)}
                    >
                      {skill}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => setIsEditing(false)}
                variant="outlined"
                className="mr-4"
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Save Changes</Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md mt-4 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start border p-4 rounded-lg">
                <FaUser className="text-gray-500 mr-2 mt-1" />
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="text-gray-800 font-medium">{newName}</p>
                </div>
              </div>
              <div className="flex items-start border p-4 rounded-lg">
                <FaEnvelope className="text-gray-500 mr-2 mt-1" />
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="text-gray-800 font-medium">{newEmail}</p>
                </div>
              </div>
              <div className="flex items-start border p-4 rounded-lg">
                <FaBirthdayCake className="text-gray-500 mr-2 mt-1" />
                <div>
                  <p className="text-gray-500">Age</p>
                  <p className="text-gray-800 font-medium">{age}</p>
                </div>
              </div>
              <div className="flex items-start border p-4 rounded-lg">
                <FaVenusMars className="text-gray-500 mr-2 mt-1" />
                <div>
                  <p className="text-gray-500">Gender</p>
                  <p className="text-gray-800 font-medium">{gender}</p>
                </div>
              </div>
              <div className="flex items-start border p-4 rounded-lg">
                <FaCode className="text-gray-500 mr-2 mt-1" />
                <div>
                  <p className="text-gray-500">Skills</p>
                  <div>
                    {skills.length > 0 ? (
                      skills.map((skill) => (
                        <Tag key={skill} className="mr-1">
                          {skill}
                        </Tag>
                      ))
                    ) : (
                      <p className="text-gray-600">No skills added</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-start border p-4 rounded-lg">
                <FaUserTag className="text-gray-500 mr-2 mt-1" />

                <div>
                  <p className="text-gray-500">Role</p>
                  <p className="text-gray-800 font-medium">
                    {user?.roles && user.roles.length > 0
                      ? user.roles[0]
                      : "Role not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
