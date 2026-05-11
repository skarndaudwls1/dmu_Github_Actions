import { Link } from 'react-router-dom'
import { useLibrary } from '../store/libraryStore.jsx'

export default function HomePage() {
  const { books, loans } = useLibrary()
  const activeLoans = loans.filter((l) => !l.returnedAt)

  return (
    <div>
      <div className="stats">
        <div className="stat-card">
          <div className="label">전체 도서</div>
          <div className="value">{books.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">대출 중</div>
          <div className="value">{activeLoans.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">대출 가능</div>
          <div className="value">{books.length - activeLoans.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">누적 대출 건수</div>
          <div className="value">{loans.length}</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>👋 환영합니다</h2>
        <p>
          이 사이트는 GitHub Actions + AWS Amplify로 자동 배포되는 도서관 대출
          시스템입니다. 도서를 등록하고 대출/반납 기능을 사용해 보세요.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/books"><button>도서 관리 →</button></Link>
          <Link to="/loans"><button className="secondary">대출 내역 보기</button></Link>
        </div>
      </div>
    </div>
  )
}
