import React from 'react'
import { Link } from 'react-router-dom'
import "./LoginPage.css"
import { GuestPage, Header } from '../Bridge'




const LoginPage = () => {
  return (
    <div className='MainSection'>
      <div className='LoginPopup'>
        원하는 링크를 <br/>
        자유롭게 저장하여 <br/>
        나만의 공간에 <br/>
        보관해 보세요 !
      </div>
      <div className='BtnBox'>
        <div className='Register'>
          <Link to={"/guest"}>회원가입</Link>
        </div>
        <div className='LoginCheck'>
          <Link to={"/user"}>로그인</Link>
        </div>
      </div> 
    </div> // MainSection
  )
}

export default LoginPage;
