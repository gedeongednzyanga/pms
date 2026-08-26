use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Inmate {
    pub id: String,
    pub code: String,

    pub cell_id: String,

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

#[derive(Debug, Deserialize)]
pub struct SaveInmateRequest {
    pub code: String,
    pub cell_id: String,

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