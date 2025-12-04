import { Metadata } from 'next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Camera, 
  GraduationCap, 
  Trophy, 
  Users, 
  Building,
  Sparkles
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Gallery - Elyon Schools',
  description: 'Explore photos from Elyon Schools showcasing our facilities, events, students, and memorable moments.',
}

const categories = [
  { id: 'all', name: 'All Photos', icon: Camera },
  { id: 'campus', name: 'Campus', icon: Building },
  { id: 'events', name: 'Events', icon: Sparkles },
  { id: 'sports', name: 'Sports', icon: Trophy },
  { id: 'graduation', name: 'Graduation', icon: GraduationCap },
  { id: 'students', name: 'Student Life', icon: Users },
]

const galleryItems = [
  {
    id: 1,
    category: 'campus',
    title: 'Main School Building',
    description: 'Our modern school building provides a conducive learning environment',
    gradient: 'from-green-400 to-emerald-600',
  },
  {
    id: 2,
    category: 'campus',
    title: 'Science Laboratory',
    description: 'Well-equipped science labs for practical learning',
    gradient: 'from-blue-400 to-indigo-600',
  },
  {
    id: 3,
    category: 'campus',
    title: 'School Library',
    description: 'Extensive collection of books and learning resources',
    gradient: 'from-amber-400 to-orange-600',
  },
  {
    id: 4,
    category: 'events',
    title: 'Cultural Day 2024',
    description: 'Students celebrating Nigerian cultural heritage',
    gradient: 'from-purple-400 to-pink-600',
  },
  {
    id: 5,
    category: 'events',
    title: 'Prize Giving Day',
    description: 'Recognizing outstanding academic achievements',
    gradient: 'from-yellow-400 to-amber-600',
  },
  {
    id: 6,
    category: 'events',
    title: 'Independence Day Celebration',
    description: 'Students celebrating Nigeria\'s independence',
    gradient: 'from-green-500 to-green-700',
  },
  {
    id: 7,
    category: 'sports',
    title: 'Inter-House Sports',
    description: 'Annual sports competition fostering team spirit',
    gradient: 'from-red-400 to-rose-600',
  },
  {
    id: 8,
    category: 'sports',
    title: 'Football Team',
    description: 'Our award-winning school football team',
    gradient: 'from-teal-400 to-cyan-600',
  },
  {
    id: 9,
    category: 'sports',
    title: 'Athletics Championship',
    description: 'Students competing in track and field events',
    gradient: 'from-orange-400 to-red-600',
  },
  {
    id: 10,
    category: 'graduation',
    title: 'Class of 2024 Graduation',
    description: 'Celebrating our graduating SSS 3 students',
    gradient: 'from-indigo-400 to-purple-600',
  },
  {
    id: 11,
    category: 'graduation',
    title: 'Primary 6 Graduation',
    description: 'Primary school leavers ready for secondary education',
    gradient: 'from-pink-400 to-rose-600',
  },
  {
    id: 12,
    category: 'students',
    title: 'Classroom Learning',
    description: 'Students engaged in interactive lessons',
    gradient: 'from-blue-400 to-cyan-600',
  },
  {
    id: 13,
    category: 'students',
    title: 'Computer Class',
    description: 'Students developing digital skills',
    gradient: 'from-slate-400 to-slate-600',
  },
  {
    id: 14,
    category: 'students',
    title: 'Art Class',
    description: 'Creative expression through visual arts',
    gradient: 'from-fuchsia-400 to-purple-600',
  },
  {
    id: 15,
    category: 'campus',
    title: 'Playground',
    description: 'Spacious outdoor play area for students',
    gradient: 'from-lime-400 to-green-600',
  },
]

function GalleryCard({ item }: { item: typeof galleryItems[0] }) {
  return (
    <Card className="overflow-hidden group hover-elevate" data-testid={`gallery-item-${item.id}`}>
      <div className={`aspect-[4/3] bg-gradient-to-br ${item.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Camera className="h-12 w-12 text-white/50" />
        </div>
        <Badge className="absolute top-3 left-3 bg-background/80 text-foreground capitalize">
          {item.category}
        </Badge>
      </div>
      <CardContent className="pt-4">
        <h3 className="font-semibold text-foreground">{item.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
      </CardContent>
    </Card>
  )
}

export default function GalleryPage() {
  return (
    <div className="min-h-screen">
      <section className="relative py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-rose-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 hover:bg-purple-100">
              <Camera className="mr-1 h-3 w-3" />
              Photo Gallery
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Our Gallery
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Take a visual tour of Elyon Schools. Explore our campus, events, 
              and the vibrant community that makes our school special.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="flex flex-wrap justify-center gap-2 h-auto mb-8 bg-transparent">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-testid={`tab-${category.id}`}
                >
                  <category.icon className="h-4 w-4" />
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item) => (
                  <GalleryCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>

            {categories.slice(1).map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {galleryItems
                    .filter((item) => item.category === category.id)
                    .map((item) => (
                      <GalleryCard key={item.id} item={item} />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-foreground">More Photos Coming Soon</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            We regularly update our gallery with new photos from school activities 
            and events. Check back often to see what&apos;s happening at Elyon Schools!
          </p>
        </div>
      </section>
    </div>
  )
}
