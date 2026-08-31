use serde::{Deserialize, Serialize};
// use sqlx::SqlitePool;


// ============================================================
// STRUCTURES RETOURNEES AU FRONTEND
// ============================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardStats {
    pub total_inmates: i64,
    pub total_male: i64,
    pub total_female: i64,

    pub total_prisons: i64,
    pub total_cells: i64,
    pub total_crimes: i64,

    pub total_capacity: i64,
    pub occupied_cells: i64,
    pub available_capacity: i64,

    pub prisoners_evolution: Vec<PrisonerEvolution>,
    pub latest_prisoners: Vec<LatestPrisoner>,
    pub activities: Vec<DashboardActivity>,
}


#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct LatestPrisoner {
    pub id: String,
    pub name: String,
    pub matricule: String,
    pub gender: String,
    pub prison: String,
    pub cell: String,
    pub date: String,
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardActivity {
    pub title: String,
    pub description: String,
    pub time: String,
}


// ============================================================
// STRUCTURES INTERNES POUR SQLX
// ============================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrisonerEvolution {
    pub month: String,
    pub prisonniers: i64,
}


// #[derive(Debug, sqlx::FromRow)]
// pub struct LatestPrisonerRow {
//     id: String,
//     name: String,
//     matricule: String,
//     gender: String,
//     prison: String,
//     cell: String,
//     date: String,
// }