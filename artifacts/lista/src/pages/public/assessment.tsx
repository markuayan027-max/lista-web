import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Target, ArrowRight, RefreshCw } from "lucide-react";
import PrimaryButton from "@/components/primary-button";
import CourseCard from "@/components/course-card";
import { Progress } from "@/components/ui/progress";
import { courses } from "@/lib/mock-data";

type AssessmentOption = { text: string; category?: string; score?: string };
type AssessmentQuestion = { id: number; text: string; options: AssessmentOption[] };

const questions: AssessmentQuestion[] = [
  {
    id: 1,
    text: "Which of these activities sounds most interesting to you?",
    options: [
      { text: "Building and fixing logical systems or websites", category: "Technology" },
      { text: "Analyzing numbers and finding patterns", category: "Data" },
      { text: "Making things look beautiful and easy to use", category: "Design" },
      { text: "Helping people and organizing care", category: "Healthcare" },
      { text: "Planning campaigns and understanding audiences", category: "Marketing" },
      { text: "Leading teams and managing resources", category: "Business" },
    ]
  },
  {
    id: 2,
    text: "How much time can you commit to learning per week?",
    options: [
      { text: "I can study full-time (40+ hours)", score: "intense" },
      { text: "Part-time (15-20 hours)", score: "moderate" },
      { text: "Just a few hours on weekends", score: "light" },
    ]
  },
  {
    id: 3,
    text: "What is your primary goal for taking a course?",
    options: [
      { text: "Start a completely new career", score: "Beginner" },
      { text: "Level up in my current role", score: "Intermediate" },
      { text: "Learn a specific tool or software", score: "Beginner" },
    ]
  },
  {
    id: 4,
    text: "How do you prefer to solve problems?",
    options: [
      { text: "By writing code or technical solutions", category: "Technology" },
      { text: "By designing visual layouts and user flows", category: "Design" },
      { text: "By organizing data in spreadsheets", category: "Data" },
      { text: "By communicating with stakeholders", category: "Business" },
    ]
  },
  {
    id: 5,
    text: "What type of role are you aiming for?",
    options: [
      { text: "Software Engineer / Developer", category: "Technology" },
      { text: "Data Analyst / Scientist", category: "Data" },
      { text: "Product / UX Designer", category: "Design" },
      { text: "Project / Product Manager", category: "Business" },
      { text: "Marketing Specialist", category: "Marketing" },
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
      return courses.slice(0, 3); // Fallback
    }

    const topCategory = topCategories[0];
    const recommended = courses.filter(c => c.category === topCategory);
    
    // Add some fallbacks if we don't have enough
    if (recommended.length < 3) {
      const others = courses.filter(c => c.category !== topCategory);
      recommended.push(...others.slice(0, 3 - recommended.length));
    }

    return recommended.slice(0, 3);
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
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 text-primary">
                <Target className="w-10 h-10" />
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
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                  <Target className="w-10 h-10" />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight">Your Recommendations</h1>
                <p className="text-xl text-muted-foreground">Based on your answers, these programs are the best fit for your goals.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {getRecommendations().map((course) => (
                  <CourseCard key={course.id} course={course} />
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
