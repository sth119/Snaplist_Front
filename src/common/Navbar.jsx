import React, { useRef } from 'react'
import "./Navbar.css"
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useFile } from './Context'
import { useAuth } from './AuthContext'

const Navbar = () => {
  const { openModal, uploadFile } = useFile();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const isGuestPage = location.pathname.startsWith('/guest');


  const handleProfileClick =  () => {
    if ( window.confirm('로그아웃하시겠습니까?')) {
      logout();
      navigate('/login');
    }
  };

  // ★ "파일추가" 버튼 클릭 시 실행
  const handleAddFileClick = () => {
    // 숨겨진 파일 input을 강제로 클릭시킴
    fileInputRef.current.click();
  };

  // ★ 파일이 선택되면 실행되는 함수
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        // 여기서 바로 업로드 함수 호출!
        uploadFile(file);
    }
    // 같은 파일을 다시 올릴 수도 있으니 input 초기화
    e.target.value = '';
  };

  return (
    <div className='Navbar'>

      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange}
      />

      <div className='OptionBox'>
        <div className='CreateBox' onClick={openModal}>
          <div className='CreateBtn'>
            +
          </div>
          <div className='CreateTextBox'>
            생성
          </div>
        </div>
        <div className='AddBox'  onClick={handleAddFileClick}>
          <div className='AddBtn'>
            +
          </div>
          <div className='AddTextBox'>
            파일추가
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

        <Link to={"/Trash"}>
        <div className='TrashBox'>
          <div className='TrashIcon' />
          <div className='TrashTextBox'>
            휴지통
          </div>
        </div>
        </Link>
      </div> {/* option box */}

      {!isGuestPage && (
      <div className='LoginSettingBox'>
        <div className='Setting' />
        <button
          onClick={handleProfileClick}
          className='GoLoginPage'
        ></button>
      </div>
      )}
    </div>
  )
}

export default Navbar;
