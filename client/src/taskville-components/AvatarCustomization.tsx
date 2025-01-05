import React from 'react'
import { useState } from "react";
import { faArrowRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
interface Asset {
    path: string;
    title: string;
}

interface AvatarCustomizationProps {
    assets: Asset[];
}

export default function AvatarCustomization({ assets }: AvatarCustomizationProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const slideStyle = {
        width: '100%',
        height: '100%',
        borderRadius: '10px',
        backgroundsposition: 'center',
        backgroundSize: 'cover',
        backgroundImage: `url(${assets[currentIndex].path})`,
    }

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? assets.length - 1 : currentIndex -1;
        setCurrentIndex(newIndex);  
    }

    const goToNext = () => {
        const isLastSlide = currentIndex === assets.length -1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    }
    return (
        <div className='slider'>
            <div className='leftArrow' onClick={goToPrevious}>
                <FontAwesomeIcon icon = {faArrowLeft} />
            </div>
            <div className='rightArrow' onClick={goToNext}>
                <FontAwesomeIcon icon = {faArrowRight} />
            </div>
            <div style={slideStyle} />
        </div>
    ) 
}
