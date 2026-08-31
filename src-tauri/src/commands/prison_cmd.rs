use tauri::State;

use crate::db::prisons::get_prisonss;
use crate::db::{prisons};
use crate::models::pagination::PaginatedResponse;
use crate::models::prison::{
    Prison,
    PrisonInput,
};
use crate::state::AppState;

#[tauri::command]
pub async fn create_prison_cmd(
    state: State<'_, AppState>,
    data: PrisonInput,
) -> Result<Prison, String> {
    prisons::create_prison(&state.db, data).await
}

#[tauri::command]
pub async fn update_prison_cmd(
    state: State<'_, AppState>,
    id: String,
    data: PrisonInput,
) -> Result<Prison, String> {
    prisons::update_prison(&state.db, id, data).await
}

#[tauri::command]
pub async fn delete_prison_cmd(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    prisons::delete_prison(&state.db, id).await
}

#[tauri::command]
pub async fn get_prisons_cmd(
    state: State<'_, AppState>,
    page: Option<i64>,
    per_page: Option<i64>,
    search: Option<String>,
) -> Result<PaginatedResponse<Prison>, String> {

    prisons::get_prisons(
        &state.db,
        page.unwrap_or(1),
        per_page.unwrap_or(10),
        search,
    ).await
}

#[tauri::command]
pub async fn get_prisonss_cmd(
    state: State<'_, AppState>,
) -> Result<Vec<Prison>, String> {
    get_prisonss(&state.db)
        .await
        .map_err(|e| format!("Erreur récupération prisons : {}", e))
}