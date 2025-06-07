import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getTeacherDetails,
  updateTeacherDetails,
} from "../routes/adminRoutes";
import { jpgImg } from "../config/config";

const TeacherDetails = ({ teacherId, onClose, onUpdate }) => {
  const [teacher, setTeacher] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  const [formData, setFormData] = useState({
    TCH_NAME: "",
    TCH_MOBILE: "",
    TCH_EMAIL: "",
    TCH_CODE: "",
    VERIFIED: "Unverified",
  });

  // Load teacher details when component mounts or teacherId changes
  useEffect(() => {
    fetchTeacherDetails();
  }, [teacherId]);

  const fetchTeacherDetails = async () => {
    if (!teacherId) return;

    setLoading(true);
    try {
      const response = await getTeacherDetails(teacherId);
      setTeacher(response);

      setFormData({
        TCH_NAME: response.TCH_NAME,
        TCH_MOBILE: response.TCH_MOBILE,
        TCH_EMAIL: response.TCH_EMAIL,
        TCH_CODE: response.TCH_CODE,
        VERIFIED: response.VERIFIED,
      });
    } catch (error) {
      toast.error("Failed to load teacher details");
      console.error("Error loading teacher details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === "VERIFIED") {
      setFormData({
        ...formData,
        VERIFIED: checked ? "Verified" : "Unverified",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfilePicPreview(URL.createObjectURL(file));
    setFormData((prev) => ({
      ...prev,
      TCH_PIC: file,
    }));
  };

  const handleImageClick = (imageData) => {
    if (!imageData) return;

    if (imageData.startsWith("data:image")) {
      const newWindow = window.open();
      newWindow.document.write(
        `<img src="${imageData}" style="max-width: 100%; height: auto;" />`
      );
    } else if (jpgImg) {
      const newWindow = window.open();
      newWindow.document.write(
        `<img src="${
          jpgImg + imageData
        }" style="max-width: 100%; height: auto;" />`
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "TCH_PIC") {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (formData.TCH_PIC) {
        formDataToSend.append("TCH_PIC", formData.TCH_PIC);
      }

      formDataToSend.append("tchId", teacher.TCH_ID);

      const response = await updateTeacherDetails(formDataToSend);
      if (response.success) {
        fetchTeacherDetails();
        toast.success("Teacher updated successfully");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Failed to update teacher");
      console.error("Error updating teacher:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original teacher data
    if (teacher) {
      setFormData({
        TCH_NAME: teacher.TCH_NAME,
        TCH_MOBILE: teacher.TCH_MOBILE,
        TCH_EMAIL: teacher.TCH_EMAIL,
        TCH_CODE: teacher.TCH_CODE,
        VERIFIED: teacher.VERIFIED,
      });
    }
    // Clear previews
    setProfilePicPreview(null);
  };

  if (loading && !teacher) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading teacher details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? "Edit Teacher Details" : "Teacher Details"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Teacher Photo */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-64 h-64 rounded-full bg-gray-200 mb-2 overflow-hidden border-2 border-orange-300 cursor-pointer"
                    onClick={() =>
                      handleImageClick(
                        profilePicPreview || jpgImg + teacher.TCH_PIC
                      )
                    }
                  >
                    <img
                      src={profilePicPreview || jpgImg + teacher.TCH_PIC}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isEditing && (
                    <label className="cursor-pointer bg-orange-100 text-orange-700 px-4 py-2 rounded-md hover:bg-orange-200 transition-colors">
                      Change Photo
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                  <div className="flex items-center mt-2">
                    <label className="block text-sm font-medium text-gray-700 mr-4">
                      Status:
                    </label>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        name="VERIFIED"
                        checked={formData.VERIFIED === "Verified"}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                    ) : (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          teacher.VERIFIED === "Verified"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {teacher.VERIFIED}
                      </span>
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teacher Code
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="TCH_CODE"
                        value={formData.TCH_CODE}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    ) : (
                      <input
                        type="text"
                        value={teacher.TCH_CODE}
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                        readOnly
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="TCH_NAME"
                        value={formData.TCH_NAME}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    ) : (
                      <input
                        type="text"
                        value={teacher.TCH_NAME}
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                        readOnly
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Contact and Institute Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="TCH_MOBILE"
                          value={formData.TCH_MOBILE}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      ) : (
                        <input
                          type="text"
                          value={teacher.TCH_MOBILE}
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                          readOnly
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="text"
                        value={teacher.TCH_EMAIL}
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              {!isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={()=>{setIsEditing(true)}}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetails;