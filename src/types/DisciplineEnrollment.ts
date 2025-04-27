interface Timeslot {
  day: string;
  time: number;
  week: string;
}

export default interface DisciplineEnrollment {
  id: number; 
  code: string;           // corresponde a sigla_disciplina
  section: string;        // adiciona sigla_turma
  name: string;
  professor: string;
  campus: string;
  turn: string;
  credits: number;
  slots: number;
  room: string | null;
  tpei: string;
  scheduleTheory: string | null;
  schedulePractice: string | null;
  timeslots: Timeslot[];
  practiceTimeslots: Timeslot[];
  courseCategory: string[];
}