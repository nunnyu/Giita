import { Routes, Route } from "react-router-dom";
import "./index.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import FindSong from "./pages/FindSong";
import Error from "./pages/Error";
import { HomeLayout, FindSongLayout } from "./components/Layouts";

/**
 * Main App component
 * @returns The main app component
 */
function App() {
  return (
    /* Main App Container */
    <div className="relative h-screen overflow-hidden m-0 p-0">
      {/* Navbar */}
      <div className="relative z-10 h-full flex flex-col pt-0 mt-0">
        <Navbar />
        {/* Routes */}
        <main className="flex-1 flex items-center justify-center overflow-y-auto">
          <Routes>
            <Route path="/" element={<HomeLayout><Home /></HomeLayout>} />
            <Route path="/find-song" element={<FindSongLayout><FindSong /></FindSongLayout>} />
            <Route path="*" element={<Error />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
