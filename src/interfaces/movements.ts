export interface InmateOption {
  id: string;
  label: string;
  cellule_id: string;
}

export interface CelluleOption {
  id: string;
  label: string;
}

export interface Release {
  id: string;
  inmate_id: string;
  inmate_name: string;
  release_date: string;
  reason: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transfer {
  id: string;
  inmate_id: string;
  inmate_name: string;
  from_cellule_id: string;
  from_cellule_name: string;
  to_cellule_id: string;
  to_cellule_name: string;
  transfer_date: string;
  reason: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}
