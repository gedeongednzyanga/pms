use tauri::State;

use crate::db::{cellules};
use crate::models::pagination::PaginatedResponse;
use crate::models::cellule::{
    Cellule, CelluleInput, CelluleWithPrison,
};
use crate::state::AppState;

#[tauri::command]
pub async fn create_cellule_cmd(
    state: State<'_, AppState>,
    data: CelluleInput,
) -> Result<Cellule, String> {
    cellules::create_cellule(&state.db, data).await
}

#[tauri::command]
pub async fn update_cellule_cmd(
    state: State<'_, AppState>,
    id: String,
    data: CelluleInput,
) -> Result<Cellule, String> {
    cellules::update_cellule(&state.db, id, data).await
}

#[tauri::command]
pub async fn delete_cellule_cmd(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    cellules::delete_cellule(&state.db, id).await
}

#[tauri::command]
pub async fn get_cellules_cmd(
    state: State<'_, AppState>,
    page: Option<i64>,
    per_page: Option<i64>,
    search: Option<String>,
) -> Result<PaginatedResponse<CelluleWithPrison>, String> {

    cellules::get_cellules(
        &state.db,
        page.unwrap_or(1),
        per_page.unwrap_or(10),
        search,
    ).await
}