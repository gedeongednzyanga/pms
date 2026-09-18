use sqlx::SqlitePool;

use crate::models::plainte::Plainte;

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct PrisonerReportRow {
    pub full_name: String,
    pub sex: String,
    pub dob: String,
    pub address: String,
    pub marital_status: String,
    pub cellule: String,
}

pub async fn get_prisoners_report_rows(
    pool: &SqlitePool,
) -> Result<Vec<PrisonerReportRow>, String> {
    sqlx::query_as::<_, PrisonerReportRow>(
        r#"
        SELECT
            TRIM(i.firstname || ' ' || COALESCE(i.middlename || ' ', '') || i.lastname) AS full_name,
            i.sex,
            i.dob,
            i.address,
            i.marital_status,
            COALESCE(p.prison_name || ' — ', '') || COALESCE(c.code, c.cellule_name) AS cellule
        FROM inmates i
        INNER JOIN cellules c ON c.id = i.cellule_id
        LEFT JOIN prisons p ON p.id = c.prison_id
        LEFT JOIN releases r ON r.inmate_id = i.id
        WHERE r.id IS NULL
        ORDER BY i.lastname COLLATE NOCASE, i.firstname COLLATE NOCASE
        "#,
    )
    .fetch_all(pool)
    .await
    .map_err(|error| error.to_string())
}

pub async fn get_plaintes_report_rows(
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
        ORDER BY date_faits DESC, created_at DESC
        "#,
    )
    .fetch_all(pool)
    .await
    .map_err(|e| {
        format!(
            "Erreur lors de la récupération des plaintes pour le rapport : {}",
            e
        )
    })
}
