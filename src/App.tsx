import { useState } from 'react'
import Home from './screens/Home'
import Search from './screens/Search'
import EventList from './screens/EventList'
import EventDetail from './screens/EventDetail'
import Favorites from './screens/Favorites'
import MyPage from './screens/MyPage'

type Screen = 'home' | 'search' | 'list' | 'detail' | 'favorites' | 'mypage'
type NavTab = 'home' | 'search' | 'list' | 'favorites' | 'mypage'

const NAV_ITEMS: { tab: NavTab; icon: string; label: string }[] = [
  { tab: 'home', icon: '🏠', label: '홈' },
  { tab: 'list', icon: '📋', label: '목록' },
  { tab: 'search', icon: '🔍', label: '검색' },
  { tab: 'favorites', icon: '❤️', label: '관심목록' },
  { tab: 'mypage', icon: '👤', label: '마이' },
]

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [activeTab, setActiveTab] = useState<NavTab>('home')
  const [selectedEventId, setSelectedEventId] = useState<number>(1)

  const navigate = (tab: NavTab) => {
    setActiveTab(tab)
    setScreen(tab)
  }

  const openEvent = (id: number) => {
    setSelectedEventId(id)
    setScreen('detail')
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <Home onSearch={() => navigate('search')} onEventClick={openEvent} />
      case 'search':
        return <Search onResults={() => navigate('list')} />
      case 'list':
        return <EventList onEventClick={openEvent} />
      case 'detail':
        return (
          <EventDetail
            eventId={selectedEventId}
            onBack={() => setScreen(activeTab)}
          />
        )
      case 'favorites':
        return <Favorites />
      case 'mypage':
        return <MyPage />
      default:
        return null
    }
  }

  return (
    <div
      className="relative flex flex-col bg-[#FAFAF8]"
      style={{ minHeight: '100dvh', maxWidth: 430, margin: '0 auto' }}
    >
      {/* Screen content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      {screen !== 'detail' && (
        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-white border-t border-[#F3F4F6] flex"
          style={{ width: '100%', maxWidth: 430, paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.tab && screen !== 'detail'
            return (
              <button
                key={item.tab}
                onClick={() => navigate(item.tab)}
                className="flex-1 flex flex-col items-center gap-0.5 py-3 transition-all active:scale-90"
              >
                <div
                  className={`w-10 h-8 flex items-center justify-center rounded-xl transition-colors ${
                    isActive ? 'bg-[#FFF0EC]' : ''
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                </div>
                <span
                  className={`text-[10px] font-semibold transition-colors ${
                    isActive ? 'text-[#FF6B47]' : 'text-[#9CA3AF]'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}
