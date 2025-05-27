import Logo from "../assets/img/logo.png"
import { Link } from "react-router-dom";

const Header=()=>{
    return(
        <>
            <div className="flex justify-between bg-red-400">
                <Link to="/"><img src={Logo} alt="logo" className="h-16 ml-3"/></Link>
                <ul className="flex my-5 text-white">
                    <li className="mx-3"><Link to="/">Home</Link></li>
                    <li className="mx-3">Contact</li>
                    <li className="mx-3">About</li>
                    <li className="mx-3">LogIn</li>
                </ul>
            </div>
        </>
    )
}

export default Header;