import React, { useState } from 'react'

type CollListProps = {
    title: string;
    children: React.ReactNode;
}

export const CollList: React.FC<CollListProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleList = () => {
    setIsOpen(!isOpen);
  };

    return (
    <div className="collapsible-list">
        <button className="collasible-header" onClick={toggleList}>
            {title} {isOpen ? "-" : "+"}
        </button>
        {isOpen && <div className="collapsible-content">{children}</div>}
    </div>
  )
}
