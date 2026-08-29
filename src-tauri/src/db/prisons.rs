use sqlx::{SqlitePool};
use uuid::Uuid;

use crate::models::{pagination::PaginatedResponse, prison::{
    Prison, PrisonInput,
}};

pub async fn create_prison(
    pool: &SqlitePool,
    data: PrisonInput,
) -> Result<Prison, String> {

    let id = Uuid::new_v4().to_string();

    let prison_name = data
        .prison_name
        .as_deref()
        .unwrap_or("")
        .trim();

    let address_prison = data
        .address_prison
        .as_deref()
        .unwrap_or("")
        .trim();

    let statut_prison = data
        .statut_prison
        .as_deref()
        .unwrap_or("")
        .trim();

    if prison_name.is_empty() {
        return Err("La désignation est obligatoire".into());
    }

    if statut_prison.is_empty() {
        return Err("Le statut de la prison est obligatoire".into());
    }

    if !matches!(statut_prison, "active" | "desactive") {
        return Err(
            "Le statut doit être 'active' ou 'desactive'".into()
        );
    }

    // Vérifier si le nom existe déjà
    let exists: Option<(String,)> = sqlx::query_as(
        "SELECT id FROM prisons WHERE prison_name = ? LIMIT 1"
    )
    .bind(prison_name)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())?;

    if exists.is_some() {
        return Err("Cette prison existe déjà".into());
    }

    let now = chrono::Local::now()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();

    sqlx::query(
        r#"
        INSERT INTO prisons (
            id,
            prison_name,
            address_prison,
            statut_prison,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&id)
    .bind(prison_name)
    .bind(address_prison)
    .bind(statut_prison)
    .bind(&now)
    .bind(&now)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    get_prison_by_id(pool, id).await
}

pub async fn get_prison_by_id(
    pool: &SqlitePool,
    id: String,
) -> Result<Prison, String> {

    sqlx::query_as::<_, Prison>(
        r#"
        SELECT
            id,
            prison_name,
            address_prison,
            statut_prison,
            created_at,
            updated_at
        FROM prisons
        WHERE id = ?
        LIMIT 1
        "#
    )
    .bind(id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Utilisateur introuvable : {}", e))
}

pub async fn update_prison(
    pool: &SqlitePool,
    id: String,
    data: PrisonInput,
) -> Result<Prison, String> {

    let prison_name = data
        .prison_name
        .as_deref()
        .unwrap_or("")
        .trim();

    let address_prison = data
        .address_prison
        .as_deref()
        .unwrap_or("")
        .trim();

    let statut_prison = data
        .statut_prison
        .as_deref()
        .unwrap_or("")
        .trim();

    if prison_name.is_empty() {
        return Err("La désignation est obligatoire".into());
    }

    if statut_prison.is_empty() {
        return Err("Le statut de la prison est obligatoire".into());
    }

    if !matches!(statut_prison, "active" | "desactive") {
        return Err(
            "Le statut doit être 'active' ou 'desactive'".into()
        );
    }

    // Vérifier que le nom n'est pas utilisé par une autre prison
    let exists: Option<(String,)> = sqlx::query_as(
        r#"
        SELECT id
        FROM prisons
        WHERE prison_name = ?
          AND id != ?
        LIMIT 1
        "#
    )
    .bind(prison_name)
    .bind(&id)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())?;

    if exists.is_some() {
        return Err("Cette prison existe déjà.".into());
    }

    let now = chrono::Local::now()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();

    sqlx::query(
        r#"
        UPDATE prisons
        SET
            prison_name = ?,
            address_prison = ?,
            statut_prison = ?,
            updated_at = ?
        WHERE id = ?
        "#
    )
    .bind(prison_name)
    .bind(address_prison)
    .bind(statut_prison)
    .bind(&now)
    .bind(&id)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    get_prison_by_id(pool, id).await
}

pub async fn delete_prison(
    pool: &SqlitePool,
    id: String,
) -> Result<(), String> {

    let result = sqlx::query(
        "DELETE FROM prisons WHERE id = ?"
    )
    .bind(id)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    if result.rows_affected() == 0 {
        return Err("Infraction introuvable".into());
    }

    Ok(())
}

// pub async fn get_prisons(
//     pool: &SqlitePool,
//     page: i64,
//     per_page: i64,
//     search: Option<String>,
// ) -> Result<PaginatedResponse<Prison>, String> {

//     let page = page.max(1);
//     let per_page = per_page.clamp(1, 100);
//     let offset = (page - 1) * per_page;

//     let search = search
//         .unwrap_or_default()
//         .trim()
//         .to_string();

//     let pattern = format!("%{}%", search);

//     let total: i64 = sqlx::query_scalar(
//         r#"
//         SELECT COUNT(*)
//         FROM prisons
//         WHERE
//             ? = ''
//             OR prison_name LIKE ?
//             OR statut_prison LIKE ?
//         "#
//     )
//     .bind(&search)
//     .bind(&pattern)
//     .bind(&pattern)
//     .fetch_one(pool)
//     .await
//     .map_err(|e| e.to_string())?;

//     let users = sqlx::query_as::<_, Prison>(
//         r#"
//         SELECT
//             id,
//             crime_name,
//             statut_crime,
//             created_at,
//             updated_at
//         FROM users
//         WHERE
//             ? = ''
//             OR crime_name LIKE ?
//             OR statut_crime LIKE ?
//         ORDER BY id DESC
//         LIMIT ? OFFSET ?
//         "#
//     )
//     .bind(&search)
//     .bind(&pattern)
//     .bind(&pattern)
//     .bind(per_page)
//     .bind(offset)
//     .fetch_all(pool)
//     .await
//     .map_err(|e| e.to_string())?;

//     Ok(PaginatedResponse::new(
//         users,
//         total,
//         page,
//         per_page,
//     ))
// }

pub async fn get_prisons(
    pool: &SqlitePool,
    page: i64,
    per_page: i64,
    search: Option<String>,
) -> Result<PaginatedResponse<Prison>, String> {

    let page = page.max(1);
    let per_page = per_page.clamp(1, 100);
    let offset = (page - 1) * per_page;

    let search = search
        .unwrap_or_default()
        .trim()
        .to_string();

    let pattern = format!("%{}%", search);

    // ============================
    // TOTAL
    // ============================
    let total: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*)
        FROM prisons
        WHERE
            ? = ''
            OR prison_name LIKE ?
            OR address_prison LIKE ?
            OR statut_prison LIKE ?
        "#
    )
    .bind(&search)
    .bind(&pattern)
    .bind(&pattern)
    .bind(&pattern)
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())?;

    // ============================
    // PRISONS
    // ============================
    let prisons = sqlx::query_as::<_, Prison>(
        r#"
        SELECT
            id,
            prison_name,
            address_prison,
            statut_prison,
            created_at,
            updated_at
        FROM prisons
        WHERE
            ? = ''
            OR prison_name LIKE ?
            OR address_prison LIKE ?
            OR statut_prison LIKE ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        "#
    )
    .bind(&search)
    .bind(&pattern)
    .bind(&pattern)
    .bind(&pattern)
    .bind(per_page)
    .bind(offset)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(PaginatedResponse::new(
        prisons,
        total,
        page,
        per_page,
    ))
}