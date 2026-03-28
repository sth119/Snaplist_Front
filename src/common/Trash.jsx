import React, { useEffect } from 'react';
import { useFile } from '../common/Context';  
import '../user/UserPage.css';  

const Trash = () => {
  const { 
    trashFiles,      // ★ files 대신 trashFiles 사용
    fetchTrash,      // ★ 휴지통 데이터 가져오는 함수
    restoreTrash,   
    deleteTrash,    
    selectedIds,
    setSelectedIds,
    handleContextMenu,
    contextMenu,
    setContextMenu,
  } = useFile();

  // ★ 화면 켜질 때 휴지통 데이터 무조건 새로 받아오기
  useEffect(() => {
    fetchTrash();
  }, []);

  const handleClick = (e, fileId) => {
    e.preventDefault();
    e.stopPropagation(); // 이벤트 새어나감 방지
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

  const handleDoubleClick = (file) => {
    // ★ 메인 화면과 동일하게 로컬호스트 주소 분기 처리
    const targetUrl = file.type === 'file'
      ? `http://localhost:8080${file.url}` 
      : file.url;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  // Del 키로 영구 삭제
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedIds.size > 0) {
        e.preventDefault();
        if (confirm('선택한 항목을 영구 삭제하시겠습니까? 복구 불가합니다.')) {
          deleteTrash(selectedIds);
          setSelectedIds(new Set());
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, deleteTrash]);

  return (
    // ★ 메인 화면과 동일한 스타일 유지를 위해 가장 큰 껍데기를 씌워줍니다.
    <div 
        className="UserPage" 
        style={{ userSelect: 'none', minHeight: '100vh', position: 'relative' }}
        onClick={() => setContextMenu(null)} // 빈 공간 클릭 시 메뉴 닫기
        onContextMenu={(e) => e.preventDefault()} // 바탕화면 기본 우클릭 메뉴 차단
    >
    <div className="UserMainSection">

      {trashFiles.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>
          휴지통이 비어 있습니다.
        </p>
      ) : (
        trashFiles.map(file => (
          <a
            key={file.id}
            href={file.type !== 'folder' ? file.url : '#'}
            target={file.type !== 'folder' ? '_blank' : ''}
            rel={file.type !== 'folder' ? 'noopener noreferrer' : ''}
            className='block'
            onClick={(e) => handleClick(e, file.id)}
            onDoubleClick={(e) => {
                e.stopPropagation();
                handleDoubleClick(file);
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation(); // ★ 우클릭 버블링 완벽 차단
                handleContextMenu(e, file.id);
            }}
            data-selected={selectedIds.has(file.id)}
          >
            <div className={`FileBox ${selectedIds.has(file.id) ? 'selected' : ''}`} data-id={file.id}>
              
              {/* ★ 메인 화면의 예쁜 썸네일 & 아이콘 렌더링 로직 이식 */}
              <div className="FileThumbnailBox">
                {file.type === 'folder' ? (
                  <div className='FolderIcon'></div>
                ) : file.type === 'file' && file.title.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) ? (
                  <img 
                      src={`http://localhost:8080${file.url}`} 
                      alt={file.title}
                      onError={(e) => { 
                        e.target.style.display = 'none'; 
                        e.target.parentNode.classList.add('FileIcon'); 
                      }}
                    />
                  ) : (
                    <div className={file.type === 'link' ? 'LinkIcon' : 'FileIcon'}></div>
                  )}
              </div>

              <p>{file.title || file.name}</p>
            </div>
          </a>
        ))
      )}

      {/* 우클릭 메뉴 - 휴지통 버전 (복구 + 영구 삭제) */}
      {contextMenu && contextMenu.fileId !== null && (
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
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* 복구 메뉴 */}
          <div
            style={{
              padding: '12px 20px',
              cursor: 'pointer',
              borderBottom: '1px solid #eee'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            onClick={() => {
              // ★ 다중 선택 복구 완벽 연동!
              if (selectedIds.has(contextMenu.fileId)) {
                restoreTrash(selectedIds);
                setSelectedIds(new Set());
              } else {
                restoreTrash(new Set([contextMenu.fileId]));
              }
              setContextMenu(null);
            }}
          >
            복구
          </div>

          {/* 영구 삭제 메뉴 */}
          <div
            style={{
              padding: '12px 20px',
              cursor: 'pointer',
              color: '#e74c3c'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fdf2f2'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            onClick={() => {
              // ★ 다중 선택 영구 삭제 완벽 연동!
              if (confirm('선택한 항목을 영구 삭제하시겠습니까?')) {
                if (selectedIds.has(contextMenu.fileId)) {
                  deleteTrash(selectedIds);
                  setSelectedIds(new Set());
                } else {
                  deleteTrash(new Set([contextMenu.fileId]));
                }
              }
              setContextMenu(null);
            }}
          >
            영구 삭제
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Trash;