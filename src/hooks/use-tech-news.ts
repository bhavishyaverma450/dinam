import { useState, useEffect } from "react"

export type NewsItem = {
  id: string
  source: string
  timeAgo: string
  headline: string
  url: string
  faviconUrl: string
}

type FetchStatus = "loading" | "success" | "error"

const CACHE_KEY = "dinam-dashboard-tech-news"
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes

type CacheData = {
  timestamp: number
  items: NewsItem[]
}

// Helper to calculate relative time
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d ago`
}

export function useTechNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [status, setStatus] = useState<FetchStatus>("loading")

  useEffect(() => {
    let isMounted = true

    async function fetchNews() {
      // 1. Check Cache
      try {
        const cachedRaw = localStorage.getItem(CACHE_KEY)
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw) as CacheData
          if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
            setNews(parsed.items)
            setStatus("success")
            return
          }
        }
      } catch {
        // Ignore cache errors and fetch fresh
      }

      // 2. Fetch Fresh Data (Algolia Hacker News API)
      setStatus("loading")
      try {
        // Fetch front page stories, 4 items
        const res = await fetch(
          "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=4"
        )
        if (!res.ok) throw new Error("Failed to fetch news")

        const data = await res.json()

        const fetchedItems: NewsItem[] = data.hits
          .filter((hit: { title?: string; url?: string }) => hit.title && hit.url) // ensure valid data
          .map((hit: { objectID: string; title: string; url: string; created_at: string }) => {
            const urlObj = new URL(hit.url)
            // Strip www. for cleaner source name
            const source = urlObj.hostname.replace(/^www\./, "")

            return {
              id: hit.objectID,
              headline: hit.title,
              url: hit.url,
              source: source,
              timeAgo: getRelativeTime(hit.created_at),
              faviconUrl: `https://www.google.com/s2/favicons?domain=${source}&sz=64`,
            }
          })

        if (isMounted) {
          setNews(fetchedItems)
          setStatus("success")

          // Update Cache
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              timestamp: Date.now(),
              items: fetchedItems,
            } satisfies CacheData)
          )
        }
      } catch {
        if (isMounted) {
          setStatus("error")
        }
      }
    }

    fetchNews()

    return () => {
      isMounted = false
    }
  }, [])

  return { news, status }
}
