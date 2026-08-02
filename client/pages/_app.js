import '../styles/globals.css';

import buildClient from '../api/buildClient';
import Nav from '../components/nav';

function App({ Component, pageProps, currentUser }) {
  return (
    <div>
      <Nav currentUser={currentUser} />
      <Component currentUser={currentUser} {...pageProps} className='container' />
    </div>
  );
}

App.getInitialProps = async appContext => {
  try {
    const client = buildClient(appContext.ctx);

    const { data: currentUser } = await client.get('/api/auth/me');

    let pageProps = {};

    if (appContext.Component.getInitialProps) {
      pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, currentUser);
    }

    return { currentUser, pageProps };
  } catch (err) {
    return { data: err.response?.data.message };
  }
};

export default App;
