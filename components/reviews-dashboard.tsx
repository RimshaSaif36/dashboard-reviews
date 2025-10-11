"use client"

import { useMemo, useState } from "react"
import useSWRMutation from "swr/mutation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Star, TrendingUp, Users, Clock, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react"

type RawReview = {
  authorName?: string
  author?: string
  user?: string
  author_name?: string
  rating?: number
  time?: string
  date?: string
  relativeTime?: string
  text?: string
  content?: string
  reviewText?: string
  sentiment?: "positive" | "negative"
}

type NormalizedReview = {
  author?: string
  rating?: number
  time?: string
  text?: string
}

type NormalizedPayload = {
  companyName: string
  averageRating?: number
  positiveReviews: NormalizedReview[]
  negativeReviews: NormalizedReview[]
}

async function postJSON(url: string, { arg }: { arg: { companyName: string } }) {
  console.log("Sending POST to", url, "with payload:", arg)
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  })
  console.log("Response status:", res.status)
  if (!res.ok) {
    let details: any = null
    try {
      details = await res.json()
    } catch {
      /* noop */
    }
    console.log("Non-OK response body:", details)
    throw new Error(details?.error || `Request failed with status ${res.status}`)
  }
  const data = await res.json()
  console.log("Raw response JSON:", data)
  return data
}

function toNormalized(data: any): NormalizedPayload | null {
  if (!data) return null

  // Try to find a company name from various common locations
  const name = data.companyName || data?.company?.name || data?.name || data?.companyDetails?.name || "Unknown Company"

  // Get any available review arrays
  const posArr: RawReview[] =
    data?.positiveReviews ||
    data?.data?.positiveReviews ||
    data?.company?.positiveReviews ||
    data?.reviews?.positive ||
    data?.data?.reviews?.positive ||
    data?.company?.reviews?.positive ||
    []

  const negArr: RawReview[] =
    data?.negativeReviews ||
    data?.data?.negativeReviews ||
    data?.company?.negativeReviews ||
    data?.reviews?.negative ||
    data?.data?.reviews?.negative ||
    data?.company?.reviews?.negative ||
    []

  // If API already separated reviews, use those; otherwise classify based on sentiment or rating
  let reviews: RawReview[] = []
  if (Array.isArray(data?.reviews)) reviews = data.reviews
  else if (Array.isArray(data?.data?.reviews)) reviews = data.data.reviews
  else if (Array.isArray(data?.company?.reviews)) reviews = data.company.reviews

  let positive: NormalizedReview[] = []
  let negative: NormalizedReview[] = []

  // Prefer explicit sentiment if present, else infer by rating threshold
  const normalizeOne = (r: RawReview): NormalizedReview => ({
    author: r.authorName || r.author || r.user || r.author_name,
    rating: r.rating,
    time: r.time || r.date || r.relativeTime,
    text: r.text || r.content || r.reviewText,
  })

  if (posArr.length || negArr.length) {
    positive = posArr.map(normalizeOne)
    negative = negArr.map(normalizeOne)
  } else if (reviews.length) {
    for (const r of reviews) {
      const s = r.sentiment
      const isPositive = s ? s === "positive" : typeof r.rating === "number" ? r.rating >= 4 : false
      const norm = normalizeOne(r)
      if (isPositive) positive.push(norm)
      else negative.push(norm)
    }
  }

  // Determine average rating (prefer provided fields, else compute from all available reviews)
  const providedAvg = data?.averageRating ?? data?.rating ?? data?.company?.rating ?? data?.companyDetails?.rating

  let averageRating: number | undefined = typeof providedAvg === "number" ? providedAvg : undefined

  if (averageRating === undefined) {
    const pool = [...positive, ...negative].filter((r) => typeof r.rating === "number")
    if (pool.length) {
      const sum = pool.reduce((acc, r) => acc + (r.rating || 0), 0)
      averageRating = sum / pool.length
    }
  }

  console.log(
    "Parsed summary -> name:",
    name,
    "avg:",
    averageRating,
    "pos:",
    positive.length,
    "neg:",
    negative.length,
  )

  return {
    companyName: name,
    averageRating,
    positiveReviews: positive,
    negativeReviews: negative,
  }
}

export default function ReviewsDashboard() {
  const [companyName, setCompanyName] = useState("")

  const { trigger, data, error, isMutating } = useSWRMutation("/api/reviews", postJSON)

  const normalized = useMemo(() => toNormalized(data), [data])

  const totalPositive = normalized?.positiveReviews.length ?? 0
  const totalNegative = normalized?.negativeReviews.length ?? 0
  const average = normalized?.averageRating

  const handleSearch = async () => {
    console.log("Search clicked. Input companyName:", companyName)
    const trimmed = companyName.trim()
    if (!trimmed) {
      console.log("Empty company name; aborting.")
      return
    }
    try {
      await trigger({ companyName: trimmed })
      console.log("Triggered fetch successfully for:", trimmed)
    } catch (e: any) {
      console.log("Error during trigger:", e?.message || e)
    }
  }

  const showNoReviews =
    !isMutating &&
    normalized &&
    totalPositive === 0 &&
    totalNegative === 0 &&
    (normalized.averageRating === undefined || normalized.averageRating === null)

  return (
    <div className="space-y-8">
      {/* Enhanced Search Form */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="company-search" className="text-sm font-medium text-muted-foreground">
              Company Name
            </label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors duration-200" />
              <Input
                id="company-search"
                placeholder="Enter Florida company name (e.g., Disney World, Universal Studios)"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="pl-10 h-12 text-lg border-2 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={isMutating || !companyName.trim()}
            className="h-12 px-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
          >
            {isMutating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search Reviews
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Enhanced Error State */}
      {error ? (
        <div role="alert" className="animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 text-sm">⚠️</span>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-200">Search Error</h4>
                  <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Enhanced Stats with Animations */}
      {normalized && !showNoReviews && (
        <section aria-label="Summary statistics" className="space-y-6">
          <div className="text-center space-y-2 animate-in fade-in-0 slide-in-from-top-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review Analysis</h2>
            <p className="text-muted-foreground">Comprehensive insights for {normalized.companyName}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-left-4 delay-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  Company
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{normalized.companyName}</p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 delay-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  Average Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {typeof average === "number" ? average.toFixed(1) : "N/A"}
                  </span>
                  {typeof average === "number" && (
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(average) 
                              ? "text-yellow-400 fill-current" 
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-right-4 delay-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  Review Counts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-green-500" />
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">{totalPositive}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="w-5 h-5 text-red-500" />
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">{totalNegative}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Enhanced No Reviews State */}
      {showNoReviews && (
        <section aria-live="polite" className="animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">No Reviews Found</h3>
              <p className="text-amber-600 dark:text-amber-400">
                We couldn't find any reviews for this company. Try searching with a different company name or check the spelling.
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Enhanced Reviews Lists */}
      {normalized && !showNoReviews && (
        <section className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-400">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h2>
            <p className="text-muted-foreground">Real feedback from verified customers</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Positive Reviews */}
            <Card className="group hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-left-4 delay-500">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <CardTitle className="flex items-center gap-3 text-green-800 dark:text-green-200">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <ThumbsUp className="w-4 h-4 text-white" />
                  </div>
                  Positive Reviews ({normalized.positiveReviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {normalized.positiveReviews.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-gray-400">😔</span>
                    </div>
                    <p className="text-sm text-muted-foreground">No positive reviews found.</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-4 p-4">
                      {normalized.positiveReviews.map((r, idx) => (
                        <div 
                          key={`pos-${idx}`} 
                          className={`group/review animate-in fade-in-0 slide-in-from-left-2 duration-300 review-delay-${Math.min(idx * 100, 500)}`}
                        >
                          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                  {(r.author || "A")[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{r.author || "Anonymous"}</p>
                                  {typeof r.rating === "number" && (
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-3 h-3 ${
                                            i < r.rating! 
                                              ? "text-yellow-400 fill-current" 
                                              : "text-gray-300 dark:text-gray-600"
                                          }`}
                                        />
                                      ))}
                                      <span className="text-xs text-muted-foreground ml-1">{r.rating.toFixed(1)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {r.time && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {r.time}
                                </div>
                              )}
                            </div>
                            {r.text && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{r.text}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Negative Reviews */}
            <Card className="group hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-right-4 delay-500">
              <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950">
                <CardTitle className="flex items-center gap-3 text-red-800 dark:text-red-200">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-500 rounded-lg flex items-center justify-center">
                    <ThumbsDown className="w-4 h-4 text-white" />
                  </div>
                  Negative Reviews ({normalized.negativeReviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {normalized.negativeReviews.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-gray-400">😔</span>
                    </div>
                    <p className="text-sm text-muted-foreground">No negative reviews found.</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-4 p-4">
                      {normalized.negativeReviews.map((r, idx) => (
                        <div 
                          key={`neg-${idx}`} 
                          className={`group/review animate-in fade-in-0 slide-in-from-right-2 duration-300 review-delay-${Math.min(idx * 100, 500)}`}
                        >
                          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 border border-red-200 dark:border-red-800 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                  {(r.author || "A")[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{r.author || "Anonymous"}</p>
                                  {typeof r.rating === "number" && (
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-3 h-3 ${
                                            i < r.rating! 
                                              ? "text-yellow-400 fill-current" 
                                              : "text-gray-300 dark:text-gray-600"
                                          }`}
                                        />
                                      ))}
                                      <span className="text-xs text-muted-foreground ml-1">{r.rating.toFixed(1)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {r.time && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {r.time}
                                </div>
                              )}
                            </div>
                            {r.text && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{r.text}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  )
}
