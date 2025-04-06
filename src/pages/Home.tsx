import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import Button from "../components/Button.tsx";

function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header/>

            <main className="container flex flex-col flex-1 mx-auto px-4 py-8 items-center justify-center">
                <h2 className="text-3xl font-bold text-green-800 mb-4">Sistema de Filtro para Matrículas</h2>
                <p className="text-lg text-gray-600 mb-4">Organize suas disciplinas e otimize seu processo de matrícula na UFABC</p>

                <Button label="Começar Agora" className="bg-green-800 text-white"/>
            </main>

            <Footer/>
        </div>
    )
}

export default Home;