use sqlx::SqlitePool;
use uuid::Uuid;

use crate::models::plainte::{Plainte, PlainteInput};

pub async fn get_plainte_by_id(
    pool: &SqlitePool,
    id: String,
) -> Result<Plainte, String> {

    sqlx::query_as::<_, Plainte>(
        r#"
        SELECT
            id,
            objet,
            description,
            date_faits,
            lieu_faits,
            statut,
            created_at,
            updated_at
        FROM plaintes
        WHERE id = ?
        LIMIT 1
        "#
    )
    .bind(id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Plainte introuvable : {}", e))
}

pub async fn create_plainte(
    pool: &SqlitePool,
    data: PlainteInput,
) -> Result<Plainte, String> {
    let id = Uuid::new_v4().to_string();

    let objet = data.objet
        .as_deref()
        .unwrap_or("")
        .trim();

    let description = data
        .description
        .as_deref()
        .unwrap_or("")
        .trim();

    let date_faits = data
        .date_faits
        .as_deref()
        .unwrap_or("")
        .trim();

    let lieu_faits = data
        .lieu_faits
        .as_deref()
        .unwrap_or("")
        .trim();

    // ============================================================
    // VALIDATIONS
    // ============================================================

    if objet.is_empty() {
        return Err("L'objet est obligatoire".into());
    }

    if description.is_empty() {
        return Err("La description est obligatoire".into());
    }

    if date_faits.is_empty() {
        return Err("La date des faits est obligatoire".into());
    }

    if lieu_faits.is_empty() {
        return Err("Le lieu des faits est obligatoire".into());
    }

    // ============================================================
    // VALEURS AUTOMATIQUES
    // ============================================================

    let now = chrono::Local::now()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();

    let statut = data
        .statut
        .as_deref()
        .unwrap_or("ENREGISTREE");

    // ============================================================
    // INSERTION
    // ============================================================

    sqlx::query(
        r#"
        INSERT INTO plaintes (
            id,
            objet,
            description,
            date_faits,
            lieu_faits,
            statut,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&id)
    .bind(objet)
    .bind(description)
    .bind(date_faits)
    .bind(lieu_faits)
    .bind(statut)
    .bind(&now)
    .bind(&now)
    .execute(pool)
    .await
    .map_err(|e| format!("Erreur lors de l'enregistrement de la plainte : {}", e))?;

    // ============================================================
    // RETOURNER LA PLAINTE
    // ============================================================

    get_plainte_by_id(pool, id).await
}

pub async fn update_plainte(
    pool: &SqlitePool,
    id: String,
    data: PlainteInput,
) -> Result<Plainte, String> {
    // ============================================================
    // VALEURS
    // ============================================================

    let objet = data
        .objet
        .as_deref()
        .unwrap_or("")
        .trim();

    let description = data
        .description
        .as_deref()
        .unwrap_or("")
        .trim();

    let date_faits = data
        .date_faits
        .as_deref()
        .unwrap_or("")
        .trim();

    let lieu_faits = data
        .lieu_faits
        .as_deref()
        .unwrap_or("")
        .trim();

    let statut = data
        .statut
        .as_deref()
        .unwrap_or("ENREGISTREE")
        .trim();

    // ============================================================
    // VALIDATIONS
    // ============================================================

    if objet.is_empty() {
        return Err("L'objet est obligatoire".into());
    }

    if description.is_empty() {
        return Err("La description est obligatoire".into());
    }

    if date_faits.is_empty() {
        return Err("La date des faits est obligatoire".into());
    }

    if lieu_faits.is_empty() {
        return Err("Le lieu des faits est obligatoire".into());
    }

    if statut.is_empty() {
        return Err("Le statut est obligatoire".into());
    }

    // ============================================================
    // VÉRIFIER QUE LA PLAINTE EXISTE
    // ============================================================

    let exists: Option<(String,)> = sqlx::query_as(
        r#"
        SELECT id
        FROM plaintes
        WHERE id = ?
        "#,
    )
    .bind(&id)
    .fetch_optional(pool)
    .await
    .map_err(|e| {
        format!(
            "Erreur lors de la vérification de la plainte : {}",
            e
        )
    })?;

    if exists.is_none() {
        return Err("Plainte introuvable".into());
    }

    // ============================================================
    // DATE DE MODIFICATION
    // ============================================================

    let now = chrono::Local::now()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();

    // ============================================================
    // MISE À JOUR
    // ============================================================

    sqlx::query(
        r#"
        UPDATE plaintes
        SET
            objet = ?,
            description = ?,
            date_faits = ?,
            lieu_faits = ?,
            statut = ?,
            updated_at = ?
        WHERE id = ?
        "#,
    )
    .bind(objet)
    .bind(description)
    .bind(date_faits)
    .bind(lieu_faits)
    .bind(statut)
    .bind(&now)
    .bind(&id)
    .execute(pool)
    .await
    .map_err(|e| {
        format!(
            "Erreur lors de la modification de la plainte : {}",
            e
        )
    })?;

    // ============================================================
    // RETOURNER LA PLAINTE MODIFIÉE
    // ============================================================

    get_plainte_by_id(pool, id).await
}

pub async fn get_plaintes(
    pool: &SqlitePool,
) -> Result<Vec<Plainte>, String> {
    sqlx::query_as::<_, Plainte>(
        r#"
        SELECT
            id,
            objet,
            description,
            date_faits,
            lieu_faits,
            statut,
            created_at,
            updated_at
        FROM plaintes
        ORDER BY created_at DESC
        "#,
    )
    .fetch_all(pool)
    .await
    .map_err(|e| {
        format!(
            "Erreur lors du chargement des plaintes : {}",
            e
        )
    })
}

pub async fn delete_plainte(
    pool: &SqlitePool,
    id: String,
) -> Result<(), String> {
    // ============================================================
    // VÉRIFIER QUE LA PLAINTE EXISTE
    // ============================================================

    let exists: Option<(String,)> = sqlx::query_as(
        r#"
        SELECT id
        FROM plaintes
        WHERE id = ?
        "#,
    )
    .bind(&id)
    .fetch_optional(pool)
    .await
    .map_err(|e| {
        format!(
            "Erreur lors de la vérification de la plainte : {}",
            e
        )
    })?;

    if exists.is_none() {
        return Err("Plainte introuvable".into());
    }

    // ============================================================
    // SUPPRESSION
    // ============================================================

    sqlx::query(
        r#"
        DELETE FROM plaintes
        WHERE id = ?
        "#,
    )
    .bind(&id)
    .execute(pool)
    .await
    .map_err(|e| {
        format!(
            "Erreur lors de la suppression de la plainte : {}",
            e
        )
    })?;

    Ok(())
}