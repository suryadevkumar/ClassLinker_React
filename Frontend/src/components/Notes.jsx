import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
    getNotesList,
    uploadNotes,
    downloadNote,
    deleteNote,
} from "../routes/notesRoutes";
import fileImage from "../assets/img/file.png";
import { useLocation } from "react-router-dom";

const Notes = () => {
    const location = useLocation();
    const userType = location.state?.userType;
    const subId = location.state?.subjectId;
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [subjectName, setSubjectName] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const subName = sessionStorage.getItem("sub_name");
                if (subName) setSubjectName(subName);

                const notesList = await getNotesList(subId);
                setNotes(notesList);
            } catch (error) {
                toast.error("Failed to load notes");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, [subId]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !file) {
            toast.error("Please provide both the note title and file!");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("notesTitle", title);
            formData.append("notesFile", file);
            formData.append("sub_id", subId);

            await uploadNotes(formData);
            toast.success("Note uploaded successfully");

            // Refresh notes list
            const notesList = await getNotesList(subId);
            setNotes(notesList);

            // Reset form
            setTitle("");
            setFile(null);
            document.getElementById("notesFile").value = "";
        } catch (error) {
            toast.error("Error uploading note");
        }
    };

    const handleDownload = async (noteId) => {
        try {
            const { data, fileName, contentType } = await downloadNote(noteId);

            // Create blob with correct file type
            const blob = new Blob([data], { type: contentType });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Download started");
        } catch (error) {
            toast.error("Failed to download note");
            console.error("Download error:", error);
        }
    };

    const handleView = async (noteId) => {
        try {
            const { data, contentType } = await downloadNote(noteId);
            const blob = new Blob([data], { type: contentType });
            const url = window.URL.createObjectURL(blob);

            // Open in new tab
            window.open(url, '_blank');

            // Note: We can't revoke the URL immediately as it's needed in the new tab
            // The browser will clean this up when the tab is closed
        } catch (error) {
            toast.error("Failed to open document");
            console.error("View error:", error);
        }
    };

    const confirmDelete = (noteId) => {
        setNoteToDelete(noteId);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            await deleteNote(noteToDelete);
            toast.success("Note deleted successfully");

            // Refresh notes list
            const notesList = await getNotesList(subId);
            setNotes(notesList);
        } catch (error) {
            toast.error("Error deleting note");
        } finally {
            setShowDeleteModal(false);
            setNoteToDelete(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-amber-50 to-pink-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-amber-50 to-pink-100 flex flex-col">
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
                        <p className="mb-6">Are you sure you want to delete this note? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setNoteToDelete(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-8">
                {/* Subject Header - Show for both but styled differently */}
                {subjectName && (
                    <h2
                        className={`text-2xl font-bold mb-6 ${userType === "student" ? "text-center" : ""
                            }`}
                    >
                        {userType === "student" ? (
                            <>
                                Subject: <span className="text-blue-600">{subjectName}</span>
                            </>
                        ) : (
                            `Subject: ${subjectName}`
                        )}
                    </h2>
                )}

                {/* Upload Form - Only for teachers */}
                {userType === "teacher" && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 w-full md:w-1/2 mx-auto">
                        <h2 className="text-2xl font-bold mb-4 text-center">
                            Upload Notes
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="notesTitle"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Notes Title
                                </label>
                                <input
                                    type="text"
                                    id="notesTitle"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter notes title"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="notesFile"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Notes File
                                </label>
                                <input
                                    type="file"
                                    id="notesFile"
                                    onChange={handleFileChange}
                                    accept=".pdf,.docx,.txt,.jpeg,.jpg,.png"
                                    className="w-full px-4 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                            >
                                Upload Notes
                            </button>
                        </form>
                    </div>
                )}

                {/* Notes List */}
                <div
                    className={`w-full lg:w-2/3  mx-auto`}
                >
                    <h3 className="text-xl font-semibold mb-4">
                        {userType === "teacher" ? "Notes List" : "Available Notes"}
                    </h3>

                    {notes.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                            <p className="text-gray-500">No notes available</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notes.map((note, index) => (
                                <div
                                    key={note[0]}
                                    className={`bg-white rounded-xl shadow-lg p-4 flex items-center ${userType === "student"
                                        ? "hover:bg-gray-50 transition-colors"
                                        : ""
                                        }`}
                                >
                                    <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4">
                                        {index + 1}
                                    </div>
                                    <div className="mx-4">
                                        <img src={fileImage} alt="fileImage" className="w-8 h-8" />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold">{note[1]}</h3>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleView(note[0])}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDownload(note[0])}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200"
                                        >
                                            Download
                                        </button>
                                        {userType === "teacher" && (
                                            <button
                                                onClick={() => confirmDelete(note[0])}
                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Notes;