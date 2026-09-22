use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Plainte {
    pub id: String,
    pub plaignant: String,
    pub objet: String,
    pub description: String,
    pub date_faits: String,
    pub lieu_faits: String,
    pub statut: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlainteInput {
    pub plaignant: Option<String>,
    pub objet: Option<String>,
    pub description: Option<String>,
    pub date_faits: Option<String>,
    pub lieu_faits: Option<String>,
    pub statut: Option<String>,
}