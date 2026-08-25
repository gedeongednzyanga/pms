use tauri::Manager;

use crate::state::AppState;

pub mod state;
pub mod commands;
pub mod db;
pub mod models;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            tauri::async_runtime::block_on(async {
                use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
                use std::str::FromStr;

                let app_dir = app.path().app_data_dir().unwrap();
                std::fs::create_dir_all(&app_dir).expect("Impossible de créer le dossier");

                let db_path = app_dir.join("pms.db");
                println!("DB path: {:?}", db_path);

                let options = SqliteConnectOptions::from_str(db_path.to_str().unwrap())
                    .unwrap()
                    .create_if_missing(true);

                let pool = SqlitePool::connect_with(options)
                    .await
                    .expect("Erreur connexion DB");

                println!("DB connectée !");

                sqlx::migrate!("./migrations")
                    .run(&pool)
                    .await
                    .expect("Erreur migrations");

                // ✅ Gérer AppState au lieu de pool directement
                app.manage(AppState { db: pool.clone() });

                Ok(())
            })
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            // USERS
            commands::user_cmd::create_user_cmd,
            commands::user_cmd::update_user_cmd,
            commands::user_cmd::authenticate_cmd,
            commands::user_cmd::delete_user_cmd,
            commands::user_cmd::get_users_cmd,
        ])
        .run(tauri::generate_context!())
        .expect("Erreur au lancement de Tauri");
}

