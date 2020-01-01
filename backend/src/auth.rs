use actix_web::{get, HttpResponse, Error, web::Json, ResponseError};
use serde_derive::{Deserialize, Serialize};
use custom_error::custom_error;
use frank_jwt::{Algorithm, encode};

use crate::config::get_app_secret;

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

custom_error!{GoogleAuthError
    NetworkError{source: reqwest::Error} = "Failed to get response from google api: {source}"
}

custom_error!{JwtTokenError
    TokenGenerationError{source: frank_jwt::error::Error} = "Failed to generate jwt token: {source}"
}

impl ResponseError for GoogleAuthError {
}

impl ResponseError for JwtTokenError {
}

#[get("/auth/")]
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
        .map_err(|err| GoogleAuthError::from(err))
}

fn generate_jwt_token(account: GoogleAuthResult) -> Result<String, JwtTokenError> {
    let mut payload = json!({
        "user_email": account.email
    });

    let mut header = json!({});

    encode(header, &get_app_secret(), &payload, Algorithm::RS256)
        .map_err(|err| JwtTokenError::from(err))
}