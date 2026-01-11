/**
 * AvatarDetails Component
 *
 * This component displays detailed information about a user's avatar including:
 * - Avatar image visualization
 * - Detected outfit items with similarity matching
 * - Product recommendations and purchase links
 * - User actions like editing avatar or saving outfits
 *
 * It integrates with a backend API for outfit detection using CLIP similarity search.
 */

import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import avatarShirt from '../assets/avatar-shirt.png';
import avatarPant from '../assets/avatar-pant.png';
import avatarShoes from '../assets/avatar-shoes.png';
import { useLocation } from 'react-router-dom';

// Type definitions for outfit items
type OutfitItem = {
  id: string;
  part: string; // Shirt, Pant, Shoes, etc.
  title: string;
  description: string;
  size: string;
  occasion: string;
  fabric: string;
  price: string;
  purchaseLink?: string;
  image?: string;
};

// Mock data for fallback outfit items
const MOCK_OUTFIT: OutfitItem[] = [
  {
    id: 'o1',
    part: 'Shirt',
    title: 'Silk Printed Shirt',
    description: 'Lightweight silk shirt with all-over tonal print and refined collar.',
    size: 'M',
    occasion: 'Formal / Evening',
    fabric: 'Silk Blend',
    price: '$89',
    purchaseLink: '#',
    image: avatarShirt,
  },
  {
    id: 'o2',
    part: 'Pant',
    title: 'Tailored Wool Trouser',
    description: 'Slim-fit wool trousers with tapered leg and subtle crease.',
    size: '32',
    occasion: 'Formal',
    fabric: 'Wool',
    price: '$129',
    purchaseLink: '#',
    image: avatarPant,
  },
  {
    id: 'o3',
    part: 'Shoes',
    title: 'Leather Derby Shoes',
    description: 'Hand-finished derby shoes with comfortable cushioned insole.',
    size: '9 US',
    occasion: 'Formal / Party',
    fabric: 'Leather',
    price: '$199',
    purchaseLink: '#',
    image: avatarShoes,
  },
//   {
//     id: 'o4',
//     part: 'Accessories',
//     title: 'Slim Leather Belt',
//     description: 'Minimal leather belt with stainless buckle.',
//     size: 'One size',
//     occasion: 'All',
//     fabric: 'Leather',
//     price: '$39',
//     purchaseLink: '#',
//     image: '/assets/avatar-accessories.png',
//   },
];

const AvatarDetails: React.FC = () => {
  // Get avatar ID from navigation state
  const location = useLocation();
  const avatarId = location.state?.avatarId;

  // Construct avatar URL using Ready Player Me service
  const avatarUrl = `https://models.readyplayer.me/${avatarId}.png?camera=fullbody`;

  // State for detected outfit items
  const [detected, setDetected] = useState<Record<string, any>>({});
  const [loadingDetected, setLoadingDetected] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Helper function to get the best match by type from detection results
  const getBestByType = (results: any[], type: string) => {
    const list = results.filter((r) => r.type?.toLowerCase() === type.toLowerCase());
    if (list.length === 0) return null;
    return list.reduce((best, cur) => (cur.confidence > (best.confidence ?? 0) ? cur : best), list[0]);
  };

  const getMaxByType = (results: any[], type: string) =>
    results
      .filter((r) => r.type === type && r.position !== null)
      .sort((a, b) => b.confidence - a.confidence)[0] || null;

  const getBestOutfitOrParts = (results: any[]) => {
    const outfits = results
      .filter((r) => r.type === "outfit" && r.position !== null)
      .sort((a, b) => b.confidence - a.confidence);
    if (outfits.length > 0) {
      // Only accept the "outfit" result when individual parts are NOT strong matches.
      // If any of shirt/pant/shoe has a strong match (>= THRESHOLD), prefer returning parts.
      const THRESHOLD = 0.65;
      const bestShirt = getMaxByType(results, "shirt");
      const bestPant = getMaxByType(results, "pant");
      const bestShoe = getMaxByType(results, "shoe");

      const shirtGood = Boolean(bestShirt && (bestShirt.confidence ?? 0) >= THRESHOLD);
      const pantGood = Boolean(bestPant && (bestPant.confidence ?? 0) >= THRESHOLD);
      const shoeGood = Boolean(bestShoe && (bestShoe.confidence ?? 0) >= THRESHOLD);

      // If none of the individual parts are strong, return the outfit. Otherwise let caller
      // handle individual-part detection by returning null/undefined.
      if ((shirtGood || pantGood || shoeGood) && outfits[0]?.confidence >= THRESHOLD) {
        return { outfit: outfits[0] }; // ONLY ONE
      } else if (!shirtGood && !pantGood && !shoeGood) {
        return { outfit: outfits[0] }; // ONLY ONE
      }
    }

    return null;
  };


  // Effect to detect outfit items when component mounts
  useEffect(() => {
    const run = async () => {
      setLoadingDetected(true);
      setDetectError(null);
      setProgress(0);
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000; // seconds
        let newProgress = (elapsed / 60) * 100;
        if (newProgress >= 100) {
          newProgress = 100;
          clearInterval(interval);
        } else if (elapsed > 60 && newProgress >= 95) {
          newProgress = 95;
          clearInterval(interval);
        }
        setProgress(newProgress);
      }, 100);

      try {
        // Call backend API for outfit detection using CLIP similarity
        const res = await fetch('http://localhost:5000/similarity/clip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarUrl }),
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!data?.results) throw new Error('Invalid response');
        console.log('detect results', data.results);
        // Process detection results
        const selection = getBestOutfitOrParts(data.results);

        if (selection) {
          setDetected(selection);
        } else {
          // Handle individual item detection
          const bestShirt = getBestByType(data.results, 'shirt');
          const bestPant = getBestByType(data.results, 'pant');
          const bestShoe = getBestByType(data.results, 'shoe');

          const out: Record<string, any> = {};
          if (bestShirt) out.shirt = bestShirt;
          if (bestPant) out.pant = bestPant;
          if (bestShoe) out.shoe = bestShoe;

          setDetected(out);
        }
        clearInterval(interval);
        setProgress(100);
      } catch (err: any) {
        console.error('detect error', err);
        clearInterval(interval);
        setProgress(100);
        setDetectError(`${err?.message} | No avatar selected` || 'Failed to detect items');
      } finally {
        setLoadingDetected(false);
      }
    };

    run();
  }, []);

  const hasOutfit = Boolean(detected.outfit);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Page header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Avatar Details</h1>
        <p className="text-muted-foreground mt-2">
          Review the avatar appearance and outfit details. Click any item to
          view purchase options.
        </p>
      </header>

      {/* Conditional rendering based on loading/error state */}
      {loadingDetected ? (
        // Loading state with progress bar
        <div className="text-center py-20">
          <div className="w-full max-w-md mx-auto">
            <div className="bg-gray-200 rounded-full h-4 mb-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-muted-foreground">Detecting outfit... {Math.round(progress)}%</p>
          </div>
        </div>
      ) : detectError ? (
        // Error state display
        <div className="text-center py-20 text-red-500">
          Error: {detectError}
        </div>
      ) : (
        // Main content grid
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Avatar display and info */}
          <section className="lg:col-span-1">
            <Card>
              {/* Avatar image container */}
              <div className="h-96 bg-muted flex items-center justify-center overflow-hidden">
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="h-full object-cover"
                />
              </div>
              {/* Avatar URL for debugging */}
              <div className="px-4 pb-3 text-xs text-muted-foreground break-words">
                {avatarUrl}
              </div>
              <CardHeader>
                <CardTitle>Model: Alex</CardTitle>
                <CardDescription>
                  Height: 6'1" • Build: Slim • Gender: Male
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Detected size: M (Chest 38")
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Preferred fit: Slim
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last updated: Oct 12, 2025
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="ghost">Edit Avatar</Button>
                <Button>Save Outfit</Button>
              </CardFooter>
            </Card>

            {/* Quick actions card */}
            <Card className="mt-4 p-4">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <div className="mt-3 flex flex-col gap-2">
                <Button variant="outline">Share Outfit</Button>
                <Button variant="ghost">Compare Sizes</Button>
              </div>
            </Card>
          </section>

          {/* Right column - Detected outfit items */}
          <section className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hasOutfit ? (
                <Card>
                  <div className="h-64 bg-muted flex items-center justify-center">
                    <img
                      // src={detected.outfit.itemUrl}
                      src={avatarUrl}
                      className="object-contain h-full"
                    />
                  </div>

                  {/* Card Content */}
                      <CardContent className="p-5">
                        {/* Category Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                            {/* {type.toUpperCase()} */}
                            OUTFIT
                          </span>
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                            {/* {(item.confidence * 100).toFixed(0)}% Match */}
                            100% Match
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                          {/* {item.title ||
                            `Premium ${
                              type.charAt(0).toUpperCase() + type.slice(1)
                            }`} */}
                            Item
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                          {/* {item.description ||
                            `High-quality ${type} perfect for your style.`} */}
                          Description of the outfit item.
                        </p>

                        {/* Details Grid */}
                        {/* {(item.size || item.fabric || item.occasion) && (
                          <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                            {item.size && (
                              <div>
                                <p className="text-slate-500 font-medium">
                                  Size
                                </p>
                                <p className="text-slate-900 font-semibold">
                                  {item.size}
                                </p>
                              </div>
                            )}
                            {item.fabric && (
                              <div>
                                <p className="text-slate-500 font-medium">
                                  Material
                                </p>
                                <p className="text-slate-900 font-semibold">
                                  {item.fabric}
                                </p>
                              </div>
                            )}
                            {item.occasion && (
                              <div className="col-span-2">
                                <p className="text-slate-500 font-medium">
                                  Occasion
                                </p>
                                <p className="text-slate-900 font-semibold">
                                  {item.occasion}
                                </p>
                              </div>
                            )}
                          </div>
                        )} */}

                        {/* Price Section */}
                        <div className="border-t pt-4 mb-4">
                          <p className="text-3xl font-bold text-slate-900">
                            {/* {item.price || "$99"} */}
                            $199
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Free shipping on orders over $50
                          </p>
                        </div>

                        {/* Buy Now Button */}
                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 rounded-lg transition-all duration-200"
                          onClick={() =>
                            window.open("#", "_blank")
                          }
                        >
                          Buy Now
                        </Button>
                      </CardContent>
                </Card>
              ) : (
                ["shirt", "pant", "shoe"].map((type) => {
                  const item = detected[type];
                  if (!item) return null;

                  return (
                    <Card
                      key={type}
                      className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      {/* Product Image */}
                      <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden border-b">
                        <img
                          src={item.itemUrl}
                          alt={type}
                          className="object-contain h-full w-full p-4"
                        />
                      </div>

                      {/* Card Content */}
                      <CardContent className="p-5">
                        {/* Category Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                            {type.toUpperCase()}
                          </span>
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                            {(item.confidence * 100).toFixed(0)}% Match
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                          {item.title ||
                            `Premium ${
                              type.charAt(0).toUpperCase() + type.slice(1)
                            }`}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                          {item.description ||
                            `High-quality ${type} perfect for your style.`}
                        </p>

                        {/* Details Grid */}
                        {(item.size || item.fabric || item.occasion) && (
                          <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                            {item.size && (
                              <div>
                                <p className="text-slate-500 font-medium">
                                  Size
                                </p>
                                <p className="text-slate-900 font-semibold">
                                  {item.size}
                                </p>
                              </div>
                            )}
                            {item.fabric && (
                              <div>
                                <p className="text-slate-500 font-medium">
                                  Material
                                </p>
                                <p className="text-slate-900 font-semibold">
                                  {item.fabric}
                                </p>
                              </div>
                            )}
                            {item.occasion && (
                              <div className="col-span-2">
                                <p className="text-slate-500 font-medium">
                                  Occasion
                                </p>
                                <p className="text-slate-900 font-semibold">
                                  {item.occasion}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Price Section */}
                        <div className="border-t pt-4 mb-4">
                          <p className="text-3xl font-bold text-slate-900">
                            {item.price || "$99"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Free shipping on orders over $50
                          </p>
                        </div>

                        {/* Buy Now Button */}
                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 rounded-lg transition-all duration-200"
                          onClick={() =>
                            window.open(item.purchaseLink || "#", "_blank")
                          }
                        >
                          Buy Now
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AvatarDetails;
