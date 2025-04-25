import {useState} from "react";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import Button from "../components/Button.tsx";

interface Course {
    id: string;
    name: string;
    campus: string[];
    type: string;
    disabled?: boolean;
}

const courses: Course[] = [
    // BC&T - Santo André
    {id: "BBT", name: "Biotecnologia", campus: ["Santo André"], type: "Bacharelados", disabled: true},
    {id: "BCC", name: "Ciências da Computação", campus: ["Santo André"], type: "Bacharelados"},
    {id: "BCD", name: "Ciência de Dados", campus: ["Santo André"], type: "Bacharelados", disabled: true},
    {id: "BCB", name: "Ciências Biológicas", campus: ["Santo André"], type: "Bacharelados", disabled: true},
    {id: "BFIS", name: "Física", campus: ["Santo André"], type: "Bacharelados", disabled: true},
    {id: "BM", name: "Matemática", campus: ["Santo André"], type: "Bacharelados", disabled: true},
    {id: "BQ", name: "Química", campus: ["Santo André"], type: "Bacharelados", disabled: true},
    {id: "EAU", name: "Engenharia Ambiental e Urbana", campus: ["Santo André"], type: "Engenharias", disabled: true},
    {id: "EENE", name: "Engenharia de Energia", campus: ["Santo André"], type: "Engenharias", disabled: true},
    {id: "EINF", name: "Engenharia de Informação", campus: ["Santo André"], type: "Engenharias", disabled: true},
    {
        id: "EIAR",
        name: "Engenharia de Instrumentação, Automação e Robótica",
        campus: ["Santo André"],
        type: "Engenharias",
        disabled: true
    },
    {id: "EMAT", name: "Engenharia de Materiais", campus: ["Santo André"], type: "Engenharias", disabled: true},

    // BC&T - São Bernardo do Campo
    {id: "BN", name: "Neurociência", campus: ["São Bernardo do Campo"], type: "Bacharelados", disabled: true},
    {
        id: "EAER",
        name: "Engenharia Aeroespacial",
        campus: ["São Bernardo do Campo"],
        type: "Engenharias",
        disabled: true
    },
    {id: "EBIO", name: "Engenharia Biomédica", campus: ["São Bernardo do Campo"], type: "Engenharias", disabled: true},
    {id: "EGES", name: "Engenharia de Gestão", campus: ["São Bernardo do Campo"], type: "Engenharias", disabled: true},

    // BC&H - São Bernardo do Campo
    {id: "BCE", name: "Ciências Econômicas", campus: ["São Bernardo do Campo"], type: "Bacharelados", disabled: true},
    {id: "BFIL", name: "Filosofia", campus: ["São Bernardo do Campo"], type: "Bacharelados", disabled: true},
    {
        id: "BPT",
        name: "Planejamento Territorial",
        campus: ["São Bernardo do Campo"],
        type: "Bacharelados",
        disabled: true
    },
    {id: "BPP", name: "Políticas Públicas", campus: ["São Bernardo do Campo"], type: "Bacharelados", disabled: true},
    {
        id: "BRI",
        name: "Relações Internacionais",
        campus: ["São Bernardo do Campo"],
        type: "Bacharelados",
        disabled: true
    },

    // Licenciaturas - São Bernardo do Campo
    {id: "LFIL", name: "Filosofia", campus: ["São Bernardo do Campo"], type: "Licenciaturas", disabled: true},
    {id: "LH", name: "História", campus: ["São Bernardo do Campo"], type: "Licenciaturas", disabled: true},

    // Licenciaturas - Santo André
    {id: "LCB", name: "Ciências Biológicas", campus: ["Santo André"], type: "Licenciaturas", disabled: true},
    {id: "LFIS", name: "Física", campus: ["Santo André"], type: "Licenciaturas", disabled: true},
    {id: "LM", name: "Matemática", campus: ["Santo André"], type: "Licenciaturas", disabled: true},
    {id: "LQ", name: "Química", campus: ["Santo André"], type: "Licenciaturas", disabled: true},

    // Interdisciplinares
    {
        id: "BCT",
        name: "Bacharelado em Ciência e Tecnologia",
        campus: ["Santo André", "São Bernardo do Campo"],
        type: "Interdisciplinares",
        disabled: true
    },
    {
        id: "BCH",
        name: "Bacharelado em Ciências e Humanidades",
        campus: ["Santo André", "São Bernardo do Campo"],
        type: "Interdisciplinares",
        disabled: true
    },
    {
        id: "LCH",
        name: "Licenciatura em Ciências Humanas",
        campus: ["Santo André", "São Bernardo do Campo"],
        type: "Interdisciplinares",
        disabled: true
    },
    {
        id: "LCNE",
        name: "Licenciatura em Ciências Naturais e Exatas",
        campus: ["Santo André", "São Bernardo do Campo"],
        type: "Interdisciplinares",
        disabled: true
    },
];

function Course() {
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    // TODO: selecionar mais de um curso
    const toggleCourse = (id: string) => {
        setSelectedCourse(selectedCourse === id ? null : id);
    }

    return (
        <div className="min-h-screen flex flex-col flex-1 bg-gray-50">
            <Header/>

            <main className="container flex flex-col flex-1 mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-xs w-full border border-gray-200 p-4">
                    <h4 className="mb-4 font-semibold text-lg">
                        Selecione o seu curso
                    </h4>
                    <div className="grid grid-cols-2 gap-2 mb-8">
                        {["Bacharelados", "Engenharias", "Licenciaturas", "Interdisciplinares"].map((courseType) => (
                            <div key={courseType}>
                                <h5 className="font-semibold text-xl">{courseType}</h5>
                                <div className="grid text-sm gap-2">
                                    {courses.filter((course) => course.type === courseType).map((course) => (
                                        <span
                                            key={course.id}
                                            onClick={() => {
                                                toggleCourse(course.id)
                                            }}
                                            className={`flex flex-row items-center gap-2 justify-between  border  rounded-md border-gray-200 p-2 ${course.disabled && "opacity-25"}`}
                                        >
                                            <input type="checkbox"
                                                   id={`course-${course.id}`}
                                                   checked={selectedCourse === course.id}
                                                   className={`w-4 ${!course.disabled ? "cursor-pointer" : "cursor-not-allowed"}`}
                                                   disabled={course.disabled}/>
                                            <label className="flex-1">
                                                <div className="flex flex-row justify-between">
                                                    <p className="font-semibold">{course.name}</p>
                                                    <p className="text-gray-400">({course.campus})</p>
                                                </div>
                                                {course.disabled &&
                                                    <span className="text-red-600  text-xs">Indisponível</span>
                                                }
                                            </label>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="w-full flex justify-end">
                        <Button label="Confirmar seleção" className={`bg-green-800 text-white text-sm ${selectedCourse === null ? "opacity-25 cursor-not-allowed" : "cursor-pointer"}`} route="/pageDisciplineSelection" />
                    </div>
                </div>
            </main>

            <Footer/>
        </div>
    )
}

export default Course;