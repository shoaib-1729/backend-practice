import { Routes, Route} from 'react-router-dom';
import AuthForm from './pages/authForm';
function App() {

  return (
    <div className='relative h-screen bg-gray-200'>
      <Routes>
        <Route path="/signup" element={<AuthForm type={"signup"} />}></Route>
        <Route path="/signin" element={<AuthForm type={"signin"} />}></Route>
      </Routes>
    </div>
  )
}

export default App
