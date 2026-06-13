import React from 'react'
import { Routes , Route, Navigate } from 'react-router'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Chat from './pages/Chat'
import { useEffect } from 'react';
import PageLoader from './components/PageLoader'
import {Toaster} from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux'
import {checkAuth, setOnlineUsers} from './store/authStore'

function App() {
  // const {checkAuth, authUser,isCheckingAuth}= useAuthStore();
  const dispatch = useDispatch();
  const authUser = useSelector((state)=>state.auth.authUser);
  const isCheckingAuth = useSelector((state)=>state.auth.isCheckingAuth);
  const socket = useSelector((state) => state.auth.socket);

  useEffect(()=>{
    dispatch(checkAuth());
  },[dispatch])
  
  useEffect(() => {
    if (!socket) return;

    socket.on("getOnlineUsers", (userIds) => {
      dispatch(setOnlineUsers(userIds));
    });

    return () => {
      socket.off("getOnlineUsers");
    };
  }, [socket, dispatch]);

  if(isCheckingAuth){
    return <PageLoader/>
  }
  
  return (
    <div className="min-h-screen bg-slate-900 relative flex items-center justify-center p-4 overflow-hidden">
      {/* DECORATORS - GRID BG & GLOW SHAPES */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />

      <Routes>
        <Route path="/" element={ authUser ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/login" element={authUser ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={authUser ? <Navigate to="/" /> : <SignUp />} />
      </Routes>

      <Toaster />
    </div>
  );
}

export default App