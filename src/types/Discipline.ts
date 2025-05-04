interface Discipline {
  id: number;
  code: string;
  name: string;
  credits: number;
  period: string;
  quarter: number;
  disciplineCategory: { name: string; quarter: number | null }[];
  
}

export default Discipline;