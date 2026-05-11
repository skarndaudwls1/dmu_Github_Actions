import { useState } from 'react'
import { useLibrary } from '../store/libraryStore.jsx'

export default function BooksPage() {
  const { books, addBook, removeBook, isLoaned, loanBook } = useLibrary()
  const [keyword, setKeyword] = useState('')
  const [form, setForm] = useState({ title: '', author: '', isbn: '' })
  const [borrowerInputs, setBorrowerInputs] = useState({})

  const filtered = books.filter((b) => {
    const q = keyword.trim().toLowerCase()
    if (!q) return true
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.isbn.includes(q)
    )
  })

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.author.trim()) return
    addBook(form)
    setForm({ title: '', author: '', isbn: '' })
  }

  const handleLoan = (bookId) => {
    const borrower = (borrowerInputs[bookId] || '').trim()
    if (!borrower) {
      alert('대출자 이름을 입력하세요.')
      return
    }
    if (loanBook(bookId, borrower)) {
      setBorrowerInputs((prev) => ({ ...prev, [bookId]: '' }))
    }
  }

  return (
    <div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>도서 등록</h3>
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="field">
              <label>제목</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="예: 클린 아키텍처"
              />
            </div>
            <div className="field">
              <label>저자</label>
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="예: 로버트 마틴"
              />
            </div>
            <div className="field">
              <label>ISBN</label>
              <input
                value={form.isbn}
                onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                placeholder="9788966262472"
              />
            </div>
            <button type="submit">추가</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>도서 목록 ({filtered.length})</h3>
          <input
            style={{ maxWidth: 260 }}
            placeholder="제목·저자·ISBN 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty">표시할 도서가 없습니다.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>제목</th>
                <th>저자</th>
                <th>ISBN</th>
                <th>상태</th>
                <th style={{ width: 280 }}>대출/관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const loaned = isLoaned(b.id)
                return (
                  <tr key={b.id}>
                    <td>{b.title}</td>
                    <td>{b.author}</td>
                    <td>{b.isbn}</td>
                    <td>
                      <span className={`badge ${loaned ? 'loaned' : 'available'}`}>
                        {loaned ? '대출 중' : '대출 가능'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {!loaned && (
                          <>
                            <input
                              style={{ flex: 1 }}
                              placeholder="대출자명"
                              value={borrowerInputs[b.id] || ''}
                              onChange={(e) =>
                                setBorrowerInputs((prev) => ({
                                  ...prev,
                                  [b.id]: e.target.value,
                                }))
                              }
                            />
                            <button onClick={() => handleLoan(b.id)}>대출</button>
                          </>
                        )}
                        <button className="danger" onClick={() => removeBook(b.id)}>
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
