use tauri::State;

use crate::db::{users};
use crate::models::pagination::PaginatedResponse;
use crate::models::user::{
    AuthSession, LoginRequest, User, UserInput,
};
use crate::state::AppState;

#[tauri::command]
pub async fn create_user_cmd(
    state: State<'_, AppState>,
    data: UserInput,
) -> Result<User, String> {
    users::create_user(&state.db, data).await
}

#[tauri::command]
pub async fn update_user_cmd(
    state: State<'_, AppState>,
    id: i64,
    data: UserInput,
) -> Result<User, String> {
    users::update_user(&state.db, id, data).await
}

#[tauri::command]
pub async fn authenticate_cmd(
    state: State<'_, AppState>,
    data: LoginRequest,
) -> Result<AuthSession, String> {

    users::authenticate(
        &state.db,
        data,
    ).await
}

// RESTAURATION DE SESSION
// =======================

#[tauri::command]
pub async fn get_current_user_cmd(
    state: State<'_, AppState>,
    token: String,
) -> Result<User, String> {

    let session = sqlx::query_as::<
        _,
        (String, String, String)
    >(
        r#"
        SELECT
            s.user_id,
            s.token,
            s.expires_at
        FROM sessions s
        WHERE s.token = ?
        LIMIT 1
        "#
    )
    .bind(&token)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    let (user_id, _, expires_at) =
        match session {

            Some(session) => session,

            None => {
                return Err(
                    "Session invalide".into()
                );
            }
        };

    let expiration =
        chrono::DateTime::parse_from_rfc3339(
            &expires_at
        )
        .map_err(|e| e.to_string())?;

    if expiration < chrono::Utc::now() {
        sqlx::query(
            "DELETE FROM sessions WHERE token = ?"
        )
        .bind(&token)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

        return Err(
            "Session expirée".into()
        );
    }

    let user = sqlx::query_as::<_, User>(
        r#"
        SELECT
            id,
            first_name,
            last_name,
            user_name,
            created_at,
            updated_at
        FROM users
        WHERE id = ?
        LIMIT 1
        "#
    )
    .bind(user_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    match user {
        Some(user) => Ok(user),

        None => Err(
            "Utilisateur introuvable".into()
        ),
    }
}

// DECONNEXION
// ===========

#[tauri::command]
pub async fn logout_cmd(
    state: State<'_, AppState>,
    token: String,
) -> Result<(), String> {

    sqlx::query(
        "DELETE FROM sessions WHERE token = ?"
    )
    .bind(token)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_user_cmd(
    state: State<'_, AppState>,
    id: i64,
) -> Result<(), String> {
    users::delete_user(&state.db, id).await
}

#[tauri::command]
pub async fn get_users_cmd(
    state: State<'_, AppState>,
    page: Option<i64>,
    per_page: Option<i64>,
    search: Option<String>,
) -> Result<PaginatedResponse<User>, String> {

    users::get_users(
        &state.db,
        page.unwrap_or(1),
        per_page.unwrap_or(10),
        search,
    ).await
}