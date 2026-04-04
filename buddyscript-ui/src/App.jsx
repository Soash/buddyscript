import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Registration from './pages/Registration';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';
import ComingSoon from './pages/ComingSoon';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Logout from './pages/Logout';
import Connections from './pages/Connections';
import Events from './pages/Events';
import FindPeople from './pages/FindPeople';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/feed" replace />} />
        
        <Route element={<PrivateRoute />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile/:id" element={<Profile />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/events" element={<Events />} />
          <Route path="/find-people" element={<FindPeople />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/support" element={<Support />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        
      </Routes>
    </Router>
  );
}

export default App;
