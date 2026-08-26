use std::path::{Path, PathBuf};

use sqlx::SqlitePool;
use tauri::AppHandle;
use tauri::Manager;
use uuid::Uuid;

use crate::models::inmate::SaveInmateRequest;

#[tauri::command]
pub async fn save_inmate_cmd(
    app: AppHandle,
    pool: tauri::State<'_, SqlitePool>,
    inmate: SaveInmateRequest,
) -> Result<String, String> {

    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

    if inmate.code.trim().is_empty() {
        return Err("Le code du détenu est obligatoire".into());
    }

    if inmate.firstname.trim().is_empty() {
        return Err("Le prénom est obligatoire".into());
    }

    if inmate.lastname.trim().is_empty() {
        return Err("Le nom est obligatoire".into());
    }

    if inmate.cell_id.trim().is_empty() {
        return Err("La cellule est obligatoire".into());
    }

    if inmate.dob.trim().is_empty() {
        return Err("La date de naissance est obligatoire".into());
    }

    // ---------------------------------------------------------
    // VERIFIER LA CELLULE
    // ---------------------------------------------------------

    let cell_exists: Option<(String,)> = sqlx::query_as(
        r#"
        SELECT id
        FROM cells
        WHERE id = ?
        "#,
    )
    .bind(&inmate.cell_id)
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| format!("Erreur vérification cellule : {}", e))?;

    if cell_exists.is_none() {
        return Err("La cellule sélectionnée n'existe pas".into());
    }

    // ---------------------------------------------------------
    // ID DU DETENU
    // ---------------------------------------------------------

    let inmate_id = Uuid::new_v4().to_string();

    // ---------------------------------------------------------
    // PHOTO
    // ---------------------------------------------------------

    let photo_path = if let Some(source_path) = &inmate.image_path {
        Some(
            save_inmate_photo(
                &app,
                source_path,
                &inmate_id,
            )
            .await?
        )
    } else {
        None
    };

    // ---------------------------------------------------------
    // TRANSACTION
    // ---------------------------------------------------------

    let mut tx = pool
        .begin()
        .await
        .map_err(|e| format!("Erreur démarrage transaction : {}", e))?;

    // ---------------------------------------------------------
    // INSERT DETENU
    // ---------------------------------------------------------

    sqlx::query(
        r#"
        INSERT INTO inmates (
            id,
            code,
            cell_id,

            firstname,
            middlename,
            lastname,

            dob,
            sex,
            address,
            marital_status,

            complexion,
            eye_color,

            sentence,
            date_from,
            date_to,

            emergency_name,
            emergency_relation,
            emergency_contact,

            photo_path
        )
        VALUES (
            ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?,
            ?, ?, ?,
            ?, ?, ?,
            ?
        )
        "#,
    )
    .bind(&inmate_id)
    .bind(&inmate.code)
    .bind(&inmate.cell_id)

    .bind(&inmate.firstname)
    .bind(&inmate.middlename)
    .bind(&inmate.lastname)

    .bind(&inmate.dob)
    .bind(&inmate.sex)
    .bind(&inmate.address)
    .bind(&inmate.marital_status)

    .bind(&inmate.complexion)
    .bind(&inmate.eye_color)

    .bind(&inmate.sentence)
    .bind(&inmate.date_from)
    .bind(&inmate.date_to)

    .bind(&inmate.emergency_name)
    .bind(&inmate.emergency_relation)
    .bind(&inmate.emergency_contact)

    .bind(&photo_path)

    .execute(&mut *tx)
    .await
    .map_err(|e| format!("Erreur création détenu : {}", e))?;

    // ---------------------------------------------------------
    // INSERT DES CRIMES
    // ---------------------------------------------------------

    for crime_id in &inmate.crime_ids {

        // Vérifier que le crime existe
        let crime_exists: Option<(String,)> = sqlx::query_as(
            r#"
            SELECT id
            FROM crimes
            WHERE id = ?
            "#,
        )
        .bind(crime_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| format!("Erreur vérification crime : {}", e))?;

        if crime_exists.is_none() {
            return Err(format!(
                "Le crime '{}' n'existe pas",
                crime_id
            ));
        }

        sqlx::query(
            r#"
            INSERT INTO inmate_crimes (
                inmate_id,
                crime_id
            )
            VALUES (?, ?)
            "#,
        )
        .bind(&inmate_id)
        .bind(crime_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Erreur association crime : {}", e))?;
    }

    // ---------------------------------------------------------
    // COMMIT
    // ---------------------------------------------------------

    tx.commit()
        .await
        .map_err(|e| format!("Erreur validation transaction : {}", e))?;

    Ok(inmate_id)
}

async fn save_inmate_photo(
    app: &AppHandle,
    source_path: &str,
    inmate_id: &str,
) -> Result<String, String> {

    let source = Path::new(source_path);

    if !source.exists() {
        return Err(format!(
            "La photo n'existe pas : {}",
            source_path
        ));
    }

    // ---------------------------------------------------------
    // APP DATA
    // ---------------------------------------------------------

    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|e| {
            format!(
                "Impossible de récupérer AppData : {}",
                e
            )
        })?;

    // ---------------------------------------------------------
    // DOSSIER PHOTOS
    // ---------------------------------------------------------

    let photos_dir = app_data
        .join("photos")
        .join("inmates");

    tokio::fs::create_dir_all(&photos_dir)
        .await
        .map_err(|e| {
            format!(
                "Impossible de créer le dossier photos : {}",
                e
            )
        })?;

    // ---------------------------------------------------------
    // EXTENSION
    // ---------------------------------------------------------

    let extension = source
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("jpg");

    let extension = extension.to_lowercase();

    let allowed_extensions = [
        "jpg",
        "jpeg",
        "png",
        "webp",
    ];

    if !allowed_extensions.contains(&extension.as_str()) {
        return Err(
            "Format d'image non supporté. Utilisez JPG, JPEG, PNG ou WEBP."
                .into()
        );
    }

    // ---------------------------------------------------------
    // NOM DU FICHIER
    // ---------------------------------------------------------

    let filename = format!(
        "{}.{}",
        inmate_id,
        extension
    );

    let destination: PathBuf =
        photos_dir.join(&filename);

    // ---------------------------------------------------------
    // COPIE
    // ---------------------------------------------------------

    tokio::fs::copy(source, &destination)
        .await
        .map_err(|e| {
            format!(
                "Erreur copie de la photo : {}",
                e
            )
        })?;

    // ---------------------------------------------------------
    // CHEMIN STOCKE EN BASE
    // ---------------------------------------------------------

    Ok(destination.to_string_lossy().to_string())
}