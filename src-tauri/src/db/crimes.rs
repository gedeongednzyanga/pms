use sqlx::{SqlitePool};
use uuid::Uuid;

use crate::models::{pagination::PaginatedResponse, crime::{
    Crime, CrimeInput,
}};

pub async fn create_crime(
    pool: &SqlitePool,
    data: CrimeInput,
) -> Result<Crime, String> {

    let id = Uuid::new_v4().to_string();
    let crime_name = data.crime_name.as_deref().unwrap_or("").trim();
    let description_crime = data.description_crime.as_deref().unwrap_or("").trim();
    let statut_crime = data.statut_crime.as_deref().unwrap_or("").trim();

    if crime_name.is_empty() {
        return Err("La désignation est obligatoire".into());
    }

    if description_crime.is_empty() {
        return Err("La description est obligatoire".into());
    }

    if statut_crime.is_empty() {
        return Err("Le statut du crime est obligatoire".into());
    }

    // Vérifier si le crime_name existe déjà
    let exists: Option<(String,)> = sqlx::query_as(
        "SELECT id FROM crimes WHERE crime_name = ? LIMIT 1"
    )
    .bind(&data.crime_name)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())?;

    if exists.is_some() {
        return Err("Cette infraction existe déjà".into());
    }

    let now = chrono::Local::now()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();

    sqlx::query(
        r#"
        INSERT INTO crimes (
            id,
            crime_name,
            description_crime,
            statut_crime,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&id)
    .bind(data.crime_name)
    .bind(description_crime)
    .bind(data.statut_crime)
    .bind(&now)
    .bind(&now)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    get_crime_by_id(pool, id).await
}

pub async fn get_crime_by_id(
    pool: &SqlitePool,
    id: String,
) -> Result<Crime, String> {

    sqlx::query_as::<_, Crime>(
        r#"
        SELECT
            id,
            crime_name,
            description_crime,
            statut_crime,
            created_at,
            updated_at
        FROM crimes
        WHERE id = ?
        LIMIT 1
        "#
    )
    .bind(id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Infraction introuvable : {}", e))
}

pub async fn update_crime(
    pool: &SqlitePool,
    id: String,
    data: CrimeInput,
) -> Result<Crime, String> {

    let crime_name = data.crime_name.as_deref().unwrap_or("").trim();
    let statut_crime = data.statut_crime.as_deref().unwrap_or("").trim();

    if crime_name.is_empty() {
        return Err("La désignation est obligatoire".into());
    }

    if statut_crime.is_empty() {
        return Err("Le statut du crime est obligatoire".into());
    }

    // Vérifier que le crime_name n'est pas utilisé par un autre crime
    let exists: Option<(String,)> = sqlx::query_as(
        r#"
        SELECT id
        FROM crimes
        WHERE crime_name = ?
          AND id != ?
        LIMIT 1
        "#
    )
    .bind(crime_name)
    .bind(&id)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())?;

    if exists.is_some() {
        return Err("Cette infraction existe déjà.".into());
    }

    let now = chrono::Local::now()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();

    sqlx::query(
        r#"
        UPDATE crimes
        SET
            crime_name = ?,
            statut_crime = ?,
            updated_at = ?
        WHERE id = ?
        "#
    )
    .bind(data.crime_name)
    .bind(data.statut_crime)
    .bind(&now)
    .bind(&id)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;
    

    get_crime_by_id(pool, id).await
}

pub async fn delete_crime(
    pool: &SqlitePool,
    id: String,
) -> Result<(), String> {

    let result = sqlx::query(
        "DELETE FROM crimes WHERE id = ?"
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

pub async fn get_crimes(
    pool: &SqlitePool,
    page: i64,
    per_page: i64,
    search: Option<String>,
) -> Result<PaginatedResponse<Crime>, String> {

    let page = page.max(1);
    let per_page = per_page.clamp(1, 100);
    let offset = (page - 1) * per_page;

    let search = search
        .unwrap_or_default()
        .trim()
        .to_string();

    let pattern = format!("%{}%", search);

    let total: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*)
        FROM crimes
        WHERE
            ? = ''
            OR crime_name LIKE ?
            OR statut_crime LIKE ?
        "#
    )
    .bind(&search)
    .bind(&pattern)
    .bind(&pattern)
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())?;

    let users = sqlx::query_as::<_, Crime>(
        r#"
        SELECT
            id,
            crime_name,
            description_crime,
            statut_crime,
            created_at,
            updated_at
        FROM crimes
        WHERE
            ? = ''
            OR crime_name LIKE ?
            OR statut_crime LIKE ?
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        "#
    )
    .bind(&search)
    .bind(&pattern)
    .bind(&pattern)
    .bind(per_page)
    .bind(offset)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(PaginatedResponse::new(
        users,
        total,
        page,
        per_page,
    ))
}