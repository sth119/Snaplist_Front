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
          dragBox,
          setDragBox,
          folders,
          currentFolderId,
          createFolder,
          folderHistory,
          enterFolder,
          goToPath,
          moveFilesToFolder,
        } = useFile();

  //const visibleFiles = files.filter(file => !file.trashed); // 아래처럼 undefined 대비 안정장치 추가
  const visibleFiles = (files || []).filter(file => !file.trashed);
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
////////////////////////////////////////////////////////////////////////////
//   const handleDrop = (e, dropIndex) => {
//     e.preventDefault();
//     if (dragIndex === null || dragIndex === dropIndex) return;

//     const newVisibleFiles = [...visibleFiles];
//     const [draggedItem] = newVisibleFiles.splice(dragIndex, 1);
//     newVisibleFiles.splice(dropIndex, 0, draggedItem);

//     // 전체 files 재정렬 (trashed 파일은 그대로)
//     // const newFiles = files.map(file => {
//     //   if (file.trashed) return file;
//     //   const found = newVisibleFiles.find(f => f.id === file.id);
//     //   return found || file;
//     // });

//     //////////////////////////////////////////////////////
//     const newFiles = [
//     ...files.filter(file => file.trashed),  // trashed 파일 먼저
//     ...newVisibleFiles                      // 새 순서의 visible 파일
//     ];
//   //////////////////////////////////////////// drag 후 index 가 볕경되지 않는 문제로 인해 바꾼 로직

//     setFiles(newFiles);
//     setDragIndex(null);

//     console.log('드롭! 이전 인덱스:', dragIndex, '새 인덱스:', dropIndex);
// console.log('새 files:', newFiles);

//   };
///// 다중 선택으로 인해 수정
////////////////////////////////////////////////////////
// 다중 이동으로 인해 수정
// const handleDrop = (e, dropIndex) => {
//     e.preventDefault();
//     if (dragIndex === null) return;

//     const draggedFile = visibleFiles[dragIndex];
//     if (!draggedFile) return;

//     // 1. 드래그한 파일이 '다중 선택 그룹'에 포함되어 있는지 확인!
//     const isMultiDrag = selectedIds.size > 1 && selectedIds.has(draggedFile.id);
    
//     // 2. 이동시킬 대상 ID 목록 결정 (다중 선택이면 전체, 아니면 방금 잡은 거 1개)
//     const idsToMove = isMultiDrag ? Array.from(selectedIds) : [draggedFile.id];

//     // 3. 이동할 놈들을 뺀 '나머지 파일들'만 걸러내기
//     const extractedFiles = visibleFiles.filter(f => idsToMove.includes(f.id));
//     const remainingFiles = visibleFiles.filter(f => !idsToMove.includes(f.id));

//     // 4. 놓은 위치(dropIndex)를 '나머지 파일들' 기준으로 재계산
//     const targetFile = visibleFiles[dropIndex];
//     let newDropIndex = remainingFiles.findIndex(f => f.id === targetFile.id);
//     if (newDropIndex === -1) newDropIndex = remainingFiles.length; // 못 찾으면 맨 끝으로

//     // 5. 계산된 위치에 뽑아뒀던 묶음(extractedFiles)을 통째로 삽입!
//     remainingFiles.splice(newDropIndex, 0, ...extractedFiles);

//     // 6. 휴지통 파일들과 다시 합쳐서 최종 저장
//     const newFiles = [
//       ...files.filter(file => file.trashed),
//       ...remainingFiles
//     ];

//     setFiles(newFiles);
//     setDragIndex(null);
//   };

//   const handleDragEnd = () => {
//     setDragIndex(null);
//   };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex === null) return;

    // ★ 1. 드래그한 항목과 내려놓은 위치의 항목을 allItems 기준으로 정확히 찾습니다.
    const draggedItem = allItems[dragIndex];
    const targetItem = allItems[dropIndex];

    if (!draggedItem || !targetItem) {
        setDragIndex(null);
        return;
    }

    // ★ 2. 이동시킬 ID 목록 추출 (다중 선택 대응)
    const isMultiDrag = selectedIds.size > 1 && selectedIds.has(draggedItem.id);
    const idsToMove = isMultiDrag ? Array.from(selectedIds) : [draggedItem.id];

    // =================================================================
    // ★ 3. 목적지가 '폴더'인 경우 -> 서버로 이동 명령 보내기!
    // =================================================================
    if (targetItem.type === 'folder') {
        moveFilesToFolder(idsToMove, targetItem.id);
        setDragIndex(null);
        return; // 이동 API를 불렀으므로 여기서 함수 즉시 종료!
    }

    // =================================================================
    // ★ 4. 목적지가 폴더가 아닌 경우 (파일 위) -> 기존처럼 순서만 바꾸기
    // =================================================================
    const extractedFiles = visibleFiles.filter(f => idsToMove.includes(f.id));
    const remainingFiles = visibleFiles.filter(f => !idsToMove.includes(f.id));

    let newDropIndex = remainingFiles.findIndex(f => f.id === targetItem.id);
    if (newDropIndex === -1) newDropIndex = remainingFiles.length; 

    remainingFiles.splice(newDropIndex, 0, ...extractedFiles);

    const newFiles = [
      ...files.filter(file => file.trashed),
      ...remainingFiles
    ];

    setFiles(newFiles);
    setDragIndex(null);
  };

    const handleDragEnd = () => {
    setDragIndex(null);
    };


  /////////////////////////////////////////////////////////
  //// 클릭 로직
  /////////////////////////////////////////////////////////

  const handleClick = (e, fileId) => {

    
    e.preventDefault(); //한번 클릭일 때 이동 막기
    e.stopPropagation(); // 개별 파일ㄹ 클릭시 클릭 이벤트 상위로 전파 막기

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

//   const handleDoubleClick = (file) => {
//     // 파일 타입이면 백엔드 서버(8080) 주소를 붙이고, 아니면(일반 링크면) 그냥 원래 주소 사용
//     const targetUrl = file.type === 'file'
//       ? `http://localhost:8080${file.url}` 
//       : file.url;

//     window.open(targetUrl, '_blank', 'noopener,noreferrer');
// };

  //  새폴더 새창 열림 문제해결을 위한 로직
  const handleDoubleClick = (item) => {
    // ★ 1. 클릭한 것이 '폴더'일 경우: 새 창을 열지 않고 멈춥니다!
    if (item.type === 'folder') {
        console.log("폴더로 들어갑니다:", item.name);
        
        enterFolder(item.id, item.name); 

        return; // ★ 여기서 함수를 강제로 종료시켜서 아래의 새 창 열기가 실행되지 않게 막습니다!
    }

    // ★ 2. 클릭한 것이 '파일'이나 '링크'일 경우: 기존처럼 새 창으로 엽니다.
    const targetUrl = item.type === 'file'
      ? `http://localhost:8080${item.url}` 
      : item.url;

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

  // ==========================================
  // ★ 드래그 다중 선택 로직
  // ==========================================
  // 1. 마우스 누를 때 (드래그 시작)
  const handleMouseDown = (e) => {
    // 파일 위에서 누른 거면 드래그 시작 안 함 (나중에 단일 클릭이나 Shift 클릭을 위해 양보)
    if (e.target.closest('.FileBox')) return;

    // 빈 공간을 누르면 기존 선택 다 풀기
    setSelectedIds(new Set());

    setDragBox({
      startX: e.clientX,
      startY: e.clientY,
      endX: e.clientX,
      endY: e.clientY,
      isDragging: true
    });
  };

  // 2. 마우스 움직일 때 (파란 상자 그리기 & 선택 검사)
  const handleMouseMove = (e) => {
    if (!dragBox || !dragBox.isDragging) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    // 2-1. 드래그 박스 좌표 업데이트
    setDragBox(prev => ({ ...prev, endX: currentX, endY: currentY }));

    // 2-2. 수학적 충돌 검사 (드래그 박스 안쪽에 들어온 파일 찾기)
    const left = Math.min(dragBox.startX, currentX);
    const right = Math.max(dragBox.startX, currentX);
    const top = Math.min(dragBox.startY, currentY);
    const bottom = Math.max(dragBox.startY, currentY);

    const elements = document.querySelectorAll('.FileBox');
    const newlySelected = new Set();

    elements.forEach(el => {
      const rect = el.getBoundingClientRect(); // 화면상에서 파일 박스의 좌표 구하기
      
      // 파일 상자와 드래그 상자가 겹치는지 확인
      if (rect.left < right && rect.right > left && rect.top < bottom && rect.bottom > top) {
        newlySelected.add(el.getAttribute('data-id')); // ★ 겹치면 해당 파일의 id를 수집!

        // ★★★ [핵심 수정] 자료형 불일치 해결 ★★★
        const rawId = el.getAttribute('data-id'); // HTML에서 가져온 문자열 ID
        
        // visibleFiles에서 원본 파일을 찾아서, '진짜 원래 타입(숫자)'의 id를 꺼내옵니다.
        const matchedFile = visibleFiles.find(f => String(f.id) === String(rawId));
        
        if (matchedFile) {
          newlySelected.add(matchedFile.id); // 진짜 id를 바구니에 담기!
        }
      }
    });

    setSelectedIds(newlySelected); // 선택된 것들 화면에 즉시 반영
  };

  // 3. 마우스 뗄 때 (드래그 종료)
  const handleMouseUp = () => {
    setDragBox(null);
  };

  // ★ 백엔드에서 받아온 폴더와 파일을 하나의 리스트로 합치기
  const allItems = [
    ...(folders || []).map(f => ({ ...f, type: 'folder' })),
    ...(files || []).filter(f => !f.trashed).map(f => {
        // ★ 핵심: 백엔드가 type을 안 주더라도, url이 http로 시작하면 무조건 link로 간주!
        const isLink = f.type === 'link' || (f.url && f.url.startsWith('http'));
        return { ...f, type: isLink ? 'link' : 'file' };
    })
  ];

  return (

    <div
      className="UserPage" 
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // 마우스가 브라우저 밖으로 나가도 드래그 종료
      style={{ userSelect: 'none', minHeight: '100vh', position: 'relative' }} // 드래그할 때 텍스트 파랗게 잡히는 것 방지
    
    
    // ★ 바탕화면 우클릭 코드는 여기에 딱 한 번만 들어갑니다! ★
      onContextMenu={(e) => {
        if (e.target.closest('.FileBox')) return; // 파일 위 클릭은 무시
        handleContextMenu(e, null); // 빈 바탕화면 클릭 시에만 null 전달
      }}
      
    >

      {/* ================= [★ 상단 폴더 경로(Breadcrumb) UI 추가] ================= */}
      <div style={{ 
          padding: '15px 20px', 
          borderBottom: '2px solid #f0f0f0', 
          marginBottom: '20px', 
          fontSize: '18px', 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center'
      }}>
          {folderHistory.map((folder, index) => (
              <span key={index}>
                  <span 
                      style={{ 
                          cursor: 'pointer', 
                          color: index === folderHistory.length - 1 ? '#333' : '#2196F3',
                          textDecoration: index === folderHistory.length - 1 ? 'none' : 'underline'
                      }}
                      onClick={() => goToPath(index)}
                  >
                      {folder.name || '홈'}
                  </span>
                  {/* 마지막 항목이 아니면 화살표(>) 표시 */}
                  {index < folderHistory.length - 1 && (
                      <span style={{ margin: '0 10px', color: '#999' }}>&gt;</span>
                  )}
              </span>
          ))}
      </div>

    <div className="UserMainSection">

      {/* ========================================================================= */}





      {allItems.length === 0 ? (
        <p style={{textAlign: 'center', color: '#999', marginTop: '50px'}}>
          <br/> 유저 Main 화면 입니다. 
        </p>
      ) : (
        // visibleFiles.map((file, index) => (
          allItems.map((item, index) => (
          <a
            // key={file.id}
            // href={file.url}
            // target='_blank'
            // rel='noopener noreferrer'
            // className='block'

            // allItems 로 바뀌어서 변경
            key={`${item.type}-${item.id}`} // 고유한 key 생성
            href={item.type !== 'folder' ? item.url : '#'} // 폴더면 빈 링크
            target={item.type !== 'folder' ? '_blank' : ''} 
            rel={item.type !== 'folder' ? 'noopener noreferrer' : ''}
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
            // onClick={(e) => handleClick(e, file.id)} // allItems 로 인한 변경 03/02
            onClick={(e) => {
                if(item.type === 'folder') e.preventDefault(); // 폴더면 링크 이동 방지
                handleClick(e, item.id)
            }}


            //onDoubleClick={() => handleDoubleClick(file.url)}
            onDoubleClick={(e) => {
              e.stopPropagation(); // 클릭 간섭 방지
              // handleDoubleClick(file); // url이 아니라 file 객체 전체를 넘겨줍니다!
              handleDoubleClick(item);
            }}
 
            // 우클릭 이벤트
            // onContextMenu={(e) => handleContextMenu(e, file.id)} allItems 로 인한 변경
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleContextMenu(e, item.id);
            }}
            
            // 선택됐는지 표시용 data 속성
            // data-selected={selectedIds.has(file.id)} allItems 로 인한 변경
            data-selected={selectedIds.has(item.id)}
            //////////////////////////////////////////////////
          >
          
          {/* 아래 file.id => item.id 로 변경 */}

          <div 
          className={`FileBox ${selectedIds.has(item.id) ? 'selected' : ''}`} 
          data-id={item.id}
          >

          {/* ================= [수정된 썸네일 영역] ================= */}
          {/* 1. 이미지든 아이콘이든 통일된 상자(.FileThumbnailBox)로 감쌉니다. */}
          <div className="FileThumbnailBox">
            {item.type === 'folder' ? (
              <div className='FolderIcon'></div>
            ) : item.type === 'file' && item.title.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) ? (
              <img 
                  src={`http://localhost:8080${item.url}`} 
                  alt={item.title}
                  onError={(e) => { 
                    e.target.style.display = 'none'; 
                    e.target.parentNode.classList.add('FileIcon'); 
                  }}
                />
              ) : (
                // Case C: 링크거나 이미지가 아닐 때 (기존 유지) -> 일반 아이콘 div 사용
                <div className={item.type === 'link' ? 'LinkIcon' : 'FileIcon'}></div>
              )}
          </div>
          
          <p>{item.name || item.title}</p>
        </div>
          </a>
        ))
      )}
      </div> 
      {/* UserMainSection */}

      {/* ★ 마우스 드래그 시 실제로 그려지는 파란색 반투명 박스 UI 추가! */}
      {dragBox && dragBox.isDragging && (
        <div
          style={{
            position: 'fixed',
            border: '1px solid rgba(33, 150, 243, 0.8)',
            backgroundColor: 'rgba(33, 150, 243, 0.15)',
            left: Math.min(dragBox.startX, dragBox.endX),
            top: Math.min(dragBox.startY, dragBox.endY),
            width: Math.abs(dragBox.startX - dragBox.endX),
            height: Math.abs(dragBox.startY - dragBox.endY),
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        />
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
              onMouseDown={(e) => e.stopPropagation()}
            >
          
          {contextMenu.fileId === null  ? (

          <div
              style={{ padding: '12px 20px', cursor: 'pointer' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
              onClick={() => {
                const folderName = prompt("새 폴더 이름을 입력하세요:");
                if (folderName && folderName.trim() !== "") {
                  createFolder(folderName.trim());
                }
                setContextMenu(null);
              }}
            >
              📁 새 폴더 만들기
            </div>

          ) : (
            <>
          {/* ★★★ 다운로드 버튼 ★★★ */}
          <div
            style={{
              padding: '12px 20px',
              cursor: 'pointer',
              borderBottom: '1px solid #eee' // 휴지통 버튼과 구분선
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            onClick={async () => {
              if(selectedIds.has(contextMenu.fileId)) {
                
                for(const id of selectedIds) {
                  await  handleDownload(id);

                  await new Promise(resolve => setTimeout(resolve, 500));
                }

                //selectedIds.forEach(id => handleDownload(id));
              } else {
              if (contextMenu.fileId !== null) handleDownload(contextMenu.fileId); // 다운로드 함수 실행!
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
              // ★ [핵심 3] 휴지통도 다중 선택 연동!
              if (selectedIds.has(contextMenu.fileId)) {
                moveTrash(selectedIds); // 선택된 거 전부 버리기
                setSelectedIds(new Set()); // 버린 후 선택 초기화
              } else {
                if (contextMenu.fileId !== null) moveTrash(new Set([contextMenu.fileId]));
              }
              setContextMenu(null);
            }}
          >
            휴지통으로 이동
          </div>
          </> /* ★ 빈 태그 닫기 */
          )} {/* ★ 삼항 연산자 분기 종료 */}
        </div>
      )} {/* contextMenu && 의 괄호 종료 */}

    </div> // usermainSection + 아래 로직 포함한 가장 큰 div
  );
};

export default UserPage;