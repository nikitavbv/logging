import React, { FunctionComponent } from "react";

type AuthProps = {
    loadGapi: () => Promise<void>
}

export const Auth: FunctionComponent<AuthProps> = ({ loadGapi }) => {
    loadGapi();

    return (
        <div>
            auth
        </div>
    )
};