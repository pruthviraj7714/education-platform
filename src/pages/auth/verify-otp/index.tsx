import { useState } from 'react';
import { useDispatch } from 'react-redux';
import Input from '../../../components/molecule/input/Input';
import Button from '../../../components/atoms/button';
import { FormProvider, useForm } from 'react-hook-form';
import { IoChevronBackOutline } from 'react-icons/io5';
import { resetPassword } from '../../../redux/slices/authSlice';
import { AppDispatch } from '../../../redux/store';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

interface FormValues {
    code1: string;
    code2: string;
    code3: string;
    code4: string;
    code5: string;
    code6: string;
    newPassword: string;
    confirmPassword: string;
}

function Index() {
    const methods = useForm<FormValues>();
    const { handleSubmit, register, watch, formState: { errors } } = methods;
    const [isPasswordReset, setIsPasswordReset] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();

    const email = location.state?.email;

    const onSubmit = async (data: FormValues) => {
        const otpCode = `${data.code1}${data.code2}${data.code3}${data.code4}${data.code5}${data.code6}`;

        try {
            await dispatch(resetPassword({ email, password: data.newPassword, otp: otpCode })).unwrap();
            setIsPasswordReset(true);
        } catch (error) {
            console.error("Password reset failed:", error);
        }
    };

    const password = watch("newPassword");


    const handleOtpChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = event.target.value;
        if (value.length === 1 && /^[0-9]$/.test(value)) {
            const nextInput = document.querySelector(`input[name="code${index + 2}"]`) as HTMLInputElement;
            if (nextInput) {
                nextInput.focus();
            }
        }
    };

    return (
        <div className="bg-background-light | min-h-screen | pt-8">
            <div className="bg-background p-[40px] rounded-[10px] shadow max-w-[540px] mx-auto">
                {isPasswordReset ? (
                    <div className="text-start">
                        <h2 className="text-4xl text-secondary font-[550] leading-[46px] mb-4">Password Successfully Reset!</h2>
                        <p className="text-secondary-light mt-[6px] leading-[25px] text-[16px] font-normal mb-6">
                            Your password has been updated. You can now log in with your new credentials and continue your journey.
                        </p>
                        <Button
                            className="bg-primary w-full"
                            onClick={() => navigate("/")}
                        >
                            Go to Login
                        </Button>
                        <p className="mt-[40px] text-[12px] text-[#98989A] text-center">
                            If you face any issues, feel free to contact support.
                        </p>
                    </div>
                ) : (
                    <div className="text-start">
                        <h2 className="text-4xl text-secondary font-[550] leading-[46px]">Password reset</h2>
                        <p className="text-secondary-light mt-[6px] leading-[25px] text-[16px] font-normal">
                            We sent a code to <span className="font-semibold">{email}</span>
                        </p>
                        <div className='mt-[40px]'>
                            <FormProvider {...methods}>
                                <form className="max-w-md mx-auto" onSubmit={handleSubmit(onSubmit)}>
                                    <div className="block text-[16px] mb-[8px] font-medium text-[#191919]/70">Enter OTP</div>
                                    <div className="flex justify-center gap-5">
                                        {Array.from({ length: 6 }).map((_, index) => (
                                            <Input
                                                key={index}
                                                type="text"
                                                // name={`code${index + 1}`}
                                                className="text-center w-[55px] h-[50px]"
                                                maxLength={1}
                                                {...register(`code${index + 1}` as keyof FormValues, {
                                                    required: true,
                                                    onChange: (e) => handleOtpChange(e, index)
                                                })}
                                            />
                                        ))}
                                    </div>
                                    {errors.code1 && <p className="text-red-500">OTP is required</p>}

                                    <div className="mt-6">
                                        <Input
                                            label='New Password'
                                            type="password"
                                            placeholder="New Password"
                                            className="w-full"
                                            {...register("newPassword", { required: true, minLength: 6 })}
                                        />
                                        {errors.newPassword && <p className="text-red-500">Password must be at least 6 characters long</p>}
                                    </div>

                                    <div className="mt-4">
                                        <Input
                                            label='Confirm Password'
                                            type="password"
                                            placeholder="Confirm Password"
                                            className="w-full"
                                            {...register("confirmPassword", {
                                                required: true,
                                                validate: value => value === password || "Passwords do not match"
                                            })}
                                        />
                                        {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full mt-8 bg-primary text-white rounded py-2"
                                    >
                                        Continue
                                    </Button>

                                    <div className='mt-6 flex items-center justify-center gap-1 cursor-pointer' onClick={() => navigate("/")}>
                                        <IoChevronBackOutline size={18} />
                                        <h3 className='text-[#191919] text-[16px]'>Back to login</h3>
                                    </div>
                                </form>
                            </FormProvider>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Index;
