import React from "react";

type AuthProps = {
    loadGapi: () => Promise<void>
}

class AuthState {
    authorized?: boolean = undefined;
}

export class Auth extends React.Component<AuthProps> {
    state: AuthState;

    constructor(props: AuthProps) {
        super(props);

        this.state = new AuthState();

        props.loadGapi().then(() => {
            const googleAuth = gapi.auth2.getAuthInstance();
            googleAuth.isSignedIn.listen(
                this.updateAuthStatus.bind(this, googleAuth)
            );
            this.updateAuthStatus(googleAuth);
        });
    }

    render() {
        if (this.state.authorized === undefined) {
            return (<div>checking authorization...</div>);
        }

        if (this.state.authorized) {
            return (<div>already authorized</div>);
        }

        return (
            <div>
                <h1>Sign in</h1>
                <img className="signin-btn" onClick={this.signIn} src={require("./google_signin.png")} alt="Sign in with Google" />
            </div>
        );
    }

    signIn() {
        const googleAuth = gapi.auth2.getAuthInstance();
        googleAuth.signIn();
    }

    updateAuthStatus(googleAuth: gapi.auth2.GoogleAuth) {
        const user = googleAuth.currentUser.get();

        const authorized = user.hasGrantedScopes('https://www.googleapis.com/auth/userinfo.email');

        this.setState({
            ...this.state,
            authorized
        })

        if (authorized) {
            this.sendTokenToBackend(user.getAuthResponse().access_token);
        }
    }

    sendTokenToBackend(access_token: string) {
        fetch('/api/v1/auth', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                access_token
            })
        }).then(() => window.location.href = '/home');
    }
}
