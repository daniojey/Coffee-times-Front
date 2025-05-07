import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

import { AuthContext } from "../../AuthContext";

import DynamicImages from "../../components/UI/images/DynamicImages";
import GoggleIcon from "../../components/UI/icons/GoggleIcon/GoggleIcon";
import "./RegistrationPage.css";

function RegistrationPage() {
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [formError, setFormError] = useState('');
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const { registration, error } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password1 !== password2) {
            alert("Паролі не співпадають!");
            return;
        }

        if (password1.length < 8 || password2.length < 8) {
            alert('Пароль повинен містити не менше 8 символів')
        }

        const success = registration(username, phone, password1, password2)

        if (success) {
            console.log('Registaration successful!');
            navigate('/');
        } else {
            console.log('Registration failed!');
        }
    }


    return (
        <div className="base-registration-container">
            <div className="registration-form-container">
                <form id='registration-form' onSubmit={handleSubmit}>
                    <h3>Sign Up</h3>
                    <p className="second-title">Do you have an account? <Link className="signuplink">Login</Link></p>

                    <input 
                    type="text"
                     name="username" 
                     className="registration-form-control" 
                     placeholder="Логін" 
                     id="username" 
                     maxLength="100" 
                     autoFocus="" 
                     onChange={(e) => setUsername(e.target.value)}
                     required=""></input>

                    <input 
                    type="text" 
                    name="phone" 
                    className="registration-form-control" 
                    placeholder="Номер телефону" 
                    id="phone" 
                    maxLength="20" 
                    onChange={(e) => setPhone(e.target.value)}
                    required=""></input>

                    <input 
                    type="password" 
                    name="password1" 
                    className="registration-form-control" 
                    placeholder="Пароль" 
                    id="password1"
                    onChange={(e) => setPassword1(e.target.value)} 
                    required=""></input>

                    <input 
                    type="password" 
                    name="password2" 
                    className="registration-form-control" 
                    placeholder="Повторіть пароль" 
                    id="password2"
                    onChange={(e) => setPassword2(e.target.value)}
                    required=""></input>

                    <button type="submit" className="registrer-submit-btn">create account</button>

                    <div className="or">
                        <div className="line"></div>
                        <p id="or">OR</p>
                    </div>

                    <a className='registration-google-login'>
                        <GoggleIcon />
                    </a>
                </form>
            </div>


            <div className="image-container">
                <DynamicImages imageName="CoffehouseImage" className="image"/>
            </div>


        </div>
    )
}

export default RegistrationPage;