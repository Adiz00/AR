import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type Gender = 'male' | 'female' | 'unisex';
type Size = 'XS' | 'S' | 'M' | 'L' | 'XL';

const MOCK_PRODUCTS = [
    {
        id: 'p1',
        title: 'Elegant Evening Dress',
        occasion: 'party',
        gender: 'female' as Gender,
        size: 'M' as Size,
        price: '$129',
        image: '/assets/img-4.png',
    },
    {
        id: 'p2',
        title: 'Casual Linen Shirt',
        occasion: 'casual',
        gender: 'male' as Gender,
        size: 'L' as Size,
        price: '$59',
        image: '../assets/img-22.png',
    },
    {
        id: 'p3',
        title: 'Smart Business Blazer',
        occasion: 'formal',
        gender: 'unisex' as Gender,
        size: 'M' as Size,
        price: '$199',
        image: '/assets/fleet1.png',
    },
    {
        id: 'p4',
        title: 'Outdoor Sport Jacket',
        occasion: 'sports',
        gender: 'male' as Gender,
        size: 'XL' as Size,
        price: '$89',
        image: '/assets/fleet2.png',
    },
    {
        id: 'p5',
        title: 'Summer Floral Dress',
        occasion: 'casual',
        gender: 'female' as Gender,
        size: 'S' as Size,
        price: '$79',
        image: '/assets/fleet3.png',
    },
];

const ImageAiSearch: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [occasion, setOccasion] = useState<string>('any');
    const [gender, setGender] = useState<string>('any');
    const [size, setSize] = useState<string>('any');
    const [results, setResults] = useState<typeof MOCK_PRODUCTS | null>(null);
    const [loading, setLoading] = useState(false);

    const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        setFile(f);
        const url = URL.createObjectURL(f);
        setPreview(url);
    }, []);

    // cleanup preview object URL when changed or on unmount
    useEffect(() => {
        return () => {
            if (preview) {
                try {
                    URL.revokeObjectURL(preview);
                } catch (e) {
                    /* noop */
                }
            }
        };
    }, [preview]);

    const reset = useCallback(() => {
        setFile(null);
        setPreview(null);
        setPrompt('');
        setOccasion('any');
        setGender('any');
        setSize('any');
        setResults(null);
    }, []);

    const generate = useCallback(() => {
        // Simulate a small client-side 'AI' search using mock data + prompt keywords
        setLoading(true);
        setResults(null);
        setTimeout(() => {
            const q = prompt.trim().toLowerCase();
            const filtered = MOCK_PRODUCTS.filter((p) => {
                if (occasion !== 'any' && p.occasion !== occasion) return false;
                if (gender !== 'any' && p.gender !== gender) return false;
                if (size !== 'any' && p.size !== size) return false;
                if (!q) return true;
                // match keywords in title or occasion
                return p.title.toLowerCase().includes(q) || p.occasion.toLowerCase().includes(q);
            });
            setResults(filtered);
            setLoading(false);
        }, 700);
    }, [prompt, occasion, gender, size]);

    const hasResults = results && results.length > 0;

    const resultsView = useMemo(() => {
        if (!results) return null;
        if (results.length === 0)
            return (
                <div className="text-center text-sm text-muted-foreground">No matches found. Try a different prompt or filters.</div>
            );

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {results.map((r) => (
                    <Card key={r.id} className="overflow-hidden">
                        <div className="h-40 bg-slate-100 flex items-center justify-center">
                            <img src={'https://www.beyours.in/cdn/shop/files/black-classic-shirt.jpg?v=1744815740'} alt={r.title} className="object-contain h-full" />
                        </div>
                        <CardHeader>
                            <CardTitle>{r.title}</CardTitle>
                            <CardDescription>
                                {r.occasion} • {r.gender} • {r.size}
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="justify-between gap-4">
                            <div className="font-semibold">{r.price}</div>
                            <Button variant="outline" size="sm">View</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        );
    }, [results]);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Image AI Outfit Finder</h1>
                <p className="text-muted-foreground mt-1">Upload a full-body image, describe the occasion and we'll surface suitable products.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <aside className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload & Preview</CardTitle>
                            <CardDescription>Choose a clear full-body photo for best results.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center gap-4">
                                <label className="w-full">
                                    <div className="h-64 w-full rounded-md border border-dashed border-input bg-background flex items-center justify-center overflow-hidden">
                                        {preview ? (
                                            <img src={preview} alt="preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="text-center text-sm text-muted-foreground p-4">No image selected</div>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" onChange={onFileChange} className="sr-only" />
                                </label>
                                <div className="w-full flex gap-2">
                                    <Button onClick={() => document.querySelector('input[type=file]')?.click()}>Choose Image</Button>
                                    <Button variant="ghost" onClick={reset}>Reset</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Prompt & Filters</CardTitle>
                            <CardDescription>Enter occasion, style, or keywords to refine results.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Input placeholder="e.g. evening party, beach wedding, office" value={prompt} onChange={(e) => setPrompt(e.target.value)} />

                            <div className="grid grid-cols-3 gap-2">
                                <select className="rounded-md border px-2 py-2" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
                                    <option value="any">Any occasion</option>
                                    <option value="casual">Casual</option>
                                    <option value="formal">Formal</option>
                                    <option value="party">Party</option>
                                    <option value="sports">Sports</option>
                                </select>
                                <select className="rounded-md border px-2 py-2" value={gender} onChange={(e) => setGender(e.target.value)}>
                                    <option value="any">Any gender</option>
                                    <option value="female">Female</option>
                                    <option value="male">Male</option>
                                    <option value="unisex">Unisex</option>
                                </select>
                                <select className="rounded-md border px-2 py-2" value={size} onChange={(e) => setSize(e.target.value)}>
                                    <option value="any">Any size</option>
                                    <option value="XS">XS</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                </select>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-2">
                            <div className="w-full flex gap-2">
                                <Button onClick={generate} disabled={loading || !file} className="flex-1">{loading ? 'Searching...' : 'Generate'}</Button>
                                <Button variant="outline" onClick={() => setResults(MOCK_PRODUCTS)} className="flex-1">Show All</Button>
                            </div>
                            <div className="w-full text-xs text-muted-foreground">Tip: Uploading a full-body image improves size and fit suggestions.</div>
                        </CardFooter>
                    </Card>
                </aside>

                <main className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Results</CardTitle>
                            <CardDescription>Products matched to your prompt, occasion and size.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!results && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="p-4 rounded-lg border bg-card">
                                            <div className="h-40 bg-slate-50 animate-pulse" />
                                            <div className="mt-3 h-4 bg-slate-50 rounded w-3/4 animate-pulse" />
                                            <div className="mt-2 h-3 bg-slate-50 rounded w-1/2 animate-pulse" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {hasResults && (
                                <div className="mt-2">{resultsView}</div>
                            )}

                            {results && results.length === 0 && (
                                <div className="mt-4 text-center text-sm text-muted-foreground">No products matched. Try changing filters.</div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
};

export default ImageAiSearch;