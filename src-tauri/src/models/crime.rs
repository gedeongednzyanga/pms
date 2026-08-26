use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Crime {
    pub id: String,
    pub crime_name: String,
    pub description: String,
    pub statut_crime: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrimeInput {
    pub crime_name: Option<String>,
    pub description: Option<String>,
    pub statut_crime: Option<String>,
}
