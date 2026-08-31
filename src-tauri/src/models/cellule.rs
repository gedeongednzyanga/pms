use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Cellule {
    pub id: String,
    pub prison_id: String,
    pub code: Option<String>,
    pub cellule_name: String,
    pub capacity: i64,
    pub statut_cellule: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CelluleInput {
    pub prison_id: Option<String>,
    pub code: Option<String>,
    pub cellule_name: Option<String>,
    pub capacity: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CelluleWithPrison {
    pub id: String,
    pub prison_id: String,
    pub code: Option<String>,
    pub cellule_name: String,
    pub capacity: i64,
    pub statut_cellule: String,
    pub created_at: String,
    pub updated_at: String,

    pub prison_name: Option<String>,
    pub address_prison: Option<String>,
}