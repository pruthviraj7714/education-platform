import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopBar from '../components/molecule/topbar';
import DashboardLayout from '../pages/layouts/DashboardLayout';
import Loader from '../components/molecule/loader/Loder';
import PrivateRoute from '../components/molecule/private-routes/PrivateRoutes';

const Login = React.lazy(() => import('../pages/auth/login'));
const Signup = React.lazy(() => import('../pages/auth/signup'));
const ForgotPassword = React.lazy(() => import('../pages/auth/forgot-password'));
const VerifyOTP = React.lazy(() => import('../pages/auth/verify-otp'));
const RoleSelection = React.lazy(() => import('../pages/auth/roles'));
const Profile = React.lazy(() => import('../pages/mentor/profile'));
const MentorDashboard = React.lazy(() => import('../pages/mentor/dashbaord'));
const CreateCourse = React.lazy(() => import('../pages/mentor/create-course'));
const CourseDetailsPage = React.lazy(() => import('../pages/mentor/course-details-page'));
const LearnerDashboard = React.lazy(() => import('../pages/learner/dashboard'));
const Chapters = React.lazy(() => import('../pages/mentor/chapters'));
const QuizBuilder = React.lazy(() => import('../pages/quiz/quiz-builder'));
const QuizDashbaord = React.lazy(() => import('../pages/quiz/quiz-dashboard'));
const Quiz = React.lazy(() => import('../pages/quiz/quiz'));

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route
            path="/*"
            element={
              <>
                <TopBar />
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/verify-otp" element={<VerifyOTP />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/roles" element={<RoleSelection />} />
                  {/* Wrap protected routes in PrivateRoute */}
                  <Route path="/create-course" element={<PrivateRoute><CreateCourse /></PrivateRoute>} />
                  <Route path="/course-details/:courseId" element={<CourseDetailsPage />} />
                  <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  <Route path="/chapters/:courseId/:chapterId" element={<PrivateRoute><Chapters /></PrivateRoute>} />
                  <Route path="/quiz-builder/:courseId" element={<PrivateRoute><QuizBuilder /></PrivateRoute>} />
                  <Route path="/quiz-dashboard/:courseId" element={<PrivateRoute><QuizDashbaord courseId={''} /></PrivateRoute>} />
                  <Route path="/quiz/:courseId/:quizId" element={<PrivateRoute><Quiz /></PrivateRoute>} />
                </Routes>
              </>
            }
          />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<PrivateRoute><MentorDashboard /></PrivateRoute>} />
            <Route path="/learner/dashboard" element={<LearnerDashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default Router;
