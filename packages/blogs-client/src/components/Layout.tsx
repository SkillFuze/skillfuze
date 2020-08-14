import React from 'react';

import { User } from '@skillfuze/types';
import Navbar from './Navbar';
import { Footer } from './Footer';

interface Props {
  children?: React.ReactNode;
  user?: User;
  showProfileControls?: boolean;
  navControls?: React.ReactNode;
  title?: string;
}

const Layout: React.FC<Props> = (props: Props) => (
  <div className="flex flex-col min-h-screen">
    <Navbar controls={props.navControls} user={props.user} showProfileControls={props.showProfileControls} />
    {props.children}
    <div className="flex flex-row w-full h-12 bg-primary items-center ">
      <Footer />
    </div>
  </div>
);

export default Layout;
