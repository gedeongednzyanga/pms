use sqlx::SqlitePool;

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
