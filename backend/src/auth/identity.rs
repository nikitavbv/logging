use std::pin::Pin;

use actix_web::{Error, FromRequest, HttpRequest, ResponseError};
use custom_error::custom_error;
use frank_jwt::{decode, Algorithm, ValidationOptions};

use futures::future::Future;
use actix_web::dev::Payload;
use serde_derive::{Serialize, Deserialize};

use crate::config::get_app_secret;

#[derive(Serialize, Deserialize, Clone)]
pub struct Identity {
    pub user_email: String,
}

custom_error!{IdentityError
    Unauthorized = "unauthorized",
    TokenDecodeError{source: frank_jwt::Error} = "token decode error",
    TokenDeserializeError{source: serde_json::Error} = "token deserialize error"
}

impl ResponseError for IdentityError {
}

impl FromRequest for Identity {
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<Identity, Error>>>>;
    type Config = ();

    fn from_request(req: &HttpRequest, payload: &mut Payload) -> Self::Future {
        let auth_token = req.headers().clone().get("x-auth-token")
            .and_then(|v| v.to_str().ok().map(|s| s.to_string()));

        Box::pin(async move {
            let auth_token = match auth_token {
                Some(v) => v,
                None => return Err(Error::from(IdentityError::Unauthorized {}))
            };

            let identity = decode_token(&auth_token).map_err(Error::from)?;

            Ok(identity)
        })
    }
}

fn decode_token(token: &str) -> Result<Identity, IdentityError> {
    let (_, payload) = decode(
        token,
        &get_app_secret(),
        Algorithm::HS256,
        &ValidationOptions::default()
    ).map_err(IdentityError::from)?;

    Ok(serde_json::from_value(payload).map_err(IdentityError::from)?)
}
