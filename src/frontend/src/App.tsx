import { Routes, Route } from "react-router-dom";
import "./index.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import FindSong from "./pages/FindSong";

function App() {
  return (
    /* Main App Container */
    <div className="relative h-screen overflow-hidden m-0 p-0"> 
      {/* Blurred background layer */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: "url(/images/vanhalen.webp)",
          filter: "blur(4px)",
        }}
      />
      {/* Gradient overlay - fades background from top to bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-990/60 to-dark-990/95" />
      <div className="relative z-10 h-full flex flex-col pt-0 mt-0">
        <Navbar />

        {/* Routes */}
        <main className="flex-1 flex items-center justify-center overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/find-song" element={<FindSong />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
