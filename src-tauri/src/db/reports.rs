use sqlx::SqlitePool;

use crate::models::{inmate::InmateFiche, plainte::Plainte};

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

pub async fn get_plaintes_report_rows_by_date_range(
    pool: &SqlitePool,
    date_debut: &str,
    date_fin: &str,
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
        WHERE date_faits >= ?1
          AND date_faits <= ?2
        ORDER BY date_faits DESC, created_at DESC
        "#,
    )
    .bind(date_debut)
    .bind(date_fin)
    .fetch_all(pool)
    .await
    .map_err(|e| {
        format!(
            "Erreur lors de la récupération des plaintes pour la période {} - {} : {}",
            date_debut,
            date_fin,
            e
        )
    })
}

// pub async fn get_plaintes_report_rows(
//     pool: &SqlitePool,
// ) -> Result<Vec<Plainte>, String> {
//     sqlx::query_as::<_, Plainte>(
//         r#"
//         SELECT
//             id,
//             objet,
//             description,
//             date_faits,
//             lieu_faits,
//             statut,
//             created_at,
//             updated_at
//         FROM plaintes
//         ORDER BY date_faits DESC, created_at DESC
//         "#,
//     )
//     .fetch_all(pool)
//     .await
//     .map_err(|e| {
//         format!(
//             "Erreur lors de la récupération des plaintes pour le rapport : {}",
//             e
//         )
//     })
// }


pub async fn get_inmate_for_fiche(
    pool: &SqlitePool,
    inmate_id: &str,
) -> Result<InmateFiche, String> {
    let inmate = sqlx::query_as::<_, InmateFiche>(
        r#"
        SELECT
            i.id,

            i.firstname,
            i.middlename,
            i.lastname,

            i.dob,
            i.sex,
            i.address,
            i.marital_status,

            i.arreter_par,
            i.lieu_arreter,

            i.date_from,
            i.date_to,

            i.emergency_name,
            i.emergency_relation,
            i.emergency_contact,

            i.photo_path,

            i.created_at,
            i.updated_at,

            i.cellule_id,
            c.cellule_name

        FROM inmates i

        LEFT JOIN cellules c
            ON c.id = i.cellule_id

        WHERE i.id = ?

        LIMIT 1
        "#,
    )
    .bind(inmate_id)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("Erreur lors de la récupération du détenu : {}", e))?;

    inmate.ok_or_else(|| {
        format!(
            "Aucun détenu trouvé avec l'identifiant : {}",
            inmate_id
        )
    })
}