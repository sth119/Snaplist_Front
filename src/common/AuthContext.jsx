import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext();


/////////////////////////////////////////////
//사용법: 다른 파일에서 import { useAuth } from './AuthContext'; 
//한 후 const { user, token } = useAuth(); 이렇게 쓰면 됨.
/////////////////////////////////////////////
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [ user, setUser ] = useState(null);
    const [ token, setToken ] = useState(localStorage.getItem('accessToken') || null);
    const [ loading , setLoading ] = useState(true);

    useEffect(() => {
        
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (loginData) => {
    // loginData = { accessToken, refreshToken, user }
    setToken(loginData.accessToken);
    setUser(loginData.user);
    localStorage.setItem('accessToken', loginData.accessToken);
    localStorage.setItem('user', JSON.stringify(loginData.user));
    // refreshToken은 필요시 저장 (보안상 localStorage보단 httpOnly 쿠키 추천, 지금은 간단히)
    if (loginData.refreshToken) {
      localStorage.setItem('refreshToken', loginData.refreshToken);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}


export default AuthContext
