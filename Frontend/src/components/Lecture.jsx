import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  uploadLecture,
  getLectures,
  deleteLecture,
} from "../routes/lectureRoutes";
import videoIcon from "../assets/img/video.png";

const Lectures = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
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
  }, [sub_id, navigate]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) {
        toast.error('Please select a video or image file');
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

      toast.success("File uploaded successfully!");
      const updatedLectures = await getLectures(sub_id);
      setLectures(updatedLectures);
      setFormData({
        title: "",
        description: "",
        videoFile: null,
      });
      document.getElementById("videoFile").value = "";
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to upload file");
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePlayVideo = (videoId) => {
    if (currentlyPlaying && currentlyPlaying !== videoId) {
      handleStopVideo(currentlyPlaying);
    }
    
    setCurrentlyPlaying(videoId);
    const videoElement = videoRefs.current[videoId];
    
    if (videoElement) {
      videoElement.src = `/lecture/stream?video_id=${videoId}`;
      videoElement.load();
      
      videoElement.onerror = () => {
        console.error('Video error:', videoElement.error);
        toast.error('Failed to play video');
        setCurrentlyPlaying(null);
      };

      videoElement.oncanplay = () => {
        videoElement.play().catch(err => {
          console.error('Playback failed:', err);
          toast.error('Playback failed - try clicking play again');
        });
      };
    }
  };

  const handleStopVideo = (videoId) => {
    const videoElement = videoRefs.current[videoId];
    if (videoElement) {
      videoElement.pause();
      videoElement.currentTime = 0;
      videoElement.src = '';
    }
    if (currentlyPlaying === videoId) {
      setCurrentlyPlaying(null);
    }
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
      toast.success("File deleted successfully");
      setLectures(lectures.filter((lecture) => lecture.VIDEO_ID !== videoToDelete));
      if (currentlyPlaying === videoToDelete) {
        handleStopVideo(videoToDelete);
      }
    } catch (error) {
      toast.error("Failed to delete file");
      console.error("Error deleting file:", error);
    } finally {
      setShowDeleteModal(false);
      setVideoToDelete(null);
    }
  };

  const handleBack = () => {
    navigate("/teacher-dashboard");
  };

  const isVideoFile = (fileType) => {
    return fileType && fileType.startsWith('video/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-2xl">Loading lectures...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-100 p-6 relative">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this file? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
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
      <div className="flex items-center mb-8">
        <button
          onClick={handleBack}
          className="mr-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Manage Lectures</h1>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Upload New Lecture
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Lecture Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter lecture title"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter lecture description"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Video/Image File</label>
            <div className="flex items-center">
              <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
                <img src={videoIcon} alt="Upload" className="w-10 h-10 mb-2" />
                <span className="text-sm text-gray-600 text-center">
                  {formData.videoFile ? (
                    <div>
                      <div>{formData.videoFile.name}</div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(formData.videoFile.size)}
                      </div>
                    </div>
                  ) : (
                    "Click to select video or image (max 1GB)"
                  )}
                </span>
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
              <p className="text-sm text-gray-600 mt-2">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className={`px-6 py-3 rounded-lg text-white font-medium ${
              uploading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
            } transition`}
          >
            {uploading ? `Uploading... ${uploadProgress}%` : "Upload File"}
          </button>
        </form>
      </div>

      {/* Lectures List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Uploaded Lectures
        </h2>

        {lectures.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No lectures uploaded yet for this subject
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lectures.map((lecture) => (
              <div
                key={lecture.VIDEO_ID}
                className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
              >
                <div className="bg-gray-100 p-4 flex flex-col items-center">
                  {currentlyPlaying === lecture.VIDEO_ID && isVideoFile(lecture.FILE_TYPE) ? (
                    <div className="w-full relative bg-black">
                      <video
                        ref={(el) => (videoRefs.current[lecture.VIDEO_ID] = el)}
                        controls
                        className="w-full h-auto max-h-64"
                        preload="auto"
                        controlsList="nodownload"
                        playsInline
                      >
                        <source 
                          src={`/api/lecture/stream?video_id=${lecture.VIDEO_ID}`}
                          type={lecture.FILE_TYPE || 'video/mp4'}
                        />
                        Your browser does not support the video tag.
                      </video>
                      <button
                        onClick={() => handleStopVideo(lecture.VIDEO_ID)}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
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
                    <>
                      {isVideoFile(lecture.FILE_TYPE) ? (
                        <img
                          src={videoIcon}
                          alt="Video"
                          className="w-16 h-16 mb-4"
                        />
                      ) : (
                        <img
                          src={`/api/lecture/stream?video_id=${lecture.VIDEO_ID}`}
                          alt="Image"
                          className="w-32 h-32 object-cover mb-4 rounded"
                          onError={(e) => {
                            e.target.src = videoIcon;
                            e.target.className = "w-16 h-16 mb-4";
                          }}
                        />
                      )}
                      <div className="flex space-x-2">
                        {isVideoFile(lecture.FILE_TYPE) && (
                          <button
                            onClick={() => handlePlayVideo(lecture.VIDEO_ID)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            Play
                          </button>
                        )}
                        <button
                          onClick={() => confirmDelete(lecture.VIDEO_ID)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {lecture.VIDEO_TITLE}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {lecture.DESCRIPTION || "No description"}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>
                      Uploaded:{" "}
                      {new Date(lecture.UPLOAD_DATE).toLocaleDateString()}
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mb-1">
                        {lecture.FILE_TYPE}
                      </span>
                      {lecture.FILE_SIZE && (
                        <span className="text-xs text-gray-400">
                          {formatFileSize(lecture.FILE_SIZE)}
                        </span>
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