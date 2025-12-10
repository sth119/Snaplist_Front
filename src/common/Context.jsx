import { createContext, useContext, useState } from 'react'

const FileContext = createContext();

export function FileProvider({ children }) {
    const [files, setFiles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newLink, setNewLink] = useState({ title: '', url: '' });

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

        if (!fullUrl.startsWith('https://') && !fullUrl.startsWith('https://')) {
            fullUrl = 'https://' + fullUrl;
        }
    
    
    const newFile = {
        id: Date.now(),
        title: newLink.title.trim(),
        url: fullUrl,
        type: 'link',
        createdAt: new Date().toISOString()
    };    
    
    setFiles(prev => [ ...prev, newFile ]);

    closeModal();
    setNewLink({ title: '', url: ''});

};

    return (
        <FileContext.Provider value={{
            files,
            showModal,
            newLink,
            setNewLink,
            openModal,
      closeModal,
      createLink
    }}>
        {children}
    </FileContext.Provider>
);
}


// 3. 다른 파일에서 쉽게 쓰라고 만든 훅 (중요!)
export const useFile = () => {
  return useContext(FileContext);
};

