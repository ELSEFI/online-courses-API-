import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Star,
  BookOpen,
  Users,
  Award,
  Calendar,
  Mail,
  Facebook,
  Linkedin,
  Youtube,
  FileText,
  Loader,
  Edit,
  Lock,
  X,
  Check,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";

const UserProfile = () => {
  const { userId: urlUserId } = useParams();
  const [user, setUser] = useState(null);
  const [instructorProfile, setInstructorProfile] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchUserProfile(urlUserId);
  }, [urlUserId]);

  const fetchUserProfile = async (profileUserId) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      let currentUserData = null;

      try {
        const currentUserResponse = await fetch("/api/v1/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (currentUserResponse.ok) {
          currentUserData = await currentUserResponse.json();
          if (currentUserData.imageUrl) {
            currentUserData.user.profileImage = currentUserData.imageUrl;
          }
        }
      } catch (err) {
        console.log("Error fetching current user:", err);
      }

      let targetUserId = profileUserId;
      let userData = null;

      if (!targetUserId && currentUserData) {
        setIsOwnProfile(true);
        userData = currentUserData;
        setUser(currentUserData.user);
        setEditedData({
          name: currentUserData.user.name,
          email: currentUserData.user.email,
        });
        targetUserId = currentUserData.user._id;
      } else if (
        targetUserId &&
        currentUserData &&
        targetUserId === currentUserData.user._id
      ) {
        setIsOwnProfile(true);
        userData = currentUserData;
        setUser(currentUserData.user);
        setEditedData({
          name: currentUserData.user.name,
          email: currentUserData.user.email,
        });
      } else if (targetUserId) {
        setIsOwnProfile(false);
        const userResponse = await fetch(`/api/v1/users/${targetUserId}`);
        if (!userResponse.ok) throw new Error("User not found");
        const fetchedUser = await userResponse.json();
        setUser(fetchedUser);
        userData = { user: fetchedUser };
      } else {
        throw new Error("Please login to view your profile");
      }

      if (userData?.user?.role === "instructor" && targetUserId) {
        try {
          const instructorResponse = await fetch(
            `/api/v1/instructor/profile/${targetUserId}`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
          );

          if (instructorResponse.ok) {
            const instructorData = await instructorResponse.json();
            setInstructorProfile(instructorData.profile);

            const coursesResponse = await fetch(
              `/api/v1/courses/instructor/${targetUserId}`
            );
            if (coursesResponse.ok) {
              const coursesData = await coursesResponse.json();
              setInstructorCourses(coursesData.courses || []);
            }
          }
        } catch (err) {
          console.log("Error fetching instructor data:", err);
        }
      }

      if (isOwnProfile && currentUserData) {
        try {
          const enrolledResponse = await fetch(
            "/api/v1/enrollments/my-courses",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (enrolledResponse.ok) {
            const enrolledData = await enrolledResponse.json();
            setEnrolledCourses(enrolledData.courses || []);
          }
        } catch (err) {
          console.log("Error fetching enrolled courses:", err);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setSaveLoading(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", editedData.name);
      formData.append("email", editedData.email);
      if (editedData.profileImage) {
        formData.append("profileImage", editedData.profileImage);
      }

      const response = await fetch("http://localhost:5000/api/v1/users/update-profile", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const data = await response.json();
      setUser((prev) => ({
        ...prev,
        name: data.user.name,
        email: data.user.email,
        profileImage: data.imageUrl || prev.profileImage,
      }));

      setSuccessMessage("Profile updated successfully!");
      setIsEditingProfile(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        alert("Passwords don't match!");
        return;
      }

      setSaveLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("/api/v1/users/update-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update password");
      }

      setSuccessMessage("Password updated successfully!");
      setIsEditingPassword(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedData((prev) => ({ ...prev, profileImage: file }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="bg-red-900/50 border border-red-500 rounded-xl p-8 text-center max-w-md">
          <p className="text-white text-xl mb-4">
            {error || "Failed to load profile"}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => fetchUserProfile(urlUserId)}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition"
            >
              Retry
            </button>
            <button
              onClick={() => (window.location.href = "/login")}
              className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isInstructor = user.role === "instructor";
  let profileImage = user.profileImage?.startsWith("http")
    ? user.profileImage
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-24 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in">
            <Check className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-8 mb-8 shadow-2xl border border-gray-700">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Image */}
            <div className="relative">
              <img
                src={profileImage}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-purple-500 shadow-xl object-cover"
              />
              {isOwnProfile && isEditingProfile && (
                <label className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 p-2 rounded-full cursor-pointer transition">
                  <Upload className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex-1 w-full text-center md:text-left">
              {/* Name Section */}
              {isOwnProfile && isEditingProfile ? (
                <div className="mb-4">
                  <label className="text-sm text-gray-400 block mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editedData.name}
                    onChange={(e) =>
                      setEditedData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Enter your name"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {user.name}
                  </h1>
                  {user.emailVerified && (
                    <div className="bg-green-500 rounded-full px-3 py-1 text-xs font-semibold">
                      Verified
                    </div>
                  )}
                </div>
              )}

              {isInstructor && instructorProfile && (
                <p className="text-xl text-gray-300 mb-3">
                  {instructorProfile.jobTitle?.en ||
                    instructorProfile.jobTitle?.ar}
                </p>
              )}

              {/* Email Section */}
              {isOwnProfile && isEditingProfile ? (
                <div className="mb-4">
                  <label className="text-sm text-gray-400 block mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editedData.email}
                    onChange={(e) =>
                      setEditedData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Enter your email"
                  />
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Joined{" "}
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isOwnProfile && (
                <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
                  {isEditingProfile ? (
                    <>
                      <button
                        onClick={handleUpdateProfile}
                        disabled={saveLoading}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-lg transition font-semibold disabled:opacity-50"
                      >
                        {saveLoading ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <Check className="w-5 h-5" />
                        )}
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setEditedData({ name: user.name, email: user.email });
                        }}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-5 py-2.5 rounded-lg transition font-semibold"
                      >
                        <X className="w-5 h-5" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-5 py-2.5 rounded-lg transition font-semibold"
                      >
                        <Edit className="w-5 h-5" />
                        Edit Profile
                      </button>
                      <button
                        onClick={() => setIsEditingPassword(!isEditingPassword)}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-5 py-2.5 rounded-lg transition font-semibold"
                      >
                        <Lock className="w-5 h-5" />
                        Change Password
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Password Change Section */}
              {isOwnProfile && isEditingPassword && (
                <div className="bg-gray-800 rounded-xl p-6 mb-4 space-y-4 border border-gray-600">
                  <h3 className="text-xl font-bold mb-4">Change Password</h3>

                  <div className="relative">
                    <label className="text-sm text-gray-400 block mb-2">
                      Current Password
                    </label>
                    <input
                      type={showPasswords.old ? "text" : "password"}
                      value={passwordData.oldPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          oldPassword: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pr-12 text-white focus:border-purple-500 focus:outline-none"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          old: !prev.old,
                        }))
                      }
                      className="absolute right-3 top-9 text-gray-400 hover:text-white"
                    >
                      {showPasswords.old ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <label className="text-sm text-gray-400 block mb-2">
                      New Password
                    </label>
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pr-12 text-white focus:border-purple-500 focus:outline-none"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          new: !prev.new,
                        }))
                      }
                      className="absolute right-3 top-9 text-gray-400 hover:text-white"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <label className="text-sm text-gray-400 block mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmNewPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmNewPassword: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pr-12 text-white focus:border-purple-500 focus:outline-none"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                      className="absolute right-3 top-9 text-gray-400 hover:text-white"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleUpdatePassword}
                      disabled={saveLoading}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-lg transition font-semibold disabled:opacity-50"
                    >
                      {saveLoading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                      Update Password
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingPassword(false);
                        setPasswordData({
                          oldPassword: "",
                          newPassword: "",
                          confirmNewPassword: "",
                        });
                      }}
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-5 py-2.5 rounded-lg transition font-semibold"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Instructor Bio & Social */}
              {isInstructor && instructorProfile && (
                <>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {instructorProfile.bio?.en || instructorProfile.bio?.ar}
                  </p>

                  {instructorProfile.socials && (
                    <div className="flex gap-3 justify-center md:justify-start">
                      {instructorProfile.socials.facebook && (
                        <a
                          href={instructorProfile.socials.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full transition"
                        >
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                      {instructorProfile.socials.linkedin && (
                        <a
                          href={instructorProfile.socials.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-500 hover:bg-blue-600 p-3 rounded-full transition"
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                      {instructorProfile.socials.youtube && (
                        <a
                          href={instructorProfile.socials.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 hover:bg-red-700 p-3 rounded-full transition"
                        >
                          <Youtube className="w-5 h-5" />
                        </a>
                      )}
                      {instructorProfile.cvFile && (
                        <a
                          href={instructorProfile.cvFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-purple-600 hover:bg-purple-700 p-3 rounded-full transition"
                        >
                          <FileText className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section - Instructor Only */}
        {isInstructor && instructorProfile && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm mb-1">Rating</p>
                  <p className="text-3xl font-bold">
                    {instructorProfile.rating?.toFixed(1) || "0.0"}
                  </p>
                  <p className="text-purple-200 text-xs">
                    ({instructorProfile.totalRatings || 0} reviews)
                  </p>
                </div>
                <Star className="w-12 h-12 text-purple-200 fill-current" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm mb-1">Students</p>
                  <p className="text-3xl font-bold">
                    {(instructorProfile.totalStudents || 0).toLocaleString()}
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm mb-1">Courses</p>
                  <p className="text-3xl font-bold">
                    {instructorProfile.totalCourses || 0}
                  </p>
                </div>
                <BookOpen className="w-12 h-12 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-200 text-sm mb-1">Experience</p>
                  <p className="text-3xl font-bold">
                    {instructorProfile.experienceYears || 0} years
                  </p>
                </div>
                <Award className="w-12 h-12 text-orange-200" />
              </div>
            </div>
          </div>
        )}

        {/* Courses Section */}
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-purple-400" />
            {isInstructor ? "Published Courses" : "Enrolled Courses"}
          </h2>

          {(isInstructor ? instructorCourses : enrolledCourses).length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {isInstructor
                  ? "No courses published yet"
                  : "No courses enrolled yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(isInstructor ? instructorCourses : enrolledCourses).map(
                (course) => (
                  <div
                    key={course._id || course.id}
                    className="bg-gray-700 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all shadow-lg border border-gray-600"
                  >
                    <img
                      src={
                        course.thumbnail ||
                        course.image ||
                        "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400"
                      }
                      alt={course.title?.en || course.title?.ar || course.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">
                        {course.title?.en || course.title?.ar || course.title}
                      </h3>

                      {isInstructor ? (
                        <>
                          <div className="flex items-center gap-2 text-gray-300 mb-2">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">
                              {course.studentsCount || course.students || 0}{" "}
                              students
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-yellow-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-bold">
                              {course.rating?.toFixed(1) || "0.0"}
                            </span>
                            <span className="text-gray-400 text-sm">
                              ({course.reviewsCount || course.reviews || 0})
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          {course.instructor && (
                            <p className="text-sm text-gray-400 mb-3">
                              Instructor:{" "}
                              {course.instructor.name || course.instructorName}
                            </p>
                          )}
                          {course.progress !== undefined && (
                            <div className="mb-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">Progress</span>
                                <span className="text-purple-400 font-bold">
                                  {course.progress}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-600 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                  style={{ width: `${course.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
