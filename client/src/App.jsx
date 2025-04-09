import React, { useEffect } from 'react'
import {Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import { SocketProvider } from './providers/Socket';
import RoomPage from './pages/RoomPage';
import { PeerProvider } from './providers/Peer';

const App = () => {


  return (
    <div>
      <SocketProvider>
      <PeerProvider>
      <Routes>
        
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<h1>About</h1>} />
        <Route path='/room/:roomId' element={<RoomPage />} />
       
      </Routes>
      </PeerProvider>
      </SocketProvider>
    </div>
  )
}

export default App
