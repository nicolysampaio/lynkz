interface CardDisciplineProps {
  id: number;
  discipline: string;
  credits: number | null;
  selected?: boolean;
  courseCategory: string[];
  toggleDiscipline: (disciplineId: number) => void;
}

function CardDiscipline({
  id,
  discipline,
  credits,
  selected = false,
  courseCategory,
  toggleDiscipline,
}: CardDisciplineProps) {
  // mapeamento das cores
  // BCC‑OBR         → bg-blue-200
  // BCC‑OL          → bg-yellow-200
  // BC&T‑OBR        → bg-gray-200
  // (qualquer outro = Livres)→ bg-red-200
  let bgClass = "bg-red-200";

  if (
    courseCategory.includes(
      "BCC - Bacharelado em Ciências da Computação (OBR)"
    )
  ) {
    bgClass = "bg-blue-200";
  } else if (
    courseCategory.includes(
      "BCC - Bacharelado em Ciências da Computação (OL)"
    )
  ) {
    bgClass = "bg-yellow-200";
  } else if (
    courseCategory.includes(
      "BC&T - Bacharelado em Ciência e Tecnologia (OBR)"
    )
  ) {
    bgClass = "bg-gray-200";
  }

  return (
    <div
      className={`p-4 rounded-md cursor-pointer ${
        selected ? "bg-green-800 text-white" : bgClass
      }`}
      onClick={() => toggleDiscipline(id)}
      role="button"
      aria-pressed={selected}
    >
      <h4 className="font-bold">{discipline}</h4>
      <p className="text-xs text-gray-400">
        {credits !== null ? `${credits} créditos` : "Sem créditos"}
      </p>
    </div>
  );
}

export default CardDiscipline;
