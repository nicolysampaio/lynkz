interface Discipline {
  id: number;
  code: string;
  name: string;
  credits: number;
  period: string;
  quarter: number;
  courseCategory: string[];
}

export default Discipline;