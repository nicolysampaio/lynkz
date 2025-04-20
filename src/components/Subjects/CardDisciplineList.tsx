import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import disciplines from "../../../db/disciplines.json";
import Discipline from "../../types/Discipline";

interface CardDisciplineListProps {
  category: "optativa" | "livre";
}

const COURSE_CATEGORIES = [
  "BC&T - Bacharelado em Ciência e Tecnologia (OBR)",
  "BC&T - Bacharelado em Ciência e Tecnologia (OL)",
  "BCC - Bacharelado em Ciências da Computação (OBR)",
  "BCC - Bacharelado em Ciências da Computação (OL)",
];

const OPTATIVE_CATEGORY = "BCC - Bacharelado em Ciências da Computação (OL)";

const optativeDisciplines = disciplines.filter(
  (discipline): discipline is Discipline =>
    discipline.courseCategory?.includes(OPTATIVE_CATEGORY)
);

const freeDisciplines = disciplines.filter(
  (discipline): discipline is Discipline =>
    !discipline.courseCategory?.some((category) =>
      COURSE_CATEGORIES.includes(category)
    )
);

function CardDisciplineList({ category }: CardDisciplineListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Discipline[]>([]);
  const [selectedOptativas, setSelectedOptativas] = useState<Discipline[]>([]);
  const [selectedLivres, setSelectedLivres] = useState<Discipline[]>([]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
    } else {
      const results =
        category === "optativa"
          ? optativeDisciplines.filter((discipline) =>
              discipline.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : freeDisciplines.filter((discipline) =>
              discipline.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
      setSearchResults(results as Discipline[]);
    }
  }, [searchQuery, category]);

  const handleSelectOptativa = (disc: Discipline) => {
    if (!selectedOptativas.some((item) => item.id === disc.id)) {
      setSelectedOptativas((prev) => [...prev, disc]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSelectLivre = (disc: Discipline) => {
    if (!selectedLivres.some((item) => item.id === disc.id)) {
      setSelectedLivres((prev) => [...prev, disc]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeOptativa = (id: number) => {
    setSelectedOptativas((prev) => prev.filter((item) => item.id !== id));
  };

  const removeLivre = (id: number) => {
    setSelectedLivres((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="p-4 border rounded-lg bg-yellow-100 text-yellow-800 relative">
      <h3 className="font-bold text-lg mb-2">
        {category === "optativa" ? "Optativas" : "Livres"}
      </h3>
      Campo de pesquisa
      <input
        type="text"
        placeholder={`Pesquisar ${
          category === "optativa" ? "optativas" : "livres"
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
              onClick={() =>
                category === "optativa"
                  ? handleSelectOptativa(result)
                  : handleSelectLivre(result)
              }
            >
              {result.name} ({result.credits} créditos)
            </div>
          ))}
        </div>
      )}
      {(category === "optativa" ? selectedOptativas : selectedLivres).length >
        0 && (
        <div className="mt-4">
          <h4 className="font-semibold">Selecionadas:</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {(category === "optativa" ? selectedOptativas : selectedLivres).map(
              (item) => (
                <div
                  key={item.id}
                  className="bg-yellow-200 text-yellow-900 px-2 py-1 rounded flex items-center"
                >
                  <span>{item.name}</span>
                  <button
                    onClick={() =>
                      category === "optativa"
                        ? removeOptativa(item.id)
                        : removeLivre(item.id)
                    }
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

export default CardDisciplineList;
