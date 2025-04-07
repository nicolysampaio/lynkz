interface Humanities {
    id: number;
    name: string;
}

interface CardHumanidadeProps {
    quarter: number;
    humanities: Humanities[];
    selected: number | null;
    selectedQuarter: { [quarter: number]: number | null };
    open: boolean;
    toggleDropdown: () => void;
    handleSelect: (disciplineId: number | null) => void;
}

function CardHumanidade(
    {
        quarter,
        humanities = [
            {id: 1, name: "Bases Epistemológicas da Ciência Moderna"},
            {id: 2, name: "Ciência, Tecnologia e Sociedade"},
            {id: 3, name: "Estrutura e Dinâmica Social"},
            {id: 4, name: "Nenhuma"}
        ],
        selected,
        selectedQuarter,
        open,
        toggleDropdown,
        handleSelect,
    }: CardHumanidadeProps,
) {
    const availableHumanities = humanities.filter(({id}) =>
        id === 4 || !Object.entries(selectedQuarter).some(([q, sel]) => parseInt(q) !== quarter && sel === id)
    );

    const onCardClick = () => {
        toggleDropdown();
        if (selected) handleSelect(null);
    }

    const selectedName = humanities.find((discipline) => discipline.id === selected)?.name ?? null;

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
                    {availableHumanities.map((discipline) => (
                        <div key={discipline.id} className="p-2 hover:bg-gray-100 cursor-pointer">
                            {discipline.name}
                        </div>
                    ))}
                </div>
            )}
        </div>

    )
}

export default CardHumanidade;
