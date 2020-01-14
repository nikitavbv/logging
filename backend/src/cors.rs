use std::pin::Pin;
use std::task::{Context, Poll};

use actix_service::{Service, Transform};
use actix_web::{dev::ServiceRequest, dev::ServiceResponse, Error, HttpResponse, http::header, http::Method};
use futures::future::{ok, Ready};
use futures::Future;

pub struct Cors;

impl<S, B> Transform<S> for Cors
    where
        S: Service<Request = ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
        S::Future: 'static,
        B: 'static,
{
    type Request = ServiceRequest;
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = CorsMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(CorsMiddleware{ service })
    }
}

pub struct CorsMiddleware<S> {
    service: S,
}

impl <S, B> Service for CorsMiddleware<S>
where
    S: Service<Request = ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static
{
    type Request = ServiceRequest;
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&mut self, req: ServiceRequest) -> Self::Future {
        if req.method() == Method::OPTIONS {
            return Box::pin(async move {
                Ok(req.into_response(
                    HttpResponse::Ok()
                        .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:3000")
                        .header(header::ACCESS_CONTROL_ALLOW_HEADERS, "*")
                        .header(header::ACCESS_CONTROL_ALLOW_METHODS, "*")
                        .finish()
                        .into_body()
                ))
            })
        }

        let fut = self.service.call(req);

        Box::pin(async move {
            Ok(fut.await?)
        })
    }
}