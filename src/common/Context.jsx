import { createContext, useContext, useState, useEffect } from 'react'

const FileContext = createContext();

export function FileProvider({ children }) {
    const [files, setFiles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newLink, setNewLink] = useState({ title: '', url: '' });
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());

    const openModal = () => {
        setShowModal(true);
        setNewLink({ title: '' , url: ''});
    };

    const closeModal = () => {
        setShowModal(false);
    }

    const createLink = () => {
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

