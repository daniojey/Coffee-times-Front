import React, { useState, useEffect } from "react";

import { truncateString } from "../../common/scripts/truncate";
import DynamicImages from "../UI/images/DynamicImages";

import './ProductHomePage.css';

function ProductHomePage({ data }) {
    const { image_url, name, description, price } = data;

    // useEffect(() => {
    //     const getImage = async () => {
    //         try {
    //             const response = await axios.get(imageUrl);
    //             setImage(imageUrl);
    //             console.log(response.data);
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     }

    //     getImage();
    // }, [])


    return (
        <div className='slide-item'>
            {/* <DynamicImages imageUrl={image_url}/> */}
            <img src={image_url}></img>

            <div id="productId">
                <div className='product__name_description'>
                    <p>{name}</p>
                    <p>{truncateString(description, 70)}</p>
                </div>
                <div className='product__price'>
                    <p>Ціна {price}грн</p>
                </div>
            </div>
        </div>

    )
}

export default ProductHomePage;