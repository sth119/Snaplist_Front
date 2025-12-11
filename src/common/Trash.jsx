import React, { useEffect } from 'react';
import { useFile } from '../common/Context';  // Context 경로 맞는지 확인!
import '../user/UserPage.css';  // 스타일 재사용 (필요하면 따로 만들어도 돼요)

const Trash = () => {
  const { 
    files, 
    restoreTrash,   // 복구 함수
    deleteTrash,    // 영구 삭제 함수 (나중에 쓰거나 지금 안 써도 됨)
    selectedIds,
    setSelectedIds,
    handleContextMenu,
    contextMenu,
    setContextMenu,
  } = useFile();

  // 휴지통 파일만 필터링
  const trashedFiles = files.filter(file => file.trashed);

  const handleClick = (e, fileId) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;

    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.clear();
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleDoubleClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Del 키로 영구 삭제 (옵션, 나중에 추가해도 돼요)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedIds.size > 0) {
        e.preventDefault();
        if (confirm('영구 삭제하시겠습니까? 복구 불가합니다.')) {
          deleteTrash(selectedIds);
          setSelectedIds(new Set());
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, deleteTrash]);

  return (
    <div className="UserMainSection">

      {trashedFiles.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>
          휴지통이 비어 있습니다.
        </p>
      ) : (
        trashedFiles.map(file => (
          <a
            key={file.id}
            href={file.url}
            target='_blank'
            rel='noopener noreferrer'
            className='block'
            onClick={(e) => handleClick(e, file.id)}
            onDoubleClick={() => handleDoubleClick(file.url)}
            onContextMenu={(e) => handleContextMenu(e, file.id)}
          >
            <div className={`FileBox ${selectedIds.has(file.id) ? 'selected' : ''}`}>
              <div className="FileIcon"></div>
              <p>{file.title}</p>
            </div>
          </a>
        ))
      )}

      {/* 우클릭 메뉴 - 휴지통 버전 (복구 + 영구 삭제) */}
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
            fontSize: '14px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 복구 메뉴 */}
          <div
            style={{
              padding: '12px 20px',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            onClick={() => {
              if (contextMenu.fileId !== null) {
                restoreTrash(new Set([contextMenu.fileId]));
              }
              setContextMenu(null);
            }}
          >
            복구
          </div>

          {/* 영구 삭제 메뉴 (나중에 확인 모달 추가 가능) */}
          <div
            style={{
              padding: '12px 20px',
              cursor: 'pointer',
              color: '#e74c3c'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fdf2f2'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            onClick={() => {
              if (contextMenu.fileId !== null && confirm('영구 삭제하시겠습니까?')) {
                deleteTrash(new Set([contextMenu.fileId]));
              }
              setContextMenu(null);
            }}
          >
            영구 삭제
          </div>
        </div>
      )}
    </div>
  );
};

export default Trash;