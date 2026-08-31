use tauri::State;
use sqlx::SqlitePool;

use crate::{db::inmates::{create_inmate, delete_inmate, get_inmate_by_id, get_inmates, update_inmate}, models::{inmate::{
    CelluleSelect, CrimeSelect, InmateDetails, InmateInput, InmateListItem, PrisonSelect,
}, pagination::PaginatedResponse}, state::AppState};

#[tauri::command]
pub async fn create_inmate_cmd(
    state: State<'_, AppState>,
    inmate: InmateInput,
) -> Result<String, String> {

    create_inmate(&state.db, inmate).await
}

#[tauri::command]
pub async fn get_inmate_cmd(
    state: State<'_, AppState>,
    id: String,
) -> Result<InmateDetails, String> {

    get_inmate_by_id(&state.db, &id).await
}

#[tauri::command]
pub async fn update_inmate_cmd(
    state: State<'_, AppState>,
    id: String,
    input: InmateInput,
) -> Result<(), String> {

    update_inmate(&state.db, &id, input).await
}

#[tauri::command]
pub async fn delete_inmate_cmd(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {

    delete_inmate(&state.db, &id).await
}

#[tauri::command]
pub async fn get_inmates_cmd(
    state: State<'_, AppState>,
    page: i64,
    per_page: i64,
    search: Option<String>,
) -> Result<PaginatedResponse<InmateListItem>, String> {

    get_inmates(
        &state.db,
        page,
        per_page,
        search,
    ).await
}

#[tauri::command]
pub async fn get_inmate_by_id_cmd(
    state: State<'_, AppState>,
    id: String,
) -> Result<InmateDetails, String> {
    get_inmate_by_id(&state.db, &id).await
}

#[tauri::command]
pub async fn get_prisons_for_select_cmd(
   state: State<'_, AppState>,
) -> Result<Vec<PrisonSelect>, String> {
    let pool: &SqlitePool = &state.db;

    let prisons = sqlx::query_as::<_, PrisonSelect>(
        r#"
        SELECT
            id,
            prison_name
        FROM prisons
        ORDER BY prison_name COLLATE NOCASE ASC
        "#
    )
    .fetch_all(pool)
    .await
    .map_err(|e| {
        format!("Erreur lors du chargement des prisons : {}", e)
    })?;

    Ok(prisons)
}

#[tauri::command]
pub async fn get_cellules_for_select_cmd(
    state: State<'_, AppState>,
) -> Result<Vec<CelluleSelect>, String> {
    let pool: &SqlitePool = &state.db;

    let cellules = sqlx::query_as::<_, CelluleSelect>(
        r#"
        SELECT
            c.id AS id,
            c.code AS code,
            c.cellule_name AS cellule_name,
            c.prison_id AS prison_id,
            p.prison_name AS prison_name
        FROM cellules AS c
        INNER JOIN prisons AS p
            ON p.id = c.prison_id
        ORDER BY
            p.prison_name COLLATE NOCASE ASC,
            c.code COLLATE NOCASE ASC,
            c.cellule_name COLLATE NOCASE ASC
        "#
    )
    .fetch_all(pool)
    .await
    .map_err(|e| {
        format!("Erreur lors du chargement des cellules : {}", e)
    })?;

    Ok(cellules)
}

#[tauri::command]
pub async fn get_crimes_for_select_cmd(
    state: State<'_, AppState>,
) -> Result<Vec<CrimeSelect>, String> {
    let pool: &SqlitePool = &state.db;

    let crimes = sqlx::query_as::<_, CrimeSelect>(
        r#"
        SELECT
            id,
            crime_name
        FROM crimes
        ORDER BY crime_name COLLATE NOCASE ASC
        "#
    )
    .fetch_all(pool)
    .await
    .map_err(|e| {
        format!("Erreur lors du chargement des crimes : {}", e)
    })?;

    Ok(crimes)
}