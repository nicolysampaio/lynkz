export interface CardHumanidadeProps {
    quarter: number;
    humanities: { id: number; name: string }[];
    open: boolean;
    selected: number | null;
    toggleDropdown: () => void;
    handleSelect: (id: number | null) => void;
    allSelected: Record<number, number | null>;
 }

 export default function CardHumanidade(
     {
         humanities = [
             {id: 1, name: "Bases Epistemológicas da Ciência Moderna",},
             {id: 2, name: "Ciência, Tecnologia e Sociedade"},
             {id: 3, name: "Estrutura e Dinâmica Social"},
             {id: 4, name: "Nenhuma"}
         ],
         quarter,
         selected,
         open,
         toggleDropdown,
         handleSelect,
         allSelected,
     }: CardHumanidadeProps,
 ) {
     // esconde das opções qualquer disciplina já escolhida em outro quadrimestre
     const usedIds = Object.entries(allSelected)
       .filter(([q, id]) => parseInt(q, 10) !== quarter && id !== null)
       .map(([, id]) => id!) as number[];
     const availableHumanities = humanities.filter(
       (h) => h.id === 4 || !usedIds.includes(h.id)
     );

     const onCardClick = () => {
         toggleDropdown();
         if (selected) handleSelect(null);
     }

     const selectedName = humanities.find((d) => d.id === selected)?.name ?? null;

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
     )
 }
