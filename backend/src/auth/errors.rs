use actix_web::ResponseError;
use custom_error::custom_error;

custom_error!{pub GoogleAuthError
    NetworkError{source: reqwest::Error} = "Failed to get response from google api: {source}"
}

custom_error!{pub JwtTokenError
    TokenGenerationError{source: frank_jwt::error::Error} = "Failed to generate jwt token: {source}"
}

impl ResponseError for GoogleAuthError {
}

impl ResponseError for JwtTokenError {
}
