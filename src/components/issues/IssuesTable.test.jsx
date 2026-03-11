import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('../../lib/api', () => ({
  apiFetch: vi.fn()
}))

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ token: null })
}))

import { apiFetch } from '../../lib/api'
import IssuesTable from './IssuesTable'

describe('IssuesTable filters', () => {
  beforeEach(() => {
    apiFetch.mockResolvedValue([
      { id: 'BUG-001', title: 'Login fails', severity: 'high', status: 'open', priority: 'P1', assignee: null, tags: [], created: new Date().toISOString() },
      { id: 'BUG-002', title: 'Chart glitch', severity: 'low', status: 'closed', priority: 'P3', assignee: null, tags: [], created: new Date().toISOString() }
    ])
  })

  it('filters by status', async () => {
    render(<IssuesTable />)
    await waitFor(() => expect(screen.getByText('BUG-001')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Closed'))

    expect(screen.queryByText('BUG-001')).not.toBeInTheDocument()
    expect(screen.getByText('BUG-002')).toBeInTheDocument()
  })

  it('searches by title', async () => {
    render(<IssuesTable />)
    await waitFor(() => expect(screen.getByText('BUG-001')).toBeInTheDocument())

    fireEvent.change(screen.getByPlaceholderText('Search issues…'), { target: { value: 'chart' } })

    expect(screen.queryByText('BUG-001')).not.toBeInTheDocument()
    expect(screen.getByText('BUG-002')).toBeInTheDocument()
  })
})
