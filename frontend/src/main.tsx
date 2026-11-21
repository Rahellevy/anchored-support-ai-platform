// Entry point: mounts the React app into <div id="root"> in index.html.
import { createRoot } from 'react-dom/client'
import './index.css'
import { Root } from './Root'

createRoot(document.getElementById('root')!).render(<Root />)
