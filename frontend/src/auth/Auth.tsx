import React from "react";

type AuthProps = {
    loadGapi: () => Promise<void>
}

function updateAuthStatus(status: boolean) {
    console.log('updateSigninStatus:', status);
}

function setAuthStatus(user: gapi.auth2.GoogleUser) {
    const isAuthorized = user.hasGrantedScopes('https://www.googleapis.com/auth/userinfo.email');
    if (isAuthorized) {
    }
}

export class Auth extends React.Component<AuthProps> {
    constructor(props: AuthProps) {
        super(props);

        props.loadGapi().then(() => {
            const googleAuth = gapi.auth2.getAuthInstance();
            googleAuth.isSignedIn.listen(updateAuthStatus);
            const user = googleAuth.currentUser.get();
            setAuthStatus(user);
        });
    }

    render() {
        return (
            <div>auth2</div>
        );
    }
}
