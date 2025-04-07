interface CardObrigatoriaProps {
    id: number
    discipline: string;
    credits: number | null;
    selected: boolean;
    toggleDiscipline: (disciplineId: number | null) => void;
}

function CardObrigatoria(
    {
        id,
        discipline,
        credits,
        selected
    }: CardObrigatoriaProps
) {
    return (
        <div className={`bg-gray-300 p-4 rounded-md cursor-pointer ${selected && "bg-green-800 text-white"}`} onClick={() => console.log(id)}>
            <h4 className="font-bold">{discipline}</h4>
            <p className="text-xs text-gray-500">{credits} créditos</p>
        </div>
    )
}

export default CardObrigatoria;

