import React from 'react';

import Router from 'next/router';
import Logo from '../../assets/icons/skillfuze-logo.svg';

interface Props {
  controls?: React.ReactNode;
}

const Navbar: React.FC<Props> = (props: Props) => (
  <nav className="flex py-3 px-5">
    <div className="flex-grow">
      <Logo style={{ width: '7.5rem' }} className="cursor-pointer" onClick={() => Router.push('/')} />
    </div>
    <div>{props.controls}</div>
  </nav>
);

export default Navbar;
