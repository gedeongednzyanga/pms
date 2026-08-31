export interface DashboardStats {
  total_inmates: number;
  total_male: number;
  total_female: number;

  total_prisons: number;
  total_cells: number;
  total_crimes: number;

  total_capacity: number;
  occupied_cells: number;
  available_capacity: number;

  prisoners_evolution: PrisonerEvolution[];

  latest_prisoners: LatestPrisoner[];

  activities: DashboardActivity[];
}

export interface PrisonerEvolution {
  month: string;
  prisonniers: number;
}

export interface LatestPrisoner {
  id: string;
  name: string;
  matricule: string;
  gender: string;
  prison: string;
  cell: string;
  date: string;
}

export interface DashboardActivity {
  title: string;
  description: string;
  time: string;
}