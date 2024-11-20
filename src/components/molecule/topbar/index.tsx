import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import Button from "../../atoms/button";
import Logo from "../../../assets/logo.svg";
import { AiOutlineUser } from "react-icons/ai";
import { TbLogout2 } from "react-icons/tb";
import { useSelector } from "react-redux";

interface TopBarProps {
  onToggle?: () => void;
  collapsed?: boolean;
}

const TopBar: React.FC<TopBarProps> = () => {
  const navigate = useNavigate();
  const [isCreator, setIsCreator] = useState<boolean | null>(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const authToken = sessionStorage.getItem("authToken");

  const { loading, user } = useSelector((state: any) => state.auth);

  useEffect(() => {
    if (!loading && user && user.roles.includes("creator")) {
      setIsCreator(true);
    }
  }, [loading, user]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
    window.location.reload();
  };

  const goBackToHome = () => {
    if (!isCreator) {
      navigate("/learner/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const showLoginButton = location.pathname !== "/";

  return (
    <div className="flex items-center justify-between bg-[white] border-b-[0.5px] border-[#F0F1F3] py-[18px] sm:px-[78px] pr-[20px] pl-[70px]">
      <div className="flex gap-3 items-center">
        <div onClick={goBackToHome} className="cursor-pointer">
          <img src={Logo} className="object-cover" alt="Logo" />
        </div>
      </div>

      {!authToken && (
        <div className="flex gap-4 items-center">
          <div onClick={() => navigate("/roles")}>
            <Button>Sign up</Button>
          </div>
          {showLoginButton && (
            <div>
              <Button onClick={() => navigate("/")} variant="outlined">
                Login
              </Button>
            </div>
          )}
        </div>
      )}

      {authToken && (
        <div className="flex items-center gap-4">
          <div>
            {isCreator ? (
              <Button
                onClick={() => {
                  navigate("/dashboard");
                }}
              >
                My Courses
              </Button>
            ) : (
              <Button onClick={() => navigate("/learner/courses")}>
                My Courses
              </Button>
            )}
          </div>

          <div className="relative">
            <FaUserCircle
              className="text-3xl cursor-pointer text-[#ff9500]"
              onClick={toggleDropdown}
            />
            {dropdownOpen && (
              <div className="absolute z-[100] right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg">
                <ul className="py-2">
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    onClick={() => navigate("/profile")}
                  >
                    <AiOutlineUser className="text-xl" />
                    My Profile
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    <TbLogout2 className="text-xl" />
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;
