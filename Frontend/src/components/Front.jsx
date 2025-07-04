import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

// Define route permissions
const routePermissions = {
    // Public routes (no auth required)
    public: [
        "/",
        "/student/login",
        "/teacher/login",
        "/admin/login",
        "/institute/login",
        "/student/signup",
        "/teacher/signup",
        "/institute/signup",
        "/reset/password",
    ],

    // Routes accessible only by specific user types
    protected: {
        "/change/password": ["institute", "admin", "teacher", "student"],
        "/institute/dashboard": ["institute"],
        "/admin/dashboard": ["institute","admin"],
        "/teacher/dashboard": ["teacher"],
        "/student/dashboard": ["student"],
        "/admin": ["institute"],
        "/class/list": ["institute", "admin"],
        "/subject": ["institute", "admin"],
        "/student": ["institute", "admin"],
        "/teacher": ["institute", "admin"],
        "/request": ["institute", "admin"],
        "/chat": ["teacher", "student"],
        "/notes": ["teacher", "student"],
        "/assignment": ["teacher", "student"],
        "/lecture": ["teacher", "student"],
        "/mark/attendance": ["teacher"],
        "/student/attendance": ["student"]
    }
};

const Front = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const authData = localStorage.getItem("userAuthData");
        const currentPath = location.pathname;

        // Check if route is public
        if (routePermissions.public.includes(currentPath)) {
            // If user is logged in, redirect to their dashboard
            if (authData) {
                try {
                    const { userType, expiryTime } = JSON.parse(authData);
                    const isExpired = new Date() > new Date(expiryTime);

                    if (!isExpired) {
                        navigate(`/${userType}/dashboard`);
                    } else {
                        localStorage.removeItem("userAuthData");
                    }
                } catch (error) {
                    console.error("Invalid authData:", error);
                    localStorage.removeItem("userAuthData");
                }
            }
            return;
        }

        // Protected route handling
        if (!authData) {
            toast.error("Please login to access this page");
            navigate("/");
            return;
        }

        try {
            const { userType, expiryTime } = JSON.parse(authData);
            const isExpired = new Date() > new Date(expiryTime);

            if (isExpired) {
                toast.error("Session expired, please login again");
                localStorage.removeItem("userAuthData");
                navigate("/");
                return;
            }

            // Check if user has permission for the current route
            const allowedUserTypes = routePermissions.protected[currentPath];
            if (!allowedUserTypes || !allowedUserTypes.includes(userType)) {
                toast.error("You don't have permission to access this page");
                navigate(`/${userType}/dashboard`);
                return;
            }

        } catch (error) {
            console.error("Invalid authData:", error);
            toast.error("Invalid session, please login again");
            localStorage.removeItem("userAuthData");
            navigate("/");
        }
    }, [location, navigate]);

    return <Outlet />;
};

export default Front;