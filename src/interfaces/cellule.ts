export interface Cellule {
    id: string;
    prison_id: string;
    code: string;
    cellule_name: string;
    capacity: number;
    statut_cellule: string;
    created_at: string;
    updated_at: string;
}

export interface CelluleWithPrison {
   id: string;
   prison_id: string;
   code: string | null;
   cellule_name: string;
   capacity: number;
   statut_cellule: string;
   created_at: string;
   updated_at: string;

   prison_name: string | null;
   address_prison: string | null;
}
