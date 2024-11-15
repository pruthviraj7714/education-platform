import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import Input from "../../../components/molecule/input/Input";
import Button from "../../../components/atoms/button";
import { MdArrowOutward } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../../../redux/store";
import { useEffect } from "react";

interface FormValues {
  email: string;
  password: string;
}

function Login() {
  const methods = useForm<FormValues>({
    mode: "onSubmit",
  });
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error, success, user } = useSelector(
    (state: any) => state.auth
  );

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    dispatch(loginUser(data));
  };

  useEffect(() => {
    if (success && user) {
      const userId = user.userId || null;
      const authToken = user.token?.access?.token || null;
      const roles = user.roles || [];

      if (userId && authToken) {
        sessionStorage.setItem("userId", userId);
        sessionStorage.setItem("authToken", authToken);
        if (roles.includes("learner")) {
          navigate("/learner/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    }
  }, [success, user, navigate]);

  return (
    <div className="bg-background-light | min-h-[90vh] | flex items-center justify-center">
      <div className="bg-background p-[40px] rounded-[10px] shadow min-w-[540px] mx-auto">
        <div className="text-start">
          <h2 className="text-4xl text-secondary font-[550] leading-[46px]">
            Login
          </h2>
          <p className="text-secondary-light mt-[6px] leading-[25px] text-[18px] font-normal">
            Welcome back! Please enter your details.
          </p>
        </div>
        <div className="mt-[40px]">
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="max-w-md mx-auto"
            >
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
              <div className="mt-5">
                {methods.formState.errors.email && (
                  <p className="text-primary">
                    {methods.formState.errors.email.message}
                  </p>
                )}
                <Input
                  type="password"
                  placeholder="Enter your Password"
                  label="Password"
                  {...methods.register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
              </div>
              {methods.formState.errors.password && (
                <p className="text-primary">
                  {methods.formState.errors.password.message}
                </p>
              )}
              <p
                onClick={() => navigate("/forgot-password")}
                className="text-[#4C4C4D] text-sm text-end mt-[10px] cursor-pointer"
              >
                Forgot Password?
              </p>
              <Button
                type="submit"
                className="w-full my-5"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
              {error && <p className="text-red-500">{error}</p>}
              <div className="mt-6 flex items-center justify-center gap-2">
                <p className="text-[#191919] text-[16px] leading-[25px]">
                  Don’t have an account?
                </p>
                <div
                  className="text-primary flex items-center cursor-pointer"
                  onClick={() => navigate("/roles")}
                >
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

export default Login;
