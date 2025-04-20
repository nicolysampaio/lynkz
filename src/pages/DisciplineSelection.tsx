import { useState } from "react";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import disciplines from "../../db/disciplines.json";
import Discipline from "../types/Discipline.ts";
import Header from "../components/Header.tsx";
import Button from "../components/Button.tsx";
import Footer from "../components/Footer.tsx";
import CardDiscipline from "../components/Subjects/CardDiscipline.tsx";
import CardHumanidade from "../components/Subjects/CardHumanidade.tsx";
import CardDisciplineList from "../components/Subjects/CardDisciplineList.tsx";

const COURSE_CATEGORIES = [
  "BC&T - Bacharelado em Ciência e Tecnologia (OBR)",
  "BC&T - Bacharelado em Ciência e Tecnologia (OL)",
  "BCC - Bacharelado em Ciências da Computação (OBR)",
  "BCC - Bacharelado em Ciências da Computação (OL)",
];

const HUMANITIES_QUARTERS = [1, 5, 6];
const OPTATIVES_QUARTERS = [8, 9, 10, 11, 12, 13];
const LIVRES_QUARTERS = [10, 14, 15];

function DisciplineSelection() {
  const [disciplinesSelected, setDisciplinesSelected] = useState<Set<number>>(
    new Set()
  );
  const [humanitiesSelected, setHumanitiesSelected] = useState<
    Record<number, number | null>
  >({});
  const [openHumanitiesDropdown, setOpenHumanitiesDropdown] = useState<
    Record<number, boolean>
  >({});

  const toggleDisciplineSelection = (id: number) =>
    setDisciplinesSelected((selected) => {
      const newSet = new Set(selected);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });

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

  const isHumanitiesQuarter = (quarter: number) =>
    HUMANITIES_QUARTERS.includes(quarter);

  const humanitiesCourses = [
    { id: 1, name: "Bases Epistemológicas da Ciência Moderna" },
    { id: 2, name: "Ciência, Tecnologia e Sociedade" },
    { id: 3, name: "Estrutura e Dinâmica Social" },
    { id: 4, name: "Nenhuma" },
  ];

  const filteredDisciplines = disciplines.filter(
    (discipline): discipline is Discipline =>
      discipline.quarter !== null &&
      discipline.credits !== null &&
      discipline.courseCategory?.some((category) =>
        COURSE_CATEGORIES.includes(category)
      )
  );

  const groupedDisciplines = filteredDisciplines.reduce<
    Record<number, Discipline[]>
  >((acc, discipline) => {
    if (discipline.quarter !== null) {
      acc[discipline.quarter] = acc[discipline.quarter] || [];
      acc[discipline.quarter].push(discipline);
    }
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

                return (
                  <div key={quarter}>
                    <h3 className="text-lg font-semibold mb-4">
                      {q}º Quadrimestre
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      {isHumanitiesQuarter(q) && (
                        <CardHumanidade
                          key={`humanities-${q}`}
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
                      {disciplines.map((discipline) => {
                        let category: "optativa" | "obrigatoria" | "livre";

                        if (
                          discipline.courseCategory.includes(
                            "BC&T - Bacharelado em Ciência e Tecnologia (OL)"
                          )
                        ) {
                          category = "optativa";
                        } else if (
                          discipline.courseCategory.includes(
                            "BC&T - Bacharelado em Ciência e Tecnologia (OBR)"
                          )
                        ) {
                          category = "obrigatoria";
                        } else {
                          category = "livre";
                        }

                        return (
                          <CardDiscipline
                            key={discipline.id}
                            id={discipline.id}
                            discipline={discipline.name}
                            credits={discipline.credits}
                            selected={disciplinesSelected.has(discipline.id)}
                            category={category}
                            toggleDiscipline={toggleDisciplineSelection}
                          />
                        );
                      })}
                      {(OPTATIVES_QUARTERS.includes(q) ||
                        LIVRES_QUARTERS.includes(q)) && (
                        <CardDisciplineList
                          category={
                            OPTATIVES_QUARTERS.includes(q) ? "optativa" : "livre"
                          }
                        />
                      )}
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
              route="/disciplinas-matricula"
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
