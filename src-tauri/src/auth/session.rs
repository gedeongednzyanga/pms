use chrono::{Duration, Utc};
use uuid::Uuid;

use sqlx::SqlitePool;

use crate::models::user::{AuthSession, User};

// use super::models::{AuthSession, User};

pub async fn create_session(
    pool: &SqlitePool,
    user: User,
) -> Result<AuthSession, String> {

    let session_id = Uuid::new_v4().to_string();

    let token = Uuid::new_v4().to_string();

    let expires_at =
        Utc::now() + Duration::days(30);

    let created_at =
        Utc::now();

    sqlx::query(
        r#"
        INSERT INTO sessions (
            id,
            user_id,
            token,
            expires_at,
            created_at
        )
        VALUES (?, ?, ?, ?, ?)
        "#
    )
    .bind(&session_id)
    .bind(&user.id)
    .bind(&token)
    .bind(expires_at.to_rfc3339())
    .bind(created_at.to_rfc3339())
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(AuthSession {
        token,
        user,
        expires_at: expires_at.to_rfc3339(),
    })
}