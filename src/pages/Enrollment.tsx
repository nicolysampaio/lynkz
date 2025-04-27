import { useState } from "react";
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
  faList,
  faTable,
} from "@fortawesome/free-solid-svg-icons";
import enrollmentData from "../../db/enrollment.json";
import disciplinesData from "../../db/disciplines.json";
import courseCategoriesData from "../../db/course_categories.json";
import DisciplineEnrollment from "../types/DisciplineEnrollment";
import Footer from "../components/Footer";
import Header from "../components/Header";

// <-- novo tipo para receber estado
type LocationState = {
  selectedCourse?: string;
  completedDisciplineCodes?: string[];
};

type Timeslot = {
  day: string;
  time: number;
  week: string;
};

function Enrollment() {
  const location = useLocation();
  const { completedDisciplineCodes = [] } = location.state as LocationState;

  const [selectedCampus, setSelectedCampus] = useState("Todos");
  const [selectedTurno, setSelectedTurno] = useState("Todos");
  const [showCampusDropdown, setShowCampusDropdown] = useState(false);
  const [showTurnoDropdown, setShowTurnoDropdown] = useState(false);

  // → Novo estado para o filtro de viagens
  const [allowTravelConflict, setAllowTravelConflict] = useState<"Sim" | "Não">("Não");
  const [showTravelDropdown, setShowTravelDropdown] = useState(false);

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
  if (!state.selectedCourse) {
    return <Navigate to="/pageCourse" replace />;
  }
  const { selectedCourse } = state;

  const COURSE_CATEGORIES =
    courseCategoriesData.find((c) => c.id === selectedCourse)?.courseCategory ?? [];

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

  const getCategoryColor = (category: string): string => {
    const prefix = category.split(" -")[0];
    const match = category.match(/\((OBR|OL)\)$/);
    const suffix = match?.[1];
    if (prefix === "BCC") {
      return suffix === "OBR" ? "bg-blue-200" : "bg-yellow-200";
    }
    if (prefix === "BC&T") {
      return suffix === "OBR" ? "bg-gray-200" : "bg-yellow-200";
    }
    return "bg-red-200";
  };

  const getCategoryIcon = (category: string) => {
    const match = category.match(/\((OBR|OL)\)$/)?.[1];
    return match === "OBR"
      ? { name: faCheckCircle, color: "text-blue-500" }
      : { name: faLock, color: "text-yellow-500" };
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

  const byCourse = allDisciplines.filter((d) =>
    d.courseCategory.some((cat) => COURSE_CATEGORIES.includes(cat))
  );

  const remaining = byCourse.filter(
    d => !completedDisciplineCodes.includes(d.code)
  );

  // → Atualizar a lógica de filteredDisciplines
  const filteredDisciplines = remaining.filter((d) => {
    const matchesCampus =
      selectedCampus === "Todos" || d.campus === campusMap[selectedCampus];
    const matchesTurn =
      selectedTurno === "Todos" || d.turn === selectedTurno;
    const isAvailable = !isDisciplineUnavailable(d);

    // → respeita allowTravelConflict
    const noTravelConflict =
      allowTravelConflict === "Sim" ||
      !selectedDisciplines.some((other) => hasCloseTravelConflict(d, other));

    return matchesCampus && matchesTurn && isAvailable && noTravelConflict;
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
    <div className="min-h-screen flex flex-col flex-1 bg-gray-50">
      <Header />

      <main className="flex flex-col flex-1 mx-16 py-8">
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
        {/* Filtros e Grade de Horários */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                        {[
                          { id: 1, name: "Obrigatória", color: "bg-blue-200" },
                          { id: 2, name: "Optativa", color: "bg-yellow-200" },
                          { id: 3, name: "Livre", color: "bg-red-200" },
                          { id: 4, name: "Concluída", color: "bg-green-500" },
                        ].map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center gap-1.5"
                          >
                            <div
                              className={`w-4 h-4 rounded ${category.color}`}
                            ></div>
                            <span className="text-xs">{category.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-medium mb-2">Ícones:</h5>
                      <div className="grid grid-cols-1 gap-2.5 text-xs">
                        {[
                          { name: "Obrigatória", icon: faCheckCircle, color: "text-blue-200" },
                          { name: "Optativa", icon: faLock, color: "text-yellow-500" },
                          { name: "Livre", icon: faUnlock, color: "text-green-500" },
                          { name: "Concluída", icon: faMedal, color: "text-yellow-500" },
                        ].map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-2"
                          >
                            <FontAwesomeIcon
                              icon={item.icon}
                              className={`${item.color} w-4 h-4`}
                            />
                            <span className="text-xs">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold mb-2">
                Disciplinas Disponíveis
              </h2>
              <p className="text-gray-500 mb-6">
                Selecione as disciplinas para sua matrícula
              </p>

              <div
                className={`grid ${viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                  : "grid-cols-1 gap-2"
                  }`}
              >
                {filteredDisciplines.map((discipline) => {
                  // escolhe a courseCategory que pertence ao curso atual
                  const matchCat = discipline.courseCategory.find((c) =>
                    COURSE_CATEGORIES.includes(c)
                  )!;
                  const color = getCategoryColor(matchCat);
                  const icon = getCategoryIcon(matchCat);
                  const isSelected = selectedDisciplines.some(
                    (d) => d.section === discipline.section
                  );
                  const isUnavailable = isDisciplineUnavailable(discipline);

                  return (
                    <div
                      key={discipline.section}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${isUnavailable
                        ? "bg-gray-100 opacity-50 cursor-not-allowed"
                        : isSelected
                          ? "bg-green-50 border-2 border-green-500"
                          : color // Cor de fundo do card
                        }`}
                      onClick={() =>
                        !isUnavailable && handleDisciplineClick(discipline)
                      }
                    >
                      <div className="flex flex-col gap-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs">{discipline.section}</h5>
                            <FontAwesomeIcon
                              icon={icon.name}
                              className={`${icon.color} w-4 h-4`}
                            />
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

            {selectedDisciplines.length > 0 && (
              <>
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold mb-4">
                    Quadro de Horários
                  </h2>
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
                          // ↓ antes: listava todas as horas fixas
                          // const visibleSlotIndexes = Array.from({ length: timeSlots.length }, (_, i) => i);

                          // ↑ agora: só renderiza linhas para horários que tenham ao menos um card
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
                                  return <td key={day.id} className="p-0 border align-top" />;
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
                                    className="p-0 border align-top whitespace-normal"
                                  >
                                    <div className="flex flex-col items-start justify-start gap-px">
                                      {slots.map(({ disc, week, start }, i) => {
                                        // escolhe a categoria da disciplina e aplica cor correta
                                        const matchCat = disc.courseCategory.find(c =>
                                          COURSE_CATEGORIES.includes(c)
                                        )!;
                                        const color = getCategoryColor(matchCat);
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

                <div
                  className={`mt-4 border rounded-lg p-4 ${selectedDisciplines.some((d) =>
                    d.courseCategory?.includes(
                      "BC&T - Bacharelado em Ciência e Tecnologia (OBR)"
                    )
                  )
                    ? "bg-gray-200 border-gray-300"
                    : selectedDisciplines.some((d) =>
                      d.courseCategory?.includes(
                        "BC&T - Bacharelado em Ciência e Tecnologia (OL)"
                      )
                    )
                      ? "bg-yellow-200 border-yellow-300"
                      : selectedDisciplines.some((d) =>
                        d.courseCategory?.includes(
                          "BCC - Bacharelado em Ciências da Computação (OL)"
                        )
                      )
                        ? "bg-red-200 border-red-300"
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
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Enrollment;
