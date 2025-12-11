import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import VerifyEmail from "./Pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import BeInstructor from "./Pages/beInstructor";
import UserProfile from "./Pages/Profile";
import { UserLayout } from "./components/Layout/userLayout";
import { Home } from "./Pages/home";
import NotFound from "./Pages/404Page";
import DashboardLayout from "./Pages/Admin/AdminPage";
import Overview from "./Pages/Admin/Overview";
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="verify-email" element={<VerifyEmail />} />
            <Route path="be-instructor" element={<BeInstructor />} />
            <Route path="profile" element={<UserProfile />} />{" "}
            <Route path="profile/:userId" element={<UserProfile />} />{" "}
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>
          {/* Admin Routes */}
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            {/* <Route path="users" element={<Users />} /> */}
            {/* <Route path="instructors" element={<Instructors />} /> */}
            {/* <Route path="courses" element={<Courses />} /> */}
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
