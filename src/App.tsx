import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Studio from './pages/Studio';
import Compare from './pages/Compare';
import Gallery from './pages/Gallery';
import Docs from './pages/Docs';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/docs" element={<Docs />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
