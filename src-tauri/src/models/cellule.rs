use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Cellule {
    pub id: String,
    pub prison_id: String,
    pub code: String,
    pub cellule_name: String,
    pub capacity: i64,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CelluleInput {
    pub prison_id: Option<String>,
    pub code: Option<String>,
    pub cellule_name: Option<String>,
    pub capacity: Option<i64>, 

}
