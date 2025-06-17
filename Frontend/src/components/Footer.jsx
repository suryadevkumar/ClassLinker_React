import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="h-16 bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg">
            <div className="container mx-auto px-4 h-full flex flex-col md:flex-row justify-between items-center">
                <p className="text-sm md:text-base font-medium">&copy; 2025 ClassLinker. All Rights Reserved.</p>
                <div className="flex space-x-4">
                    <a 
                        href="#" 
                        className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        aria-label="Facebook"
                    >
                        <FaFacebookF className="h-4 w-4" />
                    </a>
                    <a 
                        href="#" 
                        className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        aria-label="Twitter"
                    >
                        <FaTwitter className="h-4 w-4" />
                    </a>
                    <a 
                        href="#" 
                        className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        aria-label="Instagram"
                    >
                        <FaInstagram className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;