import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import disciplines from "../../db/disciplines.json";
import Discipline from "../types/Discipline";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import CardDiscipline from "../components/Subjects/CardDiscipline";
import CardHumanidade from "../components/Subjects/CardHumanidade";
import CardDisciplineList from "../components/Subjects/CardDisciplineList";
import HUMANITIES_COURSES from "../components/Subjects/CardConstantes";
import Course from "./Course";// ou, se for exportação default:
// import type Course from "../types/Course";

const HUMANITIES_QUARTERS = [1, 5, 6];
const OPTATIVES_QUARTERS = [8, 9, 10, 11, 12, 13];
const LIVRES_QUARTERS = [10, 14, 15];

// categorias OBR que devem usar “Obrigatórias Ingresso”
const PRIORITY_INGRESS_OBR = [
  "BC&T - Bacharelado em Ciência e Tecnologia (OBR)",
  "BC&H - Bacharelado em Ciências e Humanidades (OBR)",
];

export default function DisciplineSelection() {
  // Hooks sempre no topo:
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { selectedCourse: Course };
  const courseData = state.selectedCourse;
  const COURSE_CATEGORIES = courseData.courseCategory ?? [];
  const COURSE_COLORS = courseData.course_color ?? [];

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

  /**
   * Define o nome da classificação da disciplina
   * (Obrigatória, Obrigatória BC&T, Optativa, Livre, Concluída)
   * baseado na courseCategory do JSON e no selectedCourse.
   */
  const getClassificationName = (
    d: Discipline,
    quarter: number,
    selected: boolean
  ): string => {
    if (selected) return "Concluída";

    // 2) prioridade para “Obrigatórias Ingresso”
    if (d.courseCategory?.some((c) => PRIORITY_INGRESS_OBR.includes(c))) {
      return "Obrigatórias Ingresso";
    }

    // 3) modalidades obrigatórias genéricas
    const cat = d.courseCategory?.find((c) => c.endsWith("(OBR)"));
    if (cat) return "Obrigatória";

    // 4) optativas
    if (OPTATIVES_QUARTERS.includes(quarter)) return "Optativa";

    // 5) livres
    if (LIVRES_QUARTERS.includes(quarter)) return "Livre";

    // fallback
    return "Obrigatória";
  };

  /**
   * Retorna a classe de cor do card a partir da classificação
   * encontrada em course_color do courseData.
   */
  const getCardColor = (
    d: Discipline,
    quarter: number,
    selected: boolean
  ): string =>
    COURSE_COLORS.find(
      (c) => c.name === getClassificationName(d, quarter, selected)
    )?.color ?? "";

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
    
    // Códigos das disciplinas normais selecionadas
    const completedDisciplineCodes = Array.from(disciplinesSelected)
    .map((id) => (disciplines as Discipline[]).find((d) => d.id === id)?.code)
    .filter((c): c is string => !!c);
    
    // Códigos das humanidades selecionadas
    const completedHumanitiesCodes = Object.values(humanitiesSelected)
    .filter((h): h is number => h !== null)
    .map((optId) => {
      return (disciplines as Discipline[]).find((d) => d.id === optId)?.code;
    })
    .filter((c): c is string => !!c);
    
    const completedCodes = [
      ...completedDisciplineCodes,
      ...completedHumanitiesCodes,
    ];
    
    console.log("Botão 'Confirmar seleção' clicado ",{completedDisciplineCodes});
    // Navegar para a página de matrícula com os dados necessários
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
                        quarter={quarter}
                        courses={HUMANITIES_COURSES}               // ← aqui, use `courses` e não `humanities`
                        selected={humanitiesSelected[quarter] ?? null}
                        open={openHumanitiesDropdown[quarter] ?? false}
                        toggleDropdown={() => toggleDropdown(quarter)}
                        handleSelect={(id) => handleHumanitiesSelection(quarter, id)}
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
                        colorClass={getCardColor(d, quarter, disciplinesSelected.has(d.id))}
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
                        programCategories={COURSE_CATEGORIES}    // ← passe aqui
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
              onClick={() => {
                console.log("Botão 'Confirmar seleção' clicado");
                handleConfirmSelection();
              }}
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
