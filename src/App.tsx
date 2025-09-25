import { useState } from 'react'
import './index.css'
import Navbar from './components/Navbar'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="flex items-center justify-center h-full bg-dark-950">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 text-dark-50 font-woods">Welcome to tbdidk</h1>
              <p className="text-lg text-dark-200 font-woods">Practice, simplified.</p>
            </div>
          </div>
        )
      case 'find-song':
        return (
          <div className="flex items-center justify-center h-full bg-dark-950">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 text-dark-50 font-woods">Find Song</h1>
              <p className="text-lg text-dark-200 font-woods">Search for your favorite songs</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="h-screen bg-dark-950">
      <Navbar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
      />
      <main className="h-[calc(100vh-4rem)]">
        {renderPage()}
      </main>
    </div>
  )
}

export default App