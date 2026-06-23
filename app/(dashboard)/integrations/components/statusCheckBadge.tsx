import React from "react";

type StatusCheckBadgeProps = {
  active: boolean;
};

const StatusCheckBadge: React.FC<StatusCheckBadgeProps> = ({ active }) => {
  return (
    <div
      className={`
        relative          
        w-6 h-6            
        ${active ? "bg-[#0D8641]" : "bg-gray-400"} 
        rounded-full      
        after:content-[''] 
        after:absolute
        after:left-[9px]  
        after:top-[4px]    
        after:w-[7px]      
        after:h-[14px]      
        after:border-solid
        after:border-white
        after:border-r-[3px]
        after:border-b-[3px]
        after:transform
        after:rotate-45
      `}
    />
  );
};

export default StatusCheckBadge;
