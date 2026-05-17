import { useMemo } from "react";
import { useParams, Link } from "wouter";
import { useAnnouncements } from "@/hooks/use-lista-data";
import { announcementToPost } from "@/lib/lista-insforge-data";
import { withBase } from "@/lib/with-base";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Calendar, User, Clock, Share2, ArrowRight, Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import { motion } from "framer-motion";
import PrimaryButton from "@/components/primary-button";

export default function NewsDetailPage() {
  const { id } = useParams();
  const { data: announcements = [], isLoading } = useAnnouncements();
  const posts = useMemo(() => announcements.map(announcementToPost), [announcements]);
  const post = posts.find((p) => p.id === id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 text-muted-foreground gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading…
      </div>
    );
  }

  if (!post) {
    return <NotFound />;
  }

  const relatedPosts = posts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="w-full bg-white min-h-screen pb-24">
      {/* Hero Header */}
      <section className="bg-slate-50 border-b border-card-border pt-12 pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group">
              <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to updates
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 text-center"
            >
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-1 rounded-full uppercase tracking-widest text-[10px] font-bold">
                {post.category}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-slate-900">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>5 min read</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="-mt-16 container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-5xl mx-auto aspect-[16/9] md:aspect-[21/9] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white"
        >
          <img 
            src={withBase(post.imageUrl)} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        </motion.div>
      </section>

      {/* Content Area */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-6xl mx-auto">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-12">
              <div className="prose prose-slate lg:prose-xl max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-slate-600 prose-strong:text-slate-900 prose-img:rounded-3xl">
                {post.content.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-12 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Share this story</span>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {post.sourceUrl && (
                  <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <PrimaryButton variant="outline" className="rounded-full">
                      View Post <ArrowRight className="ml-2 w-4 h-4" />
                    </PrimaryButton>
                  </a>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-12">
              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="space-y-8">
                  <h3 className="text-xl font-bold tracking-tight">Related Stories</h3>
                  <div className="space-y-6">
                    {relatedPosts.map((related) => (
                      <Link key={related.id} href={`/news/${related.id}`}>
                        <div className="group cursor-pointer space-y-3">
                          <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100">
                            <img 
                              src={withBase(related.imageUrl)} 
                              alt={related.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <h4 className="font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                            {related.title}
                          </h4>
                          <p className="text-xs text-slate-400 font-medium">{new Date(related.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter/CTA */}
              <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                <h3 className="text-2xl font-bold leading-tight relative z-10 text-slate-900">Stay informed on latest scholarship slots</h3>
                <p className="text-slate-500 text-sm relative z-10 font-medium">Get instant notifications about TESDA qualifications and enrollment periods.</p>
                {/* 2026-05-13: single application entrypoint */}
                <Link href="/trainee/register">
                  <PrimaryButton className="w-full bg-primary text-white hover:bg-primary/90 mt-4">
                    Apply Now
                  </PrimaryButton>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
