import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopyright } from "@fortawesome/free-solid-svg-icons";
import ufabcLogo from "../assets/logo-ufabc-sigla-lateral-negativo.svg";

function Footer() {
    return (
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-4 bg-green-800 text-white text-center">
            <div className="flex flex-row items-center gap-2">
                <img
                    src={ufabcLogo}
                    alt="UFABC Logo"
                    className="h-10 w-auto"
                />
                <p className="text-sm font-extralight">LYNKS</p>
            </div>
            <p className="flex gap-2 items-center text-xs font-extralight">
                <FontAwesomeIcon icon={faCopyright} style={{ color: "#ffffff" }} />
                2025 Universidade Federal do ABC. Todos os direitos reservados.
            </p>
        </footer>
    );
}

export default Footer;