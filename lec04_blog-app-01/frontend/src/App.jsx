import { Route, Routes } from "react-router-dom"
import "./App.css"
import Blog from "./components/Blog"
import Signup from "./pages/signup"
import Signin from "./pages/signin"
import CreateBlog from "./components/CreateBlog"

function App() {

  return (
    <Routes>
      <Route path="/" element={<Blog></Blog>}></Route>
      <Route path="/signup" element={<Signup></Signup>}></Route>
      <Route path="/signin" element={<Signin></Signin>}></Route>
      <Route path="/create-blog" element={<CreateBlog></CreateBlog>}></Route>
      <Route path="*" element={<h1>Page Not Found</h1>}></Route>
    </Routes>
  )
}

export default App
