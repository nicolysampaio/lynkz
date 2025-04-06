import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRightToBracket} from "@fortawesome/free-solid-svg-icons";
import ufabcLogo from "../assets/logo-ufabc.png";
import Button from "./Button.tsx";

function Header() {
    return (
        <header className="bg-white border-b border-black/10 py-4">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <img
                        src={ufabcLogo}
                        alt="UFABC Logo"
                        className="h-12 w-auto"
                    />
                    <h1 className="text-2xl font-bold text-green-800">Lynkz</h1>
                </div>
                <Button label="Entrar" className="bg-green-800 text-white font-medium">
                    <FontAwesomeIcon icon={faRightToBracket} style={{color: "#ffffff"}}/>
                </Button>
            </div>
        </header>
    )
}

export default Header;