import React from "react";

type AuthProps = {
    loadGapi: () => Promise<void>
}

function updateAuthStatus(status: boolean) {
    console.log('updateSigninStatus:', status);
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
            googleAuth.isSignedIn.listen(updateAuthStatus);
            const user = googleAuth.currentUser.get();
            
            console.log(this.state);

            this.setState({
                ...this.state,
                authorized: user.hasGrantedScopes('https://www.googleapis.com/auth/userinfo.email')
            });
        });
    }

    render() {
        if (this.state.authorized === undefined) {
            return (<div>checking authorization...</div>);
        }

        if (this.state.authorized) {
            return (<div>already authorized</div>);
        }

        return (<div>not authorized yet</div>);
    }
}
