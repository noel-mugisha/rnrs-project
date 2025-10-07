"use client"

import { useState, useEffect, useRef } from "react"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  Search, Users, Briefcase, ArrowRight, CheckCircle, User, HandCoins, Laptop, Wallet, 
  LineChart, Headset, Utensils, HardHat, Car, Sparkles, Tractor, Building2 
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence, useInView, Variants } from "framer-motion"

export default function HomePage() {
  const [activeService, setActiveService] = useState('salary-access');
  const [activeJobCategory, setActiveJobCategory] = useState('farming');

  // Refs for section highlighting
  const servicesRef = useRef(null);
  const payrollRef = useRef(null);
  const dailyJobRef = useRef(null);

  const servicesInView = useInView(servicesRef, { amount: 0.2 });
  const payrollInView = useInView(payrollRef, { amount: 0.2 });
  const dailyJobInView = useInView(dailyJobRef, { amount: 0.2 });

  const isServicesActive = servicesInView || payrollInView || dailyJobInView;

  // Data arrays
  const serviceCards = [
    {
      title: "Organization",
      description: "An organization partners with RNRS by signing a contract that allows it to receive salary loans used to pay its employees. The organization then repays the loan in the following month, either in full or in installments, depending on the agreement.",
      icon: Building2,
      buttonText: "Fill your Information",
      buttonLink: "/auth/signup",
    },
    {
      title: "Employee",
      description: "Employees in partnered organizations can access part of their salary before the end of the month. This is only possible if there is an individual agreement between the employee and RNRS through their employer.",
      icon: User,
      buttonText: "Fill your Information",
      buttonLink: "/auth/signup",
    },
    {
      title: "Job Provider",
      description: "A job provider registers on the RNRS platform by submitting their personal and professional information. Once approved, they can hire workers, access job seeker profiles, and process salary payments directly through the system.",
      icon: Briefcase,
      buttonText: "Fill your Information",
      buttonLink: "/auth/signup",
    },
  ];

  const payrollServices = [
    { id: "salary-access", title: "Salary Access", icon: HandCoins, heading: "Employee Salary Access", description: "Access your weekly salary anytime. A 5% transaction fee applies, and a 3% refundable deposit is required.", image: "/images/payroll-salary-access.png", features: ["View your profile", "Request week salary", "Employee salary", "View your salary deposit", "Request deposit refund", "Payment Report", "Download Report"] },
    { id: "free-funds", title: "Free Funds", icon: Users, heading: "Employers enjoy Funds and reduce payroll burden", description: "Employers pay no fees, can split salaries over two months, and receive a 3% deposit refund after fulfilling payment obligations.", image: "/images/payroll-free-funds.png", features: ["View your profile", "Funds Report", "Manage bank accounts", "Salary deposit", "Request refund", "Payment history"] },
    { id: "online-payroll-form", title: "Online Payroll Form", icon: Laptop, heading: "Choose Your Payroll Form Easily", description: "Edit, update, and save employee payroll details securely and flexibly, with support for various payroll periods.", image: "/images/payroll-online-form.png", features: ["Daily payroll form", "Weekly payroll form", "Biweekly (15 days) payroll form", "Monthly payroll form", "Choose preferred payroll period", "Track submitted payroll forms"] },
    { id: "direct-payment", title: "Direct Payment", icon: Wallet, heading: "Quick and Easy Payment", description: "Send payroll to workers' mobile money or bank accounts with one click, ensuring fast, secure, and efficient transactions.", image: "/images/payroll-direct-payment.png", features: ["Direct deposit to bank", "Mobile money support", "Fast transactions", "Secure payment process", "Multiple payout options", "Reliable and efficient service"] },
    { id: "payroll-analytics", title: "Payroll Analytics", icon: LineChart, heading: "Insightful Payroll Analytics", description: "Track and analyze payroll trends with detailed reports and visual dashboards to optimize costs and improve efficiency.", image: "/images/payroll-analytics.png", features: ["View detailed reports", "Analyze payment trends", "Export analytics data", "Monitor salary expenses", "Identify cost-saving opportunities", "Visualize payroll data"] },
    { id: "employee-support", title: "Employee Support", icon: Headset, heading: "Dedicated Employee Support", description: "Access support for payroll queries, payment assistance, and resolving salary-related issues quickly and efficiently.", image: "/images/payroll-employee-support.png", features: ["24/7 payroll support", "Resolve payment issues", "Employee FAQ", "Request assistance", "Live chat support", "Help desk tickets"] }
  ];

  const dailyJobCategories = [
    { id: "farming", title: "Farming", icon: Tractor, description: "For farming on land, the worker agrees with the employer on a daily wage equal to or between (1,250 - 1,750) frw. For farming in the swamp, the worker agrees with the employer on a daily wage equal to or between (1,500 - 2,000) frw. NB: 100 frw is the cost of the service provided by the worker, but 150 frw is the cost of the service provided by the employer.", image: "/images/daily-job-farming.png", dropdownOptions: ["Farming on land", "Farming in the swamp"] },
    { id: "building", title: "Building", icon: HardHat, description: "Building workers in Rwanda often negotiate daily wages with employers based on the type and complexity of work. Payments range from 2,000 to 5,000 Rwandan Francs per day, depending on skill level, task nature, and materials involved. Skilled workers earn more than general laborers, and both parties agree on the rate before work begins.", image: "/images/daily-job-building.png", dropdownOptions: ["Masonry", "Carpentry", "Plastering"] },
    { id: "cleaning", title: "Cleaning", icon: Sparkles, description: "Cleaning jobs in Rwanda include tasks like sweeping, mopping, dusting, and dishwashing, depending on whether it's a home or office. Pay varies based on space size, duties, and time required. Workers typically earn between 1,000 and 2,500 Rwandan Francs per day. Most of these jobs are informal, with payment terms agreed upon beforehand.", image: "/images/daily-job-cleaning.png", dropdownOptions: ["Office", "Home", "Outdoor"] },
    { id: "burdening", title: "Burdening", icon: Briefcase, description: "Burdening jobs in Rwanda involve carrying heavy loads like construction materials or water over distances. These physically demanding roles are often informal and short-term, typically paying between 1,000 and 2,000 Rwandan Francs per day, with rates negotiated based on workload.", image: "/images/daily-job-burdening.png", dropdownOptions: ["Carrying Bricks", "Water Fetching"] },
    { id: "cooking", title: "Cooking", icon: Utensils, description: "Catering jobs involve preparing and serving food for events, businesses, or households. These roles require skills in cooking, food presentation, and customer service. They are often temporary or event-based, with daily pay varying depending on the event scale and menu complexity, usually negotiated between 15,000 and 30,000 RWF.", image: "/images/daily-job-cooking.png", dropdownOptions: ["Event", "Home catering"] },
    { id: "driving", title: "Driving", icon: Car, description: "Driving jobs in Rwanda include transporting passengers or goods for events, businesses, or individuals. Drivers may use cars, motorcycles, or trucks depending on the job. Daily pay typically ranges from 5,000 to 15,000 Rwandan Francs, depending on the vehicle type, distance, and hours worked. Rates are usually agreed upon before the job begins.", image: "/images/daily-job-driving.png", dropdownOptions: ["Passenger Transport", "Goods Delivery"] }
  ];

  const currentService = payrollServices.find(service => service.id === activeService);
  const currentJobCategory = dailyJobCategories.find(cat => cat.id === activeJobCategory);

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };
  
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="shrink-0"><Logo /></Link>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/jobs" className="text-sm font-medium hover:text-primary transition-colors relative group">Find Jobs<span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"/></a>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={cn("text-sm font-medium transition-colors relative group", isServicesActive ? "text-primary" : "hover:text-primary")}>Services<span className={cn("absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-transform duration-300 ease-out origin-left", isServicesActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")}/></button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                  <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary"><a href="#job-seeker-services">Opening Account</a></DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary"><a href="#payroll-services">Payroll Services</a></DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary"><a href="#daily-job-matching">Daily Job Matching</a></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <a href="/employers" className="text-sm font-medium hover:text-primary transition-colors relative group">For Employers<span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"/></a>
              <a href="/about" className="text-sm font-medium hover:text-primary transition-colors relative group">About<span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"/></a>
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" asChild><Link href="/auth/login">Sign In</Link></Button>
              <Button size="sm" asChild className="bg-gradient-to-r from-primary to-red-700 hover:from-primary/90 hover:to-red-700/90 transition-all duration-300"><Link href="/auth/signup">Get Started</Link></Button>
            </div>
          </div>
        </div>
      </header>
      
      <motion.main initial="hidden" animate="visible" variants={containerVariants}>
        <motion.section variants={sectionVariants} className="py-16 lg:py-24">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <motion.div variants={containerVariants} className="space-y-6 text-center lg:text-left">
                    <motion.div variants={itemVariants}><Badge variant="secondary" className="w-fit bg-primary/10 border-primary/20 text-primary">Connecting Rwanda's Talent</Badge></motion.div>
                    <motion.h1 variants={itemVariants} className="text-4xl lg:text-5xl font-bold tracking-tight text-balance text-foreground">Your career <span className="text-primary">journey starts here</span></motion.h1>
                    <motion.p variants={itemVariants} className="text-lg text-muted-foreground text-pretty max-w-lg mx-auto lg:mx-0">Join Rwanda's premier job marketplace connecting skilled professionals with quality employers. <span className="font-semibold text-primary">Build your future with RNRS.</span></motion.p>
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                      <Button size="lg" className="text-base" asChild style={{ backgroundColor: '#8B0000', color: 'white' }}><Link href="/auth/login">Get Started<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                      <Button variant="outline" size="lg" className="text-base" asChild><Link href="/jobs">Browse Jobs</Link></Button>
                    </motion.div>
                  </motion.div>
                  <motion.div variants={itemVariants} className="relative hidden lg:block">
                      <div className="relative rounded-2xl overflow-hidden shadow-lg">
                          <Image src="/images/hero-team.jpg" alt="Professional team collaboration" width={600} height={450} className="w-full h-auto object-cover" priority/>
                          <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent" />
                      </div>
                  </motion.div>
              </div>
            </div>
        </motion.section>
        
        <motion.section ref={servicesRef} variants={sectionVariants} id="job-seeker-services" className="py-20">
            <div className="container mx-auto px-4">
              <div className="inline-block mb-12"><h2 className="text-3xl font-bold border-b-4 border-primary pb-1">Our Services</h2></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {serviceCards.map((service, index) => (
                      <motion.div key={service.title} variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                      <Card className="p-8 border-l-4 border-primary hover:shadow-xl transition-shadow duration-300 h-full">
                      <CardContent className="p-0 space-y-6 flex flex-col h-full">
                          <div className="flex items-center gap-4"><div className="relative w-12 h-12 flex items-center justify-center -rotate-45"><div className="w-full h-full bg-primary absolute rounded-md" /><service.icon className="h-6 w-6 text-white z-10 rotate-45" /></div><h3 className="text-2xl font-semibold">{service.title}</h3></div>
                          <p className="text-muted-foreground flex-grow">{service.description}</p>
                          <Button asChild className="w-full text-base bg-red-800 hover:bg-red-900 transition-all duration-300 mt-auto" style={{ backgroundColor: '#800000' }} size="lg"><Link href={service.buttonLink}>{service.buttonText}</Link></Button>
                      </CardContent>
                      </Card>
                      </motion.div>
                  ))}
              </div>
            </div>
        </motion.section>

        <motion.section ref={payrollRef} variants={sectionVariants} id="payroll-services" className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12"><h2 className="text-3xl font-bold">Awesome Payroll Services For Business</h2></div>
                <Card className="overflow-hidden"><div className="grid lg:grid-cols-12">
                        <div className="lg:col-span-3 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r bg-card/50">
                            <div className="space-y-2">{payrollServices.map(service => (<button key={service.id} onClick={() => setActiveService(service.id)} className={cn("w-full text-left p-3 rounded-lg border-2 border-transparent transition-all flex items-center gap-3 text-sm", activeService === service.id ? "bg-primary/10 text-primary border-primary/20 font-semibold" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground")}><service.icon className="h-5 w-5 shrink-0"/> <span className="truncate">{service.title}</span></button>))}</div>
                        </div>
                        <div className="lg:col-span-9 p-6">
                            <AnimatePresence mode="wait">
                                {currentService && (
                                    <motion.div key={currentService.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid lg:grid-cols-5 gap-8 items-center">
                                        <motion.div variants={itemVariants} className="lg:col-span-2 relative aspect-[4/3] rounded-lg overflow-hidden shadow-md"><Image src={currentService.image} alt={currentService.title} fill style={{objectFit:"cover"}} sizes="(max-width: 1024px) 100vw, 40vw"/></motion.div>
                                        <motion.div variants={containerVariants} className="lg:col-span-3 flex flex-col justify-center space-y-4">
                                            <motion.h3 variants={itemVariants} className="text-xl font-bold">{currentService.heading}</motion.h3>
                                            <motion.p variants={itemVariants} className="text-sm text-muted-foreground">{currentService.description}</motion.p>
                                            <motion.ul variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">{currentService.features.map((feature, i) => (<li key={i} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0"/><span>{feature}</span></li>))}</motion.ul>
                                            <motion.div variants={itemVariants}><Button asChild size="sm" style={{backgroundColor: '#8B0000'}}><Link href="/auth/signup">Review your Payroll here</Link></Button></motion.div>
                                        </motion.div>
                                    </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                </div></Card>
            </div>
        </motion.section>

        <motion.section ref={dailyJobRef} variants={sectionVariants} id="daily-job-matching" className="py-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12"><h2 className="text-3xl font-bold">Daily Job Matching & Hiring Made Easy</h2></div>
                <Card className="overflow-hidden"><div className="grid lg:grid-cols-12">
                        <div className="lg:col-span-3 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r bg-card/50">
                            <div className="space-y-2">{dailyJobCategories.map(cat => (<button key={cat.id} onClick={() => setActiveJobCategory(cat.id)} className={cn("w-full text-left p-3 rounded-lg border-2 border-transparent transition-all flex items-center gap-3 text-sm", activeJobCategory === cat.id ? "bg-primary/10 text-primary border-primary/20 font-semibold" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground")}><cat.icon className="h-5 w-5 shrink-0"/> <span className="truncate">{cat.title}</span></button>))}</div>
                        </div>
                        <div className="lg:col-span-9 p-6">
                            <AnimatePresence mode="wait">
                                {currentJobCategory && (
                                    <motion.div key={currentJobCategory.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid lg:grid-cols-5 gap-8 items-center">
                                            <motion.div variants={itemVariants} className="lg:col-span-2 relative aspect-[4/3] rounded-lg overflow-hidden shadow-md"><Image src={currentJobCategory.image} alt={currentJobCategory.title} fill style={{objectFit:"cover"}} sizes="(max-width: 1024px) 100vw, 40vw"/></motion.div>
                                            <motion.div variants={containerVariants} className="lg:col-span-3 flex flex-col justify-center space-y-4">
                                                <motion.h3 variants={itemVariants} className="text-xl font-bold">Find job or worker per day in an easy way</motion.h3>
                                                <motion.p variants={itemVariants} className="text-sm text-muted-foreground">{currentJobCategory.description}</motion.p>
                                                <motion.div variants={itemVariants}><Select><SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Select a service" /></SelectTrigger><SelectContent>{currentJobCategory.dropdownOptions.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select></motion.div>
                                                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4"><Button asChild style={{backgroundColor: '#8B0000'}}><Link href="/auth/signup">Hire</Link></Button><Button asChild style={{backgroundColor: '#8B0000'}}><Link href="/auth/signup">Ready for Job</Link></Button></motion.div>
                                            </motion.div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                </div></Card>
            </div>
        </motion.section>

        <motion.section variants={sectionVariants} className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16"><h2 className="text-3xl font-bold">How RNRS Works</h2><p className="text-xl text-muted-foreground max-w-2xl mx-auto">Simple steps to connect talent with opportunity</p></div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-8"><CardContent className="space-y-4"><div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto"><Search className="h-8 w-8 text-primary" /></div><h3 className="text-xl font-semibold">Search & Discover</h3><p className="text-muted-foreground">Browse thousands of job opportunities from top employers across Rwanda</p></CardContent></Card>
              <Card className="text-center p-8"><CardContent className="space-y-4"><div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto"><Users className="h-8 w-8 text-primary" /></div><h3 className="text-xl font-semibold">Apply & Connect</h3><p className="text-muted-foreground">Submit applications with your professional profile and track your progress</p></CardContent></Card>
              <Card className="text-center p-8"><CardContent className="space-y-4"><div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto"><Briefcase className="h-8 w-8 text-primary" /></div><h3 className="text-xl font-semibold">Get Hired</h3><p className="text-muted-foreground">Land your dream job and start building your career with leading companies</p></CardContent></Card>
            </div>
          </div>
        </motion.section>

        <motion.section variants={sectionVariants} className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative"><Image src="/images/business-growth.jpg" alt="Business growth and success" width={600} height={400} className="w-full h-auto object-cover rounded-2xl"/></div>
              <div className="space-y-8">
                <div className="space-y-4"><Badge variant="secondary" className="w-fit">Success Stories</Badge><h2 className="text-3xl font-bold">Empowering Rwanda's workforce</h2><p className="text-lg text-muted-foreground">From entry-level positions to executive roles, RNRS has helped thousands of Rwandans find meaningful employment and build successful careers.</p></div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-primary mt-0.5" /><div><div className="font-semibold">95% Success Rate</div><div className="text-sm text-muted-foreground">Job seekers who complete their profiles get hired within 3 months</div></div></div>
                  <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-primary mt-0.5" /><div><div className="font-semibold">Quality Employers</div><div className="text-sm text-muted-foreground">Vetted companies offering competitive salaries and growth opportunities</div></div></div>
                  <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-primary mt-0.5" /><div><div className="font-semibold">Career Support</div><div className="text-sm text-muted-foreground">Professional guidance and resources to advance your career</div></div></div>
                </div>
                <Button size="lg" asChild><Link href="/about">Read Success Stories<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              </div>
            </div>
          </div>
        </motion.section>
        
        <footer className="border-t border-border bg-muted/30 py-12 mt-20">
            <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
                <div className="space-y-4"><Logo /><p className="text-sm text-muted-foreground">Connecting Rwanda's talent with opportunity. Building careers, transforming lives.</p></div>
                <div className="space-y-4"><h4 className="font-semibold">For Job Seekers</h4><div className="space-y-2 text-sm"><a href="/jobs" className="block text-muted-foreground hover:text-foreground transition-colors">Browse Jobs</a><a href="/profile" className="block text-muted-foreground hover:text-foreground transition-colors">Create Profile</a><a href="/resources" className="block text-muted-foreground hover:text-foreground transition-colors">Career Resources</a></div></div>
                <div className="space-y-4"><h4 className="font-semibold">For Employers</h4><div className="space-y-2 text-sm"><a href="/post-job" className="block text-muted-foreground hover:text-foreground transition-colors">Post a Job</a><a href="/pricing" className="block text-muted-foreground hover:text-foreground transition-colors">Pricing</a><a href="/employer-resources" className="block text-muted-foreground hover:text-foreground transition-colors">Employer Resources</a></div></div>
                <div className="space-y-4"><h4 className="font-semibold">Company</h4><div className="space-y-2 text-sm"><a href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">About Us</a><a href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">Contact</a><a href="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></div></div>
            </div>
            <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground"><p>&copy; 2025 RNRS - Raising Non Employed Rwandans. All rights reserved.</p></div>
            </div>
        </footer>
      </motion.main>
    </div>
  )
}