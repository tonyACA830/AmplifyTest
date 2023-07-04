// import './App.css';
// import './asset/css/animate.css';
// import './asset/css/App.css';
// import './asset/css/base.css';
// import './asset/css/fontawesome-all.css';
// import './asset/css/magnific-popup.css';
// import './asset/css/owl.carousel.css';
// import './asset/css/responseive.css';
// import './asset/css/shortcodes.css';
// import './asset/css/line-awesome.min.css';
// import 'react-toastify/dist/ReactToastify.css';
// import { useRoutes } from 'react-router-dom';
// import { Provider } from 'react-redux';
// import AppRoutes from './AppRoutes';
// import { store } from './redux/store';

// function App() {
//   const pages = useRoutes(AppRoutes);
//   return <Provider store={store}>{ pages }</Provider>
// }

// export default App;
import { useEffect, useState } from 'react';
import { Amplify, Auth, Hub } from 'aws-amplify';
import awsmobile from './aws-exports';

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

// Assuming you have two redirect URIs, and the first is for localhost and second is for production
const [
  localRedirectSignIn,
  productionRedirectSignIn,
] = awsmobile.oauth.redirectSignIn.split(',');

const [
  localRedirectSignOut,
  productionRedirectSignOut,
] = awsmobile.oauth.redirectSignOut.split(',');

const updatedawsmobile = {
  ...awsmobile,
  oauth: {
    ...awsmobile.oauth,
    redirectSignIn: isLocalhost ? localRedirectSignIn : productionRedirectSignIn,
    redirectSignOut: isLocalhost ? localRedirectSignOut : productionRedirectSignOut,
  }
}

Amplify.configure(updatedawsmobile);

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    Hub.listen('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signIn':
        case 'cognitoHostedUI':
          getUser().then(userData => setUser(userData));
          console.log("Success");
          break;
        case 'signOut':
          setUser(null);
          break;
        case 'signIn_failure':
        case 'cognitoHostedUI_failure':
          console.log('Sign in failure', data);
          break;
      }
    });

    getUser().then(userData => setUser(userData));
  }, []);

  function getUser() {
    return Auth.currentAuthenticatedUser()
      .then(userData => userData)
      .catch(() => console.log('Not signed in'));
  }

  return (
    <div>
      <p>User: {user ? JSON.stringify(user.attributes) : 'None'}</p>
      {user ? (
        <button onClick={() => Auth.signOut()}>Sign Out</button>
      ) : (
        <button onClick={() => Auth.federatedSignIn()}>Federated Sign In</button>
      )}
    </div>
  );
}

export default App;