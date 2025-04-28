export interface Course {
    id: string;
    name: string;
    campus: string[];
    type: string;
    disabled: boolean;
    courseCategory: string[];
    course_color?: { id: number; name: string; color: string }[];
  }