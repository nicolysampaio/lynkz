interface CardObrigatoriaProps {
  id: number;
  discipline: string;
  credits: number | null;
  selected: boolean;
  toggleDiscipline: (disciplineId: number) => void;
}

function CardObrigatoria({
  id,
  discipline,
  credits,
  selected = false,
  toggleDiscipline,
}: CardObrigatoriaProps) {
  return (
    <div
      className={`bg-gray-300 p-4 rounded-md cursor-pointer ${
        selected ? "bg-green-800 text-white" : ""
      }`}
      onClick={() => toggleDiscipline(id)}
    >
      <h4 className="font-bold">{discipline}</h4>
      <p className="text-xs text-gray-400">{credits} créditos</p>
    </div>
  );
}

export default CardObrigatoria;

