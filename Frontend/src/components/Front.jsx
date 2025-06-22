import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const Front = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const authData = localStorage.getItem("userAuthData");
        const publicPaths = ["/", "/student/login", "/teacher/login", "/admin/login", "/institute/login",
             "/student/signup", "/teacher/signup", "/institute/signup",];

        if (authData) {
            const { userType, expiryTime } = JSON.parse(authData);
            const isExpired = new Date() > new Date(expiryTime);
            try {

                if (!isExpired) {
                    // If the user is logged in, they are redirected to userDashboard if they try to access login/signup
                    if (publicPaths.includes(location.pathname)) {
                        navigate(`/${userType}/dashboard`);
                    }
                } else {
                    toast.error("Session expired, please login again");
                    localStorage.removeItem("userAuthData");
                    navigate("/");
                }
            } catch (error) {
                console.error("Invalid authData:", error);
                toast.error("Invalid session, please login again");
                localStorage.removeItem("userAuthData");
                navigate(`/${userType}/login`);
            }
        } else {
            if (!publicPaths.includes(location.pathname)) {
                toast.error("Please login to access this page");
                navigate("/");
            }
        }
    }, [location, navigate]);

    return <Outlet />;
};

export default Front;
