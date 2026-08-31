use tauri::Manager;

use crate::state::AppState;

pub mod state;
pub mod commands;
pub mod db;
pub mod models;
pub mod auth;

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

                // UTILISATEUR ADMIN PAR DEFAUT
                db::users::create_default_admin(&pool).await
                .expect(
                    "Impossible de créer l'utilisateur admin"
                );

                println!(
                    "Utilisateur admin vérifié !"
                );

                // ✅ Gérer AppState au lieu de pool directement
                app.manage(AppState { db: pool.clone() });

                Ok(())
            })
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            // USERS
            commands::user_cmd::create_user_cmd,
            commands::user_cmd::update_user_cmd,
            commands::user_cmd::authenticate_cmd,
            commands::user_cmd::delete_user_cmd,
            commands::user_cmd::get_users_cmd,
            commands::user_cmd::get_current_user_cmd,
            commands::user_cmd::logout_cmd,

            // INFRACTIONS / CRIMES
            commands::crime_cmd::get_crimes_cmd,
            commands::crime_cmd::create_crime_cmd,
            commands::crime_cmd::update_crime_cmd,
            commands::crime_cmd::delete_crime_cmd,

            // PRISON
            commands::prison_cmd::create_prison_cmd,
            commands::prison_cmd::get_prisons_cmd,
            commands::prison_cmd::get_prisonss_cmd,

            // CELLULE
            commands::cellule_cmd::create_cellule_cmd,

            // DETENUES
            commands::inmate_cmd::save_inmate_cmd,
        ])
        .run(tauri::generate_context!())
        .expect("Erreur au lancement de Tauri");
}

