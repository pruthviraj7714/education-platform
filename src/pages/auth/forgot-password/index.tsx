import Input from '../../../components/molecule/input/Input';
import Button from '../../../components/atoms/button';
import { FormProvider, useForm } from 'react-hook-form';
import { IoChevronBackOutline } from 'react-icons/io5';
import { MdArrowOutward } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { triggerPasswordReset } from '../../../redux/slices/authSlice';
import { AppDispatch, RootState } from '../../../redux/store';

interface FormValues {
    email: string;
}

function ForgotPassword() {
    const methods = useForm<FormValues>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error, success } = useSelector((state: RootState) => state.auth);

    const onSubmit = async (data: FormValues) => {
        try {
            await dispatch(triggerPasswordReset({ email: data.email })).unwrap();
            // Pass the email as state when navigating
            navigate('/verify-otp', { state: { email: data.email } });
        } catch (err) {
            console.error('Failed to send password reset instructions:', err);
        }
    };

    return (
        <div className="bg-background-light | min-h-screen | pt-8">
            <div className="bg-background p-[40px] rounded-[10px] shadow max-w-[540px] mx-auto">
                <div className="text-start">
                    <h2 className="text-4xl text-secondary font-[550] leading-[46px]">Forgot password?</h2>
                    <p className="text-secondary-light mt-[6px] leading-[25px] text-[18px] font-normal">
                        No worries, we’ll send you reset instructions.
                    </p>
                </div>
                <div className="mt-[40px]">
                    <FormProvider {...methods}>
                        <form className="max-w-md mx-auto" onSubmit={methods.handleSubmit(onSubmit)}>
                            <Input
                                name="email"
                                type="email"
                                placeholder="Enter your Email"
                                label="Email"
                                className="mb-5"
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Sending...' : 'Reset password'}
                            </Button>
                            {error && <p className="text-red-500 mt-2">{error}</p>}
                            {success && <p className="text-green-500 mt-2">Reset instructions sent!</p>}
                            <div className="mt-6 flex items-center justify-center gap-1 cursor-pointer" onClick={() => navigate("/")}>
                                <IoChevronBackOutline size={20} />
                                <h3 className="text-[#191919] text-[18px] leading-[25px]">Back to login</h3>
                            </div>
                            <div className="mt-[40px] flex items-center justify-center gap-2">
                                <p className="text-[#191919] text-[16px] leading-[25px]">Don’t have an account?</p>
                                <div className="text-primary flex items-center cursor-pointer" onClick={() => navigate("/roles")}>
                                    <p>Sign Up</p> <MdArrowOutward size={24} />
                                </div>
                            </div>
                        </form>
                    </FormProvider>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
