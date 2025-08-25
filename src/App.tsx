import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import StudySpots from "./pages/StudySpots";
import RecreationSpots from "./pages/RecreationSpots";
import NotFound from "./pages/NotFound";
import MySpots from "./pages/MySpots";
import Lumora from "./pages/Lumora";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/study-spots" element={<StudySpots />} />
            <Route path="/recreation-spots" element={<RecreationSpots />} />
            <Route path="/my-spots" element={<MySpots />} />
            <Route path="/lumora" element={<Lumora />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
