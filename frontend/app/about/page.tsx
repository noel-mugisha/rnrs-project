import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Heart, Target, Lightbulb, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/layout/header"

const values = [
  {
    icon: Target,
    title: "Empowerment",
    description: "We are dedicated to empowering every Rwandan by providing access to opportunities that foster professional growth and financial stability.",
  },
  {
    icon: Heart,
    title: "Integrity",
    description: "We operate with transparency and honesty, ensuring a trustworthy and reliable platform for both job seekers and employers.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We continuously leverage technology to simplify the hiring process and create effective solutions for the Rwandan job market.",
  },
  {
    icon: Users,
    title: "Community",
    description: "We are deeply committed to the Rwandan community, striving to contribute to the nation's economic development and prosperity.",
  },
]

const team = [
  {
    name: "Alex Hirwa",
    title: "Founder & CEO",
    avatar: "/images/team-member-1.jpg",
  },
  {
    name: "Benita Kaneza",
    title: "Head of Product",
    avatar: "/images/team-member-2.jpg",
  },
  {
    name: "Chris Gatera",
    title: "Lead Engineer",
    avatar: "/images/team-member-3.jpg",
  },
]

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-32">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="max-w-4xl mx-auto space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                Empowering Rwanda's Workforce, <span className="text-primary">One Connection at a Time</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                RNRS is more than a job portal. We are a dedicated team passionate about bridging the gap between talent and opportunity to foster economic growth and individual prosperity in Rwanda.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <Image
                  src="/images/about-hero.jpg"
                  alt="A group of diverse Rwandan professionals"
                  width={600}
                  height={450}
                  className="rounded-2xl shadow-xl object-cover"
                />
              </div>
              <div className="space-y-12">
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold text-primary">Our Mission</h2>
                  <p className="text-lg text-muted-foreground">
                    To connect non-employed and underemployed Rwandans with meaningful job opportunities, providing a platform that supports career development and helps businesses find the right talent to thrive.
                  </p>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold text-primary">Our Vision</h2>
                  <p className="text-lg text-muted-foreground">
                    To be the cornerstone of career development and talent acquisition in Rwanda, recognized for our commitment to integrity, innovation, and the economic empowerment of our community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold">The Principles That Guide Us</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our values are the foundation of everything we build and every connection we make.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center p-8 border-t-4 border-t-primary">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <value.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold">Meet the Team</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The passionate individuals dedicated to building a better future for Rwanda's workforce.
              </p>
            </div>
            <div className="flex justify-center flex-wrap gap-12">
              {team.map((member) => (
                <div key={member.name} className="text-center space-y-3">
                  <Avatar className="w-32 h-32 mx-auto">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="text-3xl">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-lg font-semibold">{member.name}</h4>
                    <p className="text-primary">{member.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}