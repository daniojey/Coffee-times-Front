import React from "react";

import CoffeehouseImage from "../../../assets/caffee_bar.jpg";


const imageMap = {
    CoffehouseImage: CoffeehouseImage
}

const DynamicImages = ({
    imageName="", 
    imageUrl="", 
    altText="", 
    className="" })  => {

    return (
        <img 
        src={imageUrl ? imageUrl : imageMap[imageName]} 
        alt={altText} 
        className={className} 
        />
    )
}

export default DynamicImages;