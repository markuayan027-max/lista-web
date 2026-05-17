import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Mail, Phone, Clock, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useFaqs } from "@/hooks/use-lista-data";

export default function TraineeHelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: faqs = [], isLoading } = useFaqs();

  const filteredFaqs = faqs.filter((faq) => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(filteredFaqs.map(f => f.category)));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Help & FAQ</h1>
        <p className="text-muted-foreground mt-1">Find answers or get in touch with our support team.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for answers..."
              className="pl-10 h-12 text-base bg-white rounded-xl shadow-sm border-card-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-6">
            {categories.length > 0 ? categories.map((category) => (
              <div key={category} className="space-y-3">
                <h2 className="text-lg font-bold">{category}</h2>
                <Accordion type="single" collapsible className="w-full bg-white rounded-xl border border-card-border shadow-sm overflow-hidden">
                  {filteredFaqs.filter(f => f.category === category).map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} className="border-card-border px-4">
                      <AccordionTrigger className="font-semibold text-left py-4 hover:no-underline hover:text-primary transition-colors">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )) : (
              <div className="text-center py-12 text-muted-foreground bg-white rounded-xl border border-card-border">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>No answers found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <Card className="border-card-border shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>We're here to help if you need us.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Email us</p>
                    <p className="text-sm text-muted-foreground">admin@lorenzinternational.org</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Call us</p>
                    <p className="text-sm text-muted-foreground">09051095284</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Hours</p>
                    <p className="text-sm text-muted-foreground">Mon-Sat, 8am - 5pm</p>
                  </div>
                </div>
              </div>
              <Button className="w-full font-bold">Contact Support</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
