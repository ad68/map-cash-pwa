
import './App.css'
import { Route, Routes } from 'react-router-dom';
import Home from './modules/Home'
import MapTest from './modules/Map'
function App() {
  return <Routes>
    <Route element={<Home />} path='/' />
    <Route element={<MapTest />} path='/map-cash' />
  </Routes>
}

export default App
