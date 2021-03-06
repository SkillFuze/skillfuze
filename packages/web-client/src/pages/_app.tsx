/* eslint-disable react/prop-types */
import '../../assets/css/reset.css';
import '../../assets/css/tailwind.css';
import '../../assets/css/openSans.css';
import '../../assets/css/editor.css';
import '../../assets/css/typography.css';
import 'video.js/dist/video-js.css';
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import '@uppy/screen-capture/dist/style.min.css';
import '@uppy/webcam/dist/style.min.css';
import '@skillfuze/ui-components/build/index.css';
import mixpanel from 'mixpanel-browser';
import React, { useEffect } from 'react';
import { transitions, positions, Provider as AlertProvider, useAlert } from 'react-alert';
import { Alert } from '@skillfuze/ui-components';
import Head from 'next/head';

import { configureErrorInterceptor } from '../../config/axios';

const options = {
  position: positions.TOP_CENTER,
  timeout: 3000,
  offset: '30px',
  transition: transitions.SCALE,
};

const App = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <link
          rel="preload"
          as="font"
          href="/fonts/open-sans-v17-latin-regular.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          href="/fonts/open-sans-v17-latin-700.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          href="/fonts/open-sans-v17-latin-600.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <title>Skillfuze</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <script>{mixpanel.init('1e5658f85c76974fac9afb86889ed6f2')}</script>
      </Head>
      <AlertProvider template={Alert} {...options}>
        <AlertInterceptor>
          <Component {...pageProps} />
        </AlertInterceptor>
      </AlertProvider>
    </>
  );
};

const AlertInterceptor = (props) => {
  const alert = useAlert();
  useEffect(() => {
    configureErrorInterceptor((msg: string) => alert.show(msg, { type: 'warning' }));
  }, []);

  return props.children;
};

export default App;
