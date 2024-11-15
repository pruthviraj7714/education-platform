import{u as p,a as h,b as g,r as j,j as e,B as f,l as N}from"./index-BPNOnu4i.js";import{u as w,F as b}from"./index.esm-Bae_MGDG.js";import{I as c}from"./Input-C4p4FEP5.js";import{M as v}from"./index-G-xDdI8w.js";function I(){const s=w({mode:"onSubmit"}),d=p(),t=h(),{loading:x,error:o,success:i,user:a}=g(r=>r.auth),u=r=>{d(N(r))};return j.useEffect(()=>{var r,n;if(i&&a){const l=a.userId||null,m=((n=(r=a.token)==null?void 0:r.access)==null?void 0:n.token)||null;l&&m&&(sessionStorage.setItem("userId",l),sessionStorage.setItem("authToken",m),t("/dashboard"))}},[i,a,t]),e.jsx("div",{className:"bg-background-light | min-h-[90vh] | flex items-center justify-center",children:e.jsxs("div",{className:"bg-background p-[40px] rounded-[10px] shadow min-w-[540px] mx-auto",children:[e.jsxs("div",{className:"text-start",children:[e.jsx("h2",{className:"text-4xl text-secondary font-[550] leading-[46px]",children:"Login"}),e.jsx("p",{className:"text-secondary-light mt-[6px] leading-[25px] text-[18px] font-normal",children:"Welcome back! Please enter your details."})]}),e.jsx("div",{className:"mt-[40px]",children:e.jsx(b,{...s,children:e.jsxs("form",{onSubmit:s.handleSubmit(u),className:"max-w-md mx-auto",children:[e.jsx(c,{type:"email",placeholder:"Enter your Email",label:"Email",...s.register("email",{required:"Email is required",pattern:{value:/^\S+@\S+$/i,message:"Invalid email address"}})}),e.jsxs("div",{className:"mt-5",children:[s.formState.errors.email&&e.jsx("p",{className:"text-primary",children:s.formState.errors.email.message}),e.jsx(c,{type:"password",placeholder:"Enter your Password",label:"Password",...s.register("password",{required:"Password is required",minLength:{value:6,message:"Password must be at least 6 characters"}})})]}),s.formState.errors.password&&e.jsx("p",{className:"text-primary",children:s.formState.errors.password.message}),e.jsx("p",{onClick:()=>t("/forgot-password"),className:"text-[#4C4C4D] text-sm text-end mt-[10px] cursor-pointer",children:"Forgot Password?"}),e.jsx(f,{type:"submit",className:"w-full  my-5",children:x?"Logging in...":"Login"}),o&&e.jsx("p",{className:"text-red-500",children:o}),e.jsxs("div",{className:"mt-6 flex items-center justify-center gap-2",children:[e.jsx("p",{className:"text-[#191919] text-[16px] leading-[25px]",children:"Don’t have an account?"}),e.jsxs("div",{className:"text-primary flex items-center cursor-pointer",onClick:()=>t("/roles"),children:[e.jsx("p",{children:"Sign Up"})," ",e.jsx(v,{size:24})]})]})]})})})]})})}export{I as default};
