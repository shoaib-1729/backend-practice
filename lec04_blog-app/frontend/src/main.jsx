import { createRoot } from 'react-dom/client'
import './index.css'
import { Toaster } from 'react-hot-toast';
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import store from "./utils/store"
import { Provider } from 'react-redux'


createRoot(document.getElementById('root')).render(
    <Provider store={store}>
    <BrowserRouter>
    <Toaster />
        <App />
    </BrowserRouter>
    </Provider >
)

