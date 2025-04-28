/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faGraduationCap,
  faCheckCircle,
  faLock,
  faUnlock,
  faMedal,
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
import { Course } from "../types/Course";

type LocationState = {
  selectedCourse?: string;
  completedDisciplineCodes?: string[];
};

type Timeslot = {
  day: string;
  time: number;
  week: string;
};

// categorias OBR que devem usar “Obrigatórias Ingresso”
const PRIORITY_INGRESS_OBR = [
  "BC&T - Bacharelado em Ciência e Tecnologia (OBR)",
  "BC&H - Bacharelado em Ciências e Humanidades (OBR)",
];

export default function Enrollment() {
  const location = useLocation();
  const { selectedCourse } = location.state as { selectedCourse: Course };

  const COURSE_COLORS = selectedCourse.course_color ?? [];

  // classificação com prioridade a “Obrigatórias Ingresso”
  const classifyCategoryName = (cat: string, completed: boolean): string => {
    if (completed) return "Concluída";

    if (PRIORITY_INGRESS_OBR.includes(cat)) {
      return "Obrigatórias Ingresso";
    }
    if (cat.endsWith("(OBR)")) return "Obrigatória";
    if (cat.endsWith("(OL)")) return "Optativa";
    return "Livre";
  };

  // 3) retorna bg‐class do course_color
  const getCategoryColor = (cat: string, completed: boolean): string =>
    COURSE_COLORS.find((c) => c.name === classifyCategoryName(cat, completed))
      ?.color ?? "";

  // 4) retorna ícone + text‐class
  const getCategoryIcon = (cat: string, completed: boolean) => {
    const name = classifyCategoryName(cat, completed);
    const icon =
      name === "Concluída"
        ? faMedal
        : name === "Optativa"
        ? faLock
        : name === "Livre"
        ? faUnlock
        : faCheckCircle;
    const color = COURSE_COLORS.find((c) => c.name === name)
      ?.color.replace("bg-", "text-") ?? "";
    return { icon, color };
  };

  const [selectedCampus, setSelectedCampus] = useState("Todos");
  const [selectedTurno, setSelectedTurno] = useState("Todos");
  const [showCampusDropdown, setShowCampusDropdown] = useState(false);
  const [showTurnoDropdown, setShowTurnoDropdown] = useState(false);

  // → Novo estado para o filtro de viagens
  const [allowTravelConflict, setAllowTravelConflict] = useState<"Sim" | "Não">("Não");
  const [showTravelDropdown, setShowTravelDropdown] = useState(false);

  // → novo estado para bloqueio de múltiplos professores
  const [selectedProfessors, setSelectedProfessors] = useState<string[]>([]);
  const [professorSearch, setProfessorSearch] = useState("");
  const [searchProfessorResults, setSearchProfessorResults] = useState<string[]>([]);

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

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDisciplines, setSelectedDisciplines] = useState<DisciplineEnrollment[]>([]);

  const handleDisciplineClick = (discipline: DisciplineEnrollment) => {
    setSelectedDisciplines(prev =>
      prev.some(d => d.section === discipline.section)
        ? prev.filter(d => d.section !== discipline.section)
        : [...prev, discipline]
    );
  };

  const state = (location.state ?? {}) as LocationState;
  const { completedDisciplineCodes = [] } = location.state as LocationState;

  if (!state.selectedCourse) {
    return <Navigate to="/pageCourse" replace />;
  }

  const COURSE_CATEGORIES =
    courseCategoriesData.find((c) => c.id === selectedCourse.id)?.courseCategory ?? [];

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

  const clearFilters = () => {
    setSelectedCampus("Todos");
    setSelectedTurno("Todos");
    setAllowTravelConflict("Não");
    setSelectedProfessors([]);
    setProfessorSearch("");
  };

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

  const checkTimeConflict = (disc: DisciplineEnrollment) => {
    return selectedDisciplines.some((sel) =>
      [...disc.timeslots, ...disc.practiceTimeslots].some((slot) =>
        [...sel.timeslots, ...sel.practiceTimeslots].some((s) =>
          isSlotConflict(s, slot)
        )
      )
    );
  };

  const isDisciplineUnavailable = (d: DisciplineEnrollment) => {
    if (selectedDisciplines.some(x => x.section === d.section)) return false;
    return selectedDisciplines.length > 0 && checkTimeConflict(d);
  };

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
    courseCategory: (disciplinesData.find(x => x.code === d.sigla_disciplina)?.courseCategory) ?? []
  }));

  // → monta lista única de professores
  const professorList = Array.from(
    new Set(
      allDisciplines
        .flatMap(d => d.professor.split(" / "))
        .filter(Boolean)
    )
  ).sort();

  // ...existing code...
const byCourse = allDisciplines.filter(d =>
  Array.isArray(COURSE_CATEGORIES) && d.courseCategory.some(cat => COURSE_CATEGORIES.includes(cat))
);
// ...existing code...
  const remaining = byCourse.filter(d => !completedDisciplineCodes?.includes(d.code));

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
      <main className="flex-1 mx-16 py-8">
        <div className="flex justify-between mb-8 items-center">
          <div className="flex items-center gap-4">
            <h3 className="text-green-800 font-bold text-2xl">
              <FontAwesomeIcon icon={faGraduationCap} className="mr-2" />
              Matrícula em Disciplinas
            </h3>
          </div>
          <p className="font-semibold text-xs border border-gray-200 rounded-full py-1 px-3 items-center">
            Período 2025.2
          </p>
        </div>

        {/* Card de Confirmar disciplinas */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-6">
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
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-6">
          <section className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h4 className="mb-6 font-semibold text-lg flex items-center">
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              Filtros
            </h4>

            <div className="flex flex-col gap-4">
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

              {/* → filtro Viagens próximas entre campus */}
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

              {/* → filtro de bloqueio de professor */}
              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">Professores não desejados</label>
                <input
                  type="text"
                  placeholder="Pesquisar professor..."
                  value={professorSearch}
                  onChange={e => setProfessorSearch(e.target.value)}
                  className="p-2 border rounded w-full mb-2"
                />
                {searchProfessorResults.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded shadow-lg">
                    {searchProfessorResults.map(p => (
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

              <button
                onClick={clearFilters}
                className="w-full mt-4 px-4 py-2 text-center rounded border border-gray-200 hover:bg-gray-50"
              >
                Limpar Filtros
              </button>

              <div className="flex items-center justify-center gap-2 pt-4 mt-4">
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex w-full items-center justify-center cursor-pointer px-4 py-2 rounded ${viewMode === "list" ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                >
                  <FontAwesomeIcon icon={faList} className="mr-2" />
                  Lista
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex w-full items-center justify-center cursor-pointer px-4 py-2 rounded ${viewMode === "grid" ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                >
                  <FontAwesomeIcon icon={faTable} className="mr-2" />
                  Grade
                </button>
              </div>

              {viewMode === "grid" && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <h4 className="font-semibold text-sm mb-4">Legenda:</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-xs font-medium mb-2">Categorias:</h5>
                      <div className="flex flex-wrap gap-3">
                        {COURSE_COLORS.map((cat) => (
                          <div key={cat.name} className="flex items-center gap-1.5">
                            <div className={`w-4 h-4 rounded ${cat.color}`}></div>
                            <span className="text-xs">{cat.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium mb-2">Ícones:</h5>
                      <div className="grid grid-cols-1 gap-2.5 text-xs">
                        {COURSE_COLORS.map((cat) => {
                          const { icon, color } = getCategoryIcon(cat.name, false);
                          return (
                            <div key={cat.id} className="flex items-center gap-2">
                              <FontAwesomeIcon icon={icon} className={`${color} w-4 h-4`} />
                              <span>{cat.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </section>
          {/* → Schedule (quadro de horários) fica **antes** de Disciplinas Disponíveis */}
          <section className="md:col-span-3">

            {selectedDisciplines.length > 0 && (
              <div className="mt-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">

                <h2 className="text-2xl font-bold mb-4">Quadro de Horários</h2>

                <div className="overflow-x-auto">


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
                      {(() => {
                        const skip: Record<string, number> = {};

                        const used = new Set<number>();
                        selectedDisciplines.forEach((disc) =>
                          [...disc.timeslots, ...disc.practiceTimeslots].forEach((s) =>
                            used.add(s.time - 8) // converte hora em índice (8h → slotIdx 0)
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
                                return <td key={day.id} className="p-0 border grey align-top" />;
                              }
                              // calcula span para cada bloco
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
                                  className="p-1 border align-top whitespace-normal"
                                >
                                  <div className="flex flex-col items-start justify-start gap-px">
                                    {slots.map(({ disc, week, start }, i) => {
                                      // escolhe a categoria da disciplina e aplica cor correta
                                      const matchCat = disc.courseCategory.find(c =>
                                        COURSE_CATEGORIES.includes(c)
                                      )!;
                                      const color = getCategoryColor(matchCat, false);
                                      return (
                                        <div
                                          key={disc.code + week}
                                          className={`inline-block p-2 rounded-lg shadow-sm border border-gray-200 text-left max-w-max ${color}`}
                                        >
                                          {/* Código */}
                                          <div className="font-mono text-sm mb-1">{disc.section}</div>

                                          {/* Nome */}
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

            {/* Disciplinas Disponíveis */}
            <div className="mt-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold mb-2">
                Disciplinas Disponíveis
              </h2>
              <p className="text-gray-500 mb-6">
                Selecione as disciplinas para sua matrícula
              </p>

              <div className={`grid ${viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                : "grid-cols-1 gap-2"
                }`}>
                {filteredDisciplines.map((discipline) => {
                  // escolhe a courseCategory que pertence ao curso atual
                  const matchCat = discipline.courseCategory.find((c) =>
                    COURSE_CATEGORIES.includes(c)
                  )!;
                  const completed = selectedDisciplines.some((s) => s.section === discipline.section);
                  const bg = getCategoryColor(matchCat, completed);
                  const { icon, color } = getCategoryIcon(matchCat, completed);

                  return (
                    <div
                      key={discipline.section}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${isDisciplineUnavailable(discipline)
                        ? "bg-gray-100 opacity-50 cursor-not-allowed"
                        : completed
                          ? "bg-green-50 border-2 border-green-500"
                          : bg // Cor de fundo do card
                      }`}
                      onClick={() =>
                        !isDisciplineUnavailable(discipline) && handleDisciplineClick(discipline)
                      }
                    >
                      <div className="flex flex-col gap-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs">{discipline.section}</h5>
                            <FontAwesomeIcon icon={icon} className={`${color} w-4 h-4`} />
                          </div>
                          <h4 className="text-base font-medium mt-1 break-words max-w-[20ch]">
                            {discipline.name}
                          </h4>
                        </div>
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
