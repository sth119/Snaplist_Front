import React from 'react'
import { Link } from 'react-router-dom'
import "./Main.css"
import { GuestPage, Header } from '../Bridge'




const Main = () => {
  return (
    <div className='MainSection'>
      <div className='MainBoard'>
        원하는 링크를 <br/>
        자유롭게 저장하여 <br/>
        나만의 공간에 <br/>
        보관해 보세요 !
      </div>
      <div className='BtnBox'>
        <div className='MoveRegister'>
          <Link to={"/guest"}>게스트로 이용</Link>
        </div>
        <div className='MoveLogin'>
          <Link to={"/login"}>로그인</Link>
        </div>
      </div> 
    </div> // MainSection
  )
}

export default Main;
