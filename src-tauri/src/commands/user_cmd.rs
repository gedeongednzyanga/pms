use tauri::State;
use sqlx::SqlitePool;

use crate::db::{users};
use crate::models::pagination::PaginatedResponse;
use crate::models::user::{
    LoginRequest,
    User,
    UserInput,
};

#[tauri::command]
pub async fn create_user_cmd(
    pool: State<'_, SqlitePool>,
    data: UserInput,
) -> Result<User, String> {
    users::create_user(&pool, data).await
}

#[tauri::command]
pub async fn update_user_cmd(
    pool: State<'_, SqlitePool>,
    id: i64,
    data: UserInput,
) -> Result<User, String> {
    users::update_user(&pool, id, data).await
}

#[tauri::command]
pub async fn authenticate_cmd(
    pool: State<'_, SqlitePool>,
    data: LoginRequest,
) -> Result<User, String> {
    users::authenticate(&pool, data).await
}

#[tauri::command]
pub async fn delete_user_cmd(
    pool: State<'_, SqlitePool>,
    id: i64,
) -> Result<(), String> {
    users::delete_user(&pool, id).await
}

#[tauri::command]
pub async fn get_users_cmd(
    pool: State<'_, SqlitePool>,
    page: Option<i64>,
    per_page: Option<i64>,
    search: Option<String>,
) -> Result<PaginatedResponse<User>, String> {

    users::get_users(
        &pool,
        page.unwrap_or(1),
        per_page.unwrap_or(10),
        search,
    ).await
}