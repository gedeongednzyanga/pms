use sqlx::SqlitePool;

use crate::{auth::session, models::{pagination::PaginatedResponse, user::{
    AuthSession, LoginRequest, User, UserInput, UserWithPassword,
}}};

use crate::auth::password::verify_password;

pub async fn create_default_admin(
    pool: &SqlitePool,
) -> Result<(), String> {

    let exists: Option<(String,)> = sqlx::query_as(
        r#"
        SELECT id
        FROM users
        WHERE user_name = ?
        LIMIT 1
        "#
    )
    .bind("admin")
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())?;

    if exists.is_some() {
        return Ok(());
    }

    let password_hash =
        crate::auth::password::hash_password(
            "admin123"
        )?;

    sqlx::query(
        r#"
        INSERT INTO users (
            id,
            first_name,
            last_name,
            user_name,
            password
        )
        VALUES (?, ?, ?, ?, ?)
        "#
    )
    .bind("U001")
    .bind("Admin")
    .bind("PMS")
    .bind("admin")
    .bind(password_hash)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}


pub async fn create_user(
    pool: &SqlitePool,
    data: UserInput,
) -> Result<User, String> {

    let user_name = data.user_name.trim();

    if user_name.is_empty() {
        return Err("Le nom d'utilisateur est obligatoire".into());
    }

    // Vérifier si le username existe déjà
    let exists: Option<(i64,)> = sqlx::query_as(
        "SELECT id FROM users WHERE user_name = ? LIMIT 1"
    )
    .bind(user_name)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())?;

    if exists.is_some() {
        return Err("Ce nom d'utilisateur existe déjà".into());
    }

    let id: i64 = sqlx::query_scalar(
        "SELECT COALESCE(MAX(id), 0) + 1 FROM users"
    )
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())?;

    let now = chrono::Local::now()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();

    sqlx::query(
        r#"
        INSERT INTO users (
            id,
            first_name,
            last_name,
            user_name,
            password,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(id)
    .bind(data.first_name)
    .bind(data.last_name)
    .bind(user_name)
    .bind(data.password)
    .bind(&now)
    .bind(&now)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    get_user_by_id(pool, id).await
}

pub async fn get_user_by_id(
    pool: &SqlitePool,
    id: i64,
) -> Result<User, String> {

    sqlx::query_as::<_, User>(
        r#"
        SELECT
            id,
            first_name,
            last_name,
            user_name,
            password,
            created_at,
            updated_at
        FROM users
        WHERE id = ?
        LIMIT 1
        "#
    )
    .bind(id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Utilisateur introuvable : {}", e))
}

pub async fn update_user(
    pool: &SqlitePool,
    id: i64,
    data: UserInput,
) -> Result<User, String> {

    let user_name = data.user_name.trim();

    if user_name.is_empty() {
        return Err("Le nom d'utilisateur est obligatoire".into());
    }

    // Vérifier que le username n'est pas utilisé par un autre utilisateur
    let exists: Option<(i64,)> = sqlx::query_as(
        r#"
        SELECT id
        FROM users
        WHERE user_name = ?
          AND id != ?
        LIMIT 1
        "#
    )
    .bind(user_name)
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())?;

    if exists.is_some() {
        return Err("Ce nom d'utilisateur est déjà utilisé".into());
    }

    let now = chrono::Local::now()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();

    // Si password est None, on conserve l'ancien
    if let Some(password) = data.password {
        sqlx::query(
            r#"
            UPDATE users
            SET
                first_name = ?,
                last_name = ?,
                user_name = ?,
                password = ?,
                updated_at = ?
            WHERE id = ?
            "#
        )
        .bind(data.first_name)
        .bind(data.last_name)
        .bind(user_name)
        .bind(password)
        .bind(&now)
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    } else {
        sqlx::query(
            r#"
            UPDATE users
            SET
                first_name = ?,
                last_name = ?,
                user_name = ?,
                updated_at = ?
            WHERE id = ?
            "#
        )
        .bind(data.first_name)
        .bind(data.last_name)
        .bind(user_name)
        .bind(&now)
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    }

    get_user_by_id(pool, id).await
}

pub async fn authenticate(
    pool: &SqlitePool,
    data: LoginRequest,
) -> Result<AuthSession, String> {

    let user = sqlx::query_as::<_, UserWithPassword>(
        r#"
        SELECT
            id,
            first_name,
            last_name,
            user_name,
            password,
            created_at,
            updated_at
        FROM users
        WHERE user_name = ?
        LIMIT 1
        "#
    )
    .bind(data.user_name.trim())
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())?;

    let user = match user {
        Some(user) => user,

        None => {
            return Err(
                "Nom d'utilisateur ou mot de passe incorrect"
                    .into()
            );
        }
    };

    let stored_password =
        user.password
            .as_deref()
            .unwrap_or("");

    let valid =
        verify_password(
            &data.password,
            stored_password,
        )?;

    if !valid {
        return Err(
            "Nom d'utilisateur ou mot de passe incorrect"
                .into()
        );
    }

    let public_user = User {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        user_name: user.user_name,
        created_at: user.created_at,
        updated_at: user.updated_at,
    };

    session::create_session(
        pool,
        public_user,
    )
    .await
}

// Netoyqge de session
pub async fn cleanup_sessions(
    pool: &SqlitePool,
) -> Result<(), String> {

    sqlx::query(
        r#"
        DELETE FROM sessions
        WHERE expires_at < ?
        "#
    )
    .bind(chrono::Utc::now().to_rfc3339())
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub async fn delete_user(
    pool: &SqlitePool,
    id: i64,
) -> Result<(), String> {

    let result = sqlx::query(
        "DELETE FROM users WHERE id = ?"
    )
    .bind(id)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    if result.rows_affected() == 0 {
        return Err("Utilisateur introuvable".into());
    }

    Ok(())
}

pub async fn get_users(
    pool: &SqlitePool,
    page: i64,
    per_page: i64,
    search: Option<String>,
) -> Result<PaginatedResponse<User>, String> {

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
        FROM users
        WHERE
            ? = ''
            OR first_name LIKE ?
            OR last_name LIKE ?
            OR user_name LIKE ?
        "#
    )
    .bind(&search)
    .bind(&pattern)
    .bind(&pattern)
    .bind(&pattern)
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())?;

    let users = sqlx::query_as::<_, User>(
        r#"
        SELECT
            id,
            first_name,
            last_name,
            user_name,
            password,
            created_at,
            updated_at
        FROM users
        WHERE
            ? = ''
            OR first_name LIKE ?
            OR last_name LIKE ?
            OR user_name LIKE ?
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        "#
    )
    .bind(&search)
    .bind(&pattern)
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