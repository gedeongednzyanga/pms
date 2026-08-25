use tauri::State;

use crate::db::{users};
use crate::models::pagination::PaginatedResponse;
use crate::models::user::{
    LoginRequest,
    User,
    UserInput,
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
) -> Result<User, String> {
    users::authenticate(&state.db, data).await
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