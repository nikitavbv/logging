import https from 'https';

import jwt from 'jsonwebtoken';

import { HttpStream, HttpMethod, HttpRequest } from "./api";
import config from './config';

type AuthRequest = {
    access_token: string
};

type GoogleAuthResult = {
    id: string,
    email: string,
    name: string,
};

type Token = {
    user_id: string,
};

export type AuthInfo = {
    user_id: string,
};

async function get_account_info_by_token(access_token: string): Promise<GoogleAuthResult> {
    return new Promise((resolve, _) => {
        https.get({
            hostname: 'www.googleapis.com',
            path: '/oauth2/v1/userinfo?alt=json',
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        }, response => {
            let result = '';
            response.on('data', chunk => {
                result += chunk;
            });
    
            response.on('end', () => {
                resolve(JSON.parse(result) as GoogleAuthResult);
            });
        });
    });
}

async function generate_jwt_token(account: GoogleAuthResult): Promise<string> {
    return new Promise((resolve, reject) => {
       jwt.sign({
           user_id: account.id,
       } as Token, config.app_secret, config.jwt_config, (error, token) => {
            if (error) {
                reject(error);
            } else {
                resolve(token);
            }
       });
    });
}

async function decode_jwt_token(token: string): Promise<Token> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.app_secret, config.jwt_config, (error, token) => {
            if (error) {
                reject(error);
            } else {
                resolve(token as Token);
            }
        });
    });
}

export const filter_authorization = async (req: HttpRequest): Promise<boolean> => {
    if (req.cookies === undefined) {
        return false;
    }
   
    const auth_cookie = req.cookies.auth;
    if (auth_cookie === undefined) {
        return false;
    }

    try {
        await decode_jwt_token(req.cookies.auth);
        return true;
    } catch(e) {
        return false;
    }
};

export const map_authorization = async (req: HttpRequest): Promise<HttpRequest> => {
    const token = await decode_jwt_token(req.cookies.auth);

    const authInfo = <AuthInfo> {
        user_id: token.user_id,
    };

    return new HttpRequest(req.url, req.method, req.body, req.cookies, req.callback, authInfo);
};

async function do_auth(req: HttpRequest) {
    const body: AuthRequest = req.body as AuthRequest;
    const account_info = await get_account_info_by_token(body.access_token);
    const token = await generate_jwt_token(account_info);
    req.ok({ status: 'ok' }, {
        'Set-Cookie': `auth=${token}`,
    });
}

export default (stream: HttpStream) => {
    stream.url('/').method(HttpMethod.POST).forEach(do_auth);
};