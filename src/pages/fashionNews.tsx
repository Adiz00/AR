

import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { getNews } from '@/http/api';
import { toast } from '@/hooks/use-toast';
import { LineWave } from "react-loader-spinner";
import { useQuery } from '@tanstack/react-query';


type Article = {
    id: string;
    title: string;
    image: string;
    tags: string[];
    excerpt: string;
    author: string;
    date: string;
};

// const ARTICLES: Article[] = [
//     {
//         id: 'a1',
//         title: 'Sculpted Silhouettes: Fall 2025 Trends',
//         image: '/assets/storyImg1.png',
//         tags: ['Runway', 'Fall 2025', 'Silhouettes'],
//         excerpt: 'Designers are experimenting with bold contours and architectural tailoring for a refined yet experimental fall palette.',
//         author: 'A. Monroe',
//         date: 'Oct 10, 2025',
//     },
//     {
//         id: 'a2',
//         title: 'Sustainable Fabrics Making Waves',
//         image: '/assets/storyImg2.png',
//         tags: ['Sustainability', 'Materials'],
//         excerpt: 'New bio-based fibers and recycled blends are closing the gap between performance and planet-friendly fashion.',
//         author: 'K. Rivera',
//         date: 'Oct 8, 2025',
//     },
//     {
//         id: 'a3',
//         title: 'Streetwear to Smartwear: The Crossover',
//         image: '/assets/img-22.png',
//         tags: ['Streetwear', 'Tech'],
//         excerpt: 'Casual silhouettes are getting functional upgrades — hidden pockets, adaptable fits and tech-friendly fabrics.',
//         author: 'J. Patel',
//         date: 'Oct 5, 2025',
//     },
// ];

const FashionNews: React.FC = () => {
    const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
    const [likes, setLikes] = useState<Record<string, number>>({});
     const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

    const { data: newsData = { news: [], totalPages: 0, currentPage: 1, totalCount: 0 }, isLoading, isError} = useQuery({
    queryKey: ["news", currentPage],
    queryFn: () => getNews({ page: currentPage, limit: PAGE_SIZE }),
    staleTime: 10 * 1000,
  });


  const { news, totalPages, totalCount } = newsData;


  useEffect(() => {
    if (news && !isLoading && !isError) {
      console.log("News fetched successfully", news);
      toast({
        className:
          "text-black border-2 border-green-600 shadow-lg rounded-lg h-16",
        title: "News fetched successfully.",
      });
    }
  }, [news, isLoading, isError]);

  if (isLoading  ) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 ">
            <LineWave
              visible={true}
              height="100"
              width="100"
              color="#000"
              ariaLabel="line-wave-loading"
              wrapperStyle={{}}
              wrapperClass=""
              firstLineColor=""
              middleLineColor=""
              lastLineColor=""
            />
          </div>
  );
  if (isError) return <div>Failed to load customers</div>;

    const toggleBookmark = (id: string) => {
        setBookmarks((s) => ({ ...s, [id]: !s[id] }));
    };

    const addLike = (id: string) => {
        setLikes((s) => ({ ...s, [id]: (s[id] || 0) + 1 }));
    };



    return (
        <div className="max-w-6xl mx-auto p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Fashion News</h1>
                <p className="text-muted-foreground mt-2">Curated updates — runway highlights, material innovations and street style trends.</p>
            </header>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                    <Card className="overflow-hidden">
                        <div className="relative h-64 bg-slate-100">
                            <img src="data:image/jpeg;base64,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" alt="hero" className="object-cover w-full h-full" />
                        </div>
                        <CardHeader>
                            <CardTitle>Editor’s Pick: The Modern Classic Revival</CardTitle>
                            <CardDescription>Essential silhouettes revisited with a contemporary voice and sustainable practices.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">From reimagined blazers to tailored knitwear, discover the pieces defining a new generation of wardrobe staples.</p>
                        </CardContent>
                        <CardFooter className="justify-between">
                            <div className="text-sm text-muted-foreground">By E. Laurent • Oct 12, 2025</div>
                            <div className="flex gap-2">
                                <Button variant="ghost">Share</Button>
                                <Button>Read More</Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                <aside className="space-y-4">
                    <Card className="p-4">
                        <h3 className="text-lg font-semibold">Topics</h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs">Runway</span>
                            <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs">Sustainability</span>
                            <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs">Tech</span>
                            <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs">Street</span>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <h3 className="text-lg font-semibold">Subscribe</h3>
                        <p className="text-sm text-muted-foreground mt-2">Get weekly highlights in your inbox.</p>
                        <div className="mt-3 flex gap-2">
                            <input className="flex-1 rounded-md border px-3 py-2" placeholder="you@domain.com" />
                            <Button>Subscribe</Button>
                        </div>
                    </Card>
                </aside>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4">Latest articles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.map((a) => (
                        <Card key={a.id} className="overflow-hidden flex flex-col">
                            <div className="h-48 bg-slate-100">
                                <img src={a.image} alt={a.title} className="object-cover w-full h-full" />
                            </div>
                            <CardContent className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        {a.tags.slice(0, 2).map((t) => (
                                            <span key={t} className="text-xs text-muted-foreground">#{t}</span>
                                        ))}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{a.date}</div>
                                </div>
                                <CardTitle className="mt-3 text-lg">{a.title}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-2">{a.excerpt}</p>
                            </CardContent>
                            <CardFooter className="justify-between">
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="sm" onClick={() => addLike(a.id)}>Like • {likes[a.id] || 0}</Button>
                                    <Button variant={bookmarks[a.id] ? 'secondary' : 'outline'} size="sm" onClick={() => toggleBookmark(a.id)}>{bookmarks[a.id] ? 'Bookmarked' : 'Bookmark'}</Button>
                                </div>
                                <div className="text-sm text-muted-foreground">By {a.author}</div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default FashionNews;