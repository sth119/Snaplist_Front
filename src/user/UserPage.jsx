import React, { useState, useEffect } from 'react'
import { Navbar } from '../Bridge'
import { useFile } from '../common/Context'
import '../user/UserPage.css'
////////////////////////////////////////
// import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
// import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
// import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
////////////////////////////////////////


const UserPage = () => {
  const { files,
          setFiles, 
          moveTrash,
          setContextMenu,
          handleContextMenu,
          selectedIds,
          setSelectedIds,
          contextMenu,
        } = useFile();

  const visibleFiles = files.filter(file => !file.trashed);

  /////////////////////////////////////////////////////////      
  //// Drag 드레그 로직
  /////////////////////////////////////////////////////////

  const [ dragIndex, setDragIndex ] = useState(null);

  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);  // 필요시
    // 드래그 이미지 커스텀 (옵션)
    // e.dataTransfer.setDragImage(e.target, 0, 0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();  // 드롭 허용 필수!
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) return;

    const newVisibleFiles = [...visibleFiles];
    const [draggedItem] = newVisibleFiles.splice(dragIndex, 1);
    newVisibleFiles.splice(dropIndex, 0, draggedItem);

    // 전체 files 재정렬 (trashed 파일은 그대로)
    // const newFiles = files.map(file => {
    //   if (file.trashed) return file;
    //   const found = newVisibleFiles.find(f => f.id === file.id);
    //   return found || file;
    // });

    //////////////////////////////////////////////////////
    const newFiles = [
    ...files.filter(file => file.trashed),  // trashed 파일 먼저
    ...newVisibleFiles                      // 새 순서의 visible 파일
    ];
  //////////////////////////////////////////// drag 후 index 가 볕경되지 않는 문제로 인해 바꾼 로직

    setFiles(newFiles);
    setDragIndex(null);

    console.log('드롭! 이전 인덱스:', dragIndex, '새 인덱스:', dropIndex);
console.log('새 files:', newFiles);

  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  /////////////////////////////////////////////////////////
  //// 클릭 로직
  /////////////////////////////////////////////////////////

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

  const handleDoubleClick = (file) => {
    // 파일 타입이면 백엔드 서버(8080) 주소를 붙이고, 아니면(일반 링크면) 그냥 원래 주소 사용
    const targetUrl = file.type === 'file'
      ? `http://localhost:8080${file.url}` 
      : file.url;

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
};


  // ★★★ 5번: Del 키로 바로 휴지통 이동 (여기 추가!!!)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedIds.size > 0) {
        e.preventDefault();
        moveTrash(selectedIds);  // 선택된 거 바로 휴지통으로
        setSelectedIds(new Set());  // 선택 해제
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, moveTrash]);  // 의존성 배열에 moveTrash 추가

  /////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////
  //// 파일 다운로드 로직
  /////////////////////////////////////////////////////////

  const handleDownload = async (fileId) => {

    const file = visibleFiles.find(f => f.id === fileId);
    if(!file) return;

    if(file.type === 'link') {
      alert("링크 파일은 현재 다운로드를 지원하지 않습니다.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080${file.url}`);
      if (!response.ok) throw new Error("네트워크 응답 오류");

      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.title;
      document.body.appendChild(link);
      link.click();

      // 다운로드가 끝나면 임시 링크와 태그 지우기
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      
    } catch (error) {
      console.error("다운로드 관련 에러:", error);
      alert("파일 다운로드에 실패했습니다.");
    }
  };

  



  return (

    
    <div className="UserMainSection">
      {visibleFiles.length === 0 ? (
        <p style={{textAlign: 'center', color: '#999', marginTop: '50px'}}>
          <br/> 유저 Main 화면 입니다. 
        </p>
      ) : (
        visibleFiles.map((file, index) => (
          <a
            key={file.id}
            href={file.url}
            target='_blank'
            rel='noopener noreferrer'
            className='block'
            /////////////// DRAG /////////////////////////////

            draggable="true"  // ★ 드래그 가능하게
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}

            //////////////////////////////////////////////////
            // 핵심: 클릭과 더블클릭 분리
            onClick={(e) => handleClick(e, file.id)}
            //onDoubleClick={() => handleDoubleClick(file.url)}
            onDoubleClick={(e) => {
              e.stopPropagation(); // 클릭 간섭 방지
              handleDoubleClick(file); // url이 아니라 file 객체 전체를 넘겨줍니다!
            }}

            // 우클릭 이벤트
            onContextMenu={(e) => handleContextMenu(e, file.id)}
            
            // 선택됐는지 표시용 data 속성
            data-selected={selectedIds.has(file.id)}
            //////////////////////////////////////////////////
          >
          
          <div className={`FileBox ${selectedIds.has(file.id) ? 'selected' : ''}`} >

          {/* ================= [수정된 썸네일 영역] ================= */}
          {/* 1. 이미지든 아이콘이든 통일된 상자(.FileThumbnailBox)로 감쌉니다. */}
          <div className="FileThumbnailBox">
              {file.type === 'file' && file.title.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) ? (
                // Case A: 이미지 파일일 때 -> <img> 태그 사용
                <img 
                  src={`http://localhost:8080${file.url}`} 
                  alt={file.title}
                  // (CSS 파일에서 스타일을 관리하므로 인라인 스타일 제거됨)
                  onError={(e) => { 
                    // 이미지 로딩 실패 시, 부모 상자에 아이콘 클래스를 줘서 아이콘을 띄움
                    e.target.style.display = 'none'; // 깨진 이미지 숨김
                    e.target.parentNode.classList.add('FileIcon'); // 부모에게 아이콘 클래스 추가
                  }}
                />
              ) : (
                // Case B: 링크거나 이미지가 아닐 때 -> 아이콘 div 사용
                // 이 div는 CSS에 의해 너비/높이를 가져서 이제 보일 겁니다!
                <div className={file.type === 'link' ? 'LinkIcon' : 'FileIcon'}></div>
              )}
          </div>
          {/* ========================================================= */}

          <p>{file.title}</p>
        </div>
          </a>
        ))
      )}


          {/* ★★★ 우클릭 컨텍스트 메뉴 (여기 추가!!!) ★★★ */}
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
          
          {/* ★★★ 다운로드 버튼 ★★★ */}
          <div
            style={{
              padding: '12px 20px',
              cursor: 'pointer',
              borderBottom: '1px solid #eee' // 휴지통 버튼과 구분선
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            onClick={() => {
              if (contextMenu.fileId !== null) {
                handleDownload(contextMenu.fileId); // 다운로드 함수 실행!
              }
              setContextMenu(null); // 클릭 후 메뉴 닫기
            }}
          >
            다운로드
          </div>

          {/* ★★★ 휴지통 버튼 ★★★ */}
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
            휴지통으로 이동
          </div>
        </div>
      )}

    </div>
  );
};

export default UserPage;