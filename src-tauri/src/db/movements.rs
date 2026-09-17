use sqlx::SqlitePool;
use uuid::Uuid;

use crate::models::movements::{
    CelluleOption, InmateOption, Release, ReleaseInput, Transfer, TransferInput,
};

const RELEASE_SELECT: &str = r#"
    SELECT r.id, r.inmate_id,
           TRIM(i.firstname || ' ' || COALESCE(i.middlename || ' ', '') || i.lastname) AS inmate_name,
           r.release_date, r.reason, r.notes, r.created_at, r.updated_at
    FROM releases r
    INNER JOIN inmates i ON i.id = r.inmate_id
"#;

const TRANSFER_SELECT: &str = r#"
    SELECT t.id, t.inmate_id,
           TRIM(i.firstname || ' ' || COALESCE(i.middlename || ' ', '') || i.lastname) AS inmate_name,
           t.from_cellule_id,
           COALESCE(fp.prison_name || ' — ', '') || COALESCE(fc.code, fc.cellule_name) AS from_cellule_name,
           t.to_cellule_id,
           COALESCE(tp.prison_name || ' — ', '') || COALESCE(tc.code, tc.cellule_name) AS to_cellule_name,
           t.transfer_date, t.reason, t.notes, t.created_at, t.updated_at
    FROM inmate_transfers t
    INNER JOIN inmates i ON i.id = t.inmate_id
    INNER JOIN cellules fc ON fc.id = t.from_cellule_id
    LEFT JOIN prisons fp ON fp.id = fc.prison_id
    INNER JOIN cellules tc ON tc.id = t.to_cellule_id
    LEFT JOIN prisons tp ON tp.id = tc.prison_id
"#;

fn required(value: &str, label: &str) -> Result<String, String> {
    let value = value.trim().to_string();
    if value.is_empty() {
        return Err(format!("{} est obligatoire.", label));
    }
    Ok(value)
}

async fn inmate_exists(pool: &SqlitePool, inmate_id: &str) -> Result<(), String> {
    let exists: Option<(String,)> = sqlx::query_as("SELECT id FROM inmates WHERE id = ?")
        .bind(inmate_id)
        .fetch_optional(pool)
        .await
        .map_err(|error| error.to_string())?;

    if exists.is_none() {
        return Err("La détenue sélectionnée n'existe pas.".into());
    }
    Ok(())
}

async fn inmate_is_not_released(pool: &SqlitePool, inmate_id: &str) -> Result<(), String> {
    let released: Option<(String,)> = sqlx::query_as("SELECT id FROM releases WHERE inmate_id = ?")
        .bind(inmate_id)
        .fetch_optional(pool)
        .await
        .map_err(|error| error.to_string())?;

    if released.is_some() {
        return Err("Cette détenue est déjà libérée et ne peut pas être transférée.".into());
    }
    Ok(())
}

async fn cellule_exists(pool: &SqlitePool, cellule_id: &str) -> Result<(), String> {
    let exists: Option<(String,)> = sqlx::query_as("SELECT id FROM cellules WHERE id = ?")
        .bind(cellule_id)
        .fetch_optional(pool)
        .await
        .map_err(|error| error.to_string())?;

    if exists.is_none() {
        return Err("La cellule de destination n'existe pas.".into());
    }
    Ok(())
}

pub async fn get_inmate_options(pool: &SqlitePool) -> Result<Vec<InmateOption>, String> {
    sqlx::query_as::<_, InmateOption>(
        r#"
        SELECT i.id,
               TRIM(i.firstname || ' ' || COALESCE(i.middlename || ' ', '') || i.lastname) AS label,
               i.cellule_id
        FROM inmates i
        LEFT JOIN releases r ON r.inmate_id = i.id
        WHERE r.id IS NULL
        ORDER BY i.lastname COLLATE NOCASE, i.firstname COLLATE NOCASE
        "#,
    )
    .fetch_all(pool)
    .await
    .map_err(|error| error.to_string())
}

pub async fn get_cellule_options(pool: &SqlitePool) -> Result<Vec<CelluleOption>, String> {
    sqlx::query_as::<_, CelluleOption>(
        r#"
        SELECT c.id,
               COALESCE(p.prison_name || ' — ', '') || COALESCE(c.code, c.cellule_name) AS label
        FROM cellules c
        LEFT JOIN prisons p ON p.id = c.prison_id
        WHERE c.statut_cellule = 'active'
        ORDER BY p.prison_name COLLATE NOCASE, c.code COLLATE NOCASE, c.cellule_name COLLATE NOCASE
        "#,
    )
    .fetch_all(pool)
    .await
    .map_err(|error| error.to_string())
}

pub async fn get_releases(pool: &SqlitePool) -> Result<Vec<Release>, String> {
    let query = format!("{} ORDER BY r.release_date DESC, r.created_at DESC", RELEASE_SELECT);
    sqlx::query_as::<_, Release>(&query)
        .fetch_all(pool)
        .await
        .map_err(|error| error.to_string())
}

async fn get_release(pool: &SqlitePool, id: &str) -> Result<Release, String> {
    let query = format!("{} WHERE r.id = ?", RELEASE_SELECT);
    sqlx::query_as::<_, Release>(&query)
        .bind(id)
        .fetch_one(pool)
        .await
        .map_err(|_| "Libération introuvable.".to_string())
}

pub async fn create_release(pool: &SqlitePool, data: ReleaseInput) -> Result<Release, String> {
    let inmate_id = required(&data.inmate_id, "La détenue")?;
    let release_date = required(&data.release_date, "La date de libération")?;
    let reason = required(&data.reason, "Le motif")?;
    inmate_exists(pool, &inmate_id).await?;

    let already_released: Option<(String,)> = sqlx::query_as("SELECT id FROM releases WHERE inmate_id = ?")
        .bind(&inmate_id)
        .fetch_optional(pool)
        .await
        .map_err(|error| error.to_string())?;
    if already_released.is_some() {
        return Err("Cette détenue possède déjà une libération enregistrée.".into());
    }

    let id = Uuid::new_v4().to_string();
    sqlx::query("INSERT INTO releases (id, inmate_id, release_date, reason, notes) VALUES (?, ?, ?, ?, ?)")
        .bind(&id)
        .bind(inmate_id)
        .bind(release_date)
        .bind(reason)
        .bind(data.notes.and_then(|value| (!value.trim().is_empty()).then_some(value.trim().to_string())))
        .execute(pool)
        .await
        .map_err(|error| error.to_string())?;

    get_release(pool, &id).await
}

pub async fn update_release(pool: &SqlitePool, id: &str, data: ReleaseInput) -> Result<Release, String> {
    let inmate_id = required(&data.inmate_id, "La détenue")?;
    let release_date = required(&data.release_date, "La date de libération")?;
    let reason = required(&data.reason, "Le motif")?;
    inmate_exists(pool, &inmate_id).await?;

    let duplicate: Option<(String,)> = sqlx::query_as("SELECT id FROM releases WHERE inmate_id = ? AND id != ?")
        .bind(&inmate_id)
        .bind(id)
        .fetch_optional(pool)
        .await
        .map_err(|error| error.to_string())?;
    if duplicate.is_some() {
        return Err("Cette détenue possède déjà une libération enregistrée.".into());
    }

    let result = sqlx::query(
        "UPDATE releases SET inmate_id = ?, release_date = ?, reason = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    )
    .bind(inmate_id)
    .bind(release_date)
    .bind(reason)
    .bind(data.notes.and_then(|value| (!value.trim().is_empty()).then_some(value.trim().to_string())))
    .bind(id)
    .execute(pool)
    .await
    .map_err(|error| error.to_string())?;

    if result.rows_affected() == 0 {
        return Err("Libération introuvable.".into());
    }
    get_release(pool, id).await
}

pub async fn delete_release(pool: &SqlitePool, id: &str) -> Result<(), String> {
    let result = sqlx::query("DELETE FROM releases WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|error| error.to_string())?;
    if result.rows_affected() == 0 {
        return Err("Libération introuvable.".into());
    }
    Ok(())
}

pub async fn get_transfers(pool: &SqlitePool) -> Result<Vec<Transfer>, String> {
    let query = format!("{} ORDER BY t.transfer_date DESC, t.created_at DESC", TRANSFER_SELECT);
    sqlx::query_as::<_, Transfer>(&query)
        .fetch_all(pool)
        .await
        .map_err(|error| error.to_string())
}

async fn get_transfer(pool: &SqlitePool, id: &str) -> Result<Transfer, String> {
    let query = format!("{} WHERE t.id = ?", TRANSFER_SELECT);
    sqlx::query_as::<_, Transfer>(&query)
        .bind(id)
        .fetch_one(pool)
        .await
        .map_err(|_| "Transfert introuvable.".to_string())
}

pub async fn create_transfer(pool: &SqlitePool, data: TransferInput) -> Result<Transfer, String> {
    let inmate_id = required(&data.inmate_id, "La détenue")?;
    let to_cellule_id = required(&data.to_cellule_id, "La cellule de destination")?;
    let transfer_date = required(&data.transfer_date, "La date du transfert")?;
    let reason = required(&data.reason, "Le motif")?;
    inmate_exists(pool, &inmate_id).await?;
    inmate_is_not_released(pool, &inmate_id).await?;
    cellule_exists(pool, &to_cellule_id).await?;

    let from_cellule_id: (String,) = sqlx::query_as("SELECT cellule_id FROM inmates WHERE id = ?")
        .bind(&inmate_id)
        .fetch_one(pool)
        .await
        .map_err(|error| error.to_string())?;
    if from_cellule_id.0 == to_cellule_id {
        return Err("La cellule de destination doit être différente de la cellule actuelle.".into());
    }

    let id = Uuid::new_v4().to_string();
    let mut transaction = pool.begin().await.map_err(|error| error.to_string())?;
    sqlx::query(
        "INSERT INTO inmate_transfers (id, inmate_id, from_cellule_id, to_cellule_id, transfer_date, reason, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&inmate_id)
    .bind(&from_cellule_id.0)
    .bind(&to_cellule_id)
    .bind(transfer_date)
    .bind(reason)
    .bind(data.notes.and_then(|value| (!value.trim().is_empty()).then_some(value.trim().to_string())))
    .execute(&mut *transaction)
    .await
    .map_err(|error| error.to_string())?;
    sqlx::query("UPDATE inmates SET cellule_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(&to_cellule_id)
        .bind(&inmate_id)
        .execute(&mut *transaction)
        .await
        .map_err(|error| error.to_string())?;
    transaction.commit().await.map_err(|error| error.to_string())?;

    get_transfer(pool, &id).await
}

pub async fn update_transfer(pool: &SqlitePool, id: &str, data: TransferInput) -> Result<Transfer, String> {
    let inmate_id = required(&data.inmate_id, "La détenue")?;
    let to_cellule_id = required(&data.to_cellule_id, "La cellule de destination")?;
    let transfer_date = required(&data.transfer_date, "La date du transfert")?;
    let reason = required(&data.reason, "Le motif")?;
    inmate_exists(pool, &inmate_id).await?;
    cellule_exists(pool, &to_cellule_id).await?;

    let transfer = get_transfer(pool, id).await?;
    if transfer.inmate_id != inmate_id {
        return Err("La détenue ne peut pas être modifiée sur un transfert existant.".into());
    }
    if transfer.from_cellule_id == to_cellule_id {
        return Err("La cellule de destination doit être différente de la cellule d'origine.".into());
    }

    let mut transaction = pool.begin().await.map_err(|error| error.to_string())?;
    sqlx::query(
        "UPDATE inmate_transfers SET to_cellule_id = ?, transfer_date = ?, reason = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    )
    .bind(&to_cellule_id)
    .bind(transfer_date)
    .bind(reason)
    .bind(data.notes.and_then(|value| (!value.trim().is_empty()).then_some(value.trim().to_string())))
    .bind(id)
    .execute(&mut *transaction)
    .await
    .map_err(|error| error.to_string())?;
    sqlx::query("UPDATE inmates SET cellule_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(&to_cellule_id)
        .bind(&inmate_id)
        .execute(&mut *transaction)
        .await
        .map_err(|error| error.to_string())?;
    transaction.commit().await.map_err(|error| error.to_string())?;

    get_transfer(pool, id).await
}

pub async fn delete_transfer(pool: &SqlitePool, id: &str) -> Result<(), String> {
    let result = sqlx::query("DELETE FROM inmate_transfers WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|error| error.to_string())?;
    if result.rows_affected() == 0 {
        return Err("Transfert introuvable.".into());
    }
    Ok(())
}
