import React from "react";


const imageMap = {

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