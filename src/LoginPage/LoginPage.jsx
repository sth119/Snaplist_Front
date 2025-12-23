import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import "./LoginPage.css"
import { GuestPage, Header } from '../Bridge'
import { useAuth } from '../common/AuthContext';



const LoginPage = () => {

  const [ username, setUsername ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ error, setError ] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');  // 이전 에러 지우기

    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      // 백엔드 로그인 API 호출
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();  // { accessToken, refreshToken, user }
        console.log('로그인 성공!', data);

        // AuthContext에 저장 → 전역 상태 업데이트 + localStorage 저장
        login(data);

        // 로그인 성공 후 사용자 페이지로 이동!!
        navigate('/user');
      } else {
        // 백엔드에서 401 등 에러 오면
        const errorData = await response.text();
        setError(errorData || '로그인 실패: 아이디 또는 비밀번호를 확인해주세요.');
      }
    } catch (err) {
      console.error('로그인 에러', err);
      setError('서버 연결 오류. 백엔드가 실행 중인지 확인해주세요.');
    }
  };


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
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
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
            <Link to={"/signup"}>회원가입</Link>
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
