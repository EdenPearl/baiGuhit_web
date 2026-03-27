import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Breadcrumb = ({ items }) => {
  return (
    <BreadcrumbContainer>
      {items.map((item, index) => (
        <BreadcrumbItem key={index}>
          {item.path ? (
            <BreadcrumbLink to={item.path}>{item.label}</BreadcrumbLink>
          ) : (
            item.label
          )}
        </BreadcrumbItem>
      ))}
    </BreadcrumbContainer>
  );
};

export default Breadcrumb;

const BreadcrumbContainer = styled.nav`
* {
  -webkit-tap-highlight-color: transparent;
}
 margin: 10px 0;
  font-size: 18px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const BreadcrumbItem = styled.span`
  &::after {
    content: '>';
    margin: 0 8px;
    color: #888;
  }
  &:last-child::after {
    content: '';
  }
`;

const BreadcrumbLink = styled(Link)`
  text-decoration: none;
  color: #00008B;
  &:hover {
    text-decoration: underline;
  }
`;

