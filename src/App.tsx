import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Simulator from './pages/Simulator';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<Simulator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
