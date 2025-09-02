import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Clock, Search, Star, Filter } from "lucide-react";
import { PageHeader } from '@/components/layout/PageHeader';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  featured: boolean;
  week?: number[];
  imageUrl?: string;
}

const mockArticles: Article[] = [
  {
    id: "1",
    title: "First Trimester Survival Guide",
    excerpt: "Everything you need to know about the first 12 weeks of pregnancy, from morning sickness to prenatal appointments.",
    category: "First Trimester",
    readTime: "8 min read",
    difficulty: "Beginner",
    featured: true,
    week: [1, 12],
    imageUrl: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400"
  },
  {
    id: "2",
    title: "Nutrition During Pregnancy: A Complete Guide",
    excerpt: "Learn about essential nutrients, safe foods, and what to avoid during pregnancy for optimal baby development.",
    category: "Nutrition",
    readTime: "12 min read",
    difficulty: "Intermediate",
    featured: true,
    week: [1, 40]
  },
  {
    id: "3",
    title: "Understanding Prenatal Vitamins",
    excerpt: "Which vitamins are essential during pregnancy and how to choose the right prenatal supplement for you.",
    category: "Health",
    readTime: "6 min read",
    difficulty: "Beginner",
    featured: false,
    week: [1, 40]
  },
  {
    id: "4",
    title: "Safe Exercises for Each Trimester",
    excerpt: "Modified workout routines and exercises that are safe and beneficial throughout your pregnancy journey.",
    category: "Fitness",
    readTime: "10 min read",
    difficulty: "Intermediate",
    featured: false,
    week: [1, 40]
  },
  {
    id: "5",
    title: "Preparing Your Birth Plan",
    excerpt: "How to create a comprehensive birth plan and what to discuss with your healthcare provider.",
    category: "Birth Preparation",
    readTime: "15 min read",
    difficulty: "Advanced",
    featured: false,
    week: [28, 40]
  },
  {
    id: "6",
    title: "Baby's Development Week by Week",
    excerpt: "Detailed overview of your baby's growth and development from conception to birth.",
    category: "Development",
    readTime: "20 min read",
    difficulty: "Intermediate",
    featured: true,
    week: [1, 40]
  }
];

const categories = [
  "All Articles",
  "First Trimester",
  "Second Trimester", 
  "Third Trimester",
  "Nutrition",
  "Fitness",
  "Health",
  "Development",
  "Birth Preparation"
];

const difficulties = ["All Levels", "Beginner", "Intermediate", "Advanced"];

export const ArticleLibrary = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Articles");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredArticles = mockArticles.filter(article => 
    (selectedCategory === "All Articles" || article.category === selectedCategory) &&
    (selectedDifficulty === "All Levels" || article.difficulty === selectedDifficulty) &&
    (searchQuery === "" || 
     article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const featuredArticles = filteredArticles.filter(article => article.featured);
  const regularArticles = filteredArticles.filter(article => !article.featured);

  return (
    <div className="min-h-screen bg-gradient-soft">
      <PageHeader
        title="Article Library"
        subtitle="Evidence-based pregnancy information"
        icon={<BookOpen className="h-5 w-5" />}
        actions={<Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}><Filter className="h-4 w-4 mr-2" /> Filters</Button>}
      />

      <div className="px-4 md:px-6 pb-10 space-y-6">
        {/* Search Bar */}
        <Card>
          <CardContent className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Category</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Difficulty Level</h4>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((difficulty) => (
                    <Badge
                      key={difficulty}
                      variant={selectedDifficulty === difficulty ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => setSelectedDifficulty(difficulty)}
                    >
                      {difficulty}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-warning" />
              Featured Articles
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {featuredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {article.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {article.difficulty}
                        </Badge>
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                      <CardTitle className="text-base hover:text-primary">
                        {article.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {article.excerpt}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{article.readTime}</span>
                      </div>
                      {article.week && (
                        <span>Week {article.week[0]}{article.week[1] !== article.week[0] ? `-${article.week[1]}` : ''}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Regular Articles */}
        {regularArticles.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">All Articles</h2>
            <div className="grid gap-4">
              {regularArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {article.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {article.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-base hover:text-primary">
                        {article.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{article.readTime}</span>
                      </div>
                      {article.week && (
                        <span>Week {article.week[0]}{article.week[1] !== article.week[0] ? `-${article.week[1]}` : ''}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredArticles.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No articles found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};