use std::path::Path;

use sqlx::SqlitePool;
use tauri::{AppHandle, Manager};
use uuid::Uuid;

use crate::models::{inmate::{
    Inmate, InmateDetails, InmateInput, InmateListItem, CrimeSimple, CelluleSimple
}, pagination::PaginatedResponse};

pub async fn save_inmate_photo(
    app: &AppHandle,
    source_path: &str,
) -> Result<String, String> {

    if source_path.trim().is_empty() {
        return Ok(String::new());
    }

    let source = Path::new(source_path);

    if !source.exists() {
        return Err(format!(
            "Le fichier image n'existe pas : {}",
            source_path
        ));
    }

    // =========================
    // DOSSIER APP DATA
    // =========================

    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    // =========================
    // DOSSIER PHOTOS
    // =========================

    let photos_dir = app_data_dir.join("photos");

    std::fs::create_dir_all(&photos_dir)
        .map_err(|e| e.to_string())?;

    // =========================
    // EXTENSION
    // =========================

    let extension = source
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("jpg");

    // =========================
    // NOUVEAU NOM
    // =========================

    let filename = format!(
        "{}.{}",
        Uuid::new_v4(),
        extension
    );

    let destination = photos_dir.join(filename);

    // =========================
    // COPIE
    // =========================

    std::fs::copy(
        source,
        &destination,
    )
    .map_err(|e| e.to_string())?;

    Ok(
        destination
            .to_string_lossy()
            .to_string()
    )
}

fn delete_inmate_photo(
    app: &tauri::AppHandle,
    photo_path: &str,
) {

    let app_data_dir =
        match app.path().app_data_dir() {
            Ok(dir) => dir,
            Err(_) => return,
        };


    let photos_dir =
        app_data_dir.join("photos");


    let path =
        std::path::Path::new(photo_path);


    /*
     * Vérifier que la photo se trouve
     * dans le dossier photos de l'application.
     */

    if path.starts_with(&photos_dir) {

        if let Err(error) =
            std::fs::remove_file(path)
        {

            eprintln!(
                "Impossible de supprimer la photo : {}",
                error
            );
        }
    }
}

pub async fn create_inmate(
    app: &AppHandle,
    pool: &SqlitePool,
    input: InmateInput,
) -> Result<String, String> {

    // =========================
    // VALIDATIONS
    // =========================

    let firstname = input.firstname.trim().to_string();
    let lastname = input.lastname.trim().to_string();
    let address = input.address.trim().to_string();

    if input.cellule_id.trim().is_empty() {
        return Err("La cellule est obligatoire.".into());
    }

    if firstname.is_empty() {
        return Err("Le prénom est obligatoire.".into());
    }

    if lastname.is_empty() {
        return Err("Le nom est obligatoire.".into());
    }

    if input.dob.trim().is_empty() {
        return Err("La date de naissance est obligatoire.".into());
    }

    if address.is_empty() {
        return Err("L'adresse est obligatoire.".into());
    }

    if input.date_from.trim().is_empty() {
        return Err("La date de début de peine est obligatoire.".into());
    }

    // =========================
    // VÉRIFIER LA CELLULE
    // =========================

    let cellule_exists: Option<(String,)> = sqlx::query_as(
        "SELECT id FROM cellules WHERE id = ?"
    )
    .bind(&input.cellule_id)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())?;

    if cellule_exists.is_none() {
        return Err("La cellule sélectionnée n'existe pas.".into());
    }

    // =========================
    // ID
    // =========================

    let id = Uuid::new_v4().to_string();

    // =========================
    // SAUVEGARDER LA PHOTO
    // =========================

    let photo_path = if let Some(image_path) = &input.image_path {

        if image_path.trim().is_empty() {
            None
        } else {
            Some(
                save_inmate_photo(
                    app,
                    image_path,
                )
                .await?
            )
        }

    } else {
        None
    };

    // =========================
    // TRANSACTION
    // =========================

    let mut tx = pool
        .begin()
        .await
        .map_err(|e| e.to_string())?;

    // =========================
    // INSERT DETENU
    // =========================

    sqlx::query(
        r#"
        INSERT INTO inmates (
            id,
            cellule_id,
            firstname,
            middlename,
            lastname,
            dob,
            sex,
            address,
            marital_status,
            arreter_par,
            lieu_arreter,
            date_from,
            date_to,
            emergency_name,
            emergency_relation,
            emergency_contact,
            photo_path
        )
        VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?
        )
        "#
    )
    .bind(&id)
    .bind(&input.cellule_id)
    .bind(&firstname)
    .bind(&input.middlename)
    .bind(&lastname)
    .bind(&input.dob)
    .bind(&input.sex)
    .bind(&address)
    .bind(&input.marital_status)
    .bind(&input.arreter_par)
    .bind(&input.lieu_arreter)
    .bind(&input.date_from)
    .bind(&input.date_to)
    .bind(&input.emergency_name)
    .bind(&input.emergency_relation)
    .bind(&input.emergency_contact)
    .bind(&photo_path)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    // =========================
    // INSERT CRIMES
    // =========================

    for crime_id in &input.crime_ids {

        sqlx::query(
            r#"
            INSERT INTO inmate_crimes (
                inmate_id,
                crime_id
            )
            VALUES (?, ?)
            "#
        )
        .bind(&id)
        .bind(crime_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }

    // =========================
    // COMMIT
    // =========================

    tx.commit()
        .await
        .map_err(|e| e.to_string())?;

    Ok(id)
}

pub async fn get_inmate_by_id(
    pool: &SqlitePool,
    id: &str,
) -> Result<InmateDetails, String> {

    let inmate = sqlx::query_as::<_, Inmate>(
        r#"
        SELECT
            id,
            cellule_id,
            firstname,
            middlename,
            lastname,
            dob,
            sex,
            address,
            marital_status,
            arreter_par,
            lieu_arreter,
            date_from,
            date_to,
            emergency_name,
            emergency_relation,
            emergency_contact,
            photo_path,
            created_at,
            updated_at
        FROM inmates
        WHERE id = ?
        "#
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())?
    .ok_or_else(|| "Détenu introuvable.".to_string())?;

    // =========================
    // CRIMES
    // =========================

    let crimes = sqlx::query_as::<_, CrimeSimple>(
        r#"
        SELECT
            c.id,
            c.crime_name
        FROM crimes c
        INNER JOIN inmate_crimes ic
            ON ic.crime_id = c.id
        WHERE ic.inmate_id = ?
        ORDER BY c.crime_name ASC
        "#
    )
    .bind(id)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    // =========================
    // CELLULE
    // =========================

    let cellule = sqlx::query_as::<_, CelluleSimple>(
        r#"
        SELECT
            id,
            code,
            cellule_name
        FROM cellules
        WHERE id = ?
        "#
    )
    .bind(&inmate.cellule_id)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(InmateDetails {
        inmate,
        crimes,
        cellule,
    })
}

pub async fn update_inmate(
    app: &tauri::AppHandle,
    pool: &SqlitePool,
    id: &str,
    input: InmateInput,
) -> Result<(), String> {

    // =========================================================
    // VALIDATIONS
    // =========================================================

    if id.trim().is_empty() {
        return Err("L'identifiant du détenu est invalide.".into());
    }

    let firstname =
        input.firstname.trim().to_string();

    let lastname =
        input.lastname.trim().to_string();

    let address =
        input.address.trim().to_string();


    if input.cellule_id.trim().is_empty() {
        return Err(
            "La cellule est obligatoire.".into()
        );
    }


    if firstname.is_empty() {
        return Err(
            "Le prénom est obligatoire.".into()
        );
    }


    if lastname.is_empty() {
        return Err(
            "Le nom est obligatoire.".into()
        );
    }


    if input.dob.trim().is_empty() {
        return Err(
            "La date de naissance est obligatoire.".into()
        );
    }


    if address.is_empty() {
        return Err(
            "L'adresse est obligatoire.".into()
        );
    }

    if input.date_from.trim().is_empty() {
        return Err(
            "La date de début de peine est obligatoire.".into()
        );
    }


    // =========================================================
    // VERIFIER SI LE DETENU EXISTE
    // =========================================================

    let existing_inmate:
        Option<(String, Option<String>)> =
        sqlx::query_as(
            r#"
            SELECT
                id,
                photo_path
            FROM inmates
            WHERE id = ?
            "#
        )
        .bind(id)
        .fetch_optional(pool)
        .await
        .map_err(|e| e.to_string())?;


    let Some((_, old_photo_path)) =
        existing_inmate
    else {
        return Err(
            "Le détenu sélectionné n'existe pas.".into()
        );
    };


    // =========================================================
    // VERIFIER LA CELLULE
    // =========================================================

    let cellule_exists:
        Option<(String,)> =
        sqlx::query_as(
            r#"
            SELECT id
            FROM cellules
            WHERE id = ?
            "#
        )
        .bind(&input.cellule_id)
        .fetch_optional(pool)
        .await
        .map_err(|e| e.to_string())?;


    if cellule_exists.is_none() {

        return Err(
            "La cellule sélectionnée n'existe pas.".into()
        );
    }


    // =========================================================
    // GESTION PHOTO
    // =========================================================

    /*
     * Le frontend envoie image_path.
     *
     * CAS 1 :
     * image_path = None
     * -> conserver ancienne photo
     *
     * CAS 2 :
     * image_path = Some("")
     * -> conserver ancienne photo
     *
     * CAS 3 :
     * image_path = ancien chemin
     * -> conserver ancienne photo
     *
     * CAS 4 :
     * image_path = nouveau chemin
     * -> copier nouvelle photo
     */


    let mut new_photo_created:
        Option<String> = None;


    let photo_path =
        match input.image_path.as_deref() {

            // -------------------------------------------------
            // AUCUNE PHOTO ENVOYEE
            // -------------------------------------------------

            None => {

                old_photo_path.clone()
            }


            // -------------------------------------------------
            // PHOTO VIDE
            // -------------------------------------------------

            Some(path)
                if path.trim().is_empty() =>
            {

                old_photo_path.clone()
            }


            // -------------------------------------------------
            // MEME PHOTO
            // -------------------------------------------------

            Some(path)
                if old_photo_path
                    .as_deref()
                    == Some(path) =>
            {

                old_photo_path.clone()
            }


            // -------------------------------------------------
            // NOUVELLE PHOTO
            // -------------------------------------------------

            Some(path) => {

                let saved_path =
                    save_inmate_photo(
                        app,
                        path,
                    )
                    .await?;


                new_photo_created =
                    Some(saved_path.clone());


                Some(saved_path)
            }
        };


    // =========================================================
    // TRANSACTION
    // =========================================================

    let mut tx =
        pool
            .begin()
            .await
            .map_err(|e| e.to_string())?;


    // =========================================================
    // UPDATE DETENU
    // =========================================================

    let update_result =
        sqlx::query(
            r#"
            UPDATE inmates
            SET

                cellule_id = ?,

                firstname = ?,
                middlename = ?,
                lastname = ?,

                dob = ?,

                sex = ?,

                address = ?,

                marital_status = ?,

                date_from = ?,
                date_to = ?,

                emergency_name = ?,
                emergency_relation = ?,
                emergency_contact = ?,

                photo_path = ?,

                updated_at = CURRENT_TIMESTAMP

            WHERE id = ?
            "#
        )
        .bind(&input.cellule_id)

        .bind(&firstname)
        .bind(&input.middlename)
        .bind(&lastname)

        .bind(&input.dob)

        .bind(&input.sex)

        .bind(&address)

        .bind(&input.marital_status)

        .bind(&input.date_from)
        .bind(&input.date_to)

        .bind(&input.emergency_name)
        .bind(&input.emergency_relation)
        .bind(&input.emergency_contact)

        .bind(&photo_path)

        .bind(id)

        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;


    if update_result.rows_affected() == 0 {

        tx.rollback()
            .await
            .ok();


        // Si une nouvelle photo a été créée,
        // la supprimer car UPDATE a échoué.

        if let Some(path) =
            new_photo_created
        {

            let _ =
                std::fs::remove_file(path);
        }


        return Err(
            "Aucune modification n'a été effectuée.".into()
        );
    }


    // =========================================================
    // SUPPRIMER LES ANCIENS CRIMES
    // =========================================================

    sqlx::query(
        r#"
        DELETE FROM inmate_crimes
        WHERE inmate_id = ?
        "#
    )
    .bind(id)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;


    // =========================================================
    // INSERER LES NOUVEAUX CRIMES
    // =========================================================

    for crime_id in &input.crime_ids {

        sqlx::query(
            r#"
            INSERT INTO inmate_crimes (
                inmate_id,
                crime_id
            )
            VALUES (?, ?)
            "#
        )
        .bind(id)
        .bind(crime_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }


    // =========================================================
    // COMMIT
    // =========================================================

    if let Err(error) =
        tx.commit().await
    {

        // -----------------------------------------------------
        // Si le commit échoue,
        // supprimer la nouvelle photo créée
        // -----------------------------------------------------

        if let Some(path) =
            new_photo_created
        {

            let _ =
                std::fs::remove_file(path);
        }


        return Err(
            error.to_string()
        );
    }


    // =========================================================
    // SUPPRIMER ANCIENNE PHOTO
    // =========================================================

    /*
     * On supprime l'ancienne photo uniquement si :
     *
     * - une nouvelle photo a été créée
     * - l'ancienne photo existe
     * - les deux chemins sont différents
     */


    if let (
        Some(old_path),
        Some(_new_path)
    ) = (
        old_photo_path,
        new_photo_created
    ) {

        delete_inmate_photo(
            app,
            &old_path,
        );
    }


    // =========================================================
    // SUCCESS
    // =========================================================

    Ok(())
}

pub async fn delete_inmate(
    pool: &SqlitePool,
    id: &str,
) -> Result<(), String> {

    let result = sqlx::query(
        "DELETE FROM inmates WHERE id = ?"
    )
    .bind(id)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    if result.rows_affected() == 0 {
        return Err("Détenu introuvable.".into());
    }

    Ok(())
}

pub async fn get_inmates(
    pool: &SqlitePool,
    page: i64,
    per_page: i64,
    search: Option<String>,
) -> Result<PaginatedResponse<InmateListItem>, String> {

    let page = page.max(1);
    let per_page = per_page.clamp(1, 100);

    let offset = (page - 1) * per_page;

    let search = search
        .unwrap_or_default()
        .trim()
        .to_string();

    let pattern = format!("%{}%", search);

    // =========================
    // TOTAL
    // =========================

    let total: (i64,) = sqlx::query_as(
        r#"
        SELECT COUNT(i.id)
        FROM inmates i
        LEFT JOIN cellules ce
            ON ce.id = i.cellule_id
        WHERE
            ? = ''
            OR i.firstname LIKE ?
            OR i.middlename LIKE ?
            OR i.lastname LIKE ?
            OR ce.code LIKE ?
            OR ce.cellule_name LIKE ?
        "#
    )
    .bind(&search)
    .bind(&pattern)
    .bind(&pattern)
    .bind(&pattern)
    .bind(&pattern)
    .bind(&pattern)
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())?;

    // =========================
    // DATA
    // =========================

    let data = sqlx::query_as::<_, InmateListItem>(
        r#"
        SELECT
            i.id AS id,
            i.firstname AS firstname,
            i.middlename AS middlename,
            i.lastname AS lastname,
            i.dob AS dob,
            i.sex AS sex,
            i.date_from AS date_from,
            i.date_to AS date_to,
            r.release_date AS release_date,

            i.cellule_id AS cellule_id,

            ce.code AS cellule_code,
            ce.cellule_name AS cellule_name,

            i.photo_path AS photo_path,
            i.created_at AS created_at

        FROM inmates i

        LEFT JOIN cellules ce
            ON ce.id = i.cellule_id

        LEFT JOIN releases r
            ON r.inmate_id = i.id

        WHERE
            ? = ''
            OR i.firstname LIKE ?
            OR i.middlename LIKE ?
            OR i.lastname LIKE ?
            OR ce.code LIKE ?
            OR ce.cellule_name LIKE ?

        ORDER BY i.created_at DESC

        LIMIT ? OFFSET ?
        "#
    )
    .bind(&search)
    .bind(&pattern)
    .bind(&pattern)
    .bind(&pattern)
    .bind(&pattern)
    .bind(&pattern)
    .bind(per_page)
    .bind(offset)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    let total_pages =
        if total.0 == 0 {
            0
        } else {
            (total.0 + per_page - 1) / per_page
        };

    Ok(PaginatedResponse {
        data,
        page,
        per_page,
        total: total.0,
        total_pages,
    })
}
