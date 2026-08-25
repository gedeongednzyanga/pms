use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
    pub total_pages: i64,
}

impl<T> PaginatedResponse<T> {
    pub fn new(
        data: Vec<T>,
        total: i64,
        page: i64,
        per_page: i64,
    ) -> Self {
        let total_pages = if total == 0 {
            0
        } else {
            (total + per_page - 1) / per_page
        };

        Self {
            data,
            total,
            page,
            per_page,
            total_pages,
        }
    }
}