import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./LoginPage.css";  // 기존 CSS 재활용 (이름 바꾸고 싶으면 RegisterPage.css로)

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setSuccess('회원가입 성공! 로그인해주세요.');
        setTimeout(() => {
          navigate('/login');  // 2초 후 로그인 페이지로 이동
        }, 2000);
      } else {
        const errorData = await response.text();
        setError(errorData || '회원가입 실패: 이미 사용 중인 아이디일 수 있습니다.');
      }
    } catch (err) {
      console.error('회원가입 에러', err);
      setError('서버 연결 오류. 백엔드가 실행 중인지 확인해주세요.');
    }
  };

  return (
    <div className='LoginMainSection'>  {/* 기존 스타일 재활용 */}
      <div className='LoginPopup'>
        <h2 className='text-2xl font-bold mb-6 text-center'>회원가입</h2>

        <form onSubmit={handleSubmit}>
          <div className='LoginBox'>
            <div className='IdBox'>
              <label className='IdText'>아이디</label>
              <input
                type='text'
                className='Id'
                placeholder='ID'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className='PwBox'>
              <label className='PwText'>비밀번호</label>
              <input
                type='password'
                className='Pw'
                placeholder='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 에러/성공 메시지 */}
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}

          <div className='SocialLogin'>
            {/* 소셜 버튼은 로그인과 동일하게 유지 */}
            <Link><div className='KakaoLoginBtn' /></Link>
            <Link><div className='GoogleLoginBtn' /></Link>
            <Link><div className='NaverLoginBtn' /></Link>
            <Link><div className='FacebookLoginBtn' /></Link>
          </div>

          <div className='CheckBox'>
            {/* 체크박스 필요 없으면 삭제 가능 */}
            <div className='SaveLoginBox'>
              <input type="checkbox" id="save-id" className="SaveLogin" />
              <label htmlFor='save-id' className='SaveLoginText'>
                정보 저장
              </label>
            </div>
            <div className='Register'>
              <Link to="/login">로그인</Link>
            </div>
          </div>

          <button type='submit' className='LoginCheck'>
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;