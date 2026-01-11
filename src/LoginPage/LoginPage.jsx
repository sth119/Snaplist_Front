import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import "./LoginPage.css"
import { useAuth } from '../common/AuthContext'; // 경로 확인 필요

const LoginPage = () => {

  const [ username, setUsername ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ error, setError ] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 

    // 이제 input에 onChange를 연결했으므로 값이 정상적으로 들어옵니다.
    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json(); 
        console.log('로그인 성공!', data);

        login(data);
        
        // ★ 성공했을 때만 코드로 이동 (Link 태그 대신)
        navigate('/user');
      } else {
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
            {/* ★ 수정 1: value와 onChange 추가 (이게 없어서 빈 값으로 인식됨) */}
            <input 
              type='text' 
              className='Id' 
              placeholder='ID' 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            /> 
          </div>
          <div className='PwBox'>
            <label className='PwText'>비밀번호</label>
            {/* ★ 수정 2: value와 onChange 추가 */}
            <input 
              type='password' 
              className='Pw' 
              placeholder='password' 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        
        {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '14px' }}>{error}</p>}
        
        <div className='SocialLogin'>
          {/* 소셜 로그인 부분 생략 (기존 코드 유지) */}
           <Link><div className='KakaoLoginBtn' /></Link>
           <Link><div className='GoogleLoginBtn' /></Link>
           <Link><div className='NaverLoginBtn' /></Link>
           <Link><div className='FacebookLoginBtn' /></Link>
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

        {/* ★ 수정 3: Link 태그 삭제. 버튼만 남김. */}
        {/* Link가 있으면 폼 제출(Submit)보다 페이지 이동이 먼저 될 수 있음 */}
        <button type='submit' className='LoginCheck'>
          Sign
        </button>

        </form>
      </div> 
    </div>
  )
}

export default LoginPage;