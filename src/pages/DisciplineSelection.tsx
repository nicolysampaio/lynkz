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
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";

const PRIORITY_INGRESS_OBR = [
  "BC&T - Bacharelado em Ciência e Tecnologia (OBR)",
  "BC&H - Bacharelado em Ciências e Humanidades (OBR)",
  "LCNE - Licenciatura em Ciências Naturais e Exatas (OBR)",
  "LCH - Licenciatura em Ciências Humanas (OBR)",
];

// Obtém dados do curso selecionado vindos da página anterior
// Extrai categorias, cores e configurações de quadrimestres do curso
export default function DisciplineSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { selectedCourse: Course };
  const courseData = state.selectedCourse;
  const COURSE_CATEGORIES = courseData.courseCategory ?? [];
  const COURSE_COLORS = courseData.course_color ?? [];
  const OPTATIVES_QUARTERS = courseData.quarter_categories?.OPTATIVES_QUARTERS ?? [];
  const LIVRES_QUARTERS = courseData.quarter_categories?.LIVRES_QUARTERS ?? [];
  const HUMANITIES_QUARTERS = courseData.quarter_categories?.HUMANITIES_QUARTERS ?? [];

  // Estados principais da seleção de disciplinas
  const [disciplinesSelected, setDisciplinesSelected] = useState<Set<number>>(new Set());
  const [humanitiesSelected, setHumanitiesSelected] = useState<Record<number, number | null>>({});
  const [openHumanitiesDropdown, setOpenHumanitiesDropdown] = useState<Record<number, boolean>>({});
  const [selectedOptativas, setSelectedOptativas] = useState<Discipline[]>([]);
  const [selectedLivres, setSelectedLivres] = useState<Discipline[]>([]);
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  // Alterna o dropdown de humanidades por quadrimestre
  const toggleDropdown = (quarter: number) => {
    setOpenHumanitiesDropdown((prev) => ({
      ...prev,
      [quarter]: !prev[quarter],
    }));
  };

  // Retorna o nome da classificação da disciplina (Obrigatória, Optativa, Livre, etc)
  const getClassificationName = (
    d: Discipline,
    quarter: number,
    selected: boolean
  ): string => {
    if (selected) return "Concluída";
    if (d.disciplineCategory?.some((c) => PRIORITY_INGRESS_OBR.includes(c.name))) {
      return "Obrigatórias Ingresso";
    }
    const cat = d.disciplineCategory?.find((c) => c.name.endsWith("(OBR)"));
    if (cat) return "Obrigatória";
    if (OPTATIVES_QUARTERS.includes(quarter)) return "Optativa";
    if (LIVRES_QUARTERS.includes(quarter)) return "Livre";
    return "Obrigatória";
  };

  // Retorna as classes de cor do card conforme a classificação
  function getCardColors(
    d: Discipline,
    quarter: number,
    selected: boolean
  ) {
    const colorObj = COURSE_COLORS.find(
      (c) => c.name === getClassificationName(d, quarter, selected)
    );
    return {
      bgColor: colorObj?.bgColor ?? "",
      textColor: colorObj?.textColor ?? "text-gray-400",
    };
  }

  // Alterna seleção de disciplina obrigatória
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

  // Seleciona disciplina de humanidades por quadrimestre
  const handleHumanitiesSelection = (
    quarter: number,
    disciplineId: number | null
  ) =>
    setHumanitiesSelected((prev) => ({
      ...prev,
      [quarter]: disciplineId,
    }));

  // Verifica se o quadrimestre é de humanidades
  const isHumanitiesQuarter = (quarter: number) =>
    HUMANITIES_QUARTERS.includes(quarter);

  // Filtra disciplinas obrigatórias do JSON para o curso selecionado
  const filteredDisciplines = (disciplines as Discipline[]).filter(
    (d) =>
      d.credits !== null &&
      d.disciplineCategory?.some(
        (cat) =>
          typeof cat === "object" &&
          cat.name.endsWith("(OBR)") &&
          COURSE_CATEGORIES.includes(cat.name)
      )
  );
  // Agrupa disciplinas obrigatórias por quadrimestre
  const groupedDisciplines = filteredDisciplines.reduce<Record<number, Discipline[]>>((acc, d) => {
    // Para cada categoria da disciplina, se for obrigatória, agrupe pelo quarter
    d.disciplineCategory.forEach(cat => {
      if (
        typeof cat === "object" &&
        cat.name.endsWith("(OBR)") &&
        COURSE_CATEGORIES.some((c: string) => c === cat.name) &&
        cat.quarter != null
      ) {
        if (!acc[cat.quarter]) acc[cat.quarter] = [];
        acc[cat.quarter].push(d);
      }
    });
    return acc;
  }, {});

  // Confirma seleção e navega para a próxima página levando os códigos das disciplinas selecionadas
  const handleConfirmSelection = () => {
    const completedDisciplineCodes = Array.from(disciplinesSelected)
      .map((disciplineId: number) => (disciplines as Discipline[]).find((d) => d.id === disciplineId)?.code)
      .filter((c): c is string => !!c);

    const completedHumanitiesCodes = Object.values(humanitiesSelected)
      .filter((h): h is number => h !== null)
      .map((optId) => {
        return (disciplines as Discipline[]).find((d) => d.id === optId)?.code;
      })
      .filter((c): c is string => !!c);

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

    console.log("Disciplinas selecionadas:", completedCodes);
    navigate("/disciplinas-matricula", {
      state: {
        selectedCourse: state.selectedCourse,
        completedDisciplineCodes: completedCodes,
      },
    });
  };

  // Redireciona se não houver curso selecionado
  if (!state.selectedCourse) {
    return <Navigate to="/pageCourse" replace />;
  }

  // Todas as chaves dos quadrimestres para expandir/recolher tudo
  const allKeys = Object.keys(groupedDisciplines);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="container mx-auto px-2 sm:px-2 md:px-4 py-4 sm:py-8 flex-1">
        <Button
          label="Voltar"
          onClick={() => navigate(-1)}
          className="mb-4 bg-orange-800 text-white text-sm border border-gray text-gray-800 w-fit"
        />
        <Button
          label="Confirmar seleção"
          onClick={handleConfirmSelection}
          className={`bg-green-800 text-white text-sm ${disciplinesSelected.size === 0 &&
            Object.values(humanitiesSelected).filter((v) => v !== null).length === 0 &&
            selectedOptativas.length === 0 &&
            selectedLivres.length === 0
            ? "opacity-25 cursor-not-allowed"
            : ""
            }`}
        />
        <div className="flex justify-center"></div>
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4">
          <h4 className="mb-4 font-semibold text-lg">
            Selecione as disciplinas que você já cursou
          </h4>
          <h4 className="mb-1 font-semibold text-lg">
            Obs: Clique para recolher
          </h4>
          {/* Botões para expandir/recolher todos os quadrimestres */}
          <div className="flex gap-2 mb-2">
            <button
              className="px-2 py-1 bg-green-700 text-white rounded"
              onClick={() => setOpenAccordions(allKeys)}
            >
              Expandir tudo
            </button>
            <button
              className="px-2 py-1 bg-gray-400 text-white rounded"
              onClick={() => setOpenAccordions([])}
            >
              Recolher tudo
            </button>
          </div>
          {/* Accordion dos quadrimestres */}
          <Accordion
            type="multiple"
            value={openAccordions}
            onValueChange={setOpenAccordions}
            className="mb-8"
          >
            {Object.entries(groupedDisciplines).map(([key, list]) => {
              const quarter = parseInt(key, 10);
              const optativaCount = OPTATIVES_QUARTERS.filter(q => q === quarter).length;
              const livreCount = LIVRES_QUARTERS.filter(q => q === quarter).length;

              return (
                <AccordionItem value={key} key={key}>
                  <AccordionTrigger>
                    <span className="text-lg font-semibold">{quarter}º Quadrimestre</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {/* Card de humanidades se for quadrimestre de humanidades */}
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
                      {/* Cards de disciplinas obrigatórias */}
                      {list.map((d) => {
                        const { bgColor, textColor } = getCardColors(d, quarter, disciplinesSelected.has(d.id));
                        return (
                          <CardDiscipline
                            key={d.id}
                            id={d.id}
                            discipline={d.name}
                            credits={d.credits}
                            selected={disciplinesSelected.has(d.id)}
                            colorClass={bgColor}
                            textColor={textColor}
                            toggleDiscipline={toggleDisciplineSelection}
                            courseColor={courseData.course_color ?? []}
                            
                          />
                        );
                      })}
                      {/* Cards de optativas do quadrimestre */}
                      {Array.from({ length: optativaCount }).map((_, idx) => (
                        <CardDisciplineList
                          key={`optativa-${quarter}-${idx}`}
                          id={`${quarter}-optativa-${idx}`}
                          colorClass={getCardColors({} as Discipline, quarter, false).bgColor}
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
                      {/* Cards de livres do quadrimestre */}
                      {Array.from({ length: livreCount }).map((_, idx) => (
                        <CardDisciplineList
                          key={`livre-${quarter}-${idx}`}
                          id={`${quarter}-livre-${idx}`}
                          colorClass={getCardColors({} as Discipline, quarter, false).bgColor}
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
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Botão para confirmar seleção das disciplinas */}
          <div className="flex justify-center">
            <Button
              label="Confirmar seleção"
              onClick={handleConfirmSelection}
              className={`bg-green-800 text-white text-sm ${disciplinesSelected.size === 0 &&
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