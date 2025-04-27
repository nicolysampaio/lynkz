import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import courseCategories from "../../db/course_categories.json";
import disciplines from "../../db/disciplines.json";
import Discipline from "../types/Discipline";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import CardDiscipline from "../components/Subjects/CardDiscipline";
import CardHumanidade from "../components/Subjects/CardHumanidade";
import CardDisciplineList from "../components/Subjects/CardDisciplineList";

const HUMANITIES_QUARTERS = [1, 5, 6];
const OPTATIVES_QUARTERS = [8, 9, 10, 11, 12, 13];
const LIVRES_QUARTERS = [10, 14, 15];

type LocationState = {
  selectedCourse?: string;
  completedDisciplines?: number[];
};

export default function DisciplineSelection() {
  // Hooks sempre no topo:
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [disciplinesSelected, setDisciplinesSelected] = useState<Set<number>>(
    new Set()
  );
  const [humanitiesSelected, setHumanitiesSelected] = useState<
    Record<number, number | null>
  >({});
  const [openHumanitiesDropdown, setOpenHumanitiesDropdown] = useState<Record<number, boolean>>({});

  const toggleDropdown = (quarter: number) => {
    setOpenHumanitiesDropdown((prev) => ({
      ...prev,
      [quarter]: !prev[quarter],
    }));
  };

  // monta os COURSE_CATEGORIES a partir do selectedCourse
  const COURSE_CATEGORIES =
    courseCategories.find((c) => c.id === state.selectedCourse)
      ?.courseCategory ?? [];

  const toggleDisciplineSelection = (id: number) =>
    setDisciplinesSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });

  const handleHumanitiesSelection = (
    quarter: number,
    disciplineId: number | null
  ) =>
    setHumanitiesSelected((prev) => ({
      ...prev,
      [quarter]: disciplineId,
    }));

  const isHumanitiesQuarter = (quarter: number) =>
    HUMANITIES_QUARTERS.includes(quarter);

  const humanitiesCourses = [
    { id: 146, name: "Bases Epistemológicas da Ciência Moderna" },  // id do JSON
    { id: 204, name: "Ciência, Tecnologia e Sociedade" },
    { id: 430, name: "Estrutura e Dinâmica Social" },
  ];

  // filtra disciplinas do JSON por curso e requisitos básicos
  const filteredDisciplines = (disciplines as Discipline[]).filter(
    (d) =>
      d.quarter !== null &&
      d.credits !== null &&
      d.courseCategory?.some((cat) =>
        COURSE_CATEGORIES.includes(cat)
      )
  );

  // agrupa por quadrimestre
  const groupedDisciplines = filteredDisciplines.reduce<
    Record<number, Discipline[]>
  >((acc, d) => {
    const q = d.quarter!;
    if (!acc[q]) acc[q] = [];
    acc[q].push(d);
    return acc;
  }, {});

  const handleConfirmSelection = () => {
    // códigos das disciplinas “normais”
    const completedDisciplineCodes = Array.from(disciplinesSelected)
      .map((id) => (disciplines as Discipline[]).find((d) => d.id === id)?.code)
      .filter((c): c is string => !!c);

    // códigos das humanidades selecionadas
    const completedHumanitiesCodes = Object.values(humanitiesSelected)
      .filter((h): h is number => h !== null)
      .map((optId) => {
        // encontra a disciplina no JSON pelo id correto
        return (disciplines as Discipline[]).find((d) => d.id === optId)?.code;
      })
      .filter((c): c is string => !!c);

    const completedCodes = [
      ...completedDisciplineCodes,
      ...completedHumanitiesCodes
    ];

    navigate("/disciplinas-matricula", {
      state: {
        selectedCourse: state.selectedCourse,
        completedDisciplineCodes: completedCodes,
      },
    });
  };

  // Qualquer redirecionamento antes de usar logicas que dependem de state:
  if (!state.selectedCourse) {
    return <Navigate to="/pageCourse" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="container mx-auto p-8 flex-1">
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4">
          <h4 className="mb-4 font-semibold text-lg">
            Selecione as disciplinas que você já cursou
          </h4>

          <div className="grid grid-cols-1 gap-8 mb-8">
            {Object.entries(groupedDisciplines).map(([key, list]) => {
              const quarter = parseInt(key, 10);
              return (
                <div key={key}>
                  <h3 className="text-lg font-semibold mb-4">
                    {quarter}º Quadrimestre
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    {isHumanitiesQuarter(quarter) && (
                      <CardHumanidade
                        key={quarter}
                        quarter={quarter}
                        humanities={humanitiesCourses}
                        open={!!openHumanitiesDropdown[quarter]}
                        toggleDropdown={() => toggleDropdown(quarter)}
                        handleSelect={(id) => handleHumanitiesSelection(quarter, id)}
                        selected={humanitiesSelected[quarter] ?? null}
                        allSelected={humanitiesSelected}
                      />
                    )}
                    {list.map((d) => (
                      <CardDiscipline
                        key={d.id}
                        id={d.id}
                        discipline={d.name}
                        credits={d.credits}
                        selected={disciplinesSelected.has(d.id)}
                        courseCategory={d.courseCategory}
                        toggleDiscipline={toggleDisciplineSelection}
                      />
                    ))}
                    {(OPTATIVES_QUARTERS.includes(quarter) ||
                      LIVRES_QUARTERS.includes(quarter)) && (
                      <CardDisciplineList
                        category={
                          OPTATIVES_QUARTERS.includes(quarter)
                            ? "optativa"
                            : "livre"
                        }
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Button
              label="Confirmar seleção"
              onClick={handleConfirmSelection}
              className={`bg-green-800 text-white text-sm ${
                disciplinesSelected.size === 0
                  ? "opacity-25 cursor-not-allowed"
                  : ""
              }`}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
