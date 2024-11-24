import React, { useState } from 'react'

type FilterProps = {
    title: string;
    children: React.ReactNode;
}

export const Filter: React.FC<FilterProps> = ({ title }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    const toggleFilterList = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className='collapsible-list'>
            <button className="filter-header" onClick={toggleFilterList}>
                {title} {isOpen ? "-" : "+"}
            </button>
            {isOpen && (
                <div className='filter-option'>
                    <div>
                        <h4>Priority</h4>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Filter