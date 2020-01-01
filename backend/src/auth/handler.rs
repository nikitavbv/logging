use actix_web::{HttpResponse, Error, post, web::Json};
use serde_derive::{Serialize, Deserialize};
use frank_jwt::{encode, Algorithm};

use crate::config::get_app_secret;
use super::identity::Identity;
use super::errors::{GoogleAuthError, JwtTokenError};

#[derive(Deserialize)]
struct AuthRequest {
    access_token: String,
}

#[derive(Deserialize)]
struct GoogleAuthResult {
    id: String,
    email: String,
    name: String,
}

#[derive(Serialize)]
struct AuthResponse {
    token: String
}

#[post("/auth/")]
pub async fn auth_index(req: Json<AuthRequest>) -> Result<HttpResponse, Error> {
    let account_info = get_account_info_by_token(&req.access_token).await?;
    let token = generate_jwt_token(account_info)?;
    Ok(HttpResponse::Ok().json(AuthResponse {
        token
    }))
}

async fn get_account_info_by_token(access_token: &str) -> Result<GoogleAuthResult, GoogleAuthError> {
    reqwest::get("https://www.googleapis.com/oauth2/v1/userinfo?alt=json")
        .await?
        .json()
        .await
        .map_err(GoogleAuthError::from)
}

fn generate_jwt_token(account: GoogleAuthResult) -> Result<String, JwtTokenError> {
    let mut payload = json!(Identity {
        user_email: account.email
    });

    let mut header = json!({});

    encode(header, &get_app_secret(), &payload, Algorithm::HS256)
        .map_err(JwtTokenError::from)
}