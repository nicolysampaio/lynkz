interface CardDisciplineProps {
    id: number;
    discipline: string;
    credits: number;
    selected?: boolean;
    colorClass?: string;           // só isso
    toggleDiscipline: (id: number) => void;
}

export default function CardDiscipline({
    id,
    discipline,
    credits,
    selected = false,
    colorClass,
    toggleDiscipline,
}: CardDisciplineProps) {
    const bgClass = selected
        ? "bg-green-800 text-white"
        : colorClass ?? "bg-red-200";

    return (
        <div
            className={`p-4 rounded-md cursor-pointer ${bgClass}`}
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
