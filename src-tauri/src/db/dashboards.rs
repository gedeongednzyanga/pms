use sqlx::SqlitePool;

use crate::models::dashboard::{
    DashboardActivity,
    DashboardStats,
    LatestPrisoner,
    PrisonerEvolution,
};


// ============================================================
// STRUCTURES INTERNES SQLX
// ============================================================

#[derive(Debug, sqlx::FromRow)]
struct PrisonerEvolutionRow {
    month: String,
    prisonniers: i64,
}


// ============================================================
// DASHBOARD
// ============================================================

pub async fn get_dashboard_stats(
    pool: &SqlitePool,
) -> Result<DashboardStats, String> {

    // =========================================================
    // STATISTIQUES GENERALES
    // =========================================================

    let total_inmates: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*)
        FROM inmates
        "#
    )
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Erreur total détenus : {}", e))?;


    let total_male: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*)
        FROM inmates
        WHERE LOWER(sex) IN ('male', 'homme', 'masculin')
        "#
    )
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Erreur total hommes : {}", e))?;


    let total_female: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*)
        FROM inmates
        WHERE LOWER(sex) IN ('female', 'femme', 'féminin')
        "#
    )
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Erreur total femmes : {}", e))?;


    // =========================================================
    // PRISONS
    // =========================================================

    let total_prisons: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*)
        FROM prisons
        WHERE statut_prison = 'active'
        "#
    )
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Erreur total prisons : {}", e))?;


    // =========================================================
    // CELLULES
    // =========================================================

    let total_cells: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*)
        FROM cellules
        WHERE statut_cellule = 'active'
        "#
    )
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Erreur total cellules : {}", e))?;


    // =========================================================
    // CRIMES
    // =========================================================

    let total_crimes: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*)
        FROM crimes
        WHERE statut_crime = 'active'
        "#
    )
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Erreur total crimes : {}", e))?;


    // =========================================================
    // CAPACITE TOTALE DES CELLULES
    // =========================================================

    let total_capacity: i64 = sqlx::query_scalar(
        r#"
        SELECT COALESCE(SUM(capacity), 0)
        FROM cellules
        WHERE statut_cellule = 'active'
        "#
    )
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Erreur capacité cellules : {}", e))?;


    // =========================================================
    // PLACES DISPONIBLES
    // =========================================================

    let available_capacity =
        (total_capacity - total_inmates).max(0);


    // =========================================================
    // CELLULES OCCUPEES
    // =========================================================

    let occupied_cells: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(DISTINCT cellule_id)
        FROM inmates
        "#
    )
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Erreur cellules occupées : {}", e))?;


    // =========================================================
    // EVOLUTION DES DETENUS
    // =========================================================

    let prisoners_evolution_rows =
        sqlx::query_as::<_, PrisonerEvolutionRow>(
            r#"
            SELECT
                strftime('%Y-%m', created_at) AS month,
                COUNT(*) AS prisonniers

            FROM inmates

            GROUP BY strftime('%Y-%m', created_at)

            ORDER BY month ASC

            LIMIT 12
            "#
        )
        .fetch_all(pool)
        .await
        .map_err(|e| {
            format!("Erreur évolution détenus : {}", e)
        })?;


    let prisoners_evolution = prisoners_evolution_rows
        .into_iter()
        .map(|row| {

            // row.month = "2026-08"
            let month_number =
                row.month
                    .split('-')
                    .nth(1)
                    .unwrap_or("");


            let month = match month_number {

                "01" => "Jan",
                "02" => "Fév",
                "03" => "Mar",
                "04" => "Avr",
                "05" => "Mai",
                "06" => "Juin",
                "07" => "Juil",
                "08" => "Août",
                "09" => "Sep",
                "10" => "Oct",
                "11" => "Nov",
                "12" => "Déc",

                _ => month_number,
            };


            PrisonerEvolution {
                month: month.to_string(),
                prisonniers: row.prisonniers,
            }
        })
        .collect();


    // =========================================================
    // DERNIERS DETENUS
    // =========================================================

    let latest_prisoners =
        sqlx::query_as::<_, LatestPrisoner>(
            r#"
            SELECT

                i.id AS id,

                TRIM(
                    i.firstname || ' ' ||
                    COALESCE(
                        CASE
                            WHEN i.middlename IS NOT NULL
                                 AND TRIM(i.middlename) != ''
                            THEN i.middlename || ' '
                            ELSE ''
                        END,
                        ''
                    ) ||
                    i.lastname
                ) AS name,

                i.code AS matricule,

                CASE
                    WHEN LOWER(i.sex) IN (
                        'male',
                        'homme',
                        'masculin'
                    )
                    THEN 'Masculin'

                    WHEN LOWER(i.sex) IN (
                        'female',
                        'femme',
                        'féminin'
                    )
                    THEN 'Féminin'

                    ELSE i.sex
                END AS gender,

                COALESCE(
                    p.prison_name,
                    'Non défini'
                ) AS prison,

                CASE

                    WHEN c.code IS NOT NULL
                         AND TRIM(c.code) != ''
                         AND c.cellule_name IS NOT NULL
                         AND TRIM(c.cellule_name) != ''

                    THEN c.code || ' - ' || c.cellule_name

                    WHEN c.cellule_name IS NOT NULL
                         AND TRIM(c.cellule_name) != ''

                    THEN c.cellule_name

                    WHEN c.code IS NOT NULL
                         AND TRIM(c.code) != ''

                    THEN c.code

                    ELSE 'Non définie'

                END AS cell,

                i.created_at AS date

            FROM inmates i

            LEFT JOIN cellules c
                ON c.id = i.cellule_id

            LEFT JOIN prisons p
                ON CAST(p.id AS TEXT)
                 = CAST(c.prison_id AS TEXT)

            ORDER BY datetime(i.created_at) DESC

            LIMIT 5
            "#
        )
        .fetch_all(pool)
        .await
        .map_err(|e| {
            format!("Erreur derniers détenus : {}", e)
        })?;


    // =========================================================
    // ACTIVITES RECENTES
    //
    // Comme tu n'as pas encore de table activities/logs,
    // on utilise les derniers détenus enregistrés.
    // =========================================================

    let activities = latest_prisoners
        .iter()
        .take(4)
        .map(|prisoner| {

            DashboardActivity {

                title:
                    "Nouvel enregistrement".to_string(),

                description:
                    format!(
                        "{} a été enregistré",
                        prisoner.name
                    ),

                time:
                    format_dashboard_time(
                        &prisoner.date
                    ),
            }

        })
        .collect();


    // =========================================================
    // RESULTAT
    // =========================================================

    Ok(DashboardStats {

        total_inmates,

        total_male,

        total_female,

        total_prisons,

        total_cells,

        total_crimes,

        total_capacity,

        occupied_cells,

        available_capacity,

        prisoners_evolution,

        latest_prisoners,

        activities,
    })
}


// ============================================================
// FORMATAGE DU TEMPS
// ============================================================

fn format_dashboard_time(
    date: &str,
) -> String {

    use chrono::{
        NaiveDateTime,
        Utc,
    };


    let Ok(created) =
        NaiveDateTime::parse_from_str(
            date,
            "%Y-%m-%d %H:%M:%S",
        )
    else {
        return date.to_string();
    };


    let now =
        Utc::now().naive_utc();


    let duration =
        now.signed_duration_since(
            created
        );


    if duration.num_seconds() < 60 {

        "À l'instant".to_string()

    } else if duration.num_minutes() < 60 {

        format!(
            "Il y a {} min",
            duration.num_minutes()
        )

    } else if duration.num_hours() < 24 {

        format!(
            "Il y a {}h",
            duration.num_hours()
        )

    } else if duration.num_days() == 1 {

        "Hier".to_string()

    } else if duration.num_days() < 7 {

        format!(
            "Il y a {} jours",
            duration.num_days()
        )

    } else {

        created
            .format("%d/%m/%Y")
            .to_string()
    }
}