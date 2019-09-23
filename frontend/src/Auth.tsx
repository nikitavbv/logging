import React from "react";

const Signin: React.FC = () => {
    return (
        <div>
            <div className="g-signin2" data-onsuccess="onSignIn"></div>
        </div>
    );
};

export default Signin;