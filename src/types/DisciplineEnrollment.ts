type Timeslot = {
  day: string;
  time: number;
  week: string;
};

type DisciplineEnrollment = {
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
  credits: number;
  period: string;
  quadrimester: number;
  timeslots: Timeslot[]; // <-- Corrigido aqui
  courseCategory: string[];
};

export default DisciplineEnrollment;