import '../styles/globals.css'; // Path is correct if styles/globals.css exists in root
import 'tailwindcss/tailwind.css';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Apply dark mode based on system preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
