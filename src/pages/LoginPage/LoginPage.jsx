import React, { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";

import { AuthContext } from "../../AuthContext";
import GoggleIcon from "../../components/UI/icons/GoggleIcon/GoggleIcon";

import "./LoginPage.css";

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, error } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted:', { username, password})
        const success = await login(username, password);

        if (success) {
            console.log('Login successful!');
            navigate('/'); // Redirect to the profile page or perform any other action
            // Redirect to the profile page or perform any other action
        } else {
            console.log('Login failed!');
        }
    }

    return (
        <div className='base-container'>
            <div className='form-container'>
                <form onSubmit={handleSubmit}>
                    <h3>Welcome Back!</h3>
                    <p className='second-title'>Don`n have account yet? <Link className='signuplink' to="/registration">Sign Up</Link></p>

                    <p className="form-label">
                        <input 
                        type="text" 
                        id='username' 
                        name='username' 
                        placeholder='Логін aбо номер телефону' 
                        className='form-input' 
                        onChange={(e) => setUsername(e.target.value)}
                        autoFocus/>
                    </p>

                    <p className="form-label">
                        <input 
                        type="password" 
                        id='password' 
                        name='password' 
                        placeholder='Пароль'
                        onChange={(e) => setPassword(e.target.value)} 
                        className='form-input'/>
                    </p>
                    
                    <button type='submit' className='submit-btn'>Увійти</button>

                    <div className="or">
                        <div className="line"></div>
                        <p id="or">OR</p>
                    </div>

                    <a className='google-login'>
                        <GoggleIcon />
                    </a>

                </form>
            </div>

            {/* { error && <div className="error-popup">{ error }</div>} */}
        </div>
    )
}

export default LoginPage