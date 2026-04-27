import React from 'react';
import './FoundrySnowflakeSpinner.css';

const FoundrySnowflakeSpinner = () => (
  <div className="foundry-snowflake-spinner" title="Loading...">
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <circle cx="24" cy="24" r="22" stroke="#0078D4" strokeWidth="4" opacity="0.15" />
        <g className="snowflake">
          <path d="M24 8 L24 40" stroke="#0078D4" strokeWidth="3" strokeLinecap="round"/>
          <path d="M24 24 L36 16" stroke="#0078D4" strokeWidth="3" strokeLinecap="round"/>
          <path d="M24 24 L12 16" stroke="#0078D4" strokeWidth="3" strokeLinecap="round"/>
          <path d="M24 24 L36 32" stroke="#0078D4" strokeWidth="3" strokeLinecap="round"/>
          <path d="M24 24 L12 32" stroke="#0078D4" strokeWidth="3" strokeLinecap="round"/>
        </g>
      </g>
    </svg>
  </div>
);

export default FoundrySnowflakeSpinner;
