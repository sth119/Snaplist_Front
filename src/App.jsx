import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Main , Header, GuestPage, Navbar, LoginPage, UserPage } from './Bridge';
import { FileProvider, useFile } from "./common/Context";

function HeaderWithNavbar() {
  return (
    
    <div className="flex flex-col min-h-screen">
        <Header />
      <div className='flex flex-1'>
      <Navbar />
        <div className="flex-1 relative">
          <Outlet />
          <CreateModal />
        </div>
      </div>
    </div>
    
  )
}


function OnlyHeader() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className='flex-1 flex flex-col'>
        <Outlet />
      </div>
    </div>
  )
}

function CreateModal() {
  const { showModal, newLink, setNewLink, closeModal, createLink } = useFile();

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={closeModal}>
      <div className="bg-gray-200 rounded-lg shadow-2xl p-8 w-full max-w-md mx-4 border-2 border-red-500" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 24px 0', textAlign: 'center' }}>새 링크 추가</h2>
        
        <div className='flex flex-col'>
        <label>title</label>
        <input
          type="text"
          placeholder="TITLE"
          value={newLink.title}
          onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
          autoFocus
          className='rounded-md border border-red-500'
        />
        
        <label>url</label>
        <input
          type="url"
          placeholder="URL"
          value={newLink.url}
          onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
          className='rounded-md border border-red-500'
        />
        </div>

        <div className="modal-buttons flex justify-evenly mt-8 ">
          <button className="border border-white w-16 h-12 rounded-md bg-white" onClick={closeModal}>취소</button>
          <button 
            className="confirm border border- w-16 h-12 rounded-md bg-white"
            onClick={createLink}
            disabled={!newLink.title.trim() || !newLink.url.trim()}
          >
            생성
          </button>
        </div>
      </div>
    </div>
  );
}


function App() {
  return (
    <FileProvider>
    <BrowserRouter>
    
        <Routes>
          <Route element={<HeaderWithNavbar />}>
            <Route path="/guest" element={<GuestPage />} />
            <Route path="/user" element={<UserPage />} />
          </Route>
          <Route element={<OnlyHeader />}>
            <Route path="/" element={<Main />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>
        </Routes>
    </BrowserRouter>
    </FileProvider>
  )
}


export default App;