import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import Button from "../components/Button.tsx";

import courseCategories from "../../db/course_categories.json";

import type { Course } from "../types/Course.tsx";


// usa JSON como fonte
const courses: Course[] = courseCategories.map((course) => ({
  ...course,
  course_color: course.course_color?.map((color: { id: number; name: string; bgColor: string; textColor?: string }) => ({
    ...color,
    textColor: color.textColor || "#000000", // Provide a default textColor if missing
  })),
}));

function Course() {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const toggleCourse = (course: Course) => {
    setSelectedCourse((prev) => (prev?.id === course.id ? null : course));
  };

  const handleConfirm = () => {
    if (selectedCourse) {
      navigate("/disciplinas-cursadas", { state: { selectedCourse } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col flex-1 bg-gray-50">
      <Header />

      <main className="container flex flex-col flex-1 mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="bg-white rounded-xl shadow-xs w-full border border-gray-200 p-2 sm:p-4">
          <h4 className="mb-3 font-semibold text-lg">Selecione o seu curso</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
            {["Bacharelados", "Engenharias", "Licenciaturas", "Interdisciplinares"].map((courseType) => (
              <div key={courseType}>
                <h5 className="font-semibold text-xl">{courseType}</h5>
                <div className="grid text-sm gap-2">
                  {courses
                    .filter((course) => course.type === courseType && course.disabled === false)
                    .map((course) => (
                      <span
                        key={course.id}
                        onClick={() => toggleCourse(course)}
                        className={`flex flex-row items-center gap-2 justify-between border rounded-md border-gray-200 p-2 ${
                          course.disabled ? "opacity-25 cursor-not-allowed" : "cursor-pointer"
                        }`}
                      >
                        <input
                          type="checkbox"
                          id={`course-${course.id}`}
                          checked={selectedCourse?.id === course.id}
                          disabled={course.disabled}
                          className="w-4"
                        />
                        <label className="flex-1">
                          <div className="flex flex-row justify-between">
                            <p className="font-semibold">{course.name}</p>
                            <p className="text-gray-400">({course.campus.join(", ")})</p>
                          </div>
                          {course.disabled && <span className="text-red-600 text-xs">Indisponível</span>}
                        </label>
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>

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