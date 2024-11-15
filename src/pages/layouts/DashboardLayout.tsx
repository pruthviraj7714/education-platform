import React, { useState } from 'react';
import { Layout } from 'antd';
// import { FaHome, FaChartLine, FaUser } from 'react-icons/fa';
import { Outlet, useLocation } from 'react-router-dom';
import TopBar from '../../components/molecule/topbar';


const { Content } = Layout;

const DashboardLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    // const navigate = useNavigate();

    const toggleCollapse = () => {
        setCollapsed(prevState => !prevState);
    };

    const location = useLocation();
    const isDashboardRoute = location.pathname === '/dashboard';

    // const menuItems = [
    //     {
    //         key: '1',
    //         icon: <FaHome />,
    //         label: 'Home',
    //         path: '/dashboard',
    //     },
    //     {
    //         key: '2',
    //         icon: <FaChartLine />,
    //         label: 'Analytics',
    //         path: '/dashboard/analytics',
    //     },
    //     {
    //         key: '3',
    //         icon: <FaUser />,
    //         label: 'Profile',
    //         path: '/profile',
    //     },
    // ];

    return (
        <Layout className="h-screen">
            <TopBar onToggle={toggleCollapse} collapsed={collapsed} />

            <Layout>
                {/* <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    className="bg-white shadow-md pt-4"
                    width={240}
                >
                    <Menu
                        defaultSelectedKeys={['1']}
                        className="border-none px-4"
                    >
                        {menuItems.map(({ key, icon, label, path }) => (
                            <Menu.Item
                                key={key}
                                icon={icon}
                                onClick={() => navigate(path)}
                            >
                                {label}
                            </Menu.Item>
                        ))}
                    </Menu>
                </Sider> */}
                <Layout className="bg-[#f6f6f8]">
                    <Content className={isDashboardRoute ? 'sm:p-6 p-4 overflow-auto' : 'overflow-auto'}>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default DashboardLayout;
