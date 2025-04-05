import ufabcLogo from "../assets/logo-ufabc.png";

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
            </div>
        </header>
    )
}

export default Header;