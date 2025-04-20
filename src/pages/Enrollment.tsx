import { useState } from "react";
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
import Footer from "../components/Footer";
import Header from "../components/Header";
import DisciplineEnrollment from "../types/DisciplineEnrollment";

function Enrollment() {
  const [selectedCampus, setSelectedCampus] = useState("Todos");
  const [selectedTurno, setSelectedTurno] = useState("Todos");
  const [showCampusDropdown, setShowCampusDropdown] = useState(false);
  const [showTurnoDropdown, setShowTurnoDropdown] = useState(false);
  const [selectedDisciplines, setSelectedDisciplines] = useState<DisciplineEnrollment[]>(
    []
  );
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  const campi = [
    { id: 0, name: "Santo André" },
    { id: 1, name: "São Bernardo do Campo" },
    { id: 2, name: "Todos" },
  ];
  const turno = ["Matutino", "Vespertino", "Noturno", "Todos"];

  const categories = [
    { id: "BCT", name: "BCT", color: "bg-gray-200" },
    { id: "BCC", name: "BCC", color: "bg-blue-200" },
    { id: "OPTATIVA", name: "OPTATIVA", color: "bg-yellow-200" },
    { id: "LIVRE", name: "LIVRE", color: "bg-red-200" },
    { id: "CONCLUÍDA", name: "CONCLUÍDA", color: "bg-green-500" },
  ];

  const icons = [
    {
      name: "Disciplina Obrigatória",
      icon: faCheckCircle,
      color: "text-red-500",
    },
    { name: "Disciplina Limitada", icon: faLock, color: "text-blue-500" },
    { name: "Disciplina Livre", icon: faUnlock, color: "text-green-500" },
    { name: "Disciplina Concluída", icon: faMedal, color: "text-yellow-500" },
    { name: "Professor", icon: faUser, color: "text-gray-700" },
    { name: "Local", icon: faLocationDot, color: "text-gray-700" },
    { name: "Turno", icon: faClock, color: "text-gray-700" },
  ];

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

  const clearFilters = () => {
    setSelectedCampus("Todos");
    setSelectedTurno("Todos");
  };

  const checkTimeConflict = (discipline: DisciplineEnrollment) => {
    if (selectedDisciplines.length === 0) return false;

    return selectedDisciplines.some((selected) =>
      discipline.timeslots.some((timeSlot) =>
        selected.timeslots.includes(timeSlot)
      )
    );
  };

  const isDisciplineUnavailable = (discipline: DisciplineEnrollment) => {
    if (selectedDisciplines.some((d) => d.code === discipline.code))
      return false;
    if (selectedDisciplines.length === 0) return false;
    return checkTimeConflict(discipline);
  };

  const handleDisciplineClick = (discipline: DisciplineEnrollment) => {
    const isSelected = selectedDisciplines.some(
      (d) => d.code === discipline.code
    );

    if (isSelected) {
      setSelectedDisciplines((prev) =>
        prev.filter((d) => d.code !== discipline.code)
      );
      return;
    }

    if (checkTimeConflict(discipline)) {
      alert(
        "Conflito de horário detectado! Não é possível selecionar esta disciplina."
      );
      return;
    }

    setSelectedDisciplines((prev) => [...prev, discipline]);
  };

  const getDisciplineCategory = (
    discipline: DisciplineEnrollment
  ): "obrigatoria" | "optativa" | "livre" => {
    if (
      discipline.courseCategory?.includes(
        "BC&T - Bacharelado em Ciência e Tecnologia (OBR)"
      )
    ) {
      return "obrigatoria";
    } else if (
      discipline.courseCategory?.includes(
        "BC&T - Bacharelado em Ciência e Tecnologia (OL)"
      )
    ) {
      return "optativa";
    } else {
      return "livre";
    }
  };

  // const getCategoryColor = (
  //   category: "obrigatoria" | "optativa" | "livre"
  // ): string => {
  //   switch (category) {
  //     case "obrigatoria":
  //       return "bg-gray-200";
  //     case "optativa":
  //       return "bg-yellow-200";
  //     default:
  //       return "bg-red-200";
  //   }
  // };

  const getCategoryIcon = (category: "obrigatoria" | "optativa" | "livre") => {
    switch (category) {
      case "obrigatoria":
        return faCheckCircle;
      case "optativa":
        return faLock;
      default:
        return faUnlock;
    }
  };

  // Função para obter a cor da categoria com base na legenda
  const getDisciplineColor = (category: string): string => {
    const foundCategory = categories.find((cat) => cat.id === category);
    return foundCategory ? foundCategory.color : "bg-gray-200"; // Cor padrão caso não encontre
  };

  const filteredDisciplines = enrollmentData.disciplines.filter(
    (discipline: DisciplineEnrollment) => {
      const matchesTurn =
        selectedTurno === "Todos" || discipline.turn === selectedTurno;
      const isAvailable = !isDisciplineUnavailable(discipline);
      return matchesTurn && isAvailable;
    }
  );

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

              <button
                onClick={clearFilters}
                className="w-full mt-4 px-4 py-2 text-center rounded border border-gray-200 hover:bg-gray-50"
              >
                Limpar Filtros
              </button>

              <div className="flex items-center justify-center gap-2 border-t pt-4 mt-4">
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center px-4 py-2 rounded ${
                    viewMode === "list" ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <FontAwesomeIcon icon={faList} className="mr-2" />
                  Lista
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center px-4 py-2 rounded ${
                    viewMode === "grid" ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <FontAwesomeIcon icon={faTable} className="mr-2" />
                  Grade
                </button>
              </div>

              {viewMode === "grid" && (
                <div className="mt-8 border-t pt-6">
                  <h4 className="font-semibold text-lg mb-4">Legenda:</h4>

                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium mb-2">Categorias:</h5>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center gap-1"
                          >
                            <div
                              className={`w-4 h-4 rounded ${category.color}`}
                            ></div>
                            <span className="text-sm">{category.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Ícones:</h5>
                      <div className="flex flex-col gap-2">
                        {icons.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-2"
                          >
                            <FontAwesomeIcon
                              icon={item.icon}
                              className={`${item.color} w-4 h-4`}
                            />
                            <span className="text-sm">{item.name}</span>
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
                className={`grid ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    : "grid-cols-1 gap-2"
                }`}
              >
                {filteredDisciplines.map((discipline) => {
                  const category = getDisciplineCategory(discipline);
                  const isSelected = selectedDisciplines.some(
                    (d) => d.code === discipline.code
                  );
                  const isUnavailable = isDisciplineUnavailable(discipline);

                  return (
                    <div
                      key={discipline.code}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        isUnavailable
                          ? "bg-gray-100 opacity-50 cursor-not-allowed"
                          : isSelected
                          ? "bg-green-50 border-2 border-green-500"
                          : getDisciplineColor(category) // Aplica a cor da legenda
                      }`}
                      onClick={() =>
                        !isUnavailable && handleDisciplineClick(discipline)
                      }
                    >
                      <div className="flex flex-col gap-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <h5 className="font-mono text-sm">
                              {discipline.code}
                            </h5>
                            <FontAwesomeIcon
                              icon={getCategoryIcon(category)}
                              className={`${
                                category === "obrigatoria"
                                  ? "text-red-500"
                                  : category === "optativa"
                                  ? "text-blue-500"
                                  : "text-green-500"
                              }`}
                            />
                          </div>
                          <h4 className="text-base font-medium mt-1">
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
                              {discipline.professor}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon
                              icon={faLocationDot}
                              className="text-gray-600 w-3.5"
                            />
                            <span className="text-sm text-gray-800">
                              {discipline.room}
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
                          Vagas: {discipline.filled}/{discipline.slots}
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
                    <table className="w-full border-collapse">
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
                        {timeSlots.map((timeSlot, index) => (
                          <tr key={timeSlot}>
                            <td className="p-4 border border-gray-200">
                              {timeSlot}
                            </td>
                            {weekDays.map((day) => {
                              const discipline = selectedDisciplines.find((d) =>
                                d.timeslots.some(
                                  (slot) => slot === `${day.id}-${index + 8}`
                                )
                              );
                              return (
                                <td
                                  key={`${day.id}-${timeSlot}`}
                                  className="p-2 border border-gray-200 align-top"
                                >
                                  {discipline && (
                                    <div className="bg-gray-50 p-3 rounded">
                                      <div className="font-mono text-sm mb-1">
                                        {discipline.code}
                                      </div>
                                      <div className="text-sm text-gray-700">
                                        {discipline.name}
                                      </div>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div
                  className={`mt-4 border rounded-lg p-4 ${
                    selectedDisciplines.some((d) =>
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
