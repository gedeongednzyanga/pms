use tauri::State;

use crate::{db::plaintes::{create_plainte, get_plaintes, update_plainte}, models::plainte::{Plainte, PlainteInput}, state::AppState};

#[tauri::command]
pub async fn create_plainte_cmd(
    state: State<'_, AppState>,
    plainte: PlainteInput,
) -> Result<Plainte, String> {
    create_plainte(&state.db, plainte).await
}

#[tauri::command]
pub async fn update_plainte_cmd(
    state: State<'_, AppState>,
    id: String,
    data: PlainteInput,
) -> Result<Plainte, String> {
    update_plainte(&state.db, id, data).await
}

#[tauri::command]
pub async fn get_plaintes_cmd(
    state: State<'_, AppState>,
) -> Result<Vec<Plainte>, String> {
    get_plaintes(&state.db).await
}
