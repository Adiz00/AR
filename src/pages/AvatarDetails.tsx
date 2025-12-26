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
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

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

  // Helper function to get the best match by type from detection results
  const getBestByType = (results: any[], type: string) => {
    const list = results.filter((r) => r.type?.toLowerCase() === type.toLowerCase());
    if (list.length === 0) return null;
    return list.reduce((best, cur) => (cur.confidence > (best.confidence ?? 0) ? cur : best), list[0]);
  };

  // Effect to detect outfit items when component mounts
  useEffect(() => {
    const run = async () => {
      setLoadingDetected(true);
      setDetectError(null);
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

        // Process detection results
        const bestOutfit = getBestByType(data.results, 'outfit');
        if (bestOutfit) {
          setDetected({ outfit: bestOutfit });
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
      } catch (err: any) {
        console.error('detect error', err);
        setDetectError(`${err?.message} | No avatar selected` || 'Failed to detect items');
      } finally {
        setLoadingDetected(false);
      }
    };

    run();
  }, []);
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Page header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Avatar Details</h1>
        <p className="text-muted-foreground mt-2">Review the avatar appearance and outfit details. Click any item to view purchase options.</p>
      </header>

      {/* Conditional rendering based on loading/error state */}
      {
        loadingDetected ? (
          // Loading state with animation
          <div className="text-center py-20 text-muted-foreground">
           <DotLottieReact
        src="https://lottie.host/7ec29151-fa84-45b3-97ad-dfc672f4760b/Zi8FX1bJUR.lottie"
        loop
        autoplay
      />
          </div>
        ) : detectError ? (
          // Error state display
          <div className="text-center py-20 text-red-500">Error: {detectError}</div>
        ) : (
          // Main content grid
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Avatar display and info */}
            <section className="lg:col-span-1">
              <Card>
                {/* Avatar image container */}
                <div className="h-96 bg-muted flex items-center justify-center overflow-hidden">
                  <img src={avatarUrl} alt="avatar" className="h-full object-cover" />
                </div>
                {/* Avatar URL for debugging */}
                <div className="px-4 pb-3 text-xs text-muted-foreground break-words">{avatarUrl}</div>
                <CardHeader>
                  <CardTitle>Model: Alex</CardTitle>
                  <CardDescription>Height: 6'1" • Build: Slim • Gender: Male</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Detected size: M (Chest 38")</div>
                    <div className="text-sm text-muted-foreground">Preferred fit: Slim</div>
                    <div className="text-sm text-muted-foreground">Last updated: Oct 12, 2025</div>
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
            {/* Map through detected outfit items */}
            {Object.keys(detected).map((type) => {
              const detectedItem = detected[type];
              // Use fallback mock data if no detection result
              const fallback = MOCK_OUTFIT.find((m) => m.part.toLowerCase() === type);
              const image = detectedItem?.itemUrl || fallback?.image;
              const title = fallback?.title || (type.charAt(0).toUpperCase() + type.slice(1));
              const description = fallback?.description || 'Detected item from similarity search.';
              const size = fallback?.size || '-';
              const occasion = fallback?.occasion || '-';
              const fabric = fallback?.fabric || '-';
              const price = fallback?.price || '-';
              const purchaseLink = fallback?.purchaseLink || '#';

              return (
                <Card key={type} className="flex flex-col">
                  {/* Product image */}
                  <div className="h-44 bg-muted flex items-center justify-center overflow-hidden">
                    {image ? (
                      <img src={image} alt={`${type}`} className="object-contain h-full" />
                    ) : (
                      <div className="text-muted-foreground">No image</div>
                    )}
                  </div>
                  <CardContent className="flex-1">
                    {/* Product header with type and price */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">{type || 'outfit'}</div>
                      <div className="text-sm font-semibold">{price || '24000'}</div>
                    </div>
                    <CardTitle className="mt-2 text-lg">{title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">{description}</p>

                    {/* Product specifications */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>Size: <span className="text-foreground">{size || '35'}</span></div>
                      <div>Occasion: <span className="text-foreground">{occasion}</span></div>
                      <div>Fabric: <span className="text-foreground">{fabric}</span></div>
                      <div>Link: <a href={purchaseLink} className="text-primary underline">Buy</a></div>
                    </div>
                    {/* Show confidence score if available */}
                    {detectedItem && (
                      <div className="mt-3 text-xs text-muted-foreground">Confidence: {(detectedItem.confidence * 100).toFixed(1)}%</div>
                    )}
                  </CardContent>
                  <CardFooter className="justify-between">
                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="ghost" size="sm">Try On</Button>
                    </div>
                    <div className="text-xs text-muted-foreground">Type: {type}</div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
      )
      }
    </div>
  );
};

export default AvatarDetails;
