import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import ProtectedRoute from './components/ProtectedRoute';
import Admin from './pages/Admin';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateStand from './pages/CreateStand';
import StandDetail from './pages/StandDetail';
import ProductDetail from './pages/ProductDetail';
import CreateProduct from './pages/CreateProduct';
import MyStands from './pages/MyStands';
import EditStand from './pages/EditStand';
import Reels from './pages/Reels';
import Profile from './pages/Profile';
import PrixDuMarche from './pages/PrixDuMarche';

function PublicApp() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />
          <Route path="/market-buzz"    element={<Reels />} />
          <Route path="/prix-du-marche" element={<PrixDuMarche />} />
          <Route path="/stands/:id"    element={<StandDetail />} />
          <Route path="/products/:id"  element={<ProductDetail />} />
          <Route path="/create-stand"  element={<ProtectedRoute><CreateStand /></ProtectedRoute>} />
          <Route path="/my-stands"     element={<ProtectedRoute><MyStands /></ProtectedRoute>} />
          <Route path="/profile"       element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/stands/:id/edit"             element={<ProtectedRoute><EditStand /></ProtectedRoute>} />
          <Route path="/stands/:standId/add-product" element={<ProtectedRoute><CreateProduct /></ProtectedRoute>} />
        </Routes>
      </main>
      <ChatWidget />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin — completely isolated, no navbar or chat widget */}
          <Route path="/admin/*" element={<Admin />} />
          {/* Public site */}
          <Route path="/*" element={<PublicApp />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </LanguageProvider>
  );
}
