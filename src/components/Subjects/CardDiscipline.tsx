
export interface CardDisciplineProps {
    id: number;
    discipline: string;
    credits: number;
    selected: boolean;
    colorClass: string;
    toggleDiscipline: (id: number) => void;
    courseColor: { id: number; name: string; bgColor: string; textColor: string }[];
    textColor?: string;
}

export default function CardDiscipline({
    id,
    discipline,
    credits,
    selected = false,
    colorClass,
    textColor,
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
            <h4 className={`font-bold break-words max-w-[20ch] ${textColor ?? "text-gray-400"}`}>
                {discipline}
            </h4>
            <p className={`text-xs ${textColor ?? "text-black-400"}`}>
                {credits !== null ? `${credits} créditos` : "Sem créditos"}
            </p>
        </div>
    );
}
