interface DisciplineEnrollment {
  id: number;
  code: string;
  name: string;
  professor: string;
  campus: string;
  schedule: string;
  room: string;
  slots: number;
  filled: number;
  turn: string;
  type: string;
  category: string;
  credits: number;
  period: string;
  quadrimester: number;
  timeslots: string[];
  courseCategory?: string[];
}

export default DisciplineEnrollment;