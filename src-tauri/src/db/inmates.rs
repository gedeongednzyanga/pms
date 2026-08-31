use sqlx::SqlitePool;
use uuid::Uuid;

use crate::models::{inmate::{
    Inmate, InmateDetails, InmateInput, InmateListItem, CrimeSimple, CelluleSimple
}, pagination::PaginatedResponse};

pub async fn create_inmate(
    pool: &SqlitePool,
    input: InmateInput,
) -> Result<String, String> {

    // =========================
    // VALIDATIONS
    // =========================

    let code = input.code.trim().to_string();
    let firstname = input.firstname.trim().to_string();
    let lastname = input.lastname.trim().to_string();
    let address = input.address.trim().to_string();
    let complexion = input.complexion.trim().to_string();
    let eye_color = input.eye_color.trim().to_string();
    let sentence = input.sentence.trim().to_string();

    if code.is_empty() {
        return Err("Le code du détenu est obligatoire.".into());
    }

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

    if complexion.is_empty() {
        return Err("Le teint est obligatoire.".into());
    }

    if eye_color.is_empty() {
        return Err("La couleur des yeux est obligatoire.".into());
    }

    if sentence.is_empty() {
        return Err("La peine est obligatoire.".into());
    }

    if input.date_from.trim().is_empty() {
        return Err("La date de début de peine est obligatoire.".into());
    }

    // =========================
    // VÉRIFIER LE CODE
    // =========================

    let exists: Option<(i64,)> = sqlx::query_as(
        "SELECT COUNT(*) FROM inmates WHERE code = ?"
    )
    .bind(&code)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())?;

    if exists.map(|x| x.0).unwrap_or(0) > 0 {
        return Err(format!(
            "Le code du détenu '{}' existe déjà.",
            code
        ));
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
            code,
            cellule_id,
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
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
        "#
    )
    .bind(&id)
    .bind(&code)
    .bind(&input.cellule_id)
    .bind(&firstname)
    .bind(&input.middlename)
    .bind(&lastname)
    .bind(&input.dob)
    .bind(&input.sex)
    .bind(&address)
    .bind(&input.marital_status)
    .bind(&complexion)
    .bind(&eye_color)
    .bind(&sentence)
    .bind(&input.date_from)
    .bind(&input.date_to)
    .bind(&input.emergency_name)
    .bind(&input.emergency_relation)
    .bind(&input.emergency_contact)
    .bind(&input.image_path)
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
            code,
            cellule_id,
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
    pool: &SqlitePool,
    id: &str,
    input: InmateInput,
) -> Result<(), String> {

    let code = input.code.trim().to_string();
    let firstname = input.firstname.trim().to_string();
    let lastname = input.lastname.trim().to_string();
    let address = input.address.trim().to_string();
    let complexion = input.complexion.trim().to_string();
    let eye_color = input.eye_color.trim().to_string();
    let sentence = input.sentence.trim().to_string();

    // =========================
    // VALIDATION
    // =========================

    if code.is_empty() {
        return Err("Le code est obligatoire.".into());
    }

    if input.cellule_id.is_empty() {
        return Err("La cellule est obligatoire.".into());
    }

    if firstname.is_empty() {
        return Err("Le prénom est obligatoire.".into());
    }

    if lastname.is_empty() {
        return Err("Le nom est obligatoire.".into());
    }

    if input.dob.is_empty() {
        return Err("La date de naissance est obligatoire.".into());
    }

    if address.is_empty() {
        return Err("L'adresse est obligatoire.".into());
    }

    if complexion.is_empty() {
        return Err("Le teint est obligatoire.".into());
    }

    if eye_color.is_empty() {
        return Err("La couleur des yeux est obligatoire.".into());
    }

    if sentence.is_empty() {
        return Err("La peine est obligatoire.".into());
    }

    if input.date_from.is_empty() {
        return Err("La date de début de peine est obligatoire.".into());
    }

    // =========================
    // EXISTENCE DETENU
    // =========================

    let exists: Option<(String,)> = sqlx::query_as(
        "SELECT id FROM inmates WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())?;

    if exists.is_none() {
        return Err("Détenu introuvable.".into());
    }

    // =========================
    // CODE UNIQUE
    // =========================

    let duplicate: Option<(String,)> = sqlx::query_as(
        r#"
        SELECT id
        FROM inmates
        WHERE code = ?
        AND id != ?
        LIMIT 1
        "#
    )
    .bind(&code)
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())?;

    if duplicate.is_some() {
        return Err(format!(
            "Le code '{}' est déjà utilisé.",
            code
        ));
    }

    // =========================
    // CELLULE
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
    // TRANSACTION
    // =========================

    let mut tx = pool
        .begin()
        .await
        .map_err(|e| e.to_string())?;

    // =========================
    // UPDATE
    // =========================

    sqlx::query(
        r#"
        UPDATE inmates
        SET
            code = ?,
            cellule_id = ?,
            firstname = ?,
            middlename = ?,
            lastname = ?,
            dob = ?,
            sex = ?,
            address = ?,
            marital_status = ?,
            complexion = ?,
            eye_color = ?,
            sentence = ?,
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
    .bind(&code)
    .bind(&input.cellule_id)
    .bind(&firstname)
    .bind(&input.middlename)
    .bind(&lastname)
    .bind(&input.dob)
    .bind(&input.sex)
    .bind(&address)
    .bind(&input.marital_status)
    .bind(&complexion)
    .bind(&eye_color)
    .bind(&sentence)
    .bind(&input.date_from)
    .bind(&input.date_to)
    .bind(&input.emergency_name)
    .bind(&input.emergency_relation)
    .bind(&input.emergency_contact)
    .bind(&input.image_path)
    .bind(id)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    // =========================
    // SUPPRIMER ANCIENS CRIMES
    // =========================

    sqlx::query(
        "DELETE FROM inmate_crimes WHERE inmate_id = ?"
    )
    .bind(id)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    // =========================
    // AJOUTER NOUVEAUX CRIMES
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
        .bind(id)
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
            OR i.code LIKE ?
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
            i.code AS code,
            i.firstname AS firstname,
            i.middlename AS middlename,
            i.lastname AS lastname,
            i.dob AS dob,
            i.sex AS sex,
            i.sentence AS sentence,
            i.date_from AS date_from,
            i.date_to AS date_to,

            i.cellule_id AS cellule_id,

            ce.code AS cellule_code,
            ce.cellule_name AS cellule_name,

            i.photo_path AS photo_path,
            i.created_at AS created_at

        FROM inmates i

        LEFT JOIN cellules ce
            ON ce.id = i.cellule_id

        WHERE
            ? = ''
            OR i.code LIKE ?
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
