import ufabcLogo from "../assets/logo-ufabc.png";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import Button from "../components/Button.tsx";
import GoogleLoginButton from "../components/GoogleLoginButton.tsx";

function Login() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="container flex flex-col flex-1 mx-auto px-4 py-8 items-center justify-center">
                <div className="flex flex-col items-center gap-2 mb-8">
                    <img
                        src={ufabcLogo}
                        alt="UFABC Logo"
                        className="h-24 w-auto mb-2"
                    />
                    <h2 className="text-green-800 font-bold text-3xl">Lynkz</h2>
                    <p className="text-gray-600">Sistema de Planejamento para Matrícula</p>
                </div>

                <div className="bg-white rounded-xl shadow-xs p-6 w-full max-w-md text-center border border-gray-200">
                    <h4 className="font-bold text-xl text-green-800">Entrar com E-mail Institucional</h4>
                    <p className="text-gray-500 text-sm mt-2 mb-4">Use seu e-mail institucional da UFABC para acessar o sistema</p>
                    <GoogleLoginButton />
                    <p className="mt-4 text-gray-500 text-xs">Ao entrar, você concorda com os Termos de Serviço e Política de Privacidade.</p>
                </div>

                <Button label="Voltar para a página inicial" className="mt-8 text-green-700">
                </Button>
            </main>

            <Footer />
        </div>
    )
}

export default Login;