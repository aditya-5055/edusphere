import { useEffect } from "react";
import "./index.css";
import Navbar from "./components/Common/Navbar";
// React Router
import { useDispatch, useSelector } from "react-redux";
// React Router
import Instructor from "./components/core/Dashboard/Instructor"
import { Route, Routes, useNavigate } from "react-router-dom";
import AddCourse from "./components/core/Dashboard/AddCourse";
import Cart from "./components/core/Dashboard/Cart";
import Home from "./pages/Home";
import MyCourses from "./components/core/Dashboard/MyCourses";
import EditCourse from "./components/core/Dashboard/EditCourse";
import InstructorCourseManager from "./components/core/Dashboard/InstructorCourses/InstructorCourseManager";
import Catalog from "./pages/Catalog";
import CourseDetails from "./pages/CourseDetails";
import Login from "./pages/Login";
import Contact from "./pages/Contact"
import Signup from "./pages/Signup";
import Settings from "./components/core/Dashboard/Settings";
import Dashboard from "./pages/Dashboard";
import MyProfile from "./components/core/Dashboard/MyProfile";
import PrivateRoute from "./components/core/Auth/PrivateRoute";
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses";
import StudentLiveClasses from "./components/core/Dashboard/StudentLiveClasses";
import Error from "./pages/Error";
import About from "./pages/About";
import VideoDetails from "./components/core/ViewCourse/VideoDetails";
import CourseNotes from "./components/core/ViewCourse/CourseNotes";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import OpenRoute from "./components/core/Auth/OpenRoute";
import ViewCourse from "./pages/ViewCourse";
import InstructorLiveRoute from "./components/core/Auth/InstructorLiveRoute";
import StudentLiveRoute from "./components/core/Auth/StudentLiveRoute";
import InstructorLiveRoom from "./components/live/InstructorLiveRoom";
import StudentLiveRoom from "./components/live/StudentLiveRoom";
import { ACCOUNT_TYPE } from "./utils/constants";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.profile);
  return (
    <div className="flex min-h-screen w-screen flex-col bg-richblack-900 font-inter">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
         <Route path="/contact" element={<Contact />} />
        <Route path="courses/:courseId" element={<CourseDetails />} />

        <Route path="catalog/:catalogName" element={<Catalog />} />
        {/* Open Route - for Only Non Logged in User */}
        <Route
          path="login"
          element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />
        <Route
          path="forgot-password"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />
        <Route
          // id=token
          // this also when user i not login because i\user use this for forgot password
          path="update-password/:id"
          element={
            <OpenRoute>
              <UpdatePassword />
            </OpenRoute>
          }
        />
        <Route
          path="signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />
        <Route
          path="verify-email"
          element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />
        <Route
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          {/* Route for all users */}
          <Route path="dashboard/instructor" element={<Instructor />} />

          <Route path="dashboard/my-profile" element={<MyProfile />} />
          <Route path="dashboard/Settings" element={<Settings />} />
          {/* Route only for Instructors */}
          {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
            <>
              {/* <Route path="dashboard/instructor" element={<Instructor />} /> */}
              <Route path="dashboard/my-courses" element={<MyCourses />} />
              <Route path="dashboard/add-course" element={<AddCourse />} />
              <Route path="dashboard/instructor" element={<Instructor />} />

              <Route
                path="dashboard/edit-course/:courseId"
                element={<EditCourse />}
              />
              <Route
                path="dashboard/course/:courseId/manage"
                element={<InstructorCourseManager />}
              />
            </>
          )}

          {/* Route only for Students */}
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route
                path="dashboard/enrolled-courses"
                element={<EnrolledCourses />}
              />
              <Route
                path="dashboard/live-classes"
                element={<StudentLiveClasses />}
              />
              <Route path="/dashboard/cart" element={<Cart />} />
            </>
          )}
        </Route>
        {/* For the watching course lectures */}
        <Route
          element={
            <PrivateRoute>
              <ViewCourse />
            </PrivateRoute>
          }
        >
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route
                path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
                element={<VideoDetails />}
              />
              <Route
                path="view-course/:courseId/notes"
                element={<CourseNotes />}
              />
            </>
          )}
        </Route>

        <Route
          path="/live/instructor/:roomId"
          element={
            <PrivateRoute>
              <InstructorLiveRoute>
                <InstructorLiveRoom />
              </InstructorLiveRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/live/student/:roomId"
          element={
            <PrivateRoute>
              <StudentLiveRoute>
                {(courseId) => <StudentLiveRoom courseId={courseId} />}
              </StudentLiveRoute>
            </PrivateRoute>
          }
        />

        {/* 404 Page */}
        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  );
}

export default App;
