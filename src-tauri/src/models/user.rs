use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: i64,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub user_name: Option<String>,
    pub password: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserInput {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub user_name: String,
    pub password: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginRequest {
    pub user_name: String,
    pub password: String,
}
