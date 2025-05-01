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
import Course from "./Course";


const PRIORITY_INGRESS_OBR = [
  "BC&T - Bacharelado em Ciência e Tecnologia (OBR)",
  "BC&H - Bacharelado em Ciências e Humanidades (OBR)",
  "LCNE - Licenciatura em Ciências Naturais e Exatas (OBR)",
  "LCH - Licenciatura em Ciências Humanas (OBR)",
];

export default function DisciplineSelection() {
  // Hooks sempre no topo:
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { selectedCourse: Course };
  const courseData = state.selectedCourse;
  const COURSE_CATEGORIES = courseData.courseCategory ?? [];
  const COURSE_COLORS = courseData.course_color ?? [];

  // Aqui, vai definir onde vai ficar e quantos serão os cards de optativas.
  const OPTATIVES_QUARTERS = courseData.quarter_categories?.OPTATIVES_QUARTERS ?? [];
  const LIVRES_QUARTERS = courseData.quarter_categories?.LIVRES_QUARTERS ?? [];
  const HUMANITIES_QUARTERS = courseData.quarter_categories?.HUMANITIES_QUARTERS ?? [];

  const [disciplinesSelected, setDisciplinesSelected] = useState<Set<number>>(
    new Set()
  );
  const [humanitiesSelected, setHumanitiesSelected] = useState<
    Record<number, number | null>
  >({});
  const [openHumanitiesDropdown, setOpenHumanitiesDropdown] = useState<Record<number, boolean>>({});
  const [selectedOptativas, setSelectedOptativas] = useState<Discipline[]>([]);
  const [selectedLivres, setSelectedLivres] = useState<Discipline[]>([]);

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
    )?.bgColor ?? "";

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
        COURSE_CATEGORIES.includes(cat) && cat.endsWith("(OBR)")
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
      .map((disciplineId: number) => (disciplines as Discipline[]).find((d) => d.id === disciplineId)?.code)
      .filter((c): c is string => !!c);

    // Códigos das humanidades selecionadas
    const completedHumanitiesCodes = Object.values(humanitiesSelected)
      .filter((h): h is number => h !== null)
      .map((optId) => {
        return (disciplines as Discipline[]).find((d) => d.id === optId)?.code;
      })
      .filter((c): c is string => !!c);

    // Códigos das optativas e livres selecionadas
    const completedOptativasCodes = Array.from(selectedOptativas)
      .map((discipline) => discipline.code)
      .filter((c): c is string => !!c);
    const completedLivresCodes = selectedLivres.map((d) => d.code);

    const completedCodes = [
      ...completedDisciplineCodes,
      ...completedHumanitiesCodes,
      ...completedOptativasCodes,
      ...completedLivresCodes,
    ];

    // Navegar para a página de matrícula com os dados necessários
    console.log("Botão 'Confirmar seleção' clicado ", completedCodes, state.selectedCourse);
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
      <Button
          label="Voltar"
          onClick={() => navigate(-1)}
          className="mb-4 bg-orange-800 text-white text-sm border border-gray text-gray-800 w-fit"
        />
         <Button
              label="Confirmar seleção"
              onClick={() => {
                console.log("Botão 'Confirmar seleção' clicado");
                handleConfirmSelection();
              }}
              className={`bg-green-800 text-white text-sm ${
                disciplinesSelected.size === 0 &&
                Object.values(humanitiesSelected).filter((v) => v !== null).length === 0 &&
                selectedOptativas.length === 0 &&
                selectedLivres.length === 0
                  ? "opacity-25 cursor-not-allowed"
                  : ""
              }`}
            />
         <div className="flex justify-center">
           
          </div>
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4">
          <h4 className="mb-4 font-semibold text-lg">
            Selecione as disciplinas que você já cursou
          </h4>

          <div className="grid grid-cols-1 gap-8 mb-8">
            {Object.entries(groupedDisciplines).map(([key, list]) => {
              const quarter = parseInt(key, 10);

              // Conta quantas vezes o quarter aparece nas listas
              const optativaCount = OPTATIVES_QUARTERS.filter(q => q === quarter).length;
              const livreCount = LIVRES_QUARTERS.filter(q => q === quarter).length;

              return (
                <div key={key}>
                  <h3 className="text-lg font-semibold mb-4">
                    {quarter}º Quadrimestre
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    {isHumanitiesQuarter(quarter) && (
                      <CardHumanidade
                        quarter={quarter}
                        courses={HUMANITIES_COURSES}
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

                    {/* Renderiza CardDisciplineList para optativas conforme a contagem */}
                    {Array.from({ length: optativaCount }).map((_, idx) => (
                      <CardDisciplineList
                        key={`optativa-${quarter}-${idx}`}
                        id={`${quarter}-optativa-${idx}`}
                        colorClass={getCardColor({} as Discipline, quarter, false)}
                        category="optativa"
                        programCategories={COURSE_CATEGORIES}
                        selectedOptativas={selectedOptativas}
                        courseColor={courseData.course_color ?? []}
                        toggleDiscipline={toggleDisciplineSelection}
                        setSelectedOptativas={setSelectedOptativas}
                        selectedLivres={selectedLivres}
                        setSelectedLivres={setSelectedLivres}
                      />
                    ))}

                    {Array.from({ length: livreCount }).map((_, idx) => (
                      <CardDisciplineList
                        key={`livre-${quarter}-${idx}`}
                        id={`${quarter}-livre-${idx}`}
                        colorClass={getCardColor({} as Discipline, quarter, false)}
                        category="livre"
                        programCategories={COURSE_CATEGORIES}
                        selectedOptativas={selectedOptativas}
                        setSelectedOptativas={setSelectedOptativas}
                        selectedLivres={selectedLivres}
                        setSelectedLivres={setSelectedLivres}
                        courseColor={courseData.course_color ?? []}
                      />
                    ))}
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
                disciplinesSelected.size === 0 &&
                Object.values(humanitiesSelected).filter((v) => v !== null).length === 0 &&
                selectedOptativas.length === 0 &&
                selectedLivres.length === 0
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
