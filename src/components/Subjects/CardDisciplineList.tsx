import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import disciplines from "../../../db/disciplines.json";
import Discipline from "../../types/Discipline";

interface CardDisciplineListProps {
  category: "optativa" | "livre";
  programCategories: string[];       // ← categorias vindas de Course/DisciplineSelection
}

export default function CardDisciplineList({
  category,
  programCategories,                // ← destruture aqui
}: CardDisciplineListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Discipline[]>([]);
  const [selectedOptativas, setSelectedOptativas] = useState<Discipline[]>([]);
  const [selectedLivres, setSelectedLivres] = useState<Discipline[]>([]);

  // define categorias optativas (todas as programCategories que terminam em "(OL)")
  const optativeCategories = programCategories.filter((c) =>
    c.endsWith("(OL)")
  );

  // disciplinas optativas do programa
  const optativeDisciplines = (disciplines as Discipline[]).filter((d) =>
    d.courseCategory?.some((cat) => optativeCategories.includes(cat))
  );

  // disciplinas livres: que não pertencem a nenhuma category do programa
  const freeDisciplines = (disciplines as Discipline[]).filter(
    (d) =>
      !d.courseCategory?.some((cat) =>
        programCategories.includes(cat)
      )
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

  const handleSelect = (disc: Discipline) => {
    if (category === "optativa") {
      if (!selectedOptativas.some((d) => d.id === disc.id))
        setSelectedOptativas((prev) => [...prev, disc]);
    } else {
      if (!selectedLivres.some((d) => d.id === disc.id))
        setSelectedLivres((prev) => [...prev, disc]);
    }
    setSearchQuery("");
  };

  const remove = (id: number) => {
    if (category === "optativa")
      setSelectedOptativas((prev) => prev.filter((d) => d.id !== id));
    else
      setSelectedLivres((prev) => prev.filter((d) => d.id !== id));
  };

  const containerClass =
    category === "optativa"
      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
      : "bg-red-100 text-red-800 border-red-200";
  const chipClass =
    category === "optativa"
      ? "bg-yellow-200 text-yellow-900"
      : "bg-red-200 text-red-900";

  return (
    <div className={`p-4 border rounded-lg relative ${containerClass}`}>
      <h3 className="font-bold text-lg mb-2">
        {category === "optativa" ? "Optativas" : "Livres"}
      </h3>

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
              onClick={() => handleSelect(result)}
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
