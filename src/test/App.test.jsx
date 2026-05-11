import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'
import { LibraryProvider } from '../store/libraryStore.jsx'

function renderApp(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <LibraryProvider>
        <App />
      </LibraryProvider>
    </MemoryRouter>,
  )
}

describe('App', () => {
  it('renders header title', () => {
    renderApp()
    expect(screen.getByText(/DMU 도서관 대출 시스템/)).toBeInTheDocument()
  })

  it('renders nav links', () => {
    renderApp()
    expect(screen.getByRole('link', { name: '홈' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '도서 목록' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '대출 내역' })).toBeInTheDocument()
  })

  it('renders books page', () => {
    renderApp(['/books'])
    expect(screen.getByText(/도서 등록/)).toBeInTheDocument()
  })
})
