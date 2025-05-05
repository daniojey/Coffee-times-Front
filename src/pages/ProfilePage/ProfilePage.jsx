import React, { useContext } from "react";

import { AuthContext } from "../../AuthContext";

function ProfilePage() {
    const { user, logout } = useContext(AuthContext)

    return (
        <div className="base-container">
            {user && <button onClick={logout}>Выйти</button>}
            <h1>Профіль</h1> 
        </div>
    )
}

export default ProfilePage