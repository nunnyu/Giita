import { Routes, Route } from "react-router-dom";
import "./index.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import FindSong from "./pages/FindSong";
import Practice from "./pages/Practice";
import Error from "./pages/Error";
import { HomeLayout, PracticeLayout, ErrorLayout } from "./components/Layouts";

// We have a find song layout, but for now, I think that the practice layout just looks better.

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
            <Route path="/find-song" element={<PracticeLayout><FindSong /></PracticeLayout>} />
            <Route path="/practice" element={<PracticeLayout><Practice /></PracticeLayout>} />
            <Route path="*" element={<ErrorLayout><Error /></ErrorLayout>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
