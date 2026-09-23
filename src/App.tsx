import { type ChangeEvent, type ReactNode, useEffect, useState } from 'react'
import {
  Camera,
  CalendarDays,
  ChefHat,
  Heart,
  Home,
  MapPin,
  Sparkles,
  Trophy,
  Utensils,
} from 'lucide-react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { eventDetails, featureCards } from './data/event'
import { generateQrDataUrl, qrTargets } from './qr'

const navItems = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Menu', to: '/menu', icon: Utensils },
  { label: 'Vote', to: '/vote', icon: ChefHat },
  { label: 'Gallery', to: '/gallery', icon: Camera },
  { label: 'Gratitude', to: '/gratitude', icon: Heart },
  { label: 'Admin', to: '/admin', icon: Sparkles },
]

const menuSections = [
  {
    name: 'Appetizers',
    dishes: [
      { id: 'dish-1', name: 'Fruit Salad', contributor: 'Fresh & bright', detail: 'Light, colorful, and refreshing.' },
      { id: 'dish-2', name: 'Chicken Wings', contributor: 'Savory favorite', detail: 'Crispy, juicy, and made for sharing.' },
      { id: 'dish-3', name: 'Small Chops', contributor: 'Party classic', detail: 'Bite-sized savory bites with a crowd-pleasing crunch.' },
      { id: 'dish-4', name: 'Champagne', contributor: 'Celebration pour', detail: 'A bubbly toast for the evening.' },
    ],
  },
  {
    name: 'Main Dishes',
    dishes: [
      { id: 'dish-5', name: 'Turkey Wings', contributor: 'Savory favorite', detail: 'Golden, juicy, and perfect for a celebratory spread.' },
      { id: 'dish-6', name: 'Something Mexican', contributor: 'Flavorful favorite', detail: 'A bold, vibrant dish with a festive kick.' },
      { id: 'dish-7', name: 'Oxtail Rasta Pasta', contributor: 'Guest favorite', detail: 'A rich, celebratory comfort dish.' },
      { id: 'dish-8', name: 'Jollof Rice', contributor: 'Guest favorite', detail: 'A fragrant party staple.' },
      { id: 'dish-9', name: 'Baked Chicken', contributor: 'Guest favorite', detail: 'Golden and savory, made for sharing.' },
    ],
  },
  {
    name: 'Sides',
    dishes: [
      { id: 'dish-10', name: 'Texas Roadhouse Rolls', contributor: 'Warm & buttery', detail: 'Soft, golden, and perfect with dinner.' },
      { id: 'dish-11', name: 'Mac & Cheese', contributor: 'Guest favorite', detail: 'Creamy, gooey, and familiar.' },
      { id: 'dish-12', name: 'Collard Greens', contributor: 'Guest favorite', detail: 'Slow-cooked and deeply comforting.' },
      { id: 'dish-13', name: 'Sweet Potatoes', contributor: 'Guest favorite', detail: 'A subtle sweet finish to the table.' },
    ],
  },
  {
    name: 'Desserts',
    dishes: [
      { id: 'dish-14', name: 'Nothing Bundt Cakes cake', contributor: 'Guest favorite', detail: 'A beautiful dessert centerpiece.' },
      { id: 'dish-15', name: 'Banana bread', contributor: 'Guest favorite', detail: 'Warm, comforting, and easy to share.' },
      { id: 'dish-16', name: 'Cookie Platter', contributor: 'Sweet & shareable', detail: 'A classic crowd favorite for grazing and dessert table snacking.' },
      { id: 'dish-17', name: 'Pumpkin Pies', contributor: 'Warm-season classic', detail: 'A cozy year-end favorite.' },
    ],
  },
  {
    name: 'Drinks',
    dishes: [
      { id: 'dish-18', name: 'Lemonade', contributor: 'Fresh & bright', detail: 'Citrusy, crisp, and refreshing.' },
      { id: 'dish-19', name: 'Sparkling water', contributor: 'Clean & light', detail: 'A crisp refresher for the table.' },
      { id: 'dish-20', name: 'Fruit punch', contributor: 'Festive favorite', detail: 'Sweet, fruity, and celebratory.' },
      { id: 'dish-21', name: 'Water', contributor: 'Essential refreshment', detail: 'Simple, cool, and always welcome.' },
      { id: 'dish-22', name: "Addo's Poison", contributor: 'House favorite', detail: 'A bold signature sip for the table.' },
    ],
  },
]

type GalleryPhoto = {
  id?: string
  title: string
  imageUrl?: string
  status?: 'pending' | 'approved'
  createdAt?: string
}

type PendingUpload = {
  id: string
  name: string
  previewUrl: string
  file: File
  status: 'ready' | 'uploading' | 'success' | 'error'
  progress: number
  message: string
}

const galleryShots: GalleryPhoto[] = []

const isHeicOrHeif = (file: File) => {
  return file.type === 'image/heic' || file.type === 'image/heif' || /\.(heic|heif)$/i.test(file.name)
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Image file could not be read.'))
    }

    reader.onerror = () => reject(new Error('Image file could not be read.'))
    reader.readAsDataURL(file)
  })

const convertImageToJpeg = async (file: File) => {
  if (!isHeicOrHeif(file)) {
    return file
  }

  try {
    if (typeof createImageBitmap === 'undefined') {
      return file
    }

    const bitmap = await createImageBitmap(file)
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height

    const context = canvas.getContext('2d')
    if (!context) {
      return file
    }

    context.drawImage(bitmap, 0, 0)
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result)
            return
          }

          reject(new Error('Unable to convert HEIC image to JPEG.'))
        },
        'image/jpeg',
        0.92,
      )
    })

    return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })
  } catch {
    return file
  }
}

const gratitudeNotes = [
  {
    name: 'Ariana',
    message: 'I’m grateful for the laughter, the food, and the people who made this feel like home.',
  },
  {
    name: 'Shawn',
    message: 'Thankful for good friends, good stories, and a year full of love and support.',
  },
  {
    name: 'Nia',
    message: 'I’m thankful for cozy dinners, honest conversations, and memories that keep getting better.',
  },
]

const giftItems = [
  'Custom tote bags',
  'Mason jars with wooden lids and glass straws',
  'Fridge magnets',
  'Mini champagne',
  'Passport holders and luggage tags',
  'Silver hip flasks',
]

const tournamentParticipants = [
  'Maya',
  'Jordan',
  'Ari',
  'Taylor',
  'Nia',
  'Sam',
  'Leo',
  'Zuri',
  'Drew',
  'Ava',
  'Chris',
  'Rae',
  'Theo',
  'Ivy',
  'Noah',
  'Mila',
]

const bracketMatches = [
  ['Maya vs Jordan', 'Ari vs Taylor'],
  ['Nia vs Sam', 'Leo vs Zuri'],
  ['Drew vs Ava', 'Chris vs Rae'],
  ['Theo vs Ivy', 'Noah vs Mila'],
]

const scores = [
  { label: 'Votes submitted', value: '12' },
  { label: 'Pending approvals', value: '4' },
  { label: 'Current round', value: 'Round 1' },
  { label: 'Guest count', value: '20' },
]

const guestNames = [
  'Justin',
  'Joshua W.',
  'Addo',
  'Chuka',
  'Jason',
  'Chiamaka',
  'Tosin',
  'Brittany',
  'Mathew',
  'Jermaline',
  'Ayannah',
  'D\'Angelo',
  'Subi',
  'Casey',
  'Simon',
]

const guestList = ['Joshua O (Host)', ...[...guestNames].sort(() => Math.random() - 0.5)]

const ADMIN_ACCESS_CODE = (import.meta.env.VITE_HOST_ACCESS_CODE || 'FRIENDS2026').trim()

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(185,110,62,0.2),transparent_30%),linear-gradient(180deg,#f7efe7_0%,#efd9b4_100%)] text-[#241914]">
      <header className="sticky top-0 z-40 border-b border-[#241914]/10 bg-[#f6ead9]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-3" aria-label="Return home">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#241914] text-sm font-bold text-[#f5e9d7] shadow-lg shadow-[#241914]/20">
              IG
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#6b4a3d]">Friendsgiving</p>
              <h1 className="text-base font-semibold tracking-[0.08em] text-[#241914]">IN GOOD TASTE</h1>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-5 md:flex">
            {navItems.slice(0, 7).map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    isActive ? 'bg-[#f2dcc0] text-[#241914] shadow-sm' : 'text-[#5c463f] hover:text-[#241914]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <NavLink
            to="/admin"
            className="hidden rounded-full border border-[#241914]/10 bg-[#241914] px-4 py-2 text-sm font-medium text-[#f5e9d7] shadow-md shadow-[#241914]/10 transition hover:-translate-y-px md:inline-flex"
          >
            Admin
          </NavLink>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#241914]/10 bg-[#f8f0e7]/95 p-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-2">
          {navItems.slice(0, 8).map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-2xl border px-2 py-2 text-center text-[10px] font-medium transition ${
                  isActive
                    ? 'border-[#241914]/10 bg-[#f2dcc0] text-[#241914] shadow-sm'
                    : 'border-[#241914]/10 bg-[#f5e9d7] text-[#5c463f]'
                }`
              }
            >
              <div className="mb-1 flex justify-center">
                <Icon size={16} />
              </div>
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <footer className="mx-auto max-w-6xl border-t border-[#241914]/10 px-4 py-8 text-sm text-[#5c463f] sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-[#241914]">In Good Taste</p>
            <p>Friendsgiving 2026</p>
          </div>
          <div className="flex items-center gap-2 text-[#5c463f]">
            <MapPin size={16} />
            <span>Linthicum Heights, Maryland</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function HomePage() {
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'not-attending' | 'pending'>('pending')

  useEffect(() => {
    const savedStatus = window.localStorage.getItem('friendsgiving-rsvp')
    if (savedStatus === 'attending' || savedStatus === 'not-attending') {
      setRsvpStatus(savedStatus)
    }
  }, [])

  const updateRsvp = (status: 'attending' | 'not-attending') => {
    setRsvpStatus(status)
    window.localStorage.setItem('friendsgiving-rsvp', status)
  }

  return (
    <>
      <section className="overflow-hidden rounded-4xl border border-[#241914]/10 bg-[linear-gradient(135deg,#fffaf4_0%,#f7ebdd_45%,#f0d8b4_100%)] shadow-(--shadow)">
        <div className="flex justify-center p-5 sm:p-8 lg:p-10">
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center text-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#7a3a2a]/30 bg-[#f2dcc0] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#3c221d]">
              <Sparkles size={12} />
              Friendsgiving 2026
            </div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#6b433a]">{eventDetails.name}</p>
            <h1 className="mt-3 text-4xl font-bold leading-none text-[#1d110d] sm:text-5xl md:text-6xl">
              {eventDetails.subtitle}
            </h1>
            <p className="mt-4 text-xl italic text-[#6d3d2d]">{eventDetails.slogan}</p>
            <p className="mt-6 text-lg text-[#4e3a34]">{eventDetails.date}</p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-[#4f3e38]">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f1dcc0] px-3 py-2">
                <CalendarDays size={16} />
                {eventDetails.time}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f1dcc0] px-3 py-2">
                <MapPin size={16} />
                {eventDetails.location}
              </div>
            </div>

            <p className="mt-6 max-w-2xl text-base text-[#543f39]">{eventDetails.welcome}</p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-4xl border border-[#241914]/10 bg-[linear-gradient(135deg,#f9f1e7_0%,#f2dcc0_100%)] p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.26em] text-[#6b433a]">Host note</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#241914]">Welcome to the table</h2>
            <p className="mt-3 text-base leading-relaxed text-[#543f39]">
              Tonight is about comfort, gratitude, and good energy. We’re grateful to gather in a space built for laughter,
              community, and a little bit of celebration.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[#241914]/10 bg-[#241914] p-4 text-[#f5e9d7] shadow-lg shadow-[#241914]/10">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#f1d8b8]">Gathering</p>
            <p className="mt-3 text-2xl font-semibold">In Good Taste</p>
            <p className="mt-2 text-sm text-[#f1d8b8]">Friendsgiving 2026 • Good food • Good company</p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-4xl border border-[#241914]/10 bg-[#f5e9d7] p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#7a655c]">Guest list</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#241914]">Who’s in the room</h2>
          </div>
          <span className="rounded-full border border-[#241914]/10 bg-[#fffaf3] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#4f3e38]">
            {guestList.length} guests
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {guestList.map((guest) => (
            <span key={guest} className="rounded-full border border-[#241914]/10 bg-[#fffaf3] px-3 py-2 text-sm text-[#241914]">
              {guest}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#241914] sm:text-3xl">Explore the evening</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {featureCards.map(({ title, description, href, accent, imageLabel, image }) => (
            <NavLink
              key={title}
              to={href}
              className="group rounded-3xl border border-[#241914]/10 bg-[#fffaf3]/80 p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`relative mb-4 h-28 overflow-hidden rounded-[1.2rem] bg-linear-to-br ${accent}`}>
                <img src={image} alt={title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(36,25,20,0.08),rgba(36,25,20,0.42))]" />
                <div className="absolute inset-x-4 bottom-3 flex items-end justify-between rounded-2xl border border-white/20 bg-white/10 p-3 text-sm font-medium text-[#fffaf3] backdrop-blur-sm">
                  <span>{imageLabel}</span>
                  <Sparkles size={18} />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#241914]">{title}</h3>
              <p className="mt-2 text-sm text-[#5c463f]">{description}</p>
            </NavLink>
          ))}
        </div>
      </section>
    </>
  )
}

function PageFrame({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-4xl border border-[#241914]/10 bg-[#fffaf3]/85 p-5 shadow-(--shadow) sm:p-8">
      <div className="mb-6 border-b border-[#241914]/10 pb-4">
        <h2 className="text-3xl font-semibold text-[#241914]">{title}</h2>
        <p className="mt-2 max-w-xl text-[#5c463f]">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

function MenuPage() {
  return (
    <PageFrame title="Dinner menu" subtitle="A curated lineup of cherished dishes, from cozy classics to shared favorites.">
      <div className="space-y-6">
        {menuSections.map((section) => (
          <div key={section.name}>
            <div className="mb-3 flex items-center justify-between border-b border-[#241914]/10 pb-2">
              <h3 className="text-xl font-semibold text-[#241914]">{section.name}</h3>
              <span className="text-xs uppercase tracking-[0.2em] text-[#7a655c]">{section.dishes.length} dishes</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {section.dishes.map((dish) => (
                <div key={dish.name} className="rounded-[1.3rem] border border-[#241914]/10 bg-[#f5e9d7] p-4 shadow-sm">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#7a655c]">{dish.contributor}</p>
                  <h4 className="mt-3 text-xl font-semibold text-[#241914]">{dish.name}</h4>
                  <p className="mt-2 text-sm text-[#5c463f]">{dish.detail}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageFrame>
  )
}

function VotePage() {
  const [selectedDish, setSelectedDish] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const voteOptions = menuSections
    .filter((section) => section.name !== 'Appetizers')
    .flatMap((section) =>
      section.dishes.map((dish) => ({
        id: dish.id,
        label: dish.name,
        section: section.name,
      })),
    )

  const handleVoteSubmit = () => {
    if (!selectedDish) return

    const existingVotes = JSON.parse(window.localStorage.getItem('friendsgiving-votes') || '[]')
    const nextVotes = [...existingVotes, { dish: selectedDish, submittedAt: new Date().toISOString() }]

    window.localStorage.setItem('friendsgiving-votes', JSON.stringify(nextVotes))
    setSubmitted(true)
  }

  return (
    <PageFrame title="Best Dish voting" subtitle="Voting opens when the host approves it. Until then, this space stays behind the host dashboard.">
      <div className="space-y-6">
        <div className="rounded-3xl border border-[#241914]/10 bg-[#f5e9d7] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[#7a655c]">Demo mode</p>
          <p className="mt-2 text-lg font-medium text-[#241914]">Each verified guest may submit one vote.</p>
        </div>

        {!submitted ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {voteOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedDish(option.id)}
                className={`rounded-[1.3rem] border p-4 text-left transition ${
                  selectedDish === option.id
                    ? 'border-[#b65a32] bg-[#241914] text-[#f5e9d7] shadow-lg shadow-[#241914]/15'
                    : 'border-[#241914]/10 bg-[#fffaf3] text-[#241914] hover:-translate-y-0.5'
                }`}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-inherit/80">{option.section}</p>
                <h3 className="mt-3 text-xl font-semibold">{option.label}</h3>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-[#241914] p-6 text-[#f5e9d7]">
            <p className="text-lg font-medium">Your vote is in! The winner will be revealed later tonight.</p>
            <p className="mt-3 text-sm text-[#f4d9b0]">Eligible guests may vote once after verification. Results remain hidden until the host reveals the winner.</p>
          </div>
        )}

        {!submitted && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleVoteSubmit}
              disabled={!selectedDish}
              className="rounded-full border border-[#241914]/10 bg-[#241914] px-5 py-3 text-sm font-medium text-[#f5e9d7] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Submit vote
            </button>
          </div>
        )}
      </div>
    </PageFrame>
  )
}

function GamesPage() {
  const [revealed, setRevealed] = useState(false)

  return (
    <PageFrame title="Game Night" subtitle="A surprise challenge is planned, but the host controls when it’s revealed.">
      <div className="space-y-6">
        <div className="rounded-3xl border border-[#241914]/10 bg-[#f5e9d7] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#7a655c]">Reveal state</p>
              <p className="mt-2 text-lg font-medium text-[#241914]">{revealed ? 'Fun is live' : 'Hidden until host reveal'}</p>
            </div>
            <button
              type="button"
              onClick={() => setRevealed((value) => !value)}
              className="rounded-full border border-[#241914]/10 bg-[#241914] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#f5e9d7]"
            >
              {revealed ? 'Hide' : 'Reveal'}
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-[#241914]/10 bg-[#f5e9d7] p-5">
            <h3 className="text-xl font-semibold">The mood is set</h3>
            <p className="mt-3 text-sm text-[#5c463f]">
              A little friendly competition is waiting in the wings, with plenty of laughter and energy to carry the night.
            </p>
          </div>
          <div className="rounded-3xl border border-[#241914]/10 bg-[#fffaf3] p-5">
            <h3 className="text-xl font-semibold">Current status</h3>
            <p className="mt-3 text-sm text-[#5c463f]">
              {revealed
                ? 'The fun is live and ready for the room.'
                : 'The details stay hidden until the host reveals the moment.'}
            </p>
          </div>
        </div>

        {revealed && (
          <div className="rounded-3xl border border-[#241914]/10 bg-[#fffaf3] p-5">
            <h3 className="text-xl font-semibold">Live bracket</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {bracketMatches.map((round, roundIndex) => (
                <div key={`round-${roundIndex}`} className="rounded-[1.2rem] border border-[#241914]/10 bg-[#f5e9d7] p-3">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#7a655c]">Round {roundIndex + 1}</p>
                  {round.map((match) => (
                    <div key={match} className="rounded-xl bg-[#fffaf3] p-2 text-sm text-[#241914] shadow-sm">
                      {match}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageFrame>
  )
}

function GalleryPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([])
  const [photoToRemove, setPhotoToRemove] = useState<string | null>(null)
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => {
    const savedPhotos = window.localStorage.getItem('friendsgiving-gallery')
    if (!savedPhotos) return galleryShots

    try {
      const parsed = JSON.parse(savedPhotos) as GalleryPhoto[]
      return parsed.length > 0 ? parsed : galleryShots
    } catch {
      return galleryShots
    }
  })

  const handleFileSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    if (selectedFiles.length === 0) {
      return
    }

    const normalizedFiles = await Promise.all(
      selectedFiles.map(async (file) => {
        const preparedFile = await convertImageToJpeg(file)
        const previewUrl = await readFileAsDataUrl(preparedFile)

        return {
          id: `${preparedFile.name}-${preparedFile.lastModified}-${Math.random().toString(16).slice(2)}`,
          name: preparedFile.name,
          previewUrl,
          file: preparedFile,
          status: 'ready' as const,
          progress: 100,
          message: 'Ready to review',
        }
      }),
    )

    setPendingUploads((current) => [...current, ...normalizedFiles])
    event.target.value = ''
  }

  const handleRemoveUpload = (id: string) => {
    setPendingUploads((current) => current.filter((item) => item.id !== id))
  }

  const handleSubmitPhotos = async () => {
    if (pendingUploads.length === 0) {
      return
    }

    const nextPhotos: GalleryPhoto[] = pendingUploads.map((upload) => ({
      id: upload.id,
      title: upload.name.replace(/\.[^.]+$/, '') || 'Shared photo',
      imageUrl: upload.previewUrl,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }))

    const mergedPhotos = [...nextPhotos, ...photos]
    setPhotos(mergedPhotos)
    window.localStorage.setItem('friendsgiving-gallery', JSON.stringify(mergedPhotos))
    setPendingUploads([])
    setIsUploadOpen(false)
  }

  const handleRemovePhoto = (photoId: string) => {
    const nextPhotos = photos.filter((photo) => (photo.id ?? `${photo.title}-${photo.imageUrl ?? 'placeholder'}`) !== photoId)
    setPhotos(nextPhotos)
    window.localStorage.setItem('friendsgiving-gallery', JSON.stringify(nextPhotos))
    setPhotoToRemove(null)
  }

  return (
    <PageFrame title="Photo gallery" subtitle="Share the moments from the night — everyone is welcome to upload a photo.">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setIsUploadOpen((value) => !value)}
          className="rounded-full border border-[#241914]/10 bg-[#241914] px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#f5e9d7]"
        >
          Upload Photos
        </button>
      </div>

      {photoToRemove && (
        <div className="mb-6 rounded-[1.4rem] border border-[#241914]/10 bg-[#f5e9d7] p-4">
          <p className="text-base font-semibold text-[#241914]">Remove this photo?</p>
          <p className="mt-2 text-sm text-[#5c463f]">This will delete it from the gallery and cannot be undone.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleRemovePhoto(photoToRemove)}
              className="rounded-full border border-[#241914]/10 bg-[#241914] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#f5e9d7]"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={() => setPhotoToRemove(null)}
              className="rounded-full border border-[#241914]/10 bg-[#fffaf3] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#241914]"
            >
              Keep
            </button>
          </div>
        </div>
      )}

      {isUploadOpen && (
        <div className="mb-6 space-y-4 rounded-[1.4rem] border border-[#241914]/10 bg-[#fffaf3] p-4">
          <div>
            <label htmlFor="photo-upload" className="mb-2 block text-xs uppercase tracking-[0.18em] text-[#7a655c]">
              Upload photos
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelection}
              aria-label="Upload photos"
              className="block w-full rounded-full border border-[#241914]/10 bg-[#f5e9d7] px-3 py-3 text-sm text-[#241914] file:mr-3 file:rounded-full file:border-0 file:bg-[#241914] file:px-3 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-[0.18em] file:text-[#f5e9d7]"
            />
          </div>

          {pendingUploads.length > 0 && (
            <div className="space-y-3 rounded-[1.1rem] border border-[#241914]/10 bg-[#f5e9d7] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[#241914]">Photos queued for review</p>
                <span className="text-xs uppercase tracking-[0.18em] text-[#7a655c]">{pendingUploads.length} selected</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pendingUploads.map((upload) => (
                  <div key={upload.id} className="rounded-[1rem] border border-[#241914]/10 bg-[#fffaf3] p-2">
                    <div className="relative overflow-hidden rounded-[0.8rem]">
                      <img src={upload.previewUrl} alt={upload.name} className="h-28 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveUpload(upload.id)}
                        className="absolute right-2 top-2 rounded-full bg-[#241914]/80 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[#f5e9d7]"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="mt-2 truncate text-sm font-medium text-[#241914]">{upload.name}</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#7a655c]">{upload.message}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSubmitPhotos}
                className="rounded-full border border-[#241914]/10 bg-[#241914] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#f5e9d7]"
              >
                Submit photos
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((shot) => {
          const photoId = shot.id ?? `${shot.title}-${shot.imageUrl ?? 'placeholder'}`

          return (
            <div key={photoId} className="overflow-hidden rounded-[1.4rem] border border-[#241914]/10 bg-[#fffaf3] shadow-sm">
              <div className="relative h-40 overflow-hidden bg-[#f5e9d7]">
                {shot.imageUrl ? (
                  <img src={shot.imageUrl} alt={shot.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full bg-[linear-gradient(135deg,#3b271f_0%,#b65a32_35%,#d9b77a_100%)]" />
                )}
                <button
                  type="button"
                  onClick={() => setPhotoToRemove(photoId)}
                  className="absolute right-2 top-2 rounded-full bg-[#241914]/80 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[#f5e9d7]"
                >
                  Remove
                </button>
              </div>
              <div className="p-3">
                <h4 className="text-base font-semibold text-[#241914]">{shot.title}</h4>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#7a655c]">
                  {shot.status === 'pending' ? 'Pending review' : 'Shared'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </PageFrame>
  )
}

function GratitudePage() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [validationMessage, setValidationMessage] = useState('')
  const [entries, setEntries] = useState<Array<{ name: string; message: string }>>(() => {
    const savedEntries = window.localStorage.getItem('friendsgiving-gratitude')
    if (!savedEntries) return gratitudeNotes

    try {
      const parsed = JSON.parse(savedEntries) as Array<{ name: string; message: string }>
      return parsed.length > 0 ? parsed : gratitudeNotes
    } catch {
      return gratitudeNotes
    }
  })

  const handleSubmit = () => {
    const trimmedName = name.trim()
    const trimmedMessage = message.trim()

    if (!trimmedName || !trimmedMessage) {
      setValidationMessage('Please add both your display name and a message before sharing your gratitude.')
      return
    }

    setValidationMessage('')

    const nextEntries = [{ name: trimmedName, message: trimmedMessage }, ...entries]
    setEntries(nextEntries)
    window.localStorage.setItem('friendsgiving-gratitude', JSON.stringify(nextEntries))
    setName('')
    setMessage('')
  }

  const handleRemove = (noteToRemove: { name: string; message: string }) => {
    const nextEntries = entries.filter(
      (note) => !(note.name === noteToRemove.name && note.message === noteToRemove.message),
    )

    setEntries(nextEntries)
    window.localStorage.setItem('friendsgiving-gratitude', JSON.stringify(nextEntries))
  }

  return (
    <PageFrame title="Gratitude wall" subtitle="A place to share appreciation, memories, and a few words of thanks.">
      <div className="mb-6 rounded-3xl border border-[#241914]/10 bg-[#f5e9d7] p-5">
        <p className="text-lg font-medium text-[#241914]">What are you thankful for this year?</p>
        <p className="mt-2 text-sm text-[#5c463f]">Submissions will be reviewed before publication. Selected messages may be featured on a presentation screen during the event.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="space-y-3 md:col-span-2">
            <input
              type="text"
              placeholder="Your name or display name"
              className="w-full rounded-full border border-[#241914]/10 bg-[#fffaf3] px-4 py-3 text-sm text-[#241914] outline-none ring-0 placeholder:text-[#7a655c]"
              aria-label="Your name or display name"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                if (validationMessage) setValidationMessage('')
              }}
            />
            <textarea
              placeholder="What are you thankful for?"
              className="min-h-24 w-full rounded-[1.5rem] border border-[#241914]/10 bg-[#fffaf3] px-4 py-3 text-sm text-[#241914] outline-none ring-0 placeholder:text-[#7a655c]"
              aria-label="What are you thankful for?"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value)
                if (validationMessage) setValidationMessage('')
              }}
            />
            {validationMessage && (
              <p className="rounded-full border border-[#b65a32]/30 bg-[#fffaf3] px-3 py-2 text-sm font-medium text-[#7a3a2a]">
                {validationMessage}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-full border border-[#241914]/10 bg-[#241914] px-4 py-3 text-sm font-medium text-[#f5e9d7] md:self-end"
          >
            Share
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {entries.map((note) => (
          <div key={`${note.name}-${note.message}`} className="rounded-3xl border border-[#241914]/10 bg-[#fffaf3] p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.22em] text-[#7a655c]">{note.name}</p>
              <button
                type="button"
                onClick={() => handleRemove(note)}
                className="rounded-full border border-[#241914]/10 bg-[#f5e9d7] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#241914] transition hover:bg-[#f2dcc0]"
                aria-label="Remove note"
              >
                Remove note
              </button>
            </div>
            <p className="mt-3 text-base italic leading-relaxed text-[#241914]">“{note.message}”</p>
          </div>
        ))}
      </div>
    </PageFrame>
  )
}

function ProtectedAdminPage() {
  const [enteredCode, setEnteredCode] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.localStorage.getItem('friendsgiving-admin-unlocked') === 'true'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('friendsgiving-admin-unlocked', String(isUnlocked))
    }
  }, [isUnlocked])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextUnlocked = enteredCode.trim() === ADMIN_ACCESS_CODE
    setIsUnlocked(nextUnlocked)
    if (!nextUnlocked && typeof window !== 'undefined') {
      window.localStorage.setItem('friendsgiving-admin-unlocked', 'false')
    }
  }

  if (isUnlocked) {
    return <AdminPage />
  }

  return (
    <PageFrame title="Host access required" subtitle="Enter the host code to unlock the administrative dashboard.">
      <div className="mx-auto max-w-lg rounded-3xl border border-[#241914]/10 bg-[#f5e9d7] p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-[#7a655c]">Host access</p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-[#241914]" htmlFor="host-code">
            Host code
          </label>
          <input
            id="host-code"
            type="password"
            value={enteredCode}
            onChange={(event) => setEnteredCode(event.target.value)}
            placeholder="Enter the host code"
            className="w-full rounded-full border border-[#241914]/10 bg-[#fffaf3] px-4 py-3 text-sm text-[#241914] outline-none placeholder:text-[#7a655c]"
          />
          <button
            type="submit"
            className="rounded-full border border-[#241914]/10 bg-[#241914] px-5 py-3 text-sm font-medium text-[#f5e9d7]"
          >
            Unlock dashboard
          </button>
        </form>
        <p className="mt-4 text-sm text-[#5c463f]">Use the host code shared with the event organizer.</p>
      </div>
    </PageFrame>
  )
}

function AdminPage() {
  const [votingOpen, setVotingOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.localStorage.getItem('friendsgiving-voting-open') === 'true'
  })
  const [resultsRevealed, setResultsRevealed] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.localStorage.getItem('friendsgiving-results-revealed') === 'true'
  })
  const [qrCards, setQrCards] = useState<Array<{ label: string; path: string; description: string; url: string }>>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('friendsgiving-voting-open', String(votingOpen))
    }
  }, [votingOpen])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('friendsgiving-results-revealed', String(resultsRevealed))
    }
  }, [resultsRevealed])

  useEffect(() => {
    let active = true

    const baseUrl = (import.meta.env.VITE_BASE_URL || window.location.origin || 'https://example.com').replace(/\/$/, '')

    async function loadQrCodes() {
      const generatedCards = await Promise.all(
        qrTargets.map(async (target) => ({
          ...target,
          url: await generateQrDataUrl(target, baseUrl),
        })),
      )

      if (active) {
        setQrCards(generatedCards)
      }
    }

    void loadQrCodes()

    return () => {
      active = false
    }
  }, [])

  return (
    <PageFrame title="Administrative dashboard" subtitle="Protected area for event settings, moderation, and surprise controls.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {scores.map((item) => (
          <div key={item.label} className="rounded-[1.25rem] border border-[#241914]/10 bg-[#f5e9d7] p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#7a655c]">{item.label}</p>
            <h3 className="mt-3 text-2xl font-semibold text-[#241914]">{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-[#241914]/10 bg-[#fffaf3] p-5">
          <h3 className="text-xl font-semibold">Voting controls</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setVotingOpen(true)}
              className="rounded-full border border-[#241914]/10 bg-[#241914] px-4 py-2 text-sm font-medium text-[#f5e9d7]"
            >
              Open voting
            </button>
            <button
              type="button"
              onClick={() => setVotingOpen(false)}
              className="rounded-full border border-[#241914]/10 bg-[#f5e9d7] px-4 py-2 text-sm font-medium text-[#241914]"
            >
              Close voting
            </button>
            <button
              type="button"
              onClick={() => setResultsRevealed((value) => !value)}
              className="rounded-full border border-[#241914]/10 bg-[#b65a32] px-4 py-2 text-sm font-medium text-[#fffaf3]"
            >
              {resultsRevealed ? 'Hide result' : 'Reveal result'}
            </button>
          </div>
          <p className="mt-4 text-sm text-[#5c463f]">
            Voting is currently {votingOpen ? 'open' : 'closed'}.
            {resultsRevealed ? ' The winner has been revealed.' : ' Results remain hidden from guests.'}
          </p>
        </div>

        <div className="rounded-3xl border border-[#241914]/10 bg-[#f5e9d7] p-5">
          <h3 className="text-xl font-semibold">Tournament controls</h3>
          <ul className="mt-3 space-y-2 text-sm text-[#5c463f]">
            <li>• Manage participant list</li>
            <li>• Enter match scores</li>
            <li>• Advance winners</li>
            <li>• Reveal champion when ready</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-[#241914]/10 bg-[#fffaf3] p-5">
        <h3 className="text-xl font-semibold">Participants</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {tournamentParticipants.map((participant) => (
            <span key={participant} className="rounded-full border border-[#241914]/10 bg-[#f5e9d7] px-3 py-2 text-sm text-[#241914]">
              {participant}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-[#241914]/10 bg-[#f5e9d7] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#7a655c]">Print-ready access</p>
            <h3 className="mt-2 text-xl font-semibold text-[#241914]">Event QR codes</h3>
          </div>
          <p className="text-sm text-[#5c463f]">Scan to open any event touchpoint instantly.</p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {qrCards.length === 0 ? (
            <div className="col-span-full rounded-[1.2rem] border border-dashed border-[#241914]/20 bg-[#fffaf3] p-4 text-sm text-[#5c463f]">
              Generating QR links…
            </div>
          ) : (
            qrCards.map((item) => (
              <div key={item.path} className="rounded-[1.25rem] border border-[#241914]/10 bg-[#fffaf3] p-4 shadow-sm">
                <img src={item.url} alt={`${item.label} QR code`} className="mx-auto h-32 w-32 rounded-2xl border border-[#241914]/10 bg-white p-2" />
                <p className="mt-3 text-center text-sm font-semibold text-[#241914]">{item.label}</p>
                <p className="mt-1 text-center text-[11px] uppercase tracking-[0.18em] text-[#7a655c]">{item.description}</p>
                <a
                  href={item.url}
                  download={`${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-qr.png`}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[#241914]/10 bg-[#241914] px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#f5e9d7]"
                >
                  Download PNG
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </PageFrame>
  )
}

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/vote" element={<VotePage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/gratitude" element={<GratitudePage />} />
        <Route path="/admin" element={<ProtectedAdminPage />} />
      </Routes>
    </AppShell>
  )
}

export default App
