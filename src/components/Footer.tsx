import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCopyright} from "@fortawesome/free-solid-svg-icons";
import ufabcLogo from "../assets/logo-ufabc-sigla-lateral-negativo.svg";

function Footer() {
    return (
        <footer className="flex flex-row py-6 justify-around bg-green-800 text-white py-4 text-center">
            <div className="flex flex-row items-center">
                <img
                    src={ufabcLogo} alt="UFABC Logo" className="h-12 w-auto"
                />
                <p className="text-sm mt-2 font-extralight">LYNKS</p>
            </div>
            <p className="flex gap-2 items-center text-xs font-extralight">
                <FontAwesomeIcon icon={faCopyright} style={{color: "#ffffff"}}/>
                2025 Universidade Federal do ABC. Todos os direitos reservados.
            </p>
        </footer>
    )
}

export default Footer;