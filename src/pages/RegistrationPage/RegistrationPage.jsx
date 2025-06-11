import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import * as yup from "yup";
import { useForm } from "react-hook-form";

import { AuthContext } from "../../AuthContext";

import DynamicImages from "../../components/UI/images/DynamicImages";
import GoggleIcon from "../../components/UI/icons/GoggleIcon/GoggleIcon";
import "./RegistrationPage.css";
import { yupResolver } from "@hookform/resolvers/yup";

function RegistrationPage() {
    const { registration, error } = useContext(AuthContext);
    const navigate = useNavigate();

    const shema = yup.object().shape({
        'username': yup
            .string()
            .required('Поле обязательное')
            .min(4, 'Логин не может быть меньше 4 символов'),

        'phone': yup
            .string()
            .required('Поле обязательное')
            .matches(/^(380|0)\d{9}$/, 'Неверный формат номера'),
        
        'password1': yup
            .string()
            .required('Поле обязательное')
            .test('pass', 'Пароль не может быть короче 6 символов', function(value) {
                if (String(value).length < 6) {
                    return false
                }
                
                return true
            }),
        'password2': yup
            .string()
            .required('Поле обязательное')
            .test('pass', 'Пароли должны совпадать', function(value) {
                const password1 = this.parent.password1

                if (password1 === value) {
                    return true
                }

                return false
            })
    })  

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm({
        resolver: yupResolver(shema)
    })

    const onSubmit =  async (data) => {
        console.log(data)

         const success = await registration(data['username'], data['phone'], data['password1'], data['password2'])

        if (success) {
            console.log('Registaration successful!');
            navigate('/');
        } else {
            console.log('Registration failed!');
        }
    }

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
        
    //     if (password1 !== password2) {
    //         alert("Паролі не співпадають!");
    //         return;
    //     }

    //     if (password1.length < 8 || password2.length < 8) {
    //         alert('Пароль повинен містити не менше 8 символів')
    //     }

    //     const success = registration(username, phone, password1, password2)

    //     if (success) {
    //         console.log('Registaration successful!');
    //         navigate('/');
    //     } else {
    //         console.log('Registration failed!');
    //     }
    // }


    return (
        <div className="base-registration-container">
            <div className="registration-form-container">
                <form id='registration-form' onSubmit={handleSubmit(onSubmit)} aria-label="Registration form">
                    <h3>Sign Up</h3>
                    <p className="second-title">Do you have an account? <Link className="signuplink">Login</Link></p>

                    <input 
                    {...register('username')}
                    type="text"
                     className="registration-form-control" 
                     placeholder="Логін" 
                     id="username"  
                     autoFocus="" 
                    //  onChange={(e) => setUsername(e.target.value)}
                    //  required=""
                     ></input>

                    <input 
                    {...register('phone')}
                    type="text" 
                    className="registration-form-control" 
                    placeholder="Номер телефону" 
                    id="phone" 
                    maxLength="20" 
                    // onChange={(e) => setPhone(e.target.value)}
                    // required=""
                    ></input>

                    <input 
                    {...register('password1')}
                    type="password" 
                    className="registration-form-control" 
                    placeholder="Пароль" 
                    id="password1"
                    // onChange={(e) => setPassword1(e.target.value)} 
                    // required=""
                    ></input>

                    <input 
                    {...register('password2')}
                    type="password" 
                    className="registration-form-control" 
                    placeholder="Повторіть пароль" 
                    id="password2"
                    // onChange={(e) => setPassword2(e.target.value)}
                    // required=""
                    ></input>

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