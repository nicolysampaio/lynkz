export interface CardHumanidadeProps {
  courses: { id: number; name: string }[];
  quarter: number;
  selected: number|null;
  open: boolean;
  toggleDropdown: () => void;
  handleSelect: (id: number|null) => void;
  allSelected: Record<number, number|null>;
}

export default function CardHumanidade({
  courses,
  quarter,
  selected,
  open,
  toggleDropdown,
  handleSelect,
  allSelected,
}: CardHumanidadeProps) {
  // usa `courses` aqui
  const usedIds = Object.entries(allSelected)
    .filter(([q, id]) => +q !== quarter && id != null)
    .map(([, id]) => id!) as number[];
  const available = courses.filter((c) => !usedIds.includes(c.id));

  const onCardClick = () => {
    toggleDropdown();
    if (selected) handleSelect(null);
  };

  const selectedName = courses.find((d) => d.id === selected)?.name ?? null;

  return (
    <div
      className="relative cursor-pointer p-4 border rounded-lg hover:shadow-lg transition bg-purple-100 text-purple-800"
      onClick={onCardClick}
    >
      <h3 className="font-bold text-lg">Humanidades</h3>
      <p className="text-xs text-gray-500">
        {selectedName || "Clique para selecionar"}
      </p>

      {open && (
        <div className="absolute top-full left-0 z-10 bg-white border rounded mt-1 shadow-lg">
          {available.map((discipline) => (
            <div
              key={discipline.id}
              className={`p-2 hover:bg-gray-100 cursor-pointer ${
                selected === discipline.id ? 'bg-green-800 text-white' : ''
              }`}
              onClick={() => handleSelect(discipline.id === selected ? null : discipline.id)}
            >
              {discipline.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
