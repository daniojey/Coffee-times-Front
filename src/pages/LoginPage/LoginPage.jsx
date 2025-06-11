import React, { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from 'yup';

import { AuthContext } from "../../AuthContext";
import GoggleIcon from "../../components/UI/icons/GoggleIcon/GoggleIcon";

import "./LoginPage.css";
import { yupResolver } from "@hookform/resolvers/yup";

function LoginPage() {
    const { login, error } = useContext(AuthContext);
    const navigate = useNavigate();

    // const smartRegister = (name) => ({
    //     ...register(name),
    //     onBlur: async (e) => {
    //         console.log(e.target.value)
    //     },
    //     onChange: async (e) => {
    //         console.log(e.target.value)
    //     }
    // })

    const schema = yup.object().shape({
        username: yup
            .string()
            .min(2, 'Минимум 2 символа')
            .required('Email обязателен')
            .test('opti', 'Нужна хотя бы одна цифры в пароле', function (value) {
                console.log(value)
                const password = this.parent.password
                return true
            }),

        password: yup
            .string()
            .min(2, 'В пароле не может быть меньше чем 2 символа')
            .required('Email обязателен'),
    })

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm(
        { resolver: yupResolver(schema) }
    )

    const onSubmit = async (data) => {
        console.log("Данные", data);

        const success = await login(data["username"], data["password"]);

        if (success) {
            console.log('Login successful!');
            navigate('/');

        } else {
            console.log('Login failed!');
        }
    }

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     console.log('Form submitted:', { username, password})
    //     const success = await login(username, password);

    //     if (success) {
    //         console.log('Login successful!');
    //         navigate('/'); // Redirect to the profile page or perform any other action
    //         // Redirect to the profile page or perform any other action
    //     } else {
    //         console.log('Login failed!');
    //     }
    // }

    // {
    //     Object.entries(errors).length !== 0 && (
    //         <div>
    //             <ul className="list-disc pl-5">
    //                 {Object.entries(errors).map(([fieldName, error]) => (
    //                     <li key={fieldName}>
    //                         {fieldName} - {error.message} {/* Поле: {fieldName} - можно добавить при необходимости */}
    //                     </li>
    //                 ))}
    //             </ul>
    //         </div>
    //     )
    // }

    return (
        <div className='base-container'>
            <div className='form-login-container'>
                <form onSubmit={handleSubmit(onSubmit)} className="login-form" aria-label="Login form">
                    <h3>Welcome Back!</h3>

                    <p className='second-title'>Don`n have account yet? <Link className='signuplink' to="/registration">Sign Up</Link></p>

                    <p className="form-label">
                        <input
                            type="text"
                            {...register('username')}
                            id='username'
                            placeholder='Логін aбо номер телефону'
                            className='form-input'
                            autoFocus
                        />
                        {/* <input 
                        type="text" 
                        id='username' 
                        name='username' 
                        placeholder='Логін aбо номер телефону' 
                        className='form-input' 
                        onChange={(e) => setUsername(e.target.value)}
                        autoFocus/> */}
                    </p>

                    <p className="form-label">
                        <input
                            type="password"
                            {...register('password')}
                            id='password'
                            placeholder='Пароль'
                            className='form-input'
                        />
                        {/* <input 
                        type="password" 
                        id='password' 
                        name='password' 
                        placeholder='Пароль'
                        onChange={(e) => setPassword(e.target.value)} 
                        className='form-input'/> */}
                    </p>

                    <button type='submit' className='submit-btn'>Увійти</button>

                    <div className="or">
                        <div className="line"></div>
                        <p id="or">OR</p>
                    </div>

                    <a className='google-login__login'>
                        <GoggleIcon />
                    </a>

                </form>
            </div>

            {/* { error && <div className="error-popup">{ error }</div>} */}
        </div>
    )
}

export default LoginPage