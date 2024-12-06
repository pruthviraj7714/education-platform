import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import Input from "../../../components/molecule/input/Input";
import Button from "../../../components/atoms/button";
import { MdArrowOutward } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, resetAuthState } from "../../../redux/slices/authSlice";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppDispatch } from "../../../redux/store";

interface FormValues {
  email: string;
  password: string;
  name: string;
  role: string[];
}

function Signup() {
  const methods = useForm<FormValues>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecked, setIsChecked] = useState(false);
  const { loading, error, success } = useSelector((state: any) => state.auth);
  const selectedRole = location.state?.role;

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const { name, email, password } = data;
    dispatch(registerUser({ name, email, password, roles: [selectedRole] }));
  };

  useEffect(() => {
    if (success) {
      navigate("/");
    }

    return () => {
      dispatch(resetAuthState());
    };
  }, [success, dispatch, navigate]);

  return (
    <div className="bg-background-light | min-h-screen | pt-8">
      <div className="bg-background p-[40px] rounded-[10px] shadow max-w-[540px] mx-auto">
        <div className="text-start">
          <h2 className="text-4xl text-secondary font-[550] leading-[46px]">
            Sign Up
          </h2>
          <p className="text-secondary-light mt-[6px] leading-[25px] text-[18px] font-normal">
            Sign up and begin your{" "}
            {selectedRole === "mentor" ? "mentoring" : "learning"} journey.
          </p>
        </div>
        <div className="mt-[40px]">
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="max-w-md mx-auto"
            >
              <Input
                type="text"
                placeholder="Enter your full name"
                label="Full Name"
                {...methods.register("name", {
                  required: "Full Name is required",
                })}
              />
              {methods.formState.errors.name && (
                <p className="text-primary mb-5">
                  {methods.formState.errors.name.message}
                </p>
              )}

              <Input
                type="email"
                placeholder="Enter your Email"
                label="Email"
                {...methods.register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {methods.formState.errors.email && (
                <p className="text-primary mb-5">
                  {methods.formState.errors.email.message}
                </p>
              )}

              <Input
                type="password"
                placeholder="Enter your Password"
                label="Password (min 8 characters)"
                {...methods.register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              {methods.formState.errors.password && (
                <p className="text-primary">
                  {methods.formState.errors.password.message}
                </p>
              )}

              <div className="flex items-center justify-start gap-2 my-5">
                <input
                  onChange={(e) => {
                    setIsChecked(e.target.checked);
                  }}
                  type="checkbox"
                  name="remember"
                  id="remember"
                />
                <p className="text-[#4C4C4D] text-[16px] leading-[24px]">
                  I agree with{" "}
                  <a className="text-blue-400 underline" href="/terms">
                    Terms of Use
                  </a>{" "}
                  and{" "}
                  <a className="text-blue-400 underline" href="/privacy">
                    Privacy Policy
                  </a>
                </p>
              </div>

              <Button disabled={!isChecked} type="submit" className="w-full">
                {loading ? "Signing up..." : "Sign up"}
              </Button>
              {error && <p className="text-red-500 mt-3">{error}</p>}
              <div className="mt-6 flex items-center justify-center gap-2">
                <p className="text-[#191919] text-[16px] leading-[25px]">
                  Already have an account?
                </p>
                <div className="text-primary flex items-center cursor-pointer">
                  <p onClick={() => navigate("/")}>Login</p>{" "}
                  <MdArrowOutward size={24} />
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}

export default Signup;
