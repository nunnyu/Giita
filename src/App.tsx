import { Routes, Route } from 'react-router-dom'
import './index.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import FindSong from './pages/FindSong'

function App() {
  return (
    /* Main App Container */
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      {/* Routes */}
      <main className="min-h-[calc(90vh-4rem)] flex items-center justify-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/find-song" element={<FindSong />} />
        </Routes>
      </main>
    </div>
  )
}

export default App