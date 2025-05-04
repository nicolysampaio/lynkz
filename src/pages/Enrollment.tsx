/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faGraduationCap,
  faUser,
  faLocationDot,
  faClock,
  faChevronDown,
  faTimes,
  faList,
  faTable,
} from "@fortawesome/free-solid-svg-icons";
import enrollmentData from "../../db/enrollment.json";
import disciplinesData from "../../db/disciplines.json";
import courseCategoriesData from "../../db/course_categories.json";
import DisciplineEnrollment from "../types/DisciplineEnrollment";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Button from "../components/Button";
import { Course } from "../types/Course";

// Tipos para o estado de navegação e horários
type LocationState = {
  selectedCourse?: string;
  completedDisciplineCodes?: string[];
};
type Timeslot = {
  day: string;
  time: number;
  week: string;
};

// Categorias obrigatórias de ingresso (hardcoded)
const PRIORITY_INGRESS_OBR = [
  "BC&T - Bacharelado em Ciência e Tecnologia (OBR)",
  "BC&H - Bacharelado em Ciências e Humanidades (OBR)",
  "LCNE - Licenciatura em Ciências Naturais e Exatas (OBR)",
  "LCH - Licenciatura em Ciências Humanas (OBR)",
];

export default function Enrollment() {
  const navigate = useNavigate();
  const location = useLocation();

  // Recupera o curso selecionado da navegação
  const { selectedCourse } = location.state as { selectedCourse: Course };

  // Cores das categorias do curso selecionado
  const COURSE_COLORS = selectedCourse.course_color ?? [];

  // Função para classificar a categoria da disciplina
  const classifyCategoryName = (cat: string, completed: boolean): string => {
    if (completed) return "Concluída";
    if (PRIORITY_INGRESS_OBR.includes(cat)) {
      return "Obrigatórias Ingresso";
    }
    if (cat.endsWith("(OBR)")) return "Obrigatória";
    if (cat.endsWith("(OL)")) return "Optativa";
    return "Livre";
  };

  // Retorna a cor de fundo da categoria
  const getCategoryColor = (cat: string, completed: boolean): string =>
    COURSE_COLORS.find((c) => c.name === classifyCategoryName(cat, completed))
      ?.bgColor ?? "";

  // Estados dos filtros de campus, turno e dropdowns
  const [selectedCampus, setSelectedCampus] = useState("Todos");
  const [selectedTurno, setSelectedTurno] = useState("Todos");
  const [showCampusDropdown, setShowCampusDropdown] = useState(false);
  const [showTurnoDropdown, setShowTurnoDropdown] = useState(false);

  // Estado para permitir ou não viagens próximas entre campus
  const [allowTravelConflict, setAllowTravelConflict] = useState<"Sim" | "Não">("Não");
  const [showTravelDropdown, setShowTravelDropdown] = useState(false);

  // Estado para filtro de professores bloqueados
  const [selectedProfessors, setSelectedProfessors] = useState<string[]>([]);
  const [professorSearch, setProfessorSearch] = useState("");
  const [searchProfessorResults, setSearchProfessorResults] = useState<string[]>([]);

  // Atualiza sugestões de professores conforme busca
  useEffect(() => {
    if (!professorSearch.trim()) {
      setSearchProfessorResults([]);
    } else {
      setSearchProfessorResults(
        professorList.filter(p =>
          p.toLowerCase().includes(professorSearch.toLowerCase()) &&
          !selectedProfessors.includes(p)
        )
      );
    }
  }, [professorSearch, selectedProfessors]);

  // Estado para modo de visualização (grade ou lista) e disciplinas selecionadas
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDisciplines, setSelectedDisciplines] = useState<DisciplineEnrollment[]>([]);

  // Alterna seleção de disciplina na grade/lista
  const handleDisciplineClick = (discipline: DisciplineEnrollment) => {
    setSelectedDisciplines(prev =>
      prev.some(d => d.section === discipline.section)
        ? prev.filter(d => d.section !== discipline.section)
        : [...prev, discipline]
    );
  };

  // Recupera disciplinas já cursadas da navegação
  const state = (location.state ?? {}) as LocationState;
  const { completedDisciplineCodes = [] } = location.state as LocationState;

  // Redireciona se não houver curso selecionado
  if (!state.selectedCourse) {
    return <Navigate to="/pageCourse" replace />;
  }

  // Categorias do curso selecionado
  const COURSE_CATEGORIES =
    courseCategoriesData.find((c) => c.id === selectedCourse.id)?.courseCategory ?? [];

  // Lista de campi e turnos disponíveis
  const campi = [
    { id: 0, name: "Santo André" },
    { id: 1, name: "São Bernardo do Campo" },
    { id: 2, name: "Todos" },
  ];
  const turno = ["Matutino", "Vespertino", "Noturno", "Todos"];
  const campusMap: Record<string, string> = {
    "Santo André": "SA",
    "São Bernardo do Campo": "SB",
  };

  // Limpa todos os filtros
  const clearFilters = () => {
    setSelectedCampus("Todos");
    setSelectedTurno("Todos");
    setAllowTravelConflict("Não");
    setSelectedProfessors([]);
    setProfessorSearch("");
  };

  // Funções auxiliares para checar conflitos de horário e viagem
  const isSlotConflict = (a: Timeslot, b: Timeslot): boolean => {
    if (a.day !== b.day || a.time !== b.time) return false;
    if (a.week === "Semanal" || b.week === "Semanal") return true;
    return a.week === b.week;
  };

  const isTravelAllowed = (a: Timeslot, b: Timeslot): boolean => {
    if (a.day !== b.day) return true;
    const endA = a.time + 1;
    return b.time >= endA + 1;
  };

  const hasCloseTravelConflict = (d1: DisciplineEnrollment, d2: DisciplineEnrollment): boolean => {
    if (d1.campus === d2.campus) return false;
    return d1.timeslots
      .concat(d1.practiceTimeslots)
      .some(ts1 => d2.timeslots.concat(d2.practiceTimeslots)
        .some(ts2 => !isTravelAllowed(ts1, ts2)));
  };

  // Verifica se há conflito de horário com disciplinas já selecionadas
  const checkTimeConflict = (disc: DisciplineEnrollment) => {
    return selectedDisciplines.some((sel) =>
      [...disc.timeslots, ...disc.practiceTimeslots].some((slot) =>
        [...sel.timeslots, ...sel.practiceTimeslots].some((s) =>
          isSlotConflict(s, slot)
        )
      )
    );
  };

  // Verifica se disciplina está indisponível por conflito de horário
  const isDisciplineUnavailable = (d: DisciplineEnrollment) => {
    if (selectedDisciplines.some(x => x.section === d.section)) return false;
    return selectedDisciplines.length > 0 && checkTimeConflict(d);
  };

  // Monta lista de todas as disciplinas disponíveis para matrícula
  const allDisciplines: DisciplineEnrollment[] = enrollmentData.disciplines.map(d => ({
    id: d.id!,
    code: d.sigla_disciplina!,
    section: d.sigla_turma!,
    name: d.name ?? "",
    campus: d.campus ?? "",
    turn: d.turn ?? "",
    credits: d.credits ?? 0,
    slots: d.slots ?? 0,
    room: d.room,
    tpei: d.tpei,
    professor: [
      d.docente_teoria ?? d.docente_pratica,
      d.docente_teoria_2 ?? d.docente_pratica_2,
      d.docente_teoria_3 ?? d.docente_pratica_3,
    ].filter(Boolean).join(" / "),
    scheduleTheory: d.schedule_theory,
    schedulePractice: d.schedule_practice,
    timeslots: d.timeslots as Timeslot[],
    practiceTimeslots: [],
    courseCategory: (disciplinesData.find(x => x.code === d.sigla_disciplina)?.disciplineCategory.map(cat => cat.name)) ?? []
  }));

  // Gera lista única de professores para o filtro
  const professorList = Array.from(
    new Set(
      allDisciplines
        .flatMap(d => d.professor.split(" / "))
        .filter(Boolean)
    )
  ).sort();

  // Filtra disciplinas do curso selecionado e remove as já cursadas
  const byCourse = allDisciplines.filter(d =>
    Array.isArray(COURSE_CATEGORIES) && d.courseCategory.some(cat => COURSE_CATEGORIES.includes(cat))
  );
  const remaining = byCourse.filter(d => !completedDisciplineCodes?.includes(d.code));

  // Aplica todos os filtros selecionados pelo usuário
  const filteredDisciplines = remaining.filter(d => {
    const matchesCampus = selectedCampus === "Todos" || d.campus === campusMap[selectedCampus];
    const matchesTurn = selectedTurno === "Todos" || d.turn === selectedTurno;
    const matchesProfessor = selectedProfessors.length === 0 ||
      !selectedProfessors.some(sp =>
        d.professor.split(" / ").includes(sp)
      );
    const isAvailable = !isDisciplineUnavailable(d);
    const noTravelConflict = allowTravelConflict === "Sim" ||
      !selectedDisciplines.some(other => hasCloseTravelConflict(d, other));

    return matchesCampus && matchesTurn && matchesProfessor && isAvailable && noTravelConflict;
  });

  // Slots de horários e dias da semana para montar a grade
  const timeSlots = [
    "8:00 às 9:00",
    "9:00 às 10:00",
    "10:00 às 11:00",
    "11:00 às 12:00",
    "12:00 às 13:00",
    "13:00 às 14:00",
    "14:00 às 15:00",
    "15:00 às 16:00",
    "16:00 às 17:00",
    "17:00 às 18:00",
    "18:00 às 19:00",
    "19:00 às 20:00",
    "20:00 às 21:00",
    "21:00 às 22:00",
    "22:00 às 23:00",
  ];

  const weekDays = [
    { id: "seg", label: "Segunda" },
    { id: "ter", label: "Terça" },
    { id: "qua", label: "Quarta" },
    { id: "qui", label: "Quinta" },
    { id: "sex", label: "Sexta" },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 mx-2 sm:mx-4 md:mx-2 lg:mx-16 py-4 sm:py-8">
        {/* Botão para voltar */}
        <Button
          label="Voltar"
          onClick={() => navigate(-1)}
          className="mb-4 bg-orange-800 text-white text-sm border border-gray text-gray-800 w-fit"
        />
        {/* Título e período */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-4 sm:mb-8 items-center gap-2">
          <div className="flex items-center gap-4">
            <h3 className="text-green-800 font-bold text-xl sm:text-2xl">
              <FontAwesomeIcon icon={faGraduationCap} className="mr-2" />
              Matrícula em Disciplinas
            </h3>
          </div>
          <p className="font-semibold text-xs border border-gray-200 rounded-full py-1 px-3 items-center">
            Período 2025.2
          </p>
        </div>

        {/* Card de confirmação de disciplinas selecionadas */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {selectedDisciplines.length > 0 && (
            <div
              className={`mt-4 border rounded-lg p-4  ${selectedDisciplines.some((d) =>
                d.courseCategory?.includes("BC&T - Bacharelado em Ciência e Tecnologia (OBR)")
              )
                ? "bg-gray-200 border-gray-300"
                : selectedDisciplines.some((d) =>
                  d.courseCategory?.includes("BC&T - Bacharelado em Ciência e Tecnologia (OL)")
                )
                  ? "bg-yellow-200 border-yellow-300"
                  : "bg-green-50 border-green-200"
                }`}
            >
              <p className="font-medium text-green-800">
                {selectedDisciplines.length} disciplina(s) selecionada(s)
              </p>
              <div className="flex gap-2 mt-2">
                <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Salvar Seleção
                </button>
                <button
                  className="px-4 py-2 border border-gray-200 rounded hover:bg-gray-50"
                  onClick={() => setSelectedDisciplines([])}
                >
                  Limpar Seleção
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filtros e Grade de Horários */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-1">
          {/* Coluna de filtros */}
          <section className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-4">
            <h4 className="mb-6 font-semibold text-lg flex items-center">
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              Filtros
            </h4>

            <div className="flex flex-col gap-4">
              {/* Filtro de campus */}
              <div>
                <label className="text-sm font-medium mb-2 block">Campus</label>
                <div className="relative">
                  <button
                    onClick={() => setShowCampusDropdown(!showCampusDropdown)}
                    className="w-full px-4 py-2 text-left flex items-center justify-between rounded border border-gray-200 hover:border-green-700 focus:outline-none focus:border-green-700"
                  >
                    <span>{selectedCampus}</span>
                    <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
                  </button>
                  {showCampusDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                      <ul className="py-1">
                        {campi.map((campus) => (
                          <li
                            key={campus.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSelectedCampus(campus.name);
                              setShowCampusDropdown(false);
                            }}
                          >
                            {campus.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Filtro de turno */}
              <div>
                <label className="text-sm font-medium mb-2 block">Turno</label>
                <div className="relative">
                  <button
                    onClick={() => setShowTurnoDropdown(!showTurnoDropdown)}
                    className="w-full px-4 py-2 text-left flex items-center justify-between rounded border border-gray-200 hover:border-green-700 focus:outline-none focus:border-green-700"
                  >
                    <span>{selectedTurno}</span>
                    <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
                  </button>
                  {showTurnoDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                      <ul className="py-1">
                        {turno.map((t) => (
                          <li
                            key={t}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSelectedTurno(t);
                              setShowTurnoDropdown(false);
                            }}
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Filtro de viagens próximas entre campus */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Viagens próximas entre campus
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowTravelDropdown(!showTravelDropdown)}
                    className="w-full px-4 py-2 text-left flex items-center justify-between rounded border border-gray-200 hover:border-green-700 focus:outline-none focus:border-green-700"
                  >
                    <span>{allowTravelConflict}</span>
                    <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
                  </button>
                  {showTravelDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                      <ul className="py-1">
                        {["Sim", "Não"].map((val) => (
                          <li
                            key={val}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setAllowTravelConflict(val as "Sim" | "Não");
                              setShowTravelDropdown(false);
                            }}
                          >
                            {val}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Filtro de professores não desejados */}
              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">Professores não desejados</label>
                <input
                  type="text"
                  placeholder="Pesquisar professor..."
                  value={professorSearch}
                  onChange={e => setProfessorSearch(e.target.value)}
                  className="p-2 border rounded w-full mb-2"
                />
                {/* Sugestões de professores para bloqueio */}
                {searchProfessorResults.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded shadow-lg">
                    {(professorSearch.length < 3
                      ? searchProfessorResults.slice(0, 3)
                      : searchProfessorResults
                    ).map(p => (
                      <div
                        key={p}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedProfessors(prev => [...prev, p]);
                          setProfessorSearch("");
                        }}
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                )}
                {/* Chips de professores bloqueados */}
                {selectedProfessors.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedProfessors.map(p => (
                      <div key={p} className="bg-red-200 text-red-900 px-2 py-1 rounded flex items-center">
                        <span>{p}</span>
                        <button
                          onClick={() => setSelectedProfessors(prev => prev.filter(x => x !== p))}
                          className="ml-2 hover:text-red-600"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botão para limpar todos os filtros */}
              <button
                onClick={clearFilters}
                className="w-full mt-4 px-4 py-2 text-center rounded border border-gray-200 hover:bg-gray-50"
              >
                Limpar Filtros
              </button>

              {/* Botões para alternar visualização entre lista e grade */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-4 mt-4 w-full">
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center justify-center cursor-pointer px-2 py-2 rounded w-full sm:w-auto ${viewMode === "list" ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                >
                  <FontAwesomeIcon icon={faList} className="sm:mr-2 lx:mr-2" />
                  Lista
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center justify-center cursor-pointer px-4 py-2 rounded w-full sm:w-auto ${viewMode === "grid" ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                >
                  <FontAwesomeIcon icon={faTable} className="mx-1" />
                  Grade
                </button>
              </div>

              {/* Legenda das categorias e cores */}
              {viewMode === "grid" && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <h4 className="font-semibold text-sm mb-4">Legenda:</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-xs font-medium mb-2">Categorias:</h5>
                      <div className="flex flex-wrap gap-3">
                        {COURSE_COLORS.map((cat) => (
                          <div key={cat.name} className="flex items-center gap-1.5">
                            <div className={`w-4 h-4 rounded ${cat.bgColor}`}></div>
                            <span className="text-xs">{cat.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Coluna da grade de horários e disciplinas disponíveis */}
          <section className="md:col-span-3 lg:col-span-3">
            {/* Quadro de horários das disciplinas selecionadas */}
            {selectedDisciplines.length > 0 && (
              <div className="mt-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-4">Quadro de Horários</h2>
                <div className="overflow-x-auto">
                  {/* Tabela de horários */}
                  <table className="w-auto table-auto border-collapse">
                    <thead>
                      <tr>
                        <th className="p-4 text-left bg-gray-50 border border-gray-200 font-medium">
                          Horário
                        </th>
                        {weekDays.map((day) => (
                          <th
                            key={day.id}
                            className="p-4 text-left bg-gray-50 border border-gray-200 font-medium text-gray-600"
                          >
                            {day.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Renderiza apenas os horários usados */}
                      {(() => {
                        const skip: Record<string, number> = {};
                        const used = new Set<number>();
                        selectedDisciplines.forEach((disc) =>
                          [...disc.timeslots, ...disc.practiceTimeslots].forEach((s) =>
                            used.add(s.time - 8)
                          )
                        );
                        const visibleSlotIndexes = Array.from(used)
                          .filter((i) => i >= 0 && i < timeSlots.length)
                          .sort((a, b) => a - b);

                        return visibleSlotIndexes.map((slotIdx) => (
                          <tr key={slotIdx}>
                            <td className="px-1 py-1 border border-gray-200">
                              {timeSlots[slotIdx]}
                            </td>
                            {weekDays.map((day) => {
                              if (skip[day.id] > 0) {
                                skip[day.id]!--;
                                return null;
                              }
                              const slots = selectedDisciplines.flatMap((disc) =>
                                disc.timeslots
                                  .filter((s) => s.day === day.id && s.time === slotIdx + 8)
                                  .map((s) => ({ disc, week: s.week, start: s.time }))
                              );
                              if (slots.length === 0) {
                                return <td key={day.id} className="p-1 border border-gray-200 align-top" />;
                              }
                              // Calcula o span de cada bloco de horário
                              const spans = slots.map(({ disc, week, start }) => {
                                let span = 1;
                                while (
                                  disc.timeslots.some(
                                    (s) =>
                                      s.day === day.id &&
                                      s.week === week &&
                                      s.time === start + span
                                  )
                                ) {
                                  span++;
                                }
                                return span;
                              });
                              const maxSpan = Math.max(...spans);
                              skip[day.id] = maxSpan - 1;
                              return (
                                <td
                                  key={day.id}
                                  rowSpan={maxSpan}
                                  className="p-1 border border-gray-200 align-top whitespace-normal"
                                >
                                  <div className="flex flex-col items-start justify-start gap-px">
                                    {slots.map(({ disc, week, start }, i) => {
                                      // Aplica cor da categoria da disciplina
                                      const matchCat = disc.courseCategory.find(c =>
                                        COURSE_CATEGORIES.includes(c)
                                      )!;
                                      const color = getCategoryColor(matchCat, false);
                                      return (
                                        <div
                                          key={disc.code + week}
                                          className={`inline-block p-2 rounded-lg shadow-sm border border-gray-200 text-left max-w-max ${color}`}
                                        >
                                          {/* Código da turma */}
                                          <div className="font-mono text-sm mb-1">{disc.section}</div>
                                          {/* Nome da disciplina */}
                                          <div className="text-base font-medium mb-2 truncate max-w-[12ch]">
                                            {disc.name}
                                          </div>
                                          {/* Professor */}
                                          <div className="text-xs text-gray-700 mb-1 truncate max-w-[12ch]"> {disc.professor}</div>
                                          {/* Campus */}
                                          <div className="text-xs text-gray-700 mb-1"><FontAwesomeIcon
                                            icon={faLocationDot}
                                            className="text-gray-600 w-3.5"
                                          />{disc.campus}</div>
                                          {/* Horário e Semana */}
                                          <div className="text-xs text-gray-500 mb-1 truncate max-w-[20ch]">
                                            {`${start}:00 às ${start + spans[i]}:00`}
                                          </div>
                                          <div className="text-xs text-gray-500 mb-1 truncate max-w-[20ch]">
                                            {`${week}`}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Lista de disciplinas disponíveis para matrícula */}
            <div className="mt-1 bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                Disciplinas Disponíveis
              </h2>
              <p className="text-gray-500 mb-4 sm:mb-6">
                Selecione as disciplinas para sua matrícula
              </p>

              {/* Renderiza disciplinas em grid ou lista */}
              <div className={`grid ${viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                : "grid-cols-2 gap-2"
                }`}>
                {filteredDisciplines.map((discipline) => {
                  // Encontra a categoria do curso que pertence ao curso atual
                  const matchCat = discipline.courseCategory.find((c) =>
                    COURSE_CATEGORIES.includes(c)
                  )!;
                  const completed = selectedDisciplines.some((s) => s.section === discipline.section);

                  // Classifica a categoria para exibir nome correto
                  const categoria = classifyCategoryName(matchCat, completed);

                  // Busca cor da categoria
                  const bg = COURSE_COLORS.find((c) => c.name === categoria)?.bgColor ?? "";

                  return (
                    // Card de disciplina disponível para matrícula
                    <div
                      key={discipline.section}
                      // Define cor e estilo do card conforme disponibilidade e seleção
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${isDisciplineUnavailable(discipline)
                        ? "bg-gray-100 opacity-50 cursor-not-allowed"
                        : completed
                          ? "bg-green-50 border-2 border-green-500"
                          : bg
                        }`}
                      // Só permite clicar se a disciplina estiver disponível
                      onClick={() =>
                        !isDisciplineUnavailable(discipline) && handleDisciplineClick(discipline)
                      }
                    >
                      <div className="flex flex-col gap-3">
                        <div>
                          {/* Código da turma */}
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs">{discipline.section}</h5>
                          </div>
                          {/* Nome da disciplina */}
                          <h4 className="text-base font-medium mt-1 break-words max-w-[20ch]">
                            {discipline.name}
                          </h4>
                        </div>
                        {/* Informações do professor, campus e turno */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon
                              icon={faUser}
                              className="text-gray-600 w-3.5"
                            />
                            <span className="text-sm text-gray-800">
                              <span className="break-words max-w-[16ch]">{discipline.professor}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon
                              icon={faLocationDot}
                              className="text-gray-600 w-3.5"
                            />
                            <span className="text-sm text-gray-800">
                              {discipline.campus}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon
                              icon={faClock}
                              className="text-gray-600 w-3.5"
                            />
                            <span className="text-sm text-gray-800">
                              {discipline.turn}
                            </span>
                          </div>
                        </div>
                        {/* Créditos da disciplina */}
                        <div className="text-sm text-gray-800">
                          Créditos: {discipline.credits}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}