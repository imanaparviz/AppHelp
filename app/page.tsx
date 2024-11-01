'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as random from 'maath/random'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { 
  Hammer, Wrench, Truck, PaintBucket, Laptop, Search, User, MessageSquare, Calendar, Send, Menu, Moon, Sun, 
  Book, Briefcase, Home, Scissors, Car, Heart, Utensils, Bed, Sofa, ShoppingBag, Shirt, Map, Scale, 
  Calculator, Megaphone, UserPlus, Bath, GraduationCap, Languages, Music, Monitor, Palette, Plane, 
  ShoppingCart, Stethoscope, Baby, Cat, ArrowLeft, LogIn
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

function ParticleCloud() {
  const ref = useRef()
  const [sphere] = useState(() => 
    random.inSphere(new Float32Array(5000), { radius: 1.5 })
  )

  useFrame((state, delta) => {
    if (!ref.current) return
    ref.current.rotation.x -= delta / 10
    ref.current.rotation.y -= delta / 15
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#fff"
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  )
}

const iconComponents = [
  { Icon: Book, label: 'Bildung' },
  { Icon: Briefcase, label: 'Geschäftlich' },
  { Icon: Home, label: 'Haushalt' },
  { Icon: Scissors, label: 'Handwerk' },
  { Icon: Car, label: 'Transport' },
  { Icon: Heart, label: 'Pflege' },
]

const jobCategories = [
  {
    name: "Bildung",
    icon: Book,
    subCategories: [
      { name: "Nachhilfe", icon: GraduationCap },
      { name: "Sprachunterricht", icon: Languages },
      { name: "Musikunterricht", icon: Music },
      { name: "Computertraining", icon: Monitor },
      { name: "Kunstkurse", icon: Palette }
    ]
  },
  {
    name: "Geschäftlich",
    icon: Briefcase,
    subCategories: [
      { name: "Buchhaltung", icon: Calculator },
      { name: "Marketing", icon: Megaphone },
      { name: "Rechtsberatung", icon: Scale },
      { name: "IT-Support", icon: Laptop },
      { name: "Personalvermittlung", icon: UserPlus }
    ]
  },
  {
    name: "Haushalt",
    icon: Home,
    subCategories: [
      { name: "Reinigung", icon: Home },
      { name: "Kochen", icon: Utensils },
      { name: "Badezimmerreinigung", icon: Bath },
      { name: "Bettwäsche wechseln", icon: Bed },
      { name: "Möbelpflege", icon: Sofa },
      { name: "Fensterreinigung", icon: Home },
      { name: "Wäsche waschen", icon: Shirt },
      { name: "Gartenarbeit", icon: Home },
      { name: "Haustierpflege", icon: Cat },
      { name: "Einkaufen", icon: ShoppingCart }
    ]
  },
  {
    name: "Handwerk",
    icon: Hammer,
    subCategories: [
      { name: "Malerarbeiten", icon: PaintBucket },
      { name: "Elektroarbeiten", icon: Zap },
      { name: "Klempnerarbeiten", icon: Wrench },
      { name: "Tischlerarbeiten", icon: Hammer },
      { name: "Fliesenarbeiten", icon: Ruler }
    ]
  },
  {
    name: "Transport",
    icon: Truck,
    subCategories: [
      { name: "Umzugstransporte", icon: Truck },
      { name: "Kurierdienste", icon: Truck },
      { name: "Möbeltransporte", icon: Sofa },
      { name: "Flughafentransfer", icon: Plane },
      { name: "Einkaufsservice", icon: ShoppingBag }
    ]
  },
  {
    name: "Pflege",
    icon: Heart,
    subCategories: [
      { name: "Seniorenbetreuung", icon: Heart },
      { name: "Kinderbetreuung", icon: Baby },
      { name: "Haustierbetreuung", icon: Cat },
      { name: "Krankenpflege", icon: Stethoscope },
      { name: "Physiotherapie", icon: User }
    ]
  },
]

// Sample data for nearby service providers
const nearbyProviders = [
  { id: 1, name: "Max Mustermann", service: "Reinigung", position: [52.520008, 13.404954] },
  { id: 2, name: "Anna Schmidt", service: "Gartenarbeit", position: [52.518, 13.406] },
  { id: 3, name: "Tom Weber", service: "Computerreparatur", position: [52.522, 13.402] },
  { id: 4, name: "Lisa Müller", service: "Nachhilfe", position: [52.519, 13.408] },
]

// Function to get user's IP address
const getUserIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return null;
  }
};

// Component to update map center based on user's IP
function MapCenterUpdater({ setMapCenter }) {
  const map = useMap();

  useEffect(() => {
    const updateMapCenter = async () => {
      const userIP = await getUserIP();
      if (userIP) {
        try {
          const response = await fetch(`https://ipapi.co/${userIP}/json/`);
          const data = await response.json();
          const newCenter = [data.latitude, data.longitude];
          setMapCenter(newCenter);
          map.setView(newCenter, 13);
        } catch (error) {
          console.error('Error fetching location:', error);
        }
      }
    };

    updateMapCenter();
  }, [map, setMapCenter]);

  return null;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function ResponsiveDesktopApp() {
  const [loading, setLoading] = useState(true)
  const [showIcons, setShowIcons] = useState(false)
  const [currentView, setCurrentView] = useState('welcome')
  const [userType, setUserType] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState(null)
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newJobDescription, setNewJobDescription] = useState('')
  const [messages, setMessages] = useState([
    { id: 1, sender: 'John', content: 'Hallo, bist du dieses Wochenende für einen Umzug verfügbar?' },
    { id: 2, sender: 'You', content: 'Ja, das bin ich. Welche Details kannst du mir geben?' },
  ])
  const [newMessage, setNewMessage] = useState('')
  const [appointments, setAppointments] = useState([
    { id: 1, title: 'Umzugshilfe', date: '2023-06-15', time: '14:00' },
    { id: 2, title: 'Malerarbeiten', date: '2023-06-18', time: '10:00' },
  ])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState({
    categories: false,
    messages: false,
    appointments: false,
  })
  const [darkMode, setDarkMode] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState({})
  const [mapCenter, setMapCenter] = useState([52.520008, 13.404954]);
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')

  useEffect(() => {
    const iconTimer = setTimeout(() => setShowIcons(true), 500)
    const loadingTimer = setTimeout(() => setLoading(false), 4000)
    const authTimer = setTimeout(() => setCurrentView('auth'), 5000)

    return () => {
      clearTimeout(iconTimer)
      clearTimeout(loadingTimer)
      clearTimeout(authTimer)
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const filteredCategories = jobCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.subCategories.some(sub => 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { id: messages.length + 1, sender: 'You', content: newMessage.trim() }])
      setNewMessage('')
    }
  }

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }))
  }

  const handleCategoryClick = (category) => {
    setSelectedCategory(category)
    setCurrentView('subCategories')
  }

  const handleSubCategoryClick = (subCategory) => {
    setSelectedSubCategory(subCategory)
    setCurrentView('userTypeSelection')
  }

  const handleUserTypeSelection = (type) => {
    setUserType(type)
    setCurrentView('serviceDetails')
  }

  const handleLogin = (e) => {
    e.preventDefault()
    // Here you would typically send a request to your backend to authenticate the user
    console.log('Login attempted with:', loginEmail, loginPassword)
    setIsLoggedIn(true)
    setCurrentView('categories')
  }

  const handleRegister = (e) => {
    e.preventDefault()
    // Here you would typically send a request to your backend to register the user
    console.log('Registration attempted with:', registerName, registerEmail, registerPassword)
    setIsLoggedIn(true)
    setCurrentView('categories')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentView('auth')
  }

  const renderSidebar = () => (
    <div className={`bg-gray-800 dark:bg-black text-white h-screen flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-16' : 'w-12'} rounded-r-3xl`}>
      <div className="p-2 flex items-center justify-center">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <Separator />
      <ScrollArea className="flex-grow">
        <div className="p-2 space-y-4">
          <Button
            variant="ghost"
            className="w-full justify-center rounded-xl"
            onClick={() => setCurrentView('categories')}
          >
            <Search className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-center rounded-xl"
            onClick={() => setCurrentView('messages')}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-center rounded-xl"
            onClick={() => setCurrentView('appointments')}
          >
            <Calendar className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-center rounded-xl"
            onClick={() => setCurrentView('map')}
          >
            <Map className="h-6 w-6" />
          </Button>
        </div>
      </ScrollArea>
      <Separator />
      <div className="p-2">
        {isLoggedIn ? (
          <>
            <Button
              variant="ghost"
              className="w-full justify-center rounded-xl mb-2"
              onClick={() => setCurrentView('profile')}
            >
              <User className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-center rounded-xl"
              onClick={handleLogout}
            >
              <LogIn className="h-6 w-6" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-center rounded-xl"
            onClick={() => setCurrentView('auth')}
          >
            <LogIn className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  )

  const renderContent = () => (
    <div className="flex-grow p-6 bg-gray-100 dark:bg-transparent overflow-auto">
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-full"
        >
          {darkMode ? (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Toggle dark mode</span>
        </Button>
      </div>
      <AnimatePresence>
        {currentView === 'welcome' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 dark:text-white">
              Willkommen bei HelferNet
            </h1>
            <p className="text-base sm:text-xl mb-6 sm:mb-12 dark:text-gray-300">
              Ihre Plattform für Dienstleistungen und gegenseitige Hilfe
            </p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 sm:gap-8 mb-6 sm:mb-12">
              {showIcons &&
                iconComponents.map(({ Icon, label }, index) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center"
                    >
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 dark:text-gray-300" />
                    </motion.div>
                    <span className="text-xs sm:text-sm mt-2 dark:text-gray-300">{label}</span>
                  </motion.div>
                ))}
            </div>
            {loading && (
              <div className="mt-4 sm:mt-8">
                <div className="flex items-center justify-center space-x-2">
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0s' }}
                  ></div>
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
                <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">Wird geladen...</p>
              </div>
            )}
          </motion.div>
        )}

        {currentView === 'auth' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            <Card className="bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-semibold dark:text-white">
                  Anmelden oder Registrieren
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login" className="text-xs sm:text-sm">Anmelden</TabsTrigger>
                    <TabsTrigger value="register" className="text-xs sm:text-sm">Registrieren</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs sm:text-sm">E-Mail</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                          className="text-xs sm:text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-xs sm:text-sm">Passwort</Label>
                        <Input
                          id="password"
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          className="text-xs sm:text-sm"
                        />
                      </div>
                      <Button type="submit" className="w-full text-xs sm:text-sm">
                        Anmelden
                      </Button>
                    </form>
                  </TabsContent>
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs sm:text-sm">Name</Label>
                        <Input
                          id="name"
                          placeholder="Max Mustermann"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          required
                          className="text-xs sm:text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs sm:text-sm">E-Mail</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          required
                          className="text-xs sm:text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-xs sm:text-sm">Passwort</Label>
                        <Input
                          id="password"
                          type="password"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          required
                          className="text-xs sm:text-sm"
                        />
                      </div>
                      <Button type="submit" className="w-full text-xs sm:text-sm">
                        Registrieren
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentView === 'categories' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto p-4"
          >
            <Card className="bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-semibold dark:text-white">
                  Dienstleistungskategorien
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] sm:h-[400px]">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {jobCategories.map((category, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-20 sm:h-24 flex flex-col items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                        onClick={() => handleCategoryClick(category)}
                      >
                        <category.icon className="w-8 h-8 sm:w-10 sm:h-10 mb-2" />
                        <span className="text-xs sm:text-sm">{category.name}</span>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentView === 'subCategories' && selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-semibold dark:text-white">
                  {selectedCategory.name}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">Wählen Sie eine Unterkategorie</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] sm:h-[400px]">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {selectedCategory.subCategories.map((subCategory, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-20 sm:h-24 flex flex-col items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                        onClick={() => handleSubCategoryClick(subCategory)}
                      >
                        <subCategory.icon className="w-8 h-8 sm:w-10 sm:h-10 mb-2" />
                        <span className="text-xs sm:text-sm">{subCategory.name}</span>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" onClick={() => setCurrentView('categories')} className="text-xs sm:text-sm">
                  <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Zurück zu Kategorien
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {currentView === 'userTypeSelection' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-semibold dark:text-white">
                  Wählen Sie Ihre Rolle
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Möchten Sie Dienste anbieten oder in Anspruch nehmen?
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  className="h-20 w-32 sm:h-24 sm:w-40 flex flex-col items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                  onClick={() => handleUserTypeSelection('provider')}
                >
                  <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 mb-2" />
                  <span className="text-xs sm:text-sm">Dienstleister</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 w-32 sm:h-24 sm:w-40 flex flex-col items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                  onClick={() => handleUserTypeSelection('seeker')}
                >
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 mb-2" />
                  <span className="text-xs sm:text-sm">Hilfesuchender</span>
                </Button>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" onClick={() => setCurrentView('subCategories')} className="text-xs sm:text-sm">
                  <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Zurück zu Unterkategorien
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {currentView === 'serviceDetails' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-semibold dark:text-white">
                  {userType === 'provider' ? 'Dienst anbieten' : 'Hilfe suchen'}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {userType === 'provider'
                    ? 'Beschreiben Sie Ihren Dienst'
                    : 'Beschreiben Sie, welche Hilfe Sie benötigen'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Titel
                    </label>
                    <Input
                      id="title"
                      placeholder={
                        userType === 'provider'
                          ? 'z.B. Professionelle Reinigung'
                          : 'z.B. Suche Hilfe beim Frühjahrsputz'
                      }
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      className="mt-1 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Beschreibung
                    </label>
                    <textarea
                      id="description"
                      placeholder={
                        userType === 'provider'
                          ? 'Beschreiben Sie Ihre Dienstleistung...'
                          : 'Beschreiben Sie, welche Hilfe Sie benötigen...'
                      }
                      value={newJobDescription}
                      onChange={(e) => setNewJobDescription(e.target.value)}
                      className="mt-1 w-full h-24 sm:h-32 px-3 py-2 text-sm sm:text-base text-gray-700 border rounded-lg focus:outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={() => setCurrentView('userTypeSelection')} className="text-xs sm:text-sm">
                  <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Zurück
                </Button>
                <Button onClick={() => console.log('Service details submitted')} className="text-xs sm:text-sm">
                  {userType === 'provider' ? 'Dienst anbieten' : 'Hilfe anfragen'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {currentView === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-semibold dark:text-white">
                  Mein Profil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold dark:text-white">
                      Max Mustermann
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Mitglied seit 2023</p>
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm sm:text-base font-semibold mb-2 dark:text-white">
                    Meine Fähigkeiten:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['Umzug', 'Gartenarbeit', 'Computerreparatur'].map((skill) => (
                      <span
                        key={skill}
                        className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-xs sm:text-sm dark:text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold mb-2 dark:text-white">Bewertungen:</h4>
                  <p className="text-yellow-500">★★★★☆ (4.5)</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentView === 'messages' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-semibold dark:text-white">
                  Nachrichten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] sm:h-[400px] mb-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-2 sm:p-3 rounded-3xl ${
                          message.sender === 'You'
                            ? 'bg-blue-100 dark:bg-blue-900 ml-auto'
                            : 'bg-gray-100 dark:bg-gray-700'
                        } max-w-[80%]`}
                      >
                        <p className="font-semibold dark:text-white text-xs sm:text-sm">{message.sender}</p>
                        <p className="dark:text-gray-300 text-xs sm:text-sm">{message.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Nachricht eingeben..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-grow dark:bg-gray-700 dark:text-white rounded-full text-xs sm:text-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-blue-500 text-white rounded-full"
                  >
                    <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentView === 'appointments' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-semibold dark:text-white">
                  Termine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-gray-100 dark:bg-gray-700 p-3 sm:p-4 rounded-2xl"
                    >
                      <h3 className="font-semibold dark:text-white text-sm sm:text-base">
                        {appointment.title}
                      </h3>
                      <p className="dark:text-gray-300 text-xs sm:text-sm">
                        {appointment.date} um {appointment.time}
                      </p>
                    </div>
                  ))}
                  <Button className="w-full bg-blue-500 text-white rounded-full text-xs sm:text-sm">
                    Neuen Termin planen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentView === 'map' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-semibold dark:text-white">
                  Dienstleister in der Nähe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] sm:h-[400px] rounded-xl overflow-hidden">
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapCenterUpdater setMapCenter={setMapCenter} />
                    {nearbyProviders.map((provider) => (
                      <Marker key={provider.id} position={provider.position}>
                        <Popup>
                          <strong>{provider.name}</strong>
                          <br />
                          Service: {provider.service}
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-black">
      <div className="fixed inset-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
          <ParticleCloud />
        </Canvas>
      </div>
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-amber-900/20 pointer-events-none" />
      <div className="relative z-10 flex w-full">
        {renderSidebar()}
        {renderContent()}
      </div>
    </div>
  )
}
/* eslint-enable @typescript-eslint/no-unused-vars */
