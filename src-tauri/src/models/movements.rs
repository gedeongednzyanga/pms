use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct InmateOption {
    pub id: String,
    pub label: String,
    pub cellule_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CelluleOption {
    pub id: String,
    pub label: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReleaseInput {
    pub inmate_id: String,
    pub release_date: String,
    pub reason: String,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Release {
    pub id: String,
    pub inmate_id: String,
    pub inmate_name: String,
    pub release_date: String,
    pub reason: String,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferInput {
    pub inmate_id: String,
    pub to_cellule_id: String,
    pub transfer_date: String,
    pub reason: String,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Transfer {
    pub id: String,
    pub inmate_id: String,
    pub inmate_name: String,
    pub from_cellule_id: String,
    pub from_cellule_name: String,
    pub to_cellule_id: String,
    pub to_cellule_name: String,
    pub transfer_date: String,
    pub reason: String,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}
