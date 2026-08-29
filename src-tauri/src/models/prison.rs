use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Prison {
    pub id: String,
    pub prison_name: String,
    pub address_prison: String,
    pub statut_prison: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrisonInput {
    pub prison_name: Option<String>,
    pub address_prison: Option<String>,
    pub statut_prison: Option<String>,
}
