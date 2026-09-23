import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App.tsx'

describe('Friendsgiving app', () => {
  it('renders the home page hero and key content', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText('FRIENDSGIVING 2026')).toBeInTheDocument()
    expect(screen.getByText('Explore the evening')).toBeInTheDocument()
    expect(screen.getAllByText('The Menu').length).toBeGreaterThan(0)
  })

  it('renders the menu route', () => {
    render(
      <MemoryRouter initialEntries={['/menu']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText('Dinner menu')).toBeInTheDocument()
  })

  it('requires host access before revealing the admin dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText('Host access required')).toBeInTheDocument()
    expect(screen.queryByText('Administrative dashboard')).not.toBeInTheDocument()
  })

  it('stores a submitted vote in local storage', () => {
    window.localStorage.clear()

    render(
      <MemoryRouter initialEntries={['/vote']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /Turkey Wings/i }))
    fireEvent.click(screen.getByRole('button', { name: /Submit vote/i }))

    const savedVotes = JSON.parse(window.localStorage.getItem('friendsgiving-votes') || '[]')
    expect(savedVotes).toHaveLength(1)
    expect(savedVotes[0]).toMatchObject({ dish: expect.any(String) })
  })

  it('keeps the home page focused on the event experience without RSVP controls', () => {
    window.localStorage.clear()

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.queryByText('RSVP status')).not.toBeInTheDocument()
    expect(screen.getByText('Who’s in the room')).toBeInTheDocument()
    expect(screen.getAllByText('Friendsgiving 2026').length).toBeGreaterThan(0)
  })

  it('shows a guest list on the home page', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText('Guest list')).toBeInTheDocument()
    expect(screen.getByText('Joshua O (Host)')).toBeInTheDocument()
    expect(screen.getByText('Justin')).toBeInTheDocument()
    expect(screen.getByText('Simon')).toBeInTheDocument()
  })

  it('lets guests submit a gratitude message that persists locally', () => {
    window.localStorage.clear()

    render(
      <MemoryRouter initialEntries={['/gratitude']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/your name or display name/i), {
      target: { value: 'Avery' },
    })
    fireEvent.change(screen.getByLabelText(/what are you thankful for/i), {
      target: { value: 'Good friends and great food.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /share/i }))

    const savedMessages = JSON.parse(window.localStorage.getItem('friendsgiving-gratitude') || '[]')
    expect(savedMessages.length).toBeGreaterThan(0)
    expect(screen.getByText('Avery')).toBeInTheDocument()
  })

  it('lets guests remove a note from the gratitude wall', () => {
    window.localStorage.clear()
    const existingEntries = [
      { name: 'Avery', message: 'Good friends and great food.' },
      { name: 'Jordan', message: 'Grateful for this crew.' },
    ]
    window.localStorage.setItem('friendsgiving-gratitude', JSON.stringify(existingEntries))

    render(
      <MemoryRouter initialEntries={['/gratitude']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getAllByRole('button', { name: /remove note/i })[0])

    expect(screen.queryByText('Good friends and great food.')).not.toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem('friendsgiving-gratitude') || '[]')).toHaveLength(1)
  })

  it('lets guests select multiple gallery images, preview them, and save them for moderation', async () => {
    window.localStorage.clear()

    render(
      <MemoryRouter initialEntries={['/gallery']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /upload photos/i }))

    const fileInput = screen.getByLabelText(/upload photos/i)
    expect(fileInput).toHaveAttribute('type', 'file')
    expect(fileInput).toHaveAttribute('accept', 'image/*')
    expect(fileInput).toHaveAttribute('multiple')

    const firstImage = new File(['hello'], 'first.jpg', { type: 'image/jpeg' })
    const secondImage = new File(['world'], 'second.png', { type: 'image/png' })

    fireEvent.change(fileInput, {
      target: { files: [firstImage, secondImage] },
    })

    await waitFor(() => {
      expect(screen.getByText('first.jpg')).toBeInTheDocument()
      expect(screen.getByText('second.png')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /submit photos/i }))

    const savedGallery = JSON.parse(window.localStorage.getItem('friendsgiving-gallery') || '[]')
    expect(savedGallery.length).toBeGreaterThan(0)
    expect(savedGallery[0]).toMatchObject({ title: expect.any(String) })
  })

  it('persists host admin controls across a reload', () => {
    window.localStorage.clear()

    const { unmount } = render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/host code/i), {
      target: { value: 'FRIENDS2026' },
    })
    fireEvent.click(screen.getByRole('button', { name: /unlock dashboard/i }))
    fireEvent.click(screen.getByRole('button', { name: /open voting/i }))
    fireEvent.click(screen.getByRole('button', { name: /reveal result/i }))

    expect(screen.getByText(/voting is currently open/i)).toBeInTheDocument()
    expect(screen.getByText(/the winner has been revealed/i)).toBeInTheDocument()

    unmount()

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: /close voting/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hide result/i })).toBeInTheDocument()
  })
})
