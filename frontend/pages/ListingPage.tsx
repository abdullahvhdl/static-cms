import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { loadSiteData } from '../utils/yamlLoader';
import type { SiteData, PageData } from '../types/cms';

export default function ListingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [currentPage, setCurrentPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadSiteData();
        setSiteData(data);
        
        const page = data.pages.find(p => p.slug === slug && p.template === 'listing');
        setCurrentPage(page || null);
      } catch (error) {
        console.error('Failed to load site data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

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
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-2xl font-bold ml-4">{siteData?.site.title}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{currentPage.title}</h2>
          {currentPage.description && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {currentPage.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {currentPage.items?.map((item, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {item.title}
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
                {item.description && (
                  <CardDescription>{item.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {item.link?.startsWith('http') ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full">
                      Visit Link
                    </Button>
                  </a>
                ) : (
                  <Link to={item.link || '#'} className="block">
                    <Button className="w-full">
                      View Details
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 {siteData?.site.title}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
