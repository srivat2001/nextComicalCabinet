import React from "react";
import Link from "next/router";
export const Breadcomb = ({ paths }) => {
  return (
    <nav className="breadcrumb">
      <ul>
        {paths.map((path, index) => (
          <li key={index}>
            {index !== 0 && <span className="arrow">&gt;</span>}
            <Link href={path.url}>{path.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
