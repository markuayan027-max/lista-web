import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RefreshCw } from "lucide-react";
import PrimaryButton from "@/components/primary-button";
import CourseCard from "@/components/course-card";
import { Progress } from "@/components/ui/progress";
import { courses } from "@/lib/institutional-data";

type AssessmentOption = { text: string; category?: string; score?: string };
type AssessmentQuestion = { id: number; text: string; options: AssessmentOption[] };

const questions: AssessmentQuestion[] = [
  {
    id: 1,
    text: "Which of these activities sounds most interesting to you?",
    options: [
      { text: "Working with plants, soil, and sustainable farming", category: "Agriculture" },
      { text: "Managing financial records and accounting", category: "Business" },
      { text: "Fixing computers, networking, and software", category: "ICT" },
      { text: "Operating heavy machinery or electrical systems", category: "Construction" },
      { text: "Professional driving and vehicle maintenance", category: "Automotive" },
      { text: "Pattern drafting and sewing garments", category: "Garments" },
    ]
  },
  {
    id: 2,
    text: "What environment do you prefer working in?",
    options: [
      { text: "Outdoors in a farm or garden", category: "Agriculture" },
      { text: "Office setting with a computer", category: "Business" },
      { text: "Technical workshop or IT lab", category: "ICT" },
      { text: "Construction sites or industrial areas", category: "Construction" },
      { text: "On the road or in a vehicle", category: "Automotive" },
      { text: "Tailoring shop or garments factory", category: "Garments" },
    ]
  },
  {
    id: 3,
    text: "What is your primary goal for taking a course?",
    options: [
      { text: "Start a small business or be self-employed", score: "Entrepreneur" },
      { text: "Work for a large company or agency", score: "Corporate" },
      { text: "Work abroad as a skilled professional", score: "Global" },
    ]
  },
  {
    id: 4,
    text: "How do you prefer to solve problems?",
    options: [
      { text: "By using manual tools and physical labor", category: "Construction" },
      { text: "By using digital tools and logic", category: "ICT" },
      { text: "By following strict rules and regulations", category: "Automotive" },
      { text: "By using creative design and precision", category: "Garments" },
    ]
  },
  {
    id: 5,
    text: "Which skill would you like to master most?",
    options: [
      { text: "Sustainable crop production", category: "Agriculture" },
      { text: "Professional Bookkeeping", category: "Business" },
      { text: "Electrical Installation", category: "Construction" },
      { text: "Computer Servicing", category: "ICT" },
      { text: "High-speed Tailoring", category: "Garments" },
    ]
  }
];

export default function AssessmentPage() {
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleStart = () => setStarted(true);

  const handleAnswer = (optionText: string) => {
    const newAnswers = { ...answers, [currentStep]: optionText };
    setAnswers(newAnswers);
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setStarted(false);
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
  };

  // Simple scoring logic based on selected categories
  const getRecommendations = () => {
    const toCardCourse = (c: (typeof courses)[number]) => ({
      slug: c.slug,
      name: c.title,
      sector: c.category,
      ncLevel: c.ncLevel,
      shortDescription: c.shortDescription,
      coverImageUrl: c.galleryImages?.[0],
      twspScholarship: c.twsp ? "true" : "false",
    });

    // Count category mentions in answers
    const categoryScores: Record<string, number> = {};
    
    Object.entries(answers).forEach(([stepStr, answerText]) => {
      const step = parseInt(stepStr);
      const question = questions[step];
      const option = question.options.find(o => o.text === answerText);
      if (option && option.category) {
        categoryScores[option.category] = (categoryScores[option.category] || 0) + 1;
      }
    });

    // Sort categories by score
    const topCategories = Object.entries(categoryScores)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    if (topCategories.length === 0) {
      return courses.slice(0, 3).map(toCardCourse); // Fallback
    }

    const topCategory = topCategories[0];
    const recommended = courses.filter(c => c.category === topCategory);
    
    // Add some fallbacks if we don't have enough
    if (recommended.length < 3) {
      const others = courses.filter(c => c.category !== topCategory);
      recommended.push(...others.slice(0, 3 - recommended.length));
    }

    return recommended.slice(0, 3).map(toCardCourse);
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        
        <AnimatePresence mode="wait">
          {!started ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl p-10 md:p-16 text-center border border-card-border shadow-sm"
            >
              <style>{`
                @keyframes float3d {
                  0%, 100% { transform: translateY(0px) rotate(-2deg); }
                  50% { transform: translateY(-12px) rotate(2deg); }
                }
                .icon-float { animation: float3d 3.5s ease-in-out infinite; }
              `}</style>
              <div className="mx-auto mb-8 w-64 h-80 flex items-center justify-center overflow-hidden rounded-2xl">
                <img
                  src="/assessment promotional image.png"
                  alt="Find Your Path"
                  className="icon-float w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Find Your Path</h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
                Not sure which course is right for you? Answer 5 quick questions and we'll recommend the best programs based on your goals and interests.
              </p>
              <PrimaryButton size="lg" onClick={handleStart} className="h-14 px-10 text-lg">
                Start Assessment
              </PrimaryButton>
            </motion.div>
          ) : !showResults ? (
            <motion.div
              key={`q-${currentStep}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl p-8 md:p-12 border border-card-border shadow-sm"
            >
              <div className="mb-8 space-y-4">
                <div className="flex justify-between text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  <span>Question {currentStep + 1} of {questions.length}</span>
                  <span>{Math.round(((currentStep) / questions.length) * 100)}%</span>
                </div>
                <Progress value={((currentStep) / questions.length) * 100} className="h-2 bg-slate-100" />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-snug">
                {questions[currentStep].text}
              </h2>

              <div className="space-y-4">
                {questions[currentStep].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option.text)}
                    className="w-full text-left p-6 rounded-2xl border-2 border-card-border hover:border-primary hover:bg-primary/5 transition-all duration-200 font-medium text-lg text-foreground"
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-12"
            >
              <div className="text-center space-y-6">
                <div className="mx-auto mb-2 w-24 h-24 flex items-center justify-center">
                  <img
                    src="/assessment-icon.png"
                    alt="Results"
                    className="icon-float w-20 h-20 object-contain drop-shadow-xl"
                  />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight">Your Recommendations</h1>
                <p className="text-xl text-muted-foreground">Based on your answers, these programs are the best fit for your goals.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {getRecommendations().map((course) => (
                  <CourseCard key={course.slug} course={course} hideLockOverlay={true} />
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                <button 
                  onClick={handleRestart}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold px-6 py-3"
                >
                  <RefreshCw className="w-5 h-5" /> Start over
                </button>
                <Link href="/courses">
                  <PrimaryButton variant="outline" className="h-12 px-8 bg-white">
                    Browse all courses
                  </PrimaryButton>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
