import { useState } from "react";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import disciplines from "../../db/disciplines.json";
import Header from "../components/Header.tsx";
import Button from "../components/Button.tsx";
import Footer from "../components/Footer.tsx";
import CardObrigatoria from "../components/Subjects/CardObrigatoria.tsx";
import CardHumanidade from "../components/Subjects/CardHumanidade.tsx";
import CardOptativa from "../components/Subjects/CardOptativa.tsx";

interface Discipline {
  id: number;
  code: string;
  name: string;
  credits: number;
  period: string;
  quarter: number;
  courseCategory: string[];
}

function DisciplineSelection() {
  const [disciplinesSelected, setDisciplinesSelected] = useState<number[]>([]);
  const [humanitiesSelected, setHumanitiesSelected] = useState({
    1: null,
    5: null,
    6: null,
  });
  const [openHumanitiesDropdown, setOpenHumanitiesDropdown] = useState({
    1: false,
    5: false,
    6: false,
  });

  const toggleDisciplineSelection = (id: number) =>
    setDisciplinesSelected((selected) =>
      selected.includes(id)
        ? selected.filter((discipline) => discipline !== id)
        : [...selected, id]
    );

  const toggleHumanitiesDropdown = (quarter: number) =>
    setOpenHumanitiesDropdown((selected) => ({
      ...selected,
      [quarter]: !selected[quarter],
    }));

  const handleHumanitiesSelection = (
    quarter: number,
    courseId: number | null
  ) =>
    setHumanitiesSelected((selected) => ({ ...selected, [quarter]: courseId }));

  const humanitiesCourses = [
    { id: 1, name: "Bases Epistemológicas da Ciência Moderna" },
    { id: 2, name: "Ciência, Tecnologia e Sociedade" },
    { id: 3, name: "Estrutura e Dinâmica Social" },
    { id: 4, name: "Nenhuma" },
  ];

  const filteredDisciplines = disciplines.filter(
    (discipline) =>
      discipline.quarter &&
      discipline.courseCategory?.some((category) =>
        [
          "BC&T - Bacharelado em Ciência e Tecnologia (OBR)",
          "BCC - Bacharelado em Ciências da Computação (OBR)",
          "BCC - Bacharelado em Ciências da Computação (OL)",
          "Livres",
        ].includes(category)
      )
  );

  const groupedDisciplines = filteredDisciplines.reduce<
    Record<number, Discipline[]>
  >((acc, discipline) => {
    acc[discipline.quarter] = acc[discipline.quarter] || [];
    acc[discipline.quarter].push(discipline);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col flex-1 bg-gray-50">
      <Header />

      <main className="container flex flex-col flex-1 mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-xs w-full border border-gray-200 p-4">
          <h4 className="mb-4 font-semibold text-lg">
            Selecione as disciplinas que você já cursou
          </h4>

          <div className="grid grid-cols-1 gap-8 mb-8">
            {Object.entries(groupedDisciplines).map(
              ([quarter, disciplines]) => {
                const q = parseInt(quarter);
                const isHumanitiesQuarter = q === 1 || q === 5 || q === 6;

                return (
                  <div key={quarter}>
                    <h3 className="text-lg font-semibold mb-4">
                      {q}º Quadrimestre
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      {isHumanitiesQuarter && (
                        <CardHumanidade
                          key={`humanities-${q}`} // Adicione uma key única
                          quarter={q}
                          humanities={humanitiesCourses}
                          selected={humanitiesSelected[q] || null}
                          selectedQuarter={humanitiesSelected}
                          open={openHumanitiesDropdown[q] || false}
                          toggleDropdown={() => toggleHumanitiesDropdown(q)}
                          handleSelect={(disciplineId) =>
                            handleHumanitiesSelection(q, disciplineId)
                          }
                        />
                      )}
                      {disciplines.map((discipline) => (
                        <CardObrigatoria
                          key={discipline.id} // Adicione a key aqui
                          id={discipline.id}
                          discipline={discipline.name}
                          credits={discipline.credits}
                          selected={disciplinesSelected.includes(discipline.id)}
                          toggleDiscipline={toggleDisciplineSelection}
                        />
                      ))}
                      {q === 11 && <CardOptativa key="optativa" />}
                    </div>
                  </div>
                );
              }
            )}
          </div>

          <div className="w-full flex justify-center">
            <Button
              label="Confirmar seleção"
              className="bg-green-800 text-white text-sm"
              onClick={() => console.log(disciplinesSelected)}
              icon={faCheck}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default DisciplineSelection;
