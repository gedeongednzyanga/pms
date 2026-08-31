use tauri::State;

use crate::{db::dashboards::get_dashboard_stats, models::dashboard::DashboardStats, state::AppState};

#[tauri::command]
pub async fn get_dashboard_stats_cmd(
    state: State<'_, AppState>,
) -> Result<DashboardStats, String> {
    get_dashboard_stats(&state.db).await
}