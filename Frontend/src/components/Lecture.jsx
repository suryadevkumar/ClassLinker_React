import React, { useState, useEffect, useRef } from "react";
import { FaPlay, FaStop, FaTrash, FaUpload, FaChevronLeft, FaFileAlt } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { uploadLecture, getLectures, deleteLecture } from "../routes/lectureRoutes";

const Lectures = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [videoLoading, setVideoLoading] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const videoRefs = useRef({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoFile: null,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const sub_id = location.state?.subjectId;
  const subjectName = location.state?.subjectName;
  const userType = location.state?.userType;

  useEffect(() => {
    const loadLectures = async () => {
      try {
        const data = await getLectures(sub_id);
        setLectures(data);
      } catch (error) {
        toast.error("Failed to load lectures");
        console.error("Error loading lectures:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLectures();

    return () => {
      Object.values(videoRefs.current).forEach((video) => {
        if (video) {
          video.pause();
          video.src = "";
        }
      });
      videoRefs.current = {};
    };
  }, [sub_id]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i]);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("video/") && !file.type.startsWith("image/")) {
        toast.error("Please select a video or image file");
        return;
      }
      if (file.size > 1073741824) { // 1GB
        toast.error("File size exceeds 1GB limit");
        return;
      }
      setFormData({
        ...formData,
        videoFile: file,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.videoFile) {
      toast.warning("Please select a file");
      return;
    }

    if (!formData.title.trim()) {
      toast.warning("Please enter a title");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const lectureData = new FormData();
      lectureData.append("videoFile", formData.videoFile);
      lectureData.append("title", formData.title);
      lectureData.append("description", formData.description);
      lectureData.append("sub_id", sub_id);

      await uploadLecture(lectureData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setUploadProgress(progress);
        },
      });

      toast.success("Lecture uploaded successfully!");
      const updatedLectures = await getLectures(sub_id);
      setLectures(updatedLectures);
      setFormData({
        title: "",
        description: "",
        videoFile: null,
      });
      document.getElementById("videoFile").value = "";
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to upload lecture");
      console.error("Error uploading lecture:", error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePlayVideo = async (videoId) => {
    if (currentlyPlaying && currentlyPlaying !== videoId) {
      handleStopVideo(currentlyPlaying);
    }

    setVideoLoading((prev) => ({ ...prev, [videoId]: true }));
    setCurrentlyPlaying(videoId);

    await new Promise((resolve) => setTimeout(resolve, 0));

    const videoElement = videoRefs.current[videoId];
    if (!videoElement) {
      console.error("Video element not found for ID:", videoId);
      toast.error("Video player not ready - please try again");
      setVideoLoading((prev) => ({ ...prev, [videoId]: false }));
      return;
    }

    videoElement.src = "";
    videoElement.load();

    const errorHandler = () => {
      console.error("Video playback failed", videoElement.error);
      toast.error("Failed to play video");
      setCurrentlyPlaying(null);
      setVideoLoading((prev) => ({ ...prev, [videoId]: false }));
    };

    const canPlayHandler = () => {
      videoElement.play().catch((err) => {
        console.error("Playback failed:", err);
        toast.error("Playback failed - try clicking play again");
        setVideoLoading((prev) => ({ ...prev, [videoId]: false }));
        setCurrentlyPlaying(null);
      });
    };

    const waitingHandler = () => {
      setVideoLoading((prev) => ({ ...prev, [videoId]: true }));
    };

    const playingHandler = () => {
      setVideoLoading((prev) => ({ ...prev, [videoId]: false }));
    };

    videoElement.addEventListener("error", errorHandler);
    videoElement.addEventListener("canplay", canPlayHandler);
    videoElement.addEventListener("waiting", waitingHandler);
    videoElement.addEventListener("playing", playingHandler);

    videoElement._eventHandlers = {
      error: errorHandler,
      canplay: canPlayHandler,
      waiting: waitingHandler,
      playing: playingHandler,
    };

    const lecture = lectures.find((l) => l.VIDEO_ID === videoId);
    const videoUrl = `http://localhost:3000/api/lecture/stream?video_id=${videoId}`;

    videoElement.preload = "auto";
    videoElement.src = videoUrl;

    if (lecture && lecture.FILE_TYPE) {
      videoElement.type = lecture.FILE_TYPE;
    }

    videoElement.load();
  };

  const handleStopVideo = (videoId) => {
    const videoElement = videoRefs.current[videoId];
    if (videoElement) {
      if (videoElement._eventHandlers) {
        Object.entries(videoElement._eventHandlers).forEach(
          ([event, handler]) => {
            videoElement.removeEventListener(event, handler);
          }
        );
        delete videoElement._eventHandlers;
      }

      videoElement.pause();
      videoElement.currentTime = 0;
      videoElement.src = "";
      videoElement.load();
    }

    if (currentlyPlaying === videoId) {
      setCurrentlyPlaying(null);
    }

    setVideoLoading((prev) => ({ ...prev, [videoId]: false }));
  };

  const confirmDelete = (videoId) => {
    setVideoToDelete(videoId);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setVideoToDelete(null);
  };

  const executeDelete = async () => {
    if (!videoToDelete) return;

    try {
      await deleteLecture(videoToDelete);
      toast.success("Lecture deleted successfully");
      setLectures(
        lectures.filter((lecture) => lecture.VIDEO_ID !== videoToDelete)
      );
      if (currentlyPlaying === videoToDelete) {
        handleStopVideo(videoToDelete);
      }
    } catch (error) {
      toast.error("Failed to delete lecture");
      console.error("Error deleting lecture:", error);
    } finally {
      setShowDeleteModal(false);
      setVideoToDelete(null);
    }
  };

  const handleBack = () => {
    navigate(`/${userType}Dashboard`);
  };

  const isVideoFile = (fileType) => {
    return fileType && fileType.startsWith("video/");
  };

  const LoadingSpinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="text-white mt-2 text-sm">Loading video...</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-2 px-32 bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this lecture? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-indigo-800 flex items-center">
            <FaFileAlt className="mr-2" />
            {subjectName} Lectures
          </h1>
          <p className="text-indigo-600">{userType === 'teacher' ? 'Manage' : 'View'} course lectures</p>
        </div>
        <button
          onClick={handleBack}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mt-4 md:mt-0"
        >
          <FaChevronLeft className="mr-1" />
          Back to Dashboard
        </button>
      </div>

      {/* Upload Form - Only for teachers */}
      {userType === 'teacher' && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-indigo-700 mb-4 flex items-center">
            <FaUpload className="mr-2" />
            Upload New Lecture
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lecture Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter lecture title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter lecture description"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lecture File (Video/Image)</label>
              <div className="flex items-center">
                <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-blue-50 w-full">
                  {formData.videoFile ? (
                    <div className="text-center">
                      <FaFileAlt className="mx-auto text-2xl text-indigo-600 mb-2" />
                      <p className="text-sm font-medium text-gray-800">{formData.videoFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatFileSize(formData.videoFile.size)}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FaUpload className="mx-auto text-2xl text-indigo-600 mb-2" />
                      <p className="text-sm text-gray-600">Click to select file</p>
                      <p className="text-xs text-gray-500 mt-1">Supports: MP4, MOV, AVI, JPG, PNG (Max 1GB)</p>
                    </div>
                  )}
                  <input
                    id="videoFile"
                    type="file"
                    accept="video/*,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                </label>
              </div>
            </div>

            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className={`w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium ${
                uploading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } transition`}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                'Upload Lecture'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Lectures List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 bg-indigo-50 border-b border-indigo-100">
          <h2 className="text-lg font-semibold text-indigo-700">
            {lectures.length} {lectures.length === 1 ? 'Lecture' : 'Lectures'} Available
          </h2>
        </div>

        {lectures.length === 0 ? (
          <div className="p-8 text-center">
            <FaFileAlt className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-500">No lectures available yet</h3>
            {userType === 'teacher' && (
              <p className="text-gray-500 mt-2">Upload your first lecture using the form above</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {lectures.map((lecture) => (
              <div key={lecture.VIDEO_ID} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                <div className="bg-gray-100 p-4 flex flex-col items-center relative">
                  {currentlyPlaying === lecture.VIDEO_ID && isVideoFile(lecture.FILE_TYPE) ? (
                    <div className="w-full relative bg-black">
                      {videoLoading[lecture.VIDEO_ID] && <LoadingSpinner />}
                      <video
                        ref={(el) => {
                          if (el) {
                            videoRefs.current[lecture.VIDEO_ID] = el;
                          } else {
                            delete videoRefs.current[lecture.VIDEO_ID];
                          }
                        }}
                        controls
                        className="w-full h-auto max-h-64"
                        preload="metadata"
                        controlsList="nodownload"
                        playsInline
                      />
                      <button
                        onClick={() => handleStopVideo(lecture.VIDEO_ID)}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 z-20"
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
                  ) : (
                    <div className="w-full h-48 bg-indigo-50 flex items-center justify-center relative">
                      {isVideoFile(lecture.FILE_TYPE) ? (
                        <>
                          <FaFileAlt className="text-8xl text-indigo-400" />
                          <button
                            onClick={() => handlePlayVideo(lecture.VIDEO_ID)}
                            disabled={videoLoading[lecture.VIDEO_ID]}
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition"
                          >
                            <div className="bg-indigo-600 text-white p-3 rounded-full">
                              {videoLoading[lecture.VIDEO_ID] ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              ) : (
                                <FaPlay />
                              )}
                            </div>
                          </button>
                        </>
                      ) : (
                        <img
                          src={`http://localhost:3000/api/lecture/stream?video_id=${lecture.VIDEO_ID}`}
                          alt="Lecture"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.src = '';
                            e.target.className = 'hidden';
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{lecture.VIDEO_TITLE}</h3>
                  <p className="text-gray-600 text-sm mb-3">{lecture.DESCRIPTION || "No description"}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(lecture.UPLOAD_DATE).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      {isVideoFile(lecture.FILE_TYPE) && (
                        <button
                          onClick={() => currentlyPlaying === lecture.VIDEO_ID ? 
                            handleStopVideo(lecture.VIDEO_ID) : 
                            handlePlayVideo(lecture.VIDEO_ID)}
                          className={`p-2 rounded-full ${
                            currentlyPlaying === lecture.VIDEO_ID ? 
                              'bg-red-100 text-red-600 hover:bg-red-200' : 
                              'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                          }`}
                          title={currentlyPlaying === lecture.VIDEO_ID ? "Stop" : "Play"}
                        >
                          {currentlyPlaying === lecture.VIDEO_ID ? <FaStop /> : <FaPlay />}
                        </button>
                      )}
                      {userType === 'teacher' && (
                        <button
                          onClick={() => confirmDelete(lecture.VIDEO_ID)}
                          className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lectures;