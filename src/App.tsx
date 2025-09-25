import { Routes, Route } from 'react-router-dom'
import './index.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import FindSong from './pages/FindSong'

function App() {
  return (
    /* Main App Container */
    <div className="h-screen bg-dark-950">
      <Navbar />

      {/* Routes */}
      <main className="h-[calc(100vh-4rem)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/find-song" element={<FindSong />} />
        </Routes>
      </main>
    </div>
  )
}

export default App