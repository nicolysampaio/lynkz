export interface Course {
  id: string;
  name: string;
  campus: string[];
  type: string;
  disabled: boolean;
  courseCategory: string[];
  course_color?: { id: number; name: string; bgColor: string; textColor: string }[];
  
  quarter?: number,
  quarter_categories?: {
    OPTATIVES_QUARTERS: number[];
    LIVRES_QUARTERS: number[];
    HUMANITIES_QUARTERS: number[];
  };
}