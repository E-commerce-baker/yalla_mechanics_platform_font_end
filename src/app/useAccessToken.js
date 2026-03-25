import { useEffect, useState } from "react";

export const useAccessToken = () => {
  const [token, setToken] = useState('');

  useEffect(() => {
    const loadToken = () => {
      setToken(localStorage.getItem('accessToken') || '');
    };

    loadToken();

    window.addEventListener('storage', loadToken);

    return () => {
      window.removeEventListener('storage', loadToken);
    };
  }, []);

  return token;
};