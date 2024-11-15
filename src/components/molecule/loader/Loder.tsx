import { Spin } from 'antd';

const Loader = () => {
    return (
        <div className="flex justify-center items-center">
            <Spin
                size="large"
                tip="Loading courses..."
                className="custom-spinner"
            />
        </div>
    );
};

export default Loader;
