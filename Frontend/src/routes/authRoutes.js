import axios from 'axios';

export const checkEmailUsed = async (email) => {
    try {
        const response = await axios.post(
            '/auth/checkEmailUsed',
            { email },
            {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Email check failed:', error);
        throw error;
    }
};

export const sendOtp = async (email) => {
    try {
        const response = await axios.post('/auth/sendOTP', { email }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to send OTP',
        };
    }
};

export const verifyOtp = async (email, otp) => {
    try {
        const response = await axios.post('/auth/verifyOTP', { email, otp }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to verify OTP',
        };
    }
};

export const login = async (userType, email, password) => {
    try {
        const response = await axios.post('/auth/login', { userType, email, password }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.data.success) {
            const now = new Date();
            const expiryTime = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
            const userAuthData = {
                userType: userType,
                expiryTime: expiryTime.toISOString()
            };

            localStorage.setItem("userAuthData", JSON.stringify(userAuthData));
        }
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to login',
        };
    }
};

export const updatePassword = async (userType, email, pass) => {
    try {
        const response = await axios.post('/auth/updatePassword', { userType, email, pass }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to reset Password',
        };
    }
}

export const checkSession = async () => {
    try {
        const response = await axios.get('/auth/check/session', {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        return { success: false, message: 'Session check failed' };
    }
};

export const logout = async (userType) => {
    try {
        const response = await axios.post('/auth/logout', { userType }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Logout failed',
        };
    }
};