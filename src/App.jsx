import { NavLink, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import BooksPage from './pages/BooksPage.jsx'
import LoansPage from './pages/LoansPage.jsx'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 DMU 도서관 대출 시스템</h1>
        <nav>
          <NavLink to="/" end>홈</NavLink>
          <NavLink to="/books">도서 목록</NavLink>
          <NavLink to="/loans">대출 내역</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/loans" element={<LoansPage />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <small>© 2026 DMU Library · Deployed via GitHub Actions + AWS Amplify</small>
      </footer>
    </div>
  )
}
