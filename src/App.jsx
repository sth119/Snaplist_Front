import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Main , Header, GuestPage, Navbar, LoginPage, UserPage } from './Bridge';


function HeaderWithNavbar() {
  return (
    
    <div className="flex flex-col min-h-screen">
        <Header />
      <div className='flex flex-1'>
      <Navbar />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
    
  )
}


function OnlyHeader() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className='flex-1'>
        <Outlet />
      </div>
    </div>
  )
}




function App() {
  return (
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
  )
}


export default App;