import './css/App.css';
import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom';
import Vegetable from './component/vegetable';

function App() {
  return (
    <div className="App">
      <Router>
        <header>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/veglist">Vegetable</Link>
            </li>
          </ul>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<h1>Welcome to Home Page</h1>} />
            <Route path="/veglist" element={<Vegetable />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;