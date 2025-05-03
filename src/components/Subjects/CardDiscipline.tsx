// Regras do componente:
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

// Componente que exibe um card de disciplina obrigatória, optativa ou livre
export default function CardDiscipline({
    id,
    discipline,
    credits,
    selected = false,
    colorClass,
    textColor,
    toggleDiscipline,
}: CardDisciplineProps) {
    // Define a cor de fundo do card conforme seleção
    const bgClass = selected
        ? "bg-green-800 text-white"
        : colorClass ?? "bg-red-200";

    return (
        <div
            className={`p-4 rounded-md cursor-pointer ${bgClass}`}
            onClick={() => toggleDiscipline(id)}  // Alterna seleção ao clicar
            role="button"
            aria-pressed={selected}
        >
            {/* Nome da disciplina */}
            <h4 className={`font-bold break-words max-w-[20ch] ${textColor ?? "text-gray-400"}`}>
                {discipline}
            </h4>
            {/* Créditos da disciplina */}
            <p className={`text-xs ${textColor ?? "text-black-400"}`}>
                {credits !== null ? `${credits} créditos` : "Sem créditos"}
            </p>
        </div>
    );
}
