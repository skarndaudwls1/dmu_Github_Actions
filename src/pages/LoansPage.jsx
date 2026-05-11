import { useState } from 'react'
import { useLibrary } from '../store/libraryStore.jsx'

function formatDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString('ko-KR', { hideAt: false })
}

export default function LoansPage() {
  const { books, loans, returnBook } = useLibrary()
  const [filter, setFilter] = useState('active')

  const bookMap = Object.fromEntries(books.map((b) => [b.id, b]))

  const visible = loans
    .filter((l) => {
      if (filter === 'active') return !l.returnedAt
      if (filter === 'returned') return l.returnedAt
      return true
    })
    .sort((a, b) => new Date(b.loanedAt) - new Date(a.loanedAt))

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>대출 내역</h3>
        <select
          style={{ maxWidth: 180 }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="active">대출 중</option>
          <option value="returned">반납 완료</option>
          <option value="all">전체</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="empty">표시할 대출 내역이 없습니다.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>도서</th>
              <th>대출자</th>
              <th>대출일</th>
              <th>반납일</th>
              <th>상태</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((l) => {
              const book = bookMap[l.bookId]
              return (
                <tr key={l.id}>
                  <td>{book ? book.title : <i>(삭제된 도서)</i>}</td>
                  <td>{l.borrower}</td>
                  <td>{formatDate(l.loanedAt)}</td>
                  <td>{formatDate(l.returnedAt)}</td>
                  <td>
                    <span className={`badge ${l.returnedAt ? 'available' : 'loaned'}`}>
                      {l.returnedAt ? '반납 완료' : '대출 중'}
                    </span>
                  </td>
                  <td>
                    {!l.returnedAt && (
                      <button onClick={() => returnBook(l.id)}>반납</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
