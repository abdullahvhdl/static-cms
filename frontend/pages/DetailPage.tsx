import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { loadSiteData } from '../utils/yamlLoader';
import type { SiteData, PageData } from '../types/cms';

export default function DetailPage() {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [currentPage, setCurrentPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadSiteData();
        setSiteData(data);
        
        const page = data.pages.find(p => 
          p.slug === slug && 
          p.template === 'detail' && 
          p.category === category
        );
        setCurrentPage(page || null);
      } catch (error) {
        console.error('Failed to load site data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [category, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-destructive">Page not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link to={`/${category}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {category}
            </Button>
          </Link>
          <h1 className="text-2xl font-bold ml-4">{siteData?.site.title}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{currentPage.title}</h1>
            
            {currentPage.description && (
              <p className="text-xl text-muted-foreground mb-6">
                {currentPage.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {currentPage.publishDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(currentPage.publishDate).toLocaleDateString()}
                </div>
              )}
              {currentPage.readTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {currentPage.readTime} min read
                </div>
              )}
              {currentPage.author && (
                <div>
                  By {currentPage.author}
                </div>
              )}
            </div>
          </header>

          {currentPage.featuredImage && (
            <div className="mb-8">
              <img
                src={currentPage.featuredImage}
                alt={currentPage.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            {currentPage.content && (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: currentPage.content.replace(/\n/g, '<br />') 
                }} 
              />
            )}
          </div>

          {currentPage.tags && currentPage.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {currentPage.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>

      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 {siteData?.site.title}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
