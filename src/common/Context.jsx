import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext';

const FileContext = createContext();

export function FileProvider({ children }) {
    const [files, setFiles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newLink, setNewLink] = useState({ title: '', url: '' });
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    
    

    //////////////////////////////////////////////
    // ★★★ 로그인 상태 (나중에 JWT로 대체) // 파일 업로드도 사용
    const { user, token } = useAuth(); // 예: { id: 1, username: 'test' } 또는 null (게스트)
    //////////////////////////////////////////////

    const openModal = () => {
        setShowModal(true);
        setNewLink({ title: '' , url: ''});
    };

    const closeModal = () => {
        setShowModal(false);
    };

    ///////////////////////////////////////////////////////
    // 서버에서 파일 불러오기 (로그인 시) [01.11 아래와 같이 수정]
    // const fetchFilesFromServer = async () => {
    //     if (!user || !token) return;
    //     try {
    //         const response = await fetch('/api/files', {
    //             headers: { Authorization: `Bearer ${token}` }
    //         });
    //         if (response.ok) {
    //             const serverFiles = await response.json();
    //             setFiles(serverFiles);
    //         }
    //     } catch (error) {
    //         console.error('서버 파일 불러오기 실패', error);
    //     }
    // };
    ////////////////////////////////////////////////////////

    const fetchFilesFromServer = async () => {
        if (!user || !token) return;
        try {
            const headers = { Authorization: `Bearer ${token}` };

            // 1. 일반 파일 & 휴지통 파일 동시 요청
            const [resFiles, resTrash] = await Promise.all([
                fetch('http://localhost:8080/api/files', { headers }),
                fetch('http://localhost:8080/api/files/trash', { headers })
            ]);

            if (resFiles.ok && resTrash.ok) {
                const activeData = await resFiles.json();
                const trashData = await resTrash.json();
                
                // 두 리스트를 합쳐서 state에 저장 (프론트는 하나로 관리하니까)
                setFiles([...activeData, ...trashData]);
            }
        } catch (error) {
            console.error('서버 파일 불러오기 실패', error);
        }
    };

    // 앱 시작 시 파일 로드
    useEffect(() => {

        // clear localstorage
        localStorage.removeItem('guestFiles');

        if (user) {
            const guestFiles = sessionStorage.getItem('guestFiles')

            if(guestFiles) {
                sessionStorage.removeItem('guestFiles');
            }
            fetchFilesFromServer();
        } else {
            const localFiles = JSON.parse(sessionStorage.getItem('guestFiles') || '[]');
            setFiles(localFiles);
        }
    }, [user]);

    ///////////////////////////////////////////////////////

    const createLink = async () => {
        if(!newLink.title.trim() || !newLink.url.trim()) {
            return;
    }

        let fullUrl = newLink.url.trim();

    if (!fullUrl.startsWith('https://') && !fullUrl.startsWith('http://')) {
            fullUrl = 'https://' + fullUrl;
    }
    
    
    const newFile = {
        id: Date.now(),
        title: newLink.title.trim(),
        url: fullUrl,
        type: 'link',
        createdAt: new Date().toISOString(),
        trashed: false
    };    

    ////////////////////////////////////////////////////
    if (user && token) {
            // 로그인: 서버에 저장
            try {
                const response = await fetch('http://localhost:8080/api/files', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title: newFile.title,
                        url: newFile.url,
                        type: 'link'
                    })
                });
                if (response.ok) {
                    // const savedFile = await response.json();
                    // setFiles(prev => [...prev, savedFile]);
                    fetchFilesFromServer();
                }
            } catch (error) {
                console.error('서버 저장 실패', error);
            }
        } else {
            // 게스트: localStorage에 저장
            const updatedFiles = [...files, newFile];
            setFiles(updatedFiles);
            sessionStorage.setItem('guestFiles', JSON.stringify(updatedFiles));
        }
    ///////////////////////////////////////////////
    
    

    closeModal();
    setNewLink({ title: '', url: ''});
    
    }; {/* FileProvider */}

    const handleContextMenu = (e, fileId) => {
        e.preventDefault(); // 기본 브라우저 context menu 막기
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            fileId: fileId // 우클릭한 파일 id 저장 ( 단일 파일만 )
        });
        // 단일 선택으로 강제 (우클릭은 보통 하나만 대상)
        setSelectedIds(new Set([fileId]));
    };



    // 컨텍스트 메뉴 닫기 (바깥 클릭 시)
    useEffect(() => {
        if (!contextMenu) return;

        const handleClickOutside = () => setContextMenu(null);
       
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
        
    }, [contextMenu]);

    const updateGuestStorage = (updatedFiles) => {
        if (!user) {
            sessionStorage.setItem('guestFiles', JSON.stringify(updatedFiles));
        }
    };
    //////////////////////////////////////////////////////////
    // [01.19 수정]
    // const moveTrash = (moveTrashFile) => {
    //     setFiles(prevFiles => {
    //          const updated = prevFiles.map(file =>
    //             moveTrashFile.has(file.id)
    //             ? { ...file, trashed: true }
    //             : file
    //         );

    //             updateGuestStorage(updated);

    //             return updated;
    // });
    // };
    
        ///////////////////////////////////////////
        // const restoreTrash = (reviveTrash) => {
        //     setFiles(prevFiles => {
        //          const updated = prevFiles.map(file =>  
        //             reviveTrash.has(file.id) ? { ...file, trashed: false } : file
        //         );
    
        //             updateGuestStorage(updated);
                    
        //             return updated;
        //     });
        // };
        // /////////////////////////////////////////
        
        // const deleteTrash = (fileDelete) => {
        //     setFiles(prevFiles => {
        //         const updated = prevFiles.filter(file => !fileDelete.has(file.id));
        //         updateGuestStorage(updated);
    
        //         return updated;
        // });
        // };
    
        ////////////////////////////////////////////
    

    const moveTrash = async (moveTrashFile) => {
        if (user && token) {
            try {
                await fetch('http://localhost:8080/api/files/trash', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    // Set을 Array로 변환해서 전송
                    body: JSON.stringify(Array.from(moveTrashFile))
                });
                fetchFilesFromServer(); // 서버 데이터로 동기화
                setSelectedIds(new Set()); // 선택 초기화
            } catch (err) { console.error(err); }
        } else {
            // 게스트 로직 (기존 유지)
            setFiles(prevFiles => {
                const updated = prevFiles.map(file =>
                    moveTrashFile.has(file.id) ? { ...file, trashed: true } : file
                );
                updateGuestStorage(updated);
                return updated;
            });
            setSelectedIds(new Set());
        }
    };
    /////////////////////////////////////////////////////////
    const restoreTrash = async (reviveTrash) => {
        if (user && token) {
            try {
                await fetch('http://localhost:8080/api/files/restore', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(Array.from(reviveTrash))
                });
                fetchFilesFromServer();
                setSelectedIds(new Set());
            } catch (err) { console.error(err); }
        } else {
            // 게스트 로직
            setFiles(prevFiles => {
                const updated = prevFiles.map(file =>  
                    reviveTrash.has(file.id) ? { ...file, trashed: false } : file
                );
                updateGuestStorage(updated);
                return updated;
            });
            setSelectedIds(new Set());
        }
    };
    ////////////////////////////////////////////////
    // ★★★ [수정 5] 영구 삭제 (서버 연동 추가)
    const deleteTrash = async (fileDelete) => {
        if (user && token) {
            try {
                await fetch('http://localhost:8080/api/files', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(Array.from(fileDelete))
                });
                fetchFilesFromServer();
                setSelectedIds(new Set());
            } catch (err) { console.error(err); }
        } else {
            // 게스트 로직
            setFiles(prevFiles => {
                const updated = prevFiles.filter(file => !fileDelete.has(file.id));
                updateGuestStorage(updated);
                return updated;
            });
            setSelectedIds(new Set());
        }
    };

    //=================================================================================//
    // ★ [추가] 파일 업로드 함수
    const uploadFile = async (file) => {
        if (!user || !token) {
            alert("로그인이 필요한 기능입니다.");
            return;
        }

        // 1. FormData 생성 (파일 전송용 택배 상자)
        const formData = new FormData();
        formData.append("file", file); // 백엔드의 @RequestParam("file")과 이름이 같아야 함

        try {
            const response = await fetch('http://localhost:8080/api/files/upload', {
                method: 'POST',
                headers: {
                    // ★ 중요: Content-Type은 적지 않습니다! 
                    // 브라우저가 알아서 multipart/form-data로 설정합니다.
                    Authorization: `Bearer ${token}` 
                },
                body: formData
            });

            if (response.ok) {
                // 성공하면 목록 새로고침
                await fetchFilesFromServer(); 
                alert("파일 업로드가 완료되었습니다.");
            } else {
                const errorText = await response.text();
                alert("업로드 실패: " + errorText);
            }
        } catch (error) {
            console.error("업로드 중 오류 발생", error);
            alert("서버 오류가 발생했습니다.");
        }
    };

    return (
        <FileContext.Provider value={{
            files,
            showModal,
            newLink,
            contextMenu,
            selectedIds,
            setNewLink,
            openModal,
            closeModal,
            createLink,
            moveTrash,
            restoreTrash,
            deleteTrash,
            setContextMenu,
            setSelectedIds,
            handleContextMenu,
            setFiles,
            uploadFile,
        }}>
        {children}
        </FileContext.Provider>
);
}


// 3. 다른 파일에서 쉽게 쓰라고 만든 훅 (중요!)
export const useFile = () => {
  return useContext(FileContext);
};

