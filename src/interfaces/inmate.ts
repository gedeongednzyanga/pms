export interface Inmate {
  id: string;
  cellule_id: string;
  cellule_name: string;
  prison_name: string;

  firstname: string;
  middlename?: string | null;
  lastname: string;

  dob: string;
  sex: string;
  address: string;
  marital_status: string;

  arreter_par?: string | null;
  lieu_arreter?: string | null;
  date_from: string;
  date_to?: string | null;

  emergency_name?: string | null;
  emergency_relation?: string | null;
  emergency_contact?: string | null;

  photo_path?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InmateCrime {
  id: string;
  crime_name: string;
}

export interface InmateCellule {
  id: string;
  code?: string | null;
  cellule_name?: string | null;
}

export interface InmateDetails {
  inmate: Inmate;
  crimes: InmateCrime[];
  cellule?: InmateCellule | null;
}

export interface InmateListItem {
  id: string;

  firstname: string;
  middlename?: string | null;
  lastname: string;

  dob: string;
  sex: string;

  date_from: string;
  date_to?: string | null;
  release_date?: string | null;

  cellule_id: string;
  cellule_code?: string | null;
  cellule_name?: string | null;

  photo_path?: string | null;

  created_at: string;
}

export interface PaginatedInmates {
  data: InmateListItem[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}
