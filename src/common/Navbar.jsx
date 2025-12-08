import React from 'react'
import "./Navbar.css"
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className='Navbar'>
      <div className='OptionBox'>
        <div className='CreateBox'>
          <div className='CreateBtn'>
            +
          </div>
          <div className='CreateTextBox'>
            생성
          </div>
        </div>
        <Link to={"/user"}>
        <div className='HomeBox'>
          <div className='HomeIcon' />
          <div className='HomeTextBox'>
            홈
          </div>
        </div>
        </Link>
        <div className='PhotoBox'>
          <div className='PhotoIcon' />
          <div className='PhotoTextBox'>
            사진
          </div>
        </div>

        <div className='VideoBox'>
          <div className='VideoIcon' />
          <div className='VideoTextBox'>
            비디오
          </div>
        </div>

        <div className='TrashBox'>
          <div className='TrashIcon' />
          <div className='TrashTextBox'>
            휴지통
          </div>
        </div>
      </div>
      <div className='LoginSettingBox'>
        <div className='Setting' />
        <Link to='/login'>
        <div className='GoLoginPage' />
        </Link>
      </div>
    </div>
  )
}

export default Navbar;
