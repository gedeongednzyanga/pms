use tauri::State;

use crate::{
    db::movements,
    models::movements::{CelluleOption, InmateOption, Release, ReleaseInput, Transfer, TransferInput},
    state::AppState,
};

#[tauri::command]
pub async fn get_inmate_options_cmd(state: State<'_, AppState>) -> Result<Vec<InmateOption>, String> {
    movements::get_inmate_options(&state.db).await
}

#[tauri::command]
pub async fn get_cellule_options_cmd(state: State<'_, AppState>) -> Result<Vec<CelluleOption>, String> {
    movements::get_cellule_options(&state.db).await
}

#[tauri::command]
pub async fn get_releases_cmd(state: State<'_, AppState>) -> Result<Vec<Release>, String> {
    movements::get_releases(&state.db).await
}

#[tauri::command]
pub async fn create_release_cmd(state: State<'_, AppState>, data: ReleaseInput) -> Result<Release, String> {
    movements::create_release(&state.db, data).await
}

#[tauri::command]
pub async fn update_release_cmd(state: State<'_, AppState>, id: String, data: ReleaseInput) -> Result<Release, String> {
    movements::update_release(&state.db, &id, data).await
}

#[tauri::command]
pub async fn delete_release_cmd(state: State<'_, AppState>, id: String) -> Result<(), String> {
    movements::delete_release(&state.db, &id).await
}

#[tauri::command]
pub async fn get_transfers_cmd(state: State<'_, AppState>) -> Result<Vec<Transfer>, String> {
    movements::get_transfers(&state.db).await
}

#[tauri::command]
pub async fn create_transfer_cmd(state: State<'_, AppState>, data: TransferInput) -> Result<Transfer, String> {
    movements::create_transfer(&state.db, data).await
}

#[tauri::command]
pub async fn update_transfer_cmd(state: State<'_, AppState>, id: String, data: TransferInput) -> Result<Transfer, String> {
    movements::update_transfer(&state.db, &id, data).await
}

#[tauri::command]
pub async fn delete_transfer_cmd(state: State<'_, AppState>, id: String) -> Result<(), String> {
    movements::delete_transfer(&state.db, &id).await
}
