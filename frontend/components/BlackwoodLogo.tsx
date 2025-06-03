import React from 'react';

interface BlackwoodLogoProps {
  className?: string;
  showText?: boolean;
  textColor?: string;
}

const BlackwoodLogo: React.FC<BlackwoodLogoProps> = ({ 
  className = "w-8 h-8", 
  showText = true,
  textColor = "text-[#173559]"
}) => {
  return (
    <div className="flex items-center space-x-3">
      {/* Tree Logo */}
      <div className={`bg-[#173559] rounded-full flex items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-3/4 h-3/4"
        >
          {/* Tree silhouette */}
          <path
            d="M12 2C10.5 2 9.5 3 9.5 4.5C9.5 5.5 10 6.5 11 7C10.5 7.5 10 8.5 10 9.5C10 10.5 10.5 11.5 11.5 12C11 12.5 10.5 13.5 10.5 14.5C10.5 15.5 11 16.5 12 17C13 16.5 13.5 15.5 13.5 14.5C13.5 13.5 13 12.5 12.5 12C13.5 11.5 14 10.5 14 9.5C14 8.5 13.5 7.5 13 7C14 6.5 14.5 5.5 14.5 4.5C14.5 3 13.5 2 12 2Z"
            fill="white"
            opacity="0.9"
          />
          {/* Tree trunk */}
          <rect
            x="11.5"
            y="17"
            width="1"
            height="5"
            fill="white"
            opacity="0.9"
          />
        </svg>
      </div>
      
      {/* Company Text */}
      {showText && (
        <div className={`${textColor} font-bold tracking-wide leading-tight`}>
          <div className="text-xl">BLACKWOOD</div>
          <div className="text-sm">ANALYTICS</div>
        </div>
      )}
    </div>
  );
};

export default BlackwoodLogo; 