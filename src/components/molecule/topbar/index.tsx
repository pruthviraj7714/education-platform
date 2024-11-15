import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import Button from '../../atoms/button';
import Logo from '../../../assets/logo.svg';
import { AiOutlineUser } from 'react-icons/ai';
import { TbLogout2 } from 'react-icons/tb';

interface TopBarProps {
    onToggle?: () => void;
    collapsed?: boolean;
}

const TopBar: React.FC<TopBarProps> = () => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/');
        window.location.reload();
    };

    const authToken = sessionStorage.getItem('authToken');

    const showLoginButton = location.pathname !== '/';

    return (
        <div className="flex items-center justify-between bg-[white] border-b-[0.5px] border-[#F0F1F3] py-[18px] sm:px-[78px] pr-[20px] pl-[70px]">
            <div className="flex gap-3 items-center">
                <div onClick={() => {
                    const authToken = sessionStorage.getItem('authToken');
                    navigate(authToken ? "/dashboard" : "/");
                }} className="cursor-pointer">
                    <img src={Logo} className="object-cover" alt="Logo" />
                </div>
            </div>

            {!authToken && (
                <div className='flex gap-4 items-center'>
                    <div onClick={() => navigate("/roles")}>
                        <Button>Sign up</Button>
                    </div>
                    {showLoginButton && (
                        <div>
                            <Button onClick={() => navigate("/")} variant="outlined">Login</Button>
                        </div>
                    )}
                </div>
            )}

            {authToken && (
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
                                    onClick={() => navigate('/profile')}
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
            )}
        </div>
    );
};

export default TopBar;
