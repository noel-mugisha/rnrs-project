import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, ArrowRight, BarChart, Users, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/layout/header"

const features = [
  {
    icon: Users,
    title: "Access a Diverse Talent Pool",
    description: "Connect with a wide range of skilled and motivated professionals across various industries in Rwanda.",
  },
  {
    icon: Zap,
    title: "Streamlined Hiring Process",
    description: "Our intuitive dashboard helps you manage job postings, review applications, and track candidates efficiently.",
  },
  {
    icon: BarChart,
    title: "Data-Driven Insights",
    description: "Gain valuable insights into your job postings' performance and make informed hiring decisions.",
  },
]

const testimonials = [
  {
    name: "Aline Uwera",
    title: "HR Manager, TechSavvy Rwanda",
    quote: "RNRS has transformed our hiring process. We've found exceptional local talent faster than ever before. The platform is intuitive and perfectly tailored to the Rwandan market.",
    avatar: "/images/team-member-1.jpg",
  },
  {
    name: "Jean-Paul Mugisha",
    title: "CEO, Kigali Builders Ltd.",
    quote: "As a construction company, finding skilled labor was a challenge. RNRS provided us with a direct channel to qualified candidates, saving us time and resources.",
    avatar: "/images/team-member-2.jpg",
  },
]

export default function ForEmployersPage() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-32">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 text-center lg:text-left">
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                  Find Your Next Great Hire in <span className="text-primary">Rwanda</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
                  Tap into a growing network of skilled professionals and streamline your recruitment process with tools designed for the modern Rwandan enterprise.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" asChild className="text-base bg-gradient-to-r from-primary to-blue-600">
                    <Link href="/auth/signup">
                      Post a Job Today
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="text-base">
                    <Link href="/about">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <Image
                  src="/images/employers-hero.jpg"
                  alt="A professional conducting a job interview in a modern Rwandan office"
                  width={600}
                  height={450}
                  className="rounded-2xl shadow-xl object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose RNRS Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold">Why Top Companies Choose RNRS</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We provide the tools and talent you need to build a world-class team.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center p-8 hover:shadow-lg transition-shadow">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl font-bold">A Powerful Hiring Toolkit</h2>
                <p className="text-lg text-muted-foreground">
                  From posting jobs to managing applicants, our platform simplifies every step of the hiring journey.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Effortless Job Posting</h4>
                      <p className="text-muted-foreground">Create detailed and attractive job listings in minutes with our guided editor.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Smart Candidate Filtering</h4>
                      <p className="text-muted-foreground">Quickly find the most relevant candidates using advanced filters for skills, experience, and more.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Applicant Management Dashboard</h4>
                      <p className="text-muted-foreground">Track applications, communicate with candidates, and move them through your hiring pipeline seamlessly.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-muted/30 p-8 rounded-2xl">
                <Image
                  src="/images/dashboard-preview.jpg"
                  alt="Screenshot of the RNRS employer dashboard"
                  width={500}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold">Trusted by Rwandan Businesses</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-8">
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-4 pt-4">
                      <Avatar>
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.title}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Final CTA */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center space-y-8">
              <h2 className="text-4xl font-bold">Ready to Build Your Dream Team?</h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Join hundreds of Rwandan companies finding their next great hire on RNRS. Post your first job for free.
              </p>
              <Button size="lg" variant="secondary" asChild className="text-base">
                <Link href="/auth/signup">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}