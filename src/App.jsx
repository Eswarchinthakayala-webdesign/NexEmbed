// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Pages
import LandingPage from "@/pages/LandingPage";
import DocumentationPage from "./pages/DocumentationPage";
import HelpPage from "@/pages/HelpPage";
import ScrollToTop from "./components/ScrollToTop";
import SimulatorPage from "@/pages/SimulatorPage";
import ProjectsPage from "@/pages/ProjectsPage";
import TemplatesPage from "@/pages/TemplatesPage";
import SmartHomeHubSimulator from "./pages/SmartHomeHubSimulator";
import AccessControlSimulator from "./pages/AccessControlSimulator";
import LineFollowerBotSimulator from "./pages/LineFollowerBotSimulator";
import WeatherStationSimulator from "./pages/WeatherStationSimulator";
import DetailsPage from "./pages/DetailsPage";
import EmbeddedESQuizPro from "./pages/EmbeddedESQuizPro";
import EmbeddedSyllabusPage from "./pages/EmbeddedSyllabusPage";
// Sonner
import { Toaster } from "sonner";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="relative flex flex-col min-h-screen bg-[#0b0f17] text-white overflow-hidden">
        {/* Background Animated Gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute w-[800px] h-[800px] bg-green-500/20 rounded-full blur-3xl animate-pulse top-[-200px] left-[-200px]" />
          <div className="absolute w-[600px] h-[600px] bg-emerald-400/20 rounded-full blur-3xl animate-[float_12s_infinite] bottom-[-150px] right-[-150px]" />
        </div>

        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1 relative z-10">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/docs" element={<DocumentationPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/smart-home-hub" element={<SmartHomeHubSimulator />} />
            <Route path="/access-control" element={<AccessControlSimulator />} />
            <Route path="/line-follower-bot" element={<LineFollowerBotSimulator />} />
            <Route path="/weather-station" element={<WeatherStationSimulator />} />
            <Route path="/details" element={<DetailsPage/>}/>
            <Route path="/quiz" element={<EmbeddedESQuizPro/>}/>
            <Route path="/syllabus" element={<EmbeddedSyllabusPage/>}/>
          </Routes>
        </main>

        {/* Footer */}
        <Footer />

        {/* Sonner Toaster */}
        <Toaster position="top-right" richColors />
      </div>
    </Router>
  );
}

export default App;
