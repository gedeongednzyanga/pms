use tauri::State;

use crate::db::{crimes};
use crate::models::pagination::PaginatedResponse;
use crate::models::crime::{
    Crime,
    CrimeInput,
};
use crate::state::AppState;

#[tauri::command]
pub async fn create_crime_cmd(
    state: State<'_, AppState>,
    data: CrimeInput,
) -> Result<Crime, String> {
    crimes::create_crime(&state.db, data).await
}

#[tauri::command]
pub async fn update_crime_cmd(
    state: State<'_, AppState>,
    id: String,
    data: CrimeInput,
) -> Result<Crime, String> {
    crimes::update_crime(&state.db, id, data).await
}

#[tauri::command]
pub async fn delete_crime_cmd(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    crimes::delete_crime(&state.db, id).await
}

#[tauri::command]
pub async fn get_crimes_cmd(
    state: State<'_, AppState>,
    page: Option<i64>,
    per_page: Option<i64>,
    search: Option<String>,
) -> Result<PaginatedResponse<Crime>, String> {

    crimes::get_crimes(
        &state.db,
        page.unwrap_or(1),
        per_page.unwrap_or(10),
        search,
    ).await
}