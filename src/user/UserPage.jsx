import React, { useState } from 'react'
import { Navbar } from '../Bridge'
import { useFile } from '../common/Context'
import '../user/UserPage.css'

const UserPage = () => {
  const { files } = useFile();


  const [selectedIds, setSelectedIds ] = useState(new Set());

  const handleClick = (e, fileId) => {

    e.preventDefault(); //ㅎ한번 클릭일 때 이동 막기

    if ( e.ctrlKey || e.metaKey || e.shiftKey) return;

    setSelectedIds(prev => { // 선택 토글 ( 이미 선택된 것은 해제)
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.clear(); // 다른 거 전부 해제
        newSet.add(fileId); // 현재 것만 선택
      }
      return newSet;
    });
  };

  const handleDoubleClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="UserMainSection">
      {files.length === 0 ? (
        <p style={{textAlign: 'center', color: '#999', marginTop: '50px'}}>
          <br/> 유저 Main 화면 입니다. 
        </p>
      ) : (
        files.map(file => (
          <a
            key={file.id}
            href={file.url}
            target='_blank'
            rel='noopener noreferrer'
            className='block'

            //////////////////////////////////////////////////
            // 핵심: 클릭과 더블클릭 분리
            onClick={(e) => handleClick(e, file.id)}
            onDoubleClick={() => handleDoubleClick(file.url)}
            
            // 선택됐는지 표시용 data 속성
            data-selected={selectedIds.has(file.id)}
            //////////////////////////////////////////////////
          >
          {/*============================================================ */}
          <div className={`FileBox ${selectedIds.has(file.id) ? 'selected' : ''}`} >
          {/*============================================================ */}
          {/* <div key={file.id} className="FileBox"> */}
            <div className="FileIcon"></div>
            <p>{file.title}</p>
            {/* <small style={{wordBreak: 'break-all'}}>{file.url}</small> */}
          </div>
          </a>
        ))
      )}
    </div>
  );
};

export default UserPage;