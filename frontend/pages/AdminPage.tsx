import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { loadSiteData, saveSiteData } from '../utils/yamlLoader';
import type { SiteData, PageData } from '../types/cms';

export default function AdminPage() {
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [yamlContent, setYamlContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPage, setShowAddPage] = useState(false);
  const [newPage, setNewPage] = useState<Partial<PageData>>({
    template: 'detail',
    slug: '',
    title: '',
    description: '',
    content: '',
    category: '',
    items: []
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await loadSiteData();
      setSiteData(data);
      
      // Convert to YAML format for editing
      const yamlString = generateYamlString(data);
      setYamlContent(yamlString);
    } catch (error) {
      console.error('Failed to load site data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load site data"
      });
    }
  };

  const generateYamlString = (data: SiteData): string => {
    const yaml = `site:
  title: "${data.site.title}"
  description: "${data.site.description}"

pages:
${data.pages.map(page => `  - slug: "${page.slug}"
    title: "${page.title}"
    template: "${page.template}"
    ${page.description ? `description: "${page.description}"` : ''}
    ${page.category ? `category: "${page.category}"` : ''}
    ${page.author ? `author: "${page.author}"` : ''}
    ${page.publishDate ? `publishDate: "${page.publishDate}"` : ''}
    ${page.readTime ? `readTime: ${page.readTime}` : ''}
    ${page.featuredImage ? `featuredImage: "${page.featuredImage}"` : ''}
    ${page.content ? `content: |
      ${page.content.split('\n').map(line => `      ${line}`).join('\n')}` : ''}
    ${page.tags && page.tags.length > 0 ? `tags:
${page.tags.map(tag => `      - "${tag}"`).join('\n')}` : ''}
    ${page.items && page.items.length > 0 ? `items:
${page.items.map(item => `      - title: "${item.title}"
        ${item.description ? `description: "${item.description}"` : ''}
        ${item.link ? `link: "${item.link}"` : ''}`).join('\n')}` : ''}`).join('\n')}`;
    
    return yaml;
  };

  const handleSave = async () => {
    try {
      // Parse YAML content and save
      const success = await saveSiteData(yamlContent);
      if (success) {
        await loadData();
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Site data saved successfully"
        });
      } else {
        throw new Error('Failed to save data');
      }
    } catch (error) {
      console.error('Failed to save site data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save site data. Please check your YAML syntax."
      });
    }
  };

  const handleAddPage = () => {
    if (!siteData || !newPage.slug || !newPage.title) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in required fields (slug and title)"
      });
      return;
    }

    const updatedSiteData = {
      ...siteData,
      pages: [...siteData.pages, newPage as PageData]
    };

    setSiteData(updatedSiteData);
    const yamlString = generateYamlString(updatedSiteData);
    setYamlContent(yamlString);
    
    setNewPage({
      template: 'detail',
      slug: '',
      title: '',
      description: '',
      content: '',
      category: '',
      items: []
    });
    setShowAddPage(false);
    
    toast({
      title: "Success",
      description: "Page added successfully. Don't forget to save!"
    });
  };

  const handleDeletePage = (slug: string) => {
    if (!siteData) return;

    const updatedSiteData = {
      ...siteData,
      pages: siteData.pages.filter(page => page.slug !== slug)
    };

    setSiteData(updatedSiteData);
    const yamlString = generateYamlString(updatedSiteData);
    setYamlContent(yamlString);
    
    toast({
      title: "Success",
      description: "Page deleted successfully. Don't forget to save!"
    });
  };

  if (!siteData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Site
              </Button>
            </Link>
            <h1 className="text-2xl font-bold ml-4">Admin Panel</h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowAddPage(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Page
            </Button>
            
            {isEditing ? (
              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    loadData();
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit YAML
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showAddPage && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Page</CardTitle>
              <CardDescription>Create a new page for your site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    value={newPage.slug}
                    onChange={(e) => setNewPage(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="my-page"
                  />
                </div>
                
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newPage.title}
                    onChange={(e) => setNewPage(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="My Page Title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="template">Template</Label>
                  <Select
                    value={newPage.template}
                    onValueChange={(value: 'home' | 'listing' | 'detail') => 
                      setNewPage(prev => ({ ...prev, template: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home Page</SelectItem>
                      <SelectItem value="listing">Listing Page</SelectItem>
                      <SelectItem value="detail">Detail Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newPage.category}
                    onChange={(e) => setNewPage(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="blog"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newPage.description}
                  onChange={(e) => setNewPage(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Page description"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddPage}>Add Page</Button>
                <Button variant="outline" onClick={() => setShowAddPage(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Site Pages</CardTitle>
              <CardDescription>Manage your site pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {siteData.pages.map((page) => (
                  <div
                    key={page.slug}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{page.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        /{page.category ? `${page.category}/` : ''}{page.slug} • {page.template}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const url = page.category ? `/${page.category}/${page.slug}` : `/${page.slug}`;
                          window.open(url, '_blank');
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePage(page.slug)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>YAML Configuration</CardTitle>
              <CardDescription>
                {isEditing ? 'Edit your site configuration' : 'View your site configuration'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={yamlContent}
                onChange={(e) => setYamlContent(e.target.value)}
                readOnly={!isEditing}
                className="font-mono text-sm min-h-[500px] max-h-[700px]"
                placeholder="Your YAML configuration will appear here..."
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
