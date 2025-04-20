interface CardDisciplineProps {
  id: number;
  discipline: string;
  credits: number | null;
  selected?: boolean;
  category: "optativa" | "obrigatoria" | "livre";
  toggleDiscipline: (disciplineId: number) => void;
}

function CardDiscipline({
  id,
  discipline,
  credits,
  selected = false,
  category,
  toggleDiscipline,
}: CardDisciplineProps) {
  const categoryClass = {
    optativa: "bg-blue-200",
    obrigatoria: "bg-gray-200",
    livre: "bg-yellow-200",
  };

  return (
    <div
      className={`p-4 rounded-md cursor-pointer ${
        selected ? "bg-green-800 text-white" : categoryClass[category]
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
