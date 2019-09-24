import React from "react";
import { GoogleLogin } from 'react-google-login';


const responseGoogle = (response: any) => {
    console.log(response);
}

const Signin: React.FC = () => {
    return (
        <div>
            <GoogleLogin
                clientId=""
                buttonText="Login"
                onSuccess={responseGoogle}
                onFailure={responseGoogle}
                cookiePolicy={'single_host_origin'}
            />
        </div>
    );
};

export default Signin;