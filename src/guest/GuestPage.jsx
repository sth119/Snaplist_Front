import React, { useState, useEffect } from 'react';
import { useFile } from '../common/Context';
import "./GuestPage.css"

const GuestPage = () => {
  // 1. Context에서 필요한 모든 기능 가져오기
  const { 
    files, 
    setFiles, 
    moveTrash, 
    contextMenu, 
    setContextMenu, 
    handleContextMenu, 
    selectedIds, 
    setSelectedIds 
  } = useFile();

  // 휴지통에 없는 파일만 보여주기
  const visibleFiles = files.filter(file => !file.trashed);

  ///////////////////    DRAG & DROP (UserPage와 동일)   /////////////////
  const [ dragIndex, setDragIndex ] = useState(null);

  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // 드롭 허용
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) return;

    // 1. 눈에 보이는 리스트에서 순서 변경
    const newVisibleFiles = [...visibleFiles];
    const [draggedItem] = newVisibleFiles.splice(dragIndex, 1);
    newVisibleFiles.splice(dropIndex, 0, draggedItem);

    // 2. 전체 리스트 재구성 (휴지통 파일은 뒤로 보내고, visible 파일은 순서대로)
    const newFiles = [
      ...files.filter(file => file.trashed),  // 휴지통 파일들
      ...newVisibleFiles                      // 순서 바뀐 정상 파일들
    ];

    setFiles(newFiles);
    
    // ★ 중요: 게스트 모드에서는 순서 바뀐 걸 세션 스토리지에도 저장해야 함 (새로고침 유지)
    sessionStorage.setItem('guestFiles', JSON.stringify(newFiles));
    
    setDragIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };
  /////////////////////////////////////////////////////////

  // 2. 클릭 핸들러 (선택 로직)
  const handleClick = (e, fileId) => {
    e.preventDefault(); // 링크 바로 이동 방지 (더블클릭으로 이동)
    
    // Ctrl/Shift 키가 눌리지 않았을 때 로직
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;

    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.clear(); // 단일 선택 모드 (기존 선택 해제)
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  // 3. 더블 클릭 핸들러 (링크 이동)
  const handleDoubleClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 4. Delete 키로 삭제 기능
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedIds.size > 0) {
        e.preventDefault();
        moveTrash(selectedIds);
        setSelectedIds(new Set()); // 선택 초기화
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, moveTrash, setSelectedIds]);


  return (
    <div className="GuestMainSection">
      {visibleFiles.length === 0 ? (
        <p style={{textAlign: 'center', color: '#999', marginTop: '50px'}}>
          <br/>+ 생성 버튼을 눌러 링크 추가 
        </p>
      ) : (
        visibleFiles.map((file, index) => (
          <a
            key={file.id}
            href={file.url}
            target='_blank'
            rel='noopener noreferrer'
            className='block'
            
            // ★ 드래그 이벤트 연결
            draggable="true"
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}

            // ★ 클릭/더블클릭/우클릭 이벤트 연결
            onClick={(e) => handleClick(e, file.id)}
            onDoubleClick={() => handleDoubleClick(file.url)}
            onContextMenu={(e) => handleContextMenu(e, file.id)}
            
            // CSS 스타일링용 데이터 속성
            data-selected={selectedIds.has(file.id)}
          >
            <div className={`FileBox ${selectedIds.has(file.id) ? 'selected' : ''}`}>
              <div className="FileIcon"></div>
              <p>{file.title}</p>
            </div>
          </a>
        ))
      )}

      {/* ★ 우클릭 메뉴 (UserPage와 동일) */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            zIndex: 10000,
            padding: '8px 0',
            minWidth: '180px',
            fontSize: '14px',
            color: 'black'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              padding: '12px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            onClick={() => {
              if (contextMenu.fileId !== null) {
                moveTrash(new Set([contextMenu.fileId]));
              }
              setContextMenu(null);
            }}
          >
            🗑️ 휴지통으로 이동
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestPage;