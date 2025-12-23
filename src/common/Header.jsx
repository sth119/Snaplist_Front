import React from 'react'
import "./Header.css"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Main } from '../Bridge'
import { useAuth } from './AuthContext'

const Header = () => {

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const mainPage = location.pathname === '/';
  const guestPage = location.pathname.startsWith('/guest');

  const handleProfileClick =  () => {
    if ( window.confirm('로그아웃하시겠습니까?')) {
      logout();
      navigate('/login');
    }
  };


  return (

    <div className="header">
      <Link to={"/"}>
        <span  className='title'>SnapList</span>
      </Link>

      {!mainPage && (
        <div className='header-right'>
          {user ? (
            // user 화면
            <button
              onClick={handleProfileClick}
              className='profile-button'
              title={`${user.username}`}
            >
              <div className='profile-icon'>
                {user.username[0].toUpperCase()}
              </div>
            </button>
          ) : guestPage ? (
            //guest 화면
            <button
              onClick={() => navigate('/login')}
              className='guest-login-button'
            >
              로그인 하러가기
            </button>
          ) : null} 
        </div>
      )}
    </div>
  );
}

export default Header;
