import { GOOGLE_CLIENT_ID } from './config';

function initGapi(): Promise<void> {
    return gapi.client.init({
        clientId: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/userinfo.email'
    }).then(() => {});
}

export const loadGapi = () => new Promise<void>((resolve, _) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => gapi.load('client:auth2', () => initGapi().then(resolve));
});