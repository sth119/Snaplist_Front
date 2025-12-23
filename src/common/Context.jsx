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
    // ★★★ 로그인 상태 (나중에 JWT로 대체)
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
    // 서버에서 파일 불러오기 (로그인 시)
    const fetchFilesFromServer = async () => {
        if (!user || !token) return;
        try {
            const response = await fetch('/api/files', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const serverFiles = await response.json();
                setFiles(serverFiles);
            }
        } catch (error) {
            console.error('서버 파일 불러오기 실패', error);
        }
    };

    // 앱 시작 시 파일 로드
    useEffect(() => {
        if (user) {
            const guestFiles = localStorage.getItem('guestFiles')

            if(guestFiles) {
                localStorage.removeItem('guestFiles');
            }
            fetchFilesFromServer();
        } else {
            const localFiles = JSON.parse(localStorage.getItem('guestFiles') || '[]');
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
                const response = await fetch('/api/files', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title: newFile.title,
                        url: newFile.url,
                        type: newFile.type
                    })
                });
                if (response.ok) {
                    const savedFile = await response.json();
                    setFiles(prev => [...prev, savedFile]);
                }
            } catch (error) {
                console.error('서버 저장 실패', error);
            }
        } else {
            // 게스트: localStorage에 저장
            const updatedFiles = [...files, newFile];
            setFiles(updatedFiles);
            localStorage.setItem('guestFiles', JSON.stringify(updatedFiles));
        }
    ///////////////////////////////////////////////
    
    setFiles(prev => [ ...prev, newFile ]);

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


    const moveTrash = (moveTrashFile) => {
        setFiles(prevFiles => 
            prevFiles.map(file =>
                moveTrashFile.has(file.id)
                ? { ...file, trashed: true }
                : file
            )
        );
    };

    const restoreTrash = (reviveTrash) => {
        setFiles(prevFiles => 
            prevFiles.map(file => 
                reviveTrash.has(file.id) ? { ...file, trashed: false } : file
            )
        );
    };

    const deleteTrash = (fileDelete) => {
        setFiles(prevFiles =>
            prevFiles.filter(file => !fileDelete.has(file.id))
        );
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
        }}>
        {children}
        </FileContext.Provider>
);
}


// 3. 다른 파일에서 쉽게 쓰라고 만든 훅 (중요!)
export const useFile = () => {
  return useContext(FileContext);
};

