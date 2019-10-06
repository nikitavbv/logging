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
                <button onClick={this.signIn}>Sign In</button>
            </div>
        );
    }

    signIn() {
        const googleAuth = gapi.auth2.getAuthInstance();
        googleAuth.signIn();
    }

    updateAuthStatus(googleAuth: gapi.auth2.GoogleAuth) {
        const user = googleAuth.currentUser.get();
        this.setState({
            ...this.state,
            authorized: user.hasGrantedScopes('https://www.googleapis.com/auth/userinfo.email')
        })
    }
}
