use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Inmate {
    pub id: String,
    pub code: String,
    pub cellule_id: String,

    pub firstname: String,
    pub middlename: Option<String>,
    pub lastname: String,

    pub dob: String,
    pub sex: String,
    pub address: String,
    pub marital_status: String,

    pub complexion: String,
    pub eye_color: String,

    pub sentence: String,
    pub date_from: String,
    pub date_to: Option<String>,

    pub emergency_name: Option<String>,
    pub emergency_relation: Option<String>,
    pub emergency_contact: Option<String>,

    pub photo_path: Option<String>,

    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InmateInput {
    pub code: String,
    pub cellule_id: String,

    pub firstname: String,
    pub middlename: Option<String>,
    pub lastname: String,

    pub dob: String,
    pub sex: String,
    pub address: String,
    pub marital_status: String,

    pub complexion: String,
    pub eye_color: String,

    pub crime_ids: Vec<String>,

    pub sentence: String,
    pub date_from: String,
    pub date_to: Option<String>,

    pub emergency_name: Option<String>,
    pub emergency_relation: Option<String>,
    pub emergency_contact: Option<String>,

    pub image_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct InmateDetails {
    pub inmate: Inmate,
    pub crimes: Vec<CrimeSimple>,
    pub cellule: Option<CelluleSimple>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CrimeSimple {
    pub id: String,
    pub crime_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CelluleSimple {
    pub id: String,
    pub code: Option<String>,
    pub cellule_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct InmateListItem {
    pub id: String,
    pub code: String,
    pub firstname: String,
    pub middlename: Option<String>,
    pub lastname: String,

    pub dob: String,
    pub sex: String,

    pub sentence: String,
    pub date_from: String,
    pub date_to: Option<String>,

    pub cellule_id: String,
    pub cellule_code: Option<String>,
    pub cellule_name: Option<String>,

    pub photo_path: Option<String>,

    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct PrisonSelect {
    pub id: String,
    pub prison_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CelluleSelect {
    pub id: String,
    pub code: Option<String>,
    pub cellule_name: Option<String>,
    pub prison_id: String,
    pub prison_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CrimeSelect {
    pub id: String,
    pub crime_name: String,
}