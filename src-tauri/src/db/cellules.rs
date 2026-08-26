use sqlx::{SqlitePool};
use uuid::Uuid;

use crate::models::{pagination::PaginatedResponse, cellule::{
    Cellule, CelluleInput,
}};

pub async fn create_cellule(
    pool: &SqlitePool,
    data: CelluleInput,
) -> Result<Cellule, String> {

    let id = Uuid::new_v4().to_string();
    let cellule_name = data.cellule_name.as_deref().unwrap_or("").trim();
    // let statut_cellule = data.statut_cellule.as_deref().unwrap_or("").trim();

    if cellule_name.is_empty() {
        return Err("La désignation est obligatoire".into());
    }

   

    // Vérifier si le cellule_name existe déjà
    let exists: Option<(String,)> = sqlx::query_as(
        "SELECT id FROM cellules WHERE cellule_name = ? LIMIT 1"
    )
    .bind(cellule_name)
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
        INSERT INTO cellules (
            id,
            cellule_name,
            statut_cellule,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?)
        "#
    )
    .bind(&id)
    .bind(data.cellule_name)
   
    .bind(&now)
    .bind(&now)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    get_cellule_by_id(pool, id).await
}

pub async fn get_cellule_by_id(
    pool: &SqlitePool,
    id: String,
) -> Result<Cellule, String> {

    sqlx::query_as::<_, Cellule>(
        r#"
        SELECT
            id,
            cellule_name,
            statut_cellule,
            created_at,
            updated_at
        FROM cellules
        WHERE id = ?
        LIMIT 1
        "#
    )
    .bind(id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Utilisateur introuvable : {}", e))
}

pub async fn update_cellule(
    pool: &SqlitePool,
    id: String,
    data: CelluleInput,
) -> Result<Cellule, String> {

    let cellule_name = data.cellule_name.as_deref().unwrap_or("").trim();
    

    if cellule_name.is_empty() {
        return Err("La désignation est obligatoire".into());
    }

    // if statut_cellule.is_empty() {
    //     return Err("Le statut du crime est obligatoire".into());
    // }

    // Vérifier que le cellule_name n'est pas utilisé par un autre crime
    let exists: Option<(String,)> = sqlx::query_as(
        r#"
        SELECT id
        FROM cellules
        WHERE cellule_name = ?
          AND id != ?
        LIMIT 1
        "#
    )
    .bind(cellule_name)
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
        UPDATE cellules
        SET
            cellule_name = ?,
            statut_cellule = ?,
            updated_at = ?
        WHERE id = ?
        "#
    )
    .bind(data.cellule_name)

    .bind(&now)
    .bind(&id)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;
    

    get_cellule_by_id(pool, id).await
}

pub async fn delete_cellule(
    pool: &SqlitePool,
    id: String,
) -> Result<(), String> {

    let result = sqlx::query(
        "DELETE FROM cellules WHERE id = ?"
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

pub async fn get_cellules(
    pool: &SqlitePool,
    page: i64,
    per_page: i64,
    search: Option<String>,
) -> Result<PaginatedResponse<Cellule>, String> {

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
        FROM cellules
        WHERE
            ? = ''
            OR cellule_name LIKE ?
            OR statut_cellule LIKE ?
        "#
    )
    .bind(&search)
    .bind(&pattern)
    .bind(&pattern)
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())?;

    let users = sqlx::query_as::<_, Cellule>(
        r#"
        SELECT
            id,
            cellule_name,
            statut_cellule,
            created_at,
            updated_at
        FROM users
        WHERE
            ? = ''
            OR cellule_name LIKE ?
            OR statut_cellule LIKE ?
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