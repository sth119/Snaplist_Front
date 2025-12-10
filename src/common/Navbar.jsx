import React from 'react'
import "./Navbar.css"
import { Link } from 'react-router-dom'
import { useFile } from './Context'

const Navbar = () => {
  const { openModal } = useFile();



  return (
    <div className='Navbar'>
      <div className='OptionBox'>
        <div className='CreateBox' onClick={openModal}>
          <div className='CreateBtn'>
            +
          </div>
          <div className='CreateTextBox'>
            생성
          </div>
        </div>
        <Link to={"/pc"}>
        <div className='AddBox'>
          <div className='AddBtn'>
            +
          </div>
          <div className='AddTextBox'>
            파일추가
          </div>
        </div>
        </Link>
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
