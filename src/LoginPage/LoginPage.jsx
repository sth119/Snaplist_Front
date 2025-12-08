import React from 'react'
import { Link } from 'react-router-dom'
import "./LoginPage.css"
import { GuestPage, Header } from '../Bridge'




const LoginPage = () => {

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("로그인 버튼 클릭 or Enter!");

  }







  return (
    <div className='LoginMainSection'>
      <div className='LoginPopup'>

        <form onSubmit={handleSubmit}>

        <div className='LoginBox'>
          <div className='IdBox'>
            <label className='IdText'>아이디</label>
            <input type='text' className='Id' placeholder='ID' required /> 
          </div>
          <div className='PwBox'>
            <label className='PwText'>비밀번호</label>
            <input type='password' className='Pw' placeholder='password' required />
          </div>
        </div>
        <div className='SocialLogin'>
          <Link>
          <div className='KakaoLoginBtn' />
          </Link>
          <Link >
          <div className='GoogleLoginBtn' />
          </Link>
          <Link >
          <div className='NaverLoginBtn' />
          </Link>
          <Link >
          <div className='FacebookLoginBtn' />
          </Link>
        </div>
        <div className='CheckBox'>
          <div className='SaveLoginBox'>
            <input type="checkbox" id="save-id" className="SaveLogin" />
            <label htmlFor='save-id' className='SaveLoginText'>
              로그인 정보저장
            </label>
          </div>
          <div className='Register'>
            <Link to={"/guest"}>회원가입</Link>
          </div>
        </div>
        <button type='submit' className='LoginCheck'>
          <Link to={"/user"}>Sign</Link>
        </button>

        </form>
      </div>  { /* LoginPopup */ } 
    </div> // MainSection
  )
}

export default LoginPage;
