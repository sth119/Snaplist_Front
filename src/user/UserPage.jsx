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

  ///////////////////    DRAG    ////////////////////////////////
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
            onDoubleClick={() => handleDoubleClick(file.url)}

            // 우클릭 이벤트
            onContextMenu={(e) => handleContextMenu(e, file.id)}
            
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