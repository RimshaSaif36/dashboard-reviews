import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ReviewsDashboard from "@/components/reviews-dashboard"
import { Search, Star, TrendingUp, Users, Heart, Zap, Shield, Globe, Award, Target, Sparkles, MessageCircle } from "lucide-react"

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated dots */}
        <div className="absolute top-20 left-10 w-3 h-3 bg-blue-400/30 rounded-full animate-dot-float"></div>
        <div className="absolute top-40 right-20 w-2 h-2 bg-indigo-400/30 rounded-full animate-dot-drift delay-1s"></div>
        <div className="absolute bottom-40 left-20 w-4 h-4 bg-purple-400/25 rounded-full animate-dot-pulse delay-3s"></div>
        <div className="absolute bottom-20 right-10 w-3 h-3 bg-cyan-400/30 rounded-full animate-dot-bounce delay-2s"></div>
        <div className="absolute top-60 left-1/2 w-2 h-2 bg-pink-400/30 rounded-full animate-dot-float delay-4s"></div>
        <div className="absolute bottom-60 right-1/3 w-3 h-3 bg-emerald-400/25 rounded-full animate-dot-drift delay-5s"></div>
        
        {/* Animated background icons */}
        <div className="absolute top-32 left-16 w-8 h-8 text-blue-400/20 animate-icon-float">
          <Heart className="w-full h-full" />
        </div>
        <div className="absolute top-48 right-32 w-6 h-6 text-indigo-400/20 animate-icon-spin delay-2s">
          <Zap className="w-full h-full" />
        </div>
        <div className="absolute bottom-32 left-32 w-7 h-7 text-purple-400/20 animate-icon-pulse delay-4s">
          <Shield className="w-full h-full" />
        </div>
        <div className="absolute bottom-48 right-16 w-5 h-5 text-cyan-400/20 animate-icon-bounce delay-6s">
          <Globe className="w-full h-full" />
        </div>
        <div className="absolute top-72 left-1/3 w-6 h-6 text-pink-400/20 animate-icon-float delay-8s">
          <Award className="w-full h-full" />
        </div>
        <div className="absolute bottom-72 right-1/3 w-5 h-5 text-emerald-400/20 animate-icon-spin delay-10s">
          <Target className="w-full h-full" />
        </div>
        <div className="absolute top-96 left-1/4 w-4 h-4 text-orange-400/20 animate-icon-pulse delay-12s">
          <Sparkles className="w-full h-full" />
        </div>
        <div className="absolute bottom-96 right-1/4 w-6 h-6 text-teal-400/20 animate-icon-bounce delay-14s">
          <MessageCircle className="w-full h-full" />
        </div>
        <div className="absolute top-120 left-1/5 w-5 h-5 text-rose-400/20 animate-icon-float delay-16s">
          <Star className="w-full h-full" />
        </div>
        <div className="absolute bottom-120 right-1/5 w-4 h-4 text-violet-400/20 animate-icon-spin delay-18s">
          <TrendingUp className="w-full h-full" />
        </div>
      </div>
      <div className="container mx-auto max-w-6xl p-6 space-y-8 relative z-10">
        {/* Hero Section with Animation */}
        <header className="text-center space-y-4 animate-in fade-in-0 slide-in-from-top-4 duration-700">
          <div className="relative inline-flex items-center justify-center mb-6">
            {/* Simple animated background ring */}
            <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse opacity-20"></div>
            
            {/* Main icon container */}
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-2xl animate-in zoom-in-50 duration-500 hover:scale-110 transition-transform">
              <Search className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
            Florida Company Reviews
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
            Discover authentic customer insights and reviews for Florida-based companies with our advanced analytics dashboard.
          </p>
      </header>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group animate-in fade-in-0 slide-in-from-left-4 duration-700 delay-400">
            <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Real Reviews</h3>
                <p className="text-sm text-muted-foreground">Authentic customer feedback from verified sources</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="group animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-500">
            <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Analytics</h3>
                <p className="text-sm text-muted-foreground">Comprehensive insights and trend analysis</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="group animate-in fade-in-0 slide-in-from-right-4 duration-700 delay-600">
            <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Community</h3>
                <p className="text-sm text-muted-foreground">Connect with Florida business community</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Dashboard Card */}
        <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-700">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-t-lg">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              Company Search & Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ReviewsDashboard />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
