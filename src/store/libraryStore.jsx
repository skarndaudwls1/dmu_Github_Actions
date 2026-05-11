import { createContext, useCallback, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

const LibraryContext = createContext(null)

const DEFAULT_BOOKS = [
  { id: 'b1', title: '클린 코드', author: '로버트 마틴', isbn: '9788966260959' },
  { id: 'b2', title: '리팩터링 2판', author: '마틴 파울러', isbn: '9788966262267' },
  { id: 'b3', title: '도메인 주도 설계', author: '에릭 에반스', isbn: '9788960773431' },
  { id: 'b4', title: '모던 자바스크립트 Deep Dive', author: '이웅모', isbn: '9791158392239' },
  { id: 'b5', title: '리액트를 다루는 기술', author: '김민준', isbn: '9791160508796' },
]

export function LibraryProvider({ children }) {
  const [books, setBooks] = useLocalStorage('library:books', DEFAULT_BOOKS)
  const [loans, setLoans] = useLocalStorage('library:loans', [])

  const addBook = useCallback((book) => {
    setBooks((prev) => [
      ...prev,
      { id: `b${Date.now()}`, ...book },
    ])
  }, [setBooks])

  const removeBook = useCallback((id) => {
    setBooks((prev) => prev.filter((b) => b.id !== id))
    setLoans((prev) => prev.filter((l) => l.bookId !== id))
  }, [setBooks, setLoans])

  const isLoaned = useCallback(
    (bookId) => loans.some((l) => l.bookId === bookId && !l.returnedAt),
    [loans],
  )

  const loanBook = useCallback((bookId, borrower) => {
    if (!borrower.trim()) return false
    setLoans((prev) => {
      if (prev.some((l) => l.bookId === bookId && !l.returnedAt)) return prev
      return [
        ...prev,
        {
          id: `l${Date.now()}`,
          bookId,
          borrower: borrower.trim(),
          loanedAt: new Date().toISOString(),
          returnedAt: null,
        },
      ]
    })
    return true
  }, [setLoans])

  const returnBook = useCallback((loanId) => {
    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId ? { ...l, returnedAt: new Date().toISOString() } : l,
      ),
    )
  }, [setLoans])

  const value = useMemo(
    () => ({ books, loans, addBook, removeBook, isLoaned, loanBook, returnBook }),
    [books, loans, addBook, removeBook, isLoaned, loanBook, returnBook],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used inside <LibraryProvider>')
  return ctx
}
