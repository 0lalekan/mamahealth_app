import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Heart, Plus, Search, Users } from "lucide-react";
import { PageHeader } from '@/components/layout/PageHeader';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  week: number;
  replies: number;
  likes: number;
  timeAgo: string;
  category: string;
}

const mockPosts: ForumPost[] = [
  {
    id: "1",
    title: "First trimester nausea - any tips?",
    content: "I'm 8 weeks pregnant and struggling with morning sickness. Has anyone found natural remedies that actually work?",
    author: "Sarah M.",
    week: 8,
    replies: 12,
    likes: 8,
    timeAgo: "2 hours ago",
    category: "First Trimester"
  },
  {
    id: "2", 
    title: "Baby registry essentials?",
    content: "What items are must-haves vs nice-to-haves for a newborn? Trying to prioritize my registry!",
    author: "Emma K.",
    week: 28,
    replies: 24,
    likes: 15,
    timeAgo: "4 hours ago",
    category: "Preparing for Baby"
  },
  {
    id: "3",
    title: "Exercise during pregnancy",
    content: "What workouts are safe during second trimester? My doctor said light exercise is good but I'm not sure what counts.",
    author: "Lisa R.",
    week: 20,
    replies: 7,
    likes: 5,
    timeAgo: "1 day ago",
    category: "Health & Fitness"
  }
];

const categories = [
  "All Posts",
  "First Trimester", 
  "Second Trimester",
  "Third Trimester",
  "Health & Fitness",
  "Nutrition",
  "Preparing for Baby",
  "Support & Encouragement"
];

export const CommunityForum = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Posts");
  const [showNewPost, setShowNewPost] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = mockPosts.filter(post => 
    (selectedCategory === "All Posts" || post.category === selectedCategory) &&
    (searchQuery === "" || post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     post.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-soft">
      <PageHeader
        title="Community Forum"
        subtitle="Connect with other expecting mothers"
        icon={<Users className="h-5 w-5" />}
        actions={<Button onClick={() => setShowNewPost(true)} size="sm"><Plus className="h-4 w-4 mr-2" /> New Post</Button>}
      />

      <div className="px-4 md:px-6 pb-10 space-y-6">
        {/* Search Bar */}
        <Card>
          <CardContent className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categories</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* New Post Form */}
        {showNewPost && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Create New Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Post title..." />
              <select className="w-full p-2 border rounded-md">
                <option>Select category...</option>
                {categories.slice(1).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Textarea placeholder="Share your thoughts..." rows={4} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewPost(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowNewPost(false)}>
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Forum Posts */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Week {post.week}
                      </Badge>
                    </div>
                    <CardTitle className="text-base hover:text-primary">
                      {post.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.content}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {post.author.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span>{post.author}</span>
                    </div>
                    <span>•</span>
                    <span>{post.timeAgo}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.replies}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No posts found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};