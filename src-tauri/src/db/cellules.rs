use chrono::Local;
use sqlx::{SqlitePool};
use uuid::Uuid;

use crate::models::{pagination::PaginatedResponse, cellule::{
    Cellule, CelluleInput,
}};

pub async fn create_cellule(
    pool: &SqlitePool,
    data: CelluleInput,
) -> Result<Cellule, String> {

    // ============================
    // Validation prison
    // ============================

    let prison_id = data
        .prison_id
        .as_deref()
        .unwrap_or("")
        .trim();

    if prison_id.is_empty() {
        return Err("Veuillez sélectionner une prison.".into());
    }

    // ============================
    // Validation désignation
    // ============================

    let cellule_name = data
        .cellule_name
        .as_deref()
        .unwrap_or("")
        .trim();

    if cellule_name.is_empty() {
        return Err("La désignation est obligatoire.".into());
    }

    // ============================
    // Validation capacité
    // ============================

    let capacity = data.capacity.unwrap_or(0);

    if capacity <= 0 {
        return Err("La capacité doit être supérieure à zéro.".into());
    }

    // ============================
    // Code
    // ============================

    let code = data
        .code
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty());

    // ============================
    // Vérifier que la prison existe
    // ============================

    let prison_exists: Option<(String,)> = sqlx::query_as(
        r#"
        SELECT id
        FROM prisons
        WHERE id = ?
        LIMIT 1
        "#,
    )
    .bind(prison_id)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("Erreur vérification prison : {}", e))?;

    if prison_exists.is_none() {
        return Err("La prison sélectionnée n'existe pas.".into());
    }

    // ============================
    // Vérifier le doublon de désignation
    // ============================

    let name_exists: Option<(String,)> = sqlx::query_as(
        r#"
        SELECT id
        FROM cellules
        WHERE LOWER(TRIM(cellule_name)) = LOWER(TRIM(?))
        AND prison_id = ?
        LIMIT 1
        "#,
    )
    .bind(cellule_name)
    .bind(prison_id)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("Erreur vérification cellule : {}", e))?;

    if name_exists.is_some() {
        return Err(
            "Une cellule portant cette désignation existe déjà dans cette prison."
                .into()
        );
    }

    // ============================
    // Vérifier le code
    // ============================

    if let Some(code_value) = code {
        let code_exists: Option<(String,)> = sqlx::query_as(
            r#"
            SELECT id
            FROM cellules
            WHERE LOWER(TRIM(code)) = LOWER(TRIM(?))
            LIMIT 1
            "#,
        )
        .bind(code_value)
        .fetch_optional(pool)
        .await
        .map_err(|e| format!("Erreur vérification code : {}", e))?;

        if code_exists.is_some() {
            return Err("Ce code de cellule existe déjà.".into());
        }
    }

    // ============================
    // Générer ID
    // ============================

    let id = Uuid::new_v4().to_string();

    // ============================
    // Date
    // ============================

    let now = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    // ============================
    // Insertion
    // ============================

    sqlx::query(
        r#"
        INSERT INTO cellules (
            id,
            prison_id,
            code,
            cellule_name,
            capacity,
            statut_cellule,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&id)
    .bind(prison_id)
    .bind(code)
    .bind(cellule_name)
    .bind(capacity)
    .bind("active")
    .bind(&now)
    .bind(&now)
    .execute(pool)
    .await
    .map_err(|e| format!("Erreur création cellule : {}", e))?;

    // ============================
    // Retourner la cellule créée
    // ============================

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
            prison_id,
            code,
            cellule_name,
            capacity,
            statut_cellule,
            created_at,
            updated_at
        FROM cellules
        WHERE id = ?
        LIMIT 1
        "#,
    )
    .bind(&id)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("Erreur récupération cellule : {}", e))?
    .ok_or_else(|| "Cellule introuvable.".to_string())
}

pub async fn update_cellule(
    pool: &SqlitePool,
    id: String,
    data: CelluleInput,
) -> Result<Cellule, String> {

    // ============================
    // Vérifier que la cellule existe
    // ============================

    let existing = get_cellule_by_id(pool, id.clone()).await?;

    // ============================
    // Validation prison
    // ============================

    let prison_id = data
        .prison_id
        .as_deref()
        .unwrap_or("")
        .trim();

    if prison_id.is_empty() {
        return Err("Veuillez sélectionner une prison.".into());
    }

    // ============================
    // Validation désignation
    // ============================

    let cellule_name = data
        .cellule_name
        .as_deref()
        .unwrap_or("")
        .trim();

    if cellule_name.is_empty() {
        return Err("La désignation est obligatoire.".into());
    }

    // ============================
    // Validation capacité
    // ============================

    let capacity = data.capacity.unwrap_or(0);

    if capacity <= 0 {
        return Err("La capacité doit être supérieure à zéro.".into());
    }

    // ============================
    // Code
    // ============================

    let code = data
        .code
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty());

    // ============================
    // Vérifier prison
    // ============================

    let prison_exists: Option<(String,)> = sqlx::query_as(
        r#"
        SELECT id
        FROM prisons
        WHERE id = ?
        LIMIT 1
        "#,
    )
    .bind(prison_id)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("Erreur vérification prison : {}", e))?;

    if prison_exists.is_none() {
        return Err("La prison sélectionnée n'existe pas.".into());
    }

    // ============================
    // Vérifier doublon désignation
    // ============================

    let name_exists: Option<(String,)> = sqlx::query_as(
        r#"
        SELECT id
        FROM cellules
        WHERE LOWER(TRIM(cellule_name)) = LOWER(TRIM(?))
        AND prison_id = ?
        AND id != ?
        LIMIT 1
        "#,
    )
    .bind(cellule_name)
    .bind(prison_id)
    .bind(&id)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("Erreur vérification cellule : {}", e))?;

    if name_exists.is_some() {
        return Err(
            "Une cellule portant cette désignation existe déjà dans cette prison."
                .into()
        );
    }

    // ============================
    // Vérifier code
    // ============================

    if let Some(code_value) = code {
        let code_exists: Option<(String,)> = sqlx::query_as(
            r#"
            SELECT id
            FROM cellules
            WHERE LOWER(TRIM(code)) = LOWER(TRIM(?))
            AND id != ?
            LIMIT 1
            "#,
        )
        .bind(code_value)
        .bind(&id)
        .fetch_optional(pool)
        .await
        .map_err(|e| format!("Erreur vérification code : {}", e))?;

        if code_exists.is_some() {
            return Err("Ce code de cellule existe déjà.".into());
        }
    }

    // ============================
    // Date modification
    // ============================

    let now = Local::now()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();

    // ============================
    // Mise à jour
    // ============================

    sqlx::query(
        r#"
        UPDATE cellules
        SET
            prison_id = ?,
            code = ?,
            cellule_name = ?,
            capacity = ?,
            updated_at = ?
        WHERE id = ?
        "#,
    )
    .bind(prison_id)
    .bind(code)
    .bind(cellule_name)
    .bind(capacity)
    .bind(&now)
    .bind(&id)
    .execute(pool)
    .await
    .map_err(|e| format!("Erreur modification cellule : {}", e))?;

    // ============================
    // Retourner la cellule modifiée
    // ============================

    get_cellule_by_id(pool, existing.id).await
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