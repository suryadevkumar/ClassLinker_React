import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaFileAlt, FaUpload, FaDownload, FaEye, FaTrash, FaBook, FaChevronLeft  } from "react-icons/fa";
import {
    getNotesList,
    uploadNotes,
    downloadNote,
    deleteNote,
} from "../routes/notesRoutes";
import { useLocation, useNavigate } from "react-router-dom";

const Notes = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userType = location.state?.userType;
    const subId = location.state?.subjectId;
    const subName = location.state?.subjectName;
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
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

        setUploading(true);
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
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (noteId, noteTitle) => {
        try {
            const { data, fileName, contentType } = await downloadNote(noteId);

            // Create blob with correct file type
            const blob = new Blob([data], { type: contentType });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = fileName || `${noteTitle}.${contentType.split('/')[1]}`;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
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
            window.open(url, '_blank');
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
            <div className="flex justify-center items-center min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this note? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
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
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-indigo-800 flex items-center">
                            <FaBook className="mr-2" />
                            {subName} Notes
                        </h1>
                        <p className="text-indigo-600">{userType === 'teacher' ? 'Manage' : 'View'} course materials</p>
                    </div>
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 mt-4 md:mt-0"
                    >
                        <FaChevronLeft className="mr-1" />
                        Back to Dashboard
                    </button>
                </div>

                {/* Upload Form - Only for teachers */}
                {userType === "teacher" && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-bold mb-4 text-indigo-700 flex items-center">
                            <FaUpload className="mr-2" />
                            Upload New Notes
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="notesTitle"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Notes Title
                                </label>
                                <input
                                    type="text"
                                    id="notesTitle"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter notes title"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="notesFile"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Notes File (PDF, DOCX, TXT, Images)
                                </label>
                                <div className="flex items-center">
                                    <label className="flex flex-col items-center px-4 py-6 bg-white text-blue-500 rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-blue-50 w-full">
                                        <FaFileAlt className="text-2xl mb-2" />
                                        <span className="text-sm">
                                            {file ? file.name : 'Choose a file'}
                                        </span>
                                        <input
                                            type="file"
                                            id="notesFile"
                                            onChange={handleFileChange}
                                            accept=".pdf,.docx,.txt,.jpeg,.jpg,.png"
                                            className="hidden"
                                            required
                                        />
                                    </label>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center disabled:opacity-70"
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
                                    'Upload Notes'
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Notes List */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-4 bg-indigo-50 border-b border-indigo-100">
                        <h2 className="text-lg font-semibold text-indigo-700">
                            {notes.length} {notes.length === 1 ? 'Note' : 'Notes'} Available
                        </h2>
                    </div>

                    {notes.length === 0 ? (
                        <div className="p-8 text-center">
                            <FaFileAlt className="mx-auto text-4xl text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-500">No notes available yet</h3>
                            {userType === 'teacher' && (
                                <p className="text-gray-500 mt-2">Upload your first note using the form above</p>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {notes.map((note, index) => (
                                <div key={note[0]} className="p-4 hover:bg-gray-50 transition">
                                    <div className="flex items-start">
                                        <div className="bg-indigo-100 text-indigo-600 rounded-lg p-3 mr-4">
                                            <FaFileAlt className="text-xl" />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-medium text-gray-800">{note[1]}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Uploaded on {new Date(note[2]).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleView(note[0])}
                                                className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full transition"
                                                title="View"
                                            >
                                                <FaEye />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(note[0], note[1])}
                                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition"
                                                title="Download"
                                            >
                                                <FaDownload />
                                            </button>
                                            {userType === "teacher" && (
                                                <button
                                                    onClick={() => confirmDelete(note[0])}
                                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notes;