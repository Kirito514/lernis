import React, { useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Search, 
  ArrowRight, 
  Play, 
  CheckCircle, 
  Shield, 
  QrCode, 
  Target, 
  Award, 
  Globe, 
  Database, 
  Users, 
  Zap, 
  FileText, 
  MapPin, 
  Clock, 
  Phone, 
  Mail 
} from 'lucide-react';
// Lazy load components for better performance
const Navbar = lazy(() => import('../components/Navbar'));
const Footer = lazy(() => import('../components/Footer'));

export default function HomePage() {
  const [searchId, setSearchId] = useState('');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) {
      // Focus input field and add error styling
      const input = document.querySelector('input[placeholder="Enter Certificate ID"]') as HTMLInputElement;
      if (input) {
        input.focus();
        input.classList.add('border-red-500', 'ring-red-500');
        setTimeout(() => {
          input.classList.remove('border-red-500', 'ring-red-500');
        }, 2000);
      }
      return;
    }
    window.location.href = `/verify/${searchId.trim()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-transparent to-purple-50/60" />
        
        {/* Floating orbs with optimized animation */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse-optimized" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-300/15 rounded-full blur-3xl animate-pulse-optimized" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-br from-indigo-400/18 to-blue-300/18 rounded-full blur-3xl animate-pulse-optimized" style={{animationDelay: '4s'}} />
        <div className="absolute bottom-40 right-1/4 w-32 h-32 bg-gradient-to-br from-emerald-400/6 to-teal-300/6 rounded-full blur-3xl animate-pulse-optimized" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-gradient-to-br from-amber-400/10 to-orange-300/10 rounded-full blur-3xl animate-pulse-optimized" style={{animationDelay: '3s'}} />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Radial gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-blue-50/20" />
      </div>

      {/* Soft gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-16 sm:-top-40 sm:-left-32 w-[200px] h-[200px] sm:w-[420px] sm:h-[420px] rounded-full bg-gradient-to-br from-blue-400/25 to-purple-400/25 blur-3xl" />
        <div className="absolute -bottom-20 -right-16 sm:-bottom-40 sm:-right-32 w-[250px] h-[250px] sm:w-[520px] sm:h-[520px] rounded-full bg-gradient-to-br from-amber-300/20 to-blue-400/20 blur-3xl" />
      </div>

      {/* Navigation Header */}
      <Suspense fallback={<div className="h-16 bg-transparent" />}>
        <Navbar />
      </Suspense>

      {/* Split hero */}
      <section className="relative pt-12 sm:pt-16 lg:pt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Left copy */}
              <div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 mb-5">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-purple-600">BLOCKCHAIN CERTIFICATES</p>
                <h1 className="text-5xl leading-tight md:text-6xl md:leading-tight font-extrabold tracking-tight text-gray-900">
                  Turn your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">data</span> into
                  verifiable <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">certificates</span>
                </h1>
                <p className="mt-3 max-w-xl text-gray-600 text-base md:text-lg">
                  Create, mint and verify education credentials as NFTs on the Polygon blockchain. Share your link or QR.
                </p>

                <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                  <Link to="/auth/register" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white bg-gray-900 hover:bg-black transition">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button type="button" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 transition" aria-label="Watch product demo video">
                    <Play className="h-4 w-4" aria-hidden="true" /> Watch Demo
                  </button>
                </div>

                <form onSubmit={handleSearch} className="mt-4 flex max-w-md rounded-3xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm p-1 shadow-lg focus-within:border-blue-500 focus-within:shadow-blue-100">
                  <div className="flex-1 flex items-center px-4 py-3">
                    <Search className="h-5 w-5 text-gray-400 mr-3" />
                    <input 
                      type="text" 
                      placeholder="Enter Certificate ID" 
                      value={searchId} 
                      onChange={(e) => setSearchId(e.target.value)} 
                      className="flex-1 text-sm outline-none bg-transparent placeholder-gray-500 text-gray-900" 
                      aria-label="Certificate ID for verification"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md"
                  >
                    <Search className="h-4 w-4" aria-hidden="true" /> 
                    Verify
                  </button>
                </form>

                {/* Small trust row */}
                <div className="mt-4 flex items-center gap-4 text-gray-500/80 text-xs">
                  <div className="inline-flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-emerald-600"/>No signup</div>
                  <div className="inline-flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-blue-600"/>Anti‑tamper</div>
                  <div className="inline-flex items-center gap-1"><QrCode className="h-3.5 w-3.5 text-purple-600"/>QR verify</div>
                </div>
                <p className="mt-2 text-xs text-gray-500">Powered by Polygon, IPFS, Filecoin.</p>
              </div>

               {/* Right: Hero Image */}
               <div className="relative flex items-center justify-center mt-8 lg:mt-0">
                 <div className="relative">
                   <img 
                     src="/images/NFT-hero.svg" 
                     alt="EduNFT Platform" 
                     className="w-full max-w-[500px] sm:max-w-[700px] lg:max-w-[900px] h-[300px] sm:h-[450px] lg:h-[550px] object-contain animate-float"
                     loading="eager"
                     decoding="async"
                     fetchPriority="high"
                   />
                   {/* Floating elements around the main image */}
                   <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full animate-pulse-optimized"></div>
                   <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-500 rounded-full animate-pulse-optimized" style={{animationDelay: '1s'}}></div>
                   <div className="absolute top-1/2 -left-8 w-4 h-4 bg-green-500 rounded-full animate-pulse-optimized" style={{animationDelay: '2s'}}></div>
                 </div>
               </div>
            </div>

            {/* Space before next sections */}
            <div className="h-10" />
          </div>
        </section>

      {/* Trust Section */}
      <section className="py-16 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Trusted by Educational Institutions Worldwide
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of institutions already using Lernis
            </p>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                number: "10,000+", 
                label: "Certificates Issued",
                icon: "📜",
                color: "from-blue-500 to-cyan-500"
              },
              { 
                number: "500+", 
                label: "Institutions",
                icon: "🏫",
                color: "from-green-500 to-emerald-500"
              },
              { 
                number: "50+", 
                label: "Countries",
                icon: "🌍",
                color: "from-purple-500 to-pink-500"
              },
              { 
                number: "99.9%", 
                label: "Uptime",
                icon: "⚡",
                color: "from-orange-500 to-red-500"
              }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="mb-4">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className={`text-3xl md:text-4xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium text-sm">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm font-semibold mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              How It Works
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Three Simple Steps</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">From creation to verification in minutes</p>
          </div>

          {/* Timeline Style */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 transform -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-4">
              {[
                {
                  step: "01",
                  title: "Create & Upload",
                  description: "Institutions upload certificate data and customize with their branding",
                  icon: <FileText className="h-6 w-6" />,
                  color: "from-blue-500 to-blue-600",
                  bgColor: "bg-blue-50",
                  borderColor: "border-blue-200"
                },
                {
                  step: "02", 
                  title: "Blockchain Mint",
                  description: "Certificates are minted as NFTs on Polygon for permanent storage",
                  icon: <Zap className="h-6 w-6" />,
                  color: "from-purple-500 to-purple-600",
                  bgColor: "bg-purple-50",
                  borderColor: "border-purple-200"
                },
                {
                  step: "03",
                  title: "Instant Verify", 
                  description: "Anyone can verify authenticity using QR codes or certificate links",
                  icon: <CheckCircle className="h-6 w-6" />,
                  color: "from-green-500 to-green-600",
                  bgColor: "bg-green-50",
                  borderColor: "border-green-200"
                }
              ].map((item, index) => (
                <div key={index} className="relative group">
                  {/* Step Circle */}
                  <div className="relative z-10 mx-auto lg:mx-0 w-16 h-16 mb-6">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {item.step}
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${item.color}`}></div>
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className={`${item.bgColor} ${item.borderColor} border rounded-2xl p-6 text-center lg:text-left group-hover:shadow-lg transition-all duration-300`}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center mx-auto lg:mx-0 mb-4 text-white`}>
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>

                  {/* Arrow for mobile */}
                  {index < 2 && (
                    <div className="lg:hidden flex justify-center mt-6">
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-full">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Complete process takes less than 5 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold mb-4">
              <Zap className="h-3 w-3" />
              Powerful Features
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Discover the powerful capabilities that make Lernis the leading platform for blockchain-based educational credentials.</p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Shield className="h-5 w-5" />,
                title: "Blockchain Security",
                description: "Immutable on-chain records prevent tampering and ensure authenticity.",
                gradient: "from-blue-500 to-cyan-500",
                bgGradient: "from-blue-50 to-cyan-50"
              },
              {
                icon: <Zap className="h-5 w-5" />,
                title: "Instant Verification",
                description: "Verify any certificate in seconds with our lightning-fast system.",
                gradient: "from-green-500 to-emerald-500",
                bgGradient: "from-green-50 to-emerald-50"
              },
              {
                icon: <Globe className="h-5 w-5" />,
                title: "Global Access",
                description: "Available 24/7 from anywhere in the world.",
                gradient: "from-purple-500 to-pink-500",
                bgGradient: "from-purple-50 to-pink-50"
              },
              {
                icon: <FileText className="h-5 w-5" />,
                title: "Custom Fields",
                description: "Flexible form creation for any type of credential",
                gradient: "from-orange-500 to-red-500",
                bgGradient: "from-orange-50 to-red-50"
              },
              {
                icon: <GraduationCap className="h-5 w-5" />,
                title: "Institution Logo",
                description: "Brand your certificates with official logos",
                gradient: "from-indigo-500 to-blue-500",
                bgGradient: "from-indigo-50 to-blue-50"
              },
              {
                icon: <Users className="h-5 w-5" />,
                title: "Bulk Import",
                description: "Upload multiple certificates via CSV",
                gradient: "from-teal-500 to-green-500",
                bgGradient: "from-teal-50 to-green-50"
              }
            ].map((feature, index) => (
              <div key={index} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${feature.bgGradient} p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Icon */}
                <div className={`relative z-10 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
                
                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">What Our Users Say</h2>
                <p className="text-lg text-gray-600">Hear from educational institutions using EduNFT</p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-green-600">
                <Users className="h-5 w-5" />
                <span className="text-xs font-semibold">Trusted by 500+ Institutions</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Dr. Sarah Johnson",
                role: "Registrar, MIT",
                content: "EduNFT has revolutionized how we issue and verify certificates. The blockchain technology ensures our credentials are tamper-proof and globally recognized.",
                avatar: "SJ"
              },
              {
                name: "Prof. Ahmed Hassan",
                role: "Dean, University of Dubai",
                content: "The platform is incredibly user-friendly. Our students can now share their certificates instantly with employers worldwide.",
                avatar: "AH"
              },
              {
                name: "Lisa Chen",
                role: "HR Director, Google",
                content: "Verifying educational credentials has never been easier. We can instantly validate certificates from any institution using EduNFT.",
                avatar: "LC"
              }
            ].map((testimonial, index) => (
              <div key={index} className="rounded-2xl bg-white/90 backdrop-blur border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-3">
                    <div className="font-bold text-gray-900 text-base">{testimonial.name}</div>
                    <div className="text-gray-600 font-medium text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic text-sm leading-relaxed">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-6 items-center mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1.5 w-1.5 bg-orange-500 rounded-full"></div>
                <div className="h-1.5 w-1.5 bg-orange-400 rounded-full"></div>
                <div className="h-1.5 w-1.5 bg-orange-300 rounded-full"></div>
                <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider ml-3">About Us</span>
              </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">About Lernis</h2>
                <p className="text-base text-gray-600 leading-relaxed">
                  Lernis is a revolutionary platform that transforms traditional educational credentials into verifiable, tamper-proof NFTs on the blockchain.
                </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-full h-40 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl flex items-center justify-center">
                <Award className="h-12 w-12 text-orange-500 opacity-50" />
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Icon */}
              <div className="relative z-10 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-5 w-5" />
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300">
                  Our Mission
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  To democratize credential verification by making it instant, secure, and accessible to everyone through blockchain technology.
                </p>
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Icon */}
              <div className="relative z-10 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                <Award className="h-5 w-5" />
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300">
                  Our Vision
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  A world where every educational achievement is instantly verifiable, globally recognized, and permanently secure.
                </p>
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            </div>
          </div>

          {/* Core Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: <Shield className="h-5 w-5" />,
                title: "Security",
                description: "Blockchain-powered immutability ensures credentials can never be tampered with.",
                gradient: "from-red-500 to-pink-500",
                bgGradient: "from-red-50 to-pink-50"
              },
              {
                icon: <Globe className="h-5 w-5" />,
                title: "Accessibility",
                description: "Available 24/7, accessible from anywhere in the world.",
                gradient: "from-green-500 to-emerald-500",
                bgGradient: "from-green-50 to-emerald-50"
              },
              {
                icon: <Database className="h-5 w-5" />,
                title: "Transparency",
                description: "All verification processes are open and auditable on the blockchain.",
                gradient: "from-blue-500 to-cyan-500",
                bgGradient: "from-blue-50 to-cyan-50"
              },
              {
                icon: <Users className="h-5 w-5" />,
                title: "Inclusivity",
                description: "Designed to serve educational institutions of all sizes worldwide.",
                gradient: "from-orange-500 to-amber-500",
                bgGradient: "from-orange-50 to-amber-50"
              }
            ].map((value, index) => (
              <div key={index} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${value.bgGradient} p-5 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Icon */}
                <div className={`relative z-10 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r ${value.gradient} text-white mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  {value.icon}
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300">
                    {value.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {value.description}
                  </p>
                </div>
                
                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${value.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-semibold mb-4">
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
              Pricing Plans
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Simple Pricing</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Start free and scale as you grow. Choose the perfect plan for your educational institution's needs.</p>
          </div>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Free Plan */}
            <div className="rounded-2xl bg-white/90 backdrop-blur border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative group hover:-translate-y-1">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-3xl font-extrabold text-gray-900 mb-2">$0</div>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited verifications",
                  "Basic issuing (up to 10/month)",
                  "Community support",
                  "Standard templates",
                  "Basic analytics"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/auth/register" className="w-full bg-gray-900 text-white rounded-full px-5 py-2.5 font-semibold hover:bg-black transition block text-center">
                Get Started Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-6 shadow-2xl relative transform scale-105 group hover:scale-110 transition-all duration-300">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">Most Popular</span>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                <div className="text-3xl font-extrabold text-white mb-2">$19</div>
                <p className="text-blue-100">per month</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Free",
                  "Unlimited issuing",
                  "Custom branding",
                  "Advanced analytics",
                  "Priority support",
                  "Bulk import (CSV)",
                  "API access",
                  "Webhook notifications"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-white flex-shrink-0" />
                    <span className="text-blue-100">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full bg-white text-gray-900 rounded-full px-5 py-2.5 font-semibold hover:bg-gray-100 transition">
                Start Pro Trial
              </button>
            </div>
            
            {/* Enterprise Plan */}
            <div className="rounded-2xl bg-white/90 backdrop-blur border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative group hover:-translate-y-1">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-3xl font-extrabold text-gray-900 mb-2">Custom</div>
                <p className="text-gray-600">For large organizations</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Pro",
                  "Custom integrations",
                  "Dedicated support",
                  "SLA guarantees",
                  "Custom templates",
                  "Advanced security",
                  "On-premise options",
                  "Training & consulting"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full bg-gray-900 text-white rounded-full px-5 py-2.5 font-semibold hover:bg-black transition">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-6 w-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <FileText className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Help Center</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 max-w-2xl">Everything you need to know about EduNFT</p>
          </div>

           <div className="space-y-3">
             {[
               {
                 question: "What is Lernis?",
                 answer: "Lernis is a blockchain-based platform that allows educational institutions to mint and verify certificates as NFTs, ensuring authenticity and preventing fraud."
               },
               {
                 question: "How secure are the certificates?",
                 answer: "Certificates are stored on the Polygon blockchain, making them immutable and tamper-proof. Each certificate is cryptographically verified."
               },
               {
                 question: "Do I need to pay gas fees?",
                 answer: "No, we use Biconomy for gasless transactions, so institutions can mint certificates without paying gas fees."
               },
               {
                 question: "Can anyone verify certificates?",
                 answer: "Yes, our verification system is public and free to use. Anyone can verify a certificate using the certificate ID or QR code."
               },
               {
                 question: "What blockchains do you support?",
                 answer: "Currently, we support Polygon (MATIC) network, with plans to expand to other blockchains in the future."
               },
               {
                 question: "How do I get started?",
                 answer: "Simply register as an institution, complete the verification process, and start minting certificates. No technical knowledge required."
               }
             ].map((faq, index) => (
               <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                 <button
                   onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                   className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                 >
                   <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                   <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-300 ${openFAQ === index ? 'rotate-180' : ''}`}>
                     <svg 
                       className="w-4 h-4 text-gray-600" 
                       fill="none" 
                       stroke="currentColor" 
                       viewBox="0 0 24 24"
                     >
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                     </svg>
                   </div>
                 </button>
                 
                 <div className={`transition-all duration-300 ease-in-out ${openFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                   <div className="px-6 pb-6">
                     <div className="border-t border-gray-200 pt-4">
                       <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                     </div>
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>


        {/* Get Started CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of institutions already using Lernis. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/auth/register"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold bg-white text-gray-900 hover:bg-gray-100 transition"
              >
                <GraduationCap className="h-5 w-5" />
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-gray-900 transition"
              >
                <Play className="h-5 w-5" />
                Watch Demo
              </Link>
            </div>
          </div>
        </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-full text-blue-700 text-xs font-semibold mb-4">
              <Mail className="h-3 w-3" />
              <span>Contact Us</span>
              <div className="h-1 w-1 bg-blue-400 rounded-full"></div>
              <div className="h-1 w-1 bg-blue-300 rounded-full"></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Have questions about EduNFT? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {[
              {
                icon: <Mail className="h-5 w-5" />,
                title: "Email",
                description: "support@edunft.com",
                link: "mailto:support@edunft.com"
              },
              {
                icon: <Phone className="h-5 w-5" />,
                title: "Phone",
                description: "+1 (555) 123-4567",
                link: "tel:+15551234567"
              },
              {
                icon: <MapPin className="h-5 w-5" />,
                title: "Address",
                description: "123 Blockchain St, Tech City, TC 12345",
                link: "#"
              },
              {
                icon: <Clock className="h-5 w-5" />,
                title: "Business Hours",
                description: "Mon-Fri: 9AM-6PM EST",
                link: "#"
              }
            ].map((info, index) => (
              <div key={index} className="rounded-2xl bg-white/90 backdrop-blur border border-gray-200/50 p-5 shadow-lg hover:shadow-xl transition-all duration-300 text-center group hover:-translate-y-1">
                <div className="bg-blue-600/10 text-blue-600 p-2.5 rounded-lg w-10 h-10 flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform duration-300">
                  {info.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{info.title}</h3>
                <a 
                  href={info.link} 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {info.description}
                </a>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="text-center">
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-white">
              <h3 className="text-xl font-extrabold mb-2">Need Help Getting Started?</h3>
              <p className="text-blue-100 mb-4">
                Our team is here to help you implement EduNFT at your institution
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-white text-gray-900 hover:bg-gray-100 transition"
                >
                  <Mail className="h-3 w-3" />
                  Contact Sales
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <Link
                  to="/schedule-demo"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border-2 border-white text-white hover:bg-white hover:text-gray-900 transition"
                >
                  <Play className="h-3 w-3" />
                  Schedule Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Suspense fallback={<div className="h-32 bg-gray-900" />}>
        <Footer />
      </Suspense>

    </div>
  );
}
