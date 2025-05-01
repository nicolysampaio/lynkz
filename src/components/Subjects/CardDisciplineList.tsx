import { useEffect, useState, useMemo, Dispatch, SetStateAction } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import disciplines from "../../../db/disciplines.json";
import Discipline from "../../types/Discipline";

export interface CardDisciplineListProps {
  id: string; // Added the missing 'id' property
  colorClass: string;
  category: "optativa" | "livre";
  programCategories: string[];
  selectedOptativas: Discipline[];
  setSelectedOptativas: Dispatch<SetStateAction<Discipline[]>>;
  selectedLivres: Discipline[];
  setSelectedLivres: Dispatch<SetStateAction<Discipline[]>>;
  courseColor: { name: string; bgColor: string }[];
  toggleDiscipline?: (id: number) => void; 
}

export default function CardDisciplineList({
  category,
  programCategories, 
  setSelectedOptativas,
  setSelectedLivres,
  selectedOptativas,
  selectedLivres,
  courseColor,
}: CardDisciplineListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Discipline[]>([]);



  // define categorias optativas (todas as programCategories que terminam em "(OL)")
  const optativeCategories = useMemo(
    () => programCategories.filter((c) => c.endsWith("(OL)")),
    [programCategories]
  );

  // disciplinas optativas do programa
  const optativeDisciplines = useMemo(
    () =>
      (disciplines as Discipline[]).filter((d) =>
        d.courseCategory?.some((cat) => optativeCategories.includes(cat))
      ),
    [optativeCategories]
  );

  // disciplinas livres: que não pertencem a nenhuma category do programa
  const freeDisciplines = useMemo(
    () =>
      (disciplines as Discipline[]).filter(
        (d) =>
          !d.courseCategory?.some((cat) =>
            programCategories.includes(cat)
          )
      ),
    [programCategories]
  );

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
    } else {
      const source =
        category === "optativa"
          ? optativeDisciplines
          : freeDisciplines;
      setSearchResults(
        source.filter((d) =>
          d.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, category, optativeDisciplines, freeDisciplines]);

  const handleSelectOptativa = (disciplina: Discipline) => {
    setSelectedOptativas((prev) =>
      prev.some((d) => d.id === disciplina.id)
        ? prev.filter((d) => d.id !== disciplina.id)
        : [...prev, disciplina]
    );
  };

  // Removed unused handleSelectLivre function

  const remove = (id: number) => {
    if (category === "optativa")
      setSelectedOptativas((prev) => prev.filter((d) => d.id !== id));
    else
      setSelectedLivres((prev) => prev.filter((d) => d.id !== id));
  };

  
  const getColorClass = (type: "Optativa" | "Livre") => {
    const colorObj = courseColor.find((c) => c.name === type);
    return colorObj?.bgColor || "";
  };

  const containerClass =
    category === "optativa"
      ? `${getColorClass("Optativa")} text-yellow-800 border-yellow-200`
      : `${getColorClass("Livre")} text-red-800 border-red-200`;

  const chipClass =
    category === "optativa"
      ? `${getColorClass("Optativa")} text-yellow-900`
      : `${getColorClass("Livre")} text-red-900`;

  return (
    <div className={`p-4 border rounded-lg relative ${containerClass}`}>
      <h3 className="font-bold text-lg mb-2">
        {category === "optativa" ? "Optativas" : "Livres"}
      </h3>

      <input
        type="text"
        placeholder={`Pesquisar ${category === "optativa" ? "optativas" : "livres"
          }...`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="p-2 border rounded w-full mb-2"
      />

      {searchResults.length > 0 && (
        <div className="absolute top-full left-0 w-full max-h-48 overflow-auto bg-white border rounded mt-1 shadow-lg z-10">
          {searchResults.map((result) => (
            <div
              key={result.id}
              className="p-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelectOptativa(result)}
            >
              {result.name} ({result.credits} créditos)
            </div>
          ))}
        </div>
      )}

      {(category === "optativa" ? selectedOptativas : selectedLivres)
        .length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold">Selecionadas:</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {(category === "optativa" ? selectedOptativas : selectedLivres).map(
                (item) => (
                  <div
                    key={item.id}
                    className={`${chipClass} px-2 py-1 rounded flex items-center`}
                  >
                    <span>{item.name}</span>
                    <button
                      onClick={() => remove(item.id)}
                      className="ml-2 hover:text-red-600"
                    >
                      <FontAwesomeIcon icon={faX} />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}
    </div>
  );
}
