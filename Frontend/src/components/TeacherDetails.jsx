import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaUser, FaEnvelope, FaPhone, FaCheck, FaTimes, FaEdit, FaSave, FaTimesCircle, FaChalkboardTeacher } from "react-icons/fa";
import { getTeacherDetails, updateTeacherDetails } from "../routes/adminRoutes";
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
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? "Verified" : "Unverified") : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setProfilePicPreview(previewUrl);
    setFormData(prev => ({
      ...prev,
      TCH_PIC: file,
    }));
  };

  const handleImageClick = (imageData) => {
    if (!imageData) return;
    const newWindow = window.open();
    newWindow.document.write(
      `<img src="${imageData.startsWith("data:image") ? imageData : jpgImg + imageData}" 
       style="max-width: 100%; height: auto;" />`
    );
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

      if (formData.TCH_PIC) formDataToSend.append("TCH_PIC", formData.TCH_PIC);
      formDataToSend.append("tchId", teacher.TCH_ID);

      const response = await updateTeacherDetails(formDataToSend);
      if (response.success) {
        fetchTeacherDetails();
        toast.success("Teacher updated successfully");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Failed to update teacher");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (teacher) {
      setFormData({
        TCH_NAME: teacher.TCH_NAME,
        TCH_MOBILE: teacher.TCH_MOBILE,
        TCH_EMAIL: teacher.TCH_EMAIL,
        TCH_CODE: teacher.TCH_CODE,
        VERIFIED: teacher.VERIFIED,
      });
    }
    setProfilePicPreview(null);
  };

  if (loading && !teacher) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading teacher details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-indigo-800">
                {isEditing ? "Edit Teacher Details" : "Teacher Details"}
              </h2>
              <p className="text-indigo-600">
                {teacher.TCH_CODE} - {teacher.TCH_NAME}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Teacher Photo */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-48 h-48 rounded-full bg-indigo-50 mb-4 overflow-hidden border-4 border-indigo-100 cursor-pointer shadow-md"
                    onClick={() => handleImageClick(profilePicPreview || jpgImg + teacher.TCH_PIC)}
                  >
                    <img
                      src={profilePicPreview || jpgImg + teacher.TCH_PIC}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {isEditing && (
                    <label className="cursor-pointer bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors flex items-center">
                      <FaEdit className="mr-2" />
                      Change Photo
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                  
                  <div className="flex items-center mt-4">
                    <span className="text-sm font-medium text-gray-700 mr-3">Status:</span>
                    {isEditing ? (
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="VERIFIED"
                          checked={formData.VERIFIED === "Verified"}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className={`relative w-11 h-6 rounded-full peer ${formData.VERIFIED === "Verified" ? 'bg-green-500' : 'bg-gray-300'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {formData.VERIFIED}
                        </span>
                      </label>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                        teacher.VERIFIED === "Verified"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {teacher.VERIFIED === "Verified" ? (
                          <FaCheck className="mr-1" />
                        ) : (
                          <FaTimesCircle className="mr-1" />
                        )}
                        {teacher.VERIFIED}
                      </span>
                    )}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="bg-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center">
                    <FaChalkboardTeacher className="mr-2" />
                    Basic Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Code</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="TCH_CODE"
                          value={formData.TCH_CODE}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      ) : (
                        <div className="w-full p-3 bg-white border border-gray-300 rounded-lg">
                          {teacher.TCH_CODE}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="TCH_NAME"
                          value={formData.TCH_NAME}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      ) : (
                        <div className="w-full p-3 bg-white border border-gray-300 rounded-lg">
                          {teacher.TCH_NAME}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center">
                    <FaEnvelope className="mr-2" />
                    Contact Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                      {isEditing ? (
                        <div className="relative">
                          <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
                          <input
                            type="tel"
                            name="TCH_MOBILE"
                            value={formData.TCH_MOBILE}
                            onChange={handleInputChange}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
                          <div className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-lg">
                            {teacher.TCH_MOBILE}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                        <div className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-lg">
                          {teacher.TCH_EMAIL}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              {!isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                  >
                    <FaEdit className="mr-2" />
                    Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                  >
                    <FaTimes className="mr-2" />
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                    disabled={loading}
                  >
                    <FaTimes className="mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        Save Changes
                      </>
                    )}
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