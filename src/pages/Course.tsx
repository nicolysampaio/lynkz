import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import Button from "../components/Button.tsx";
import courseCategories from "../../db/course_categories.json";
import type { Course } from "../types/Course.tsx";
import { useMemo } from "react";
// Lista de cursos carregada do JSON
const courses: Course[] = courseCategories as Course[];

function Course() {
  const navigate = useNavigate();
  // Estado para armazenar o curso selecionado
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Alterna seleção do curso (seleciona ou desseleciona)
  const toggleCourse = useCallback((course: Course) => {
    setSelectedCourse((prev) => (prev?.id === course.id ? null : course));
  }, []);

  // Confirma seleção e navega para a próxima página, levando o curso selecionado
  const handleConfirm = () => {
    if (selectedCourse) {
      console.log("Curso selecionado:", selectedCourse);
      navigate("/disciplinas-cursadas", { state: { selectedCourse } });
    }
  };
  const filteredCoursesByType = useMemo(() => {
    return (type: string) => courses.filter((course) => course.type === type && !course.disabled);
  }, []);
  return (
    <div className="min-h-screen flex flex-col flex-1 bg-gray-50">
      <Header />

      <main className="container flex flex-col flex-1 mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="bg-white rounded-xl shadow-xs w-full border border-gray-200 p-2 sm:p-4">
          <h4 className="mb-3 font-semibold text-lg">Selecione o seu curso</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
            {/* Renderiza os tipos de curso em colunas */}
            {["Bacharelados", "Engenharias", "Licenciaturas", "Interdisciplinares"].map((courseType) => (
              <div key={courseType}>
                <h5 className="font-semibold text-xl">{courseType}</h5>
                <div className="py-4 grid text-sm gap-2">
                  {/* Lista os cursos de cada tipo */}
              
                  {filteredCoursesByType(courseType).map((course) => (
                      <span
                        key={course.id}
                        className={`flex flex-row items-center gap-2 justify-between border rounded-md border-gray-200 p-2  ${
                          course.disabled ? "opacity-25 cursor-not-allowed" : "cursor-pointer"
                        }`}
                      >
                        {/* Checkbox para selecionar o curso */}
                        <input
                          type="checkbox"
                          id={`course-${course.id}`}
                          checked={selectedCourse?.id === course.id}
                          disabled={course.disabled}
                          className="w-4"
                          onChange={() => toggleCourse(course)}
                        />
                        {/* Label clicável para selecionar o curso */}
                        <label
                          htmlFor={`course-${course.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex flex-row justify-between">
                            <p className="font-semibold">{course.name}</p>
                            <p className="text-gray-400">({course.campus.join(", ")})</p>
                          </div>
                          {/* Indica se o curso está indisponível */}
                          {course.disabled && <span className="text-red-600 text-xs">Indisponível</span>}
                        </label>
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Botão para confirmar a seleção do curso */}
          <div className="w-full flex justify-end">
            <Button
              label="Confirmar seleção"
              onClick={handleConfirm}
              className={`bg-green-800 text-white text-sm ${
                !selectedCourse ? "opacity-25 cursor-not-allowed" : ""
              }`}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Course;