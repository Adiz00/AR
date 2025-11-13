import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import avatarShirt from '../assets/avatar-shirt.png';
import avatarPant from '../assets/avatar-pant.png';
import avatarShoes from '../assets/avatar-shoes.png';
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
  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Avatar Details</h1>
        <p className="text-muted-foreground mt-2">Review the avatar appearance and outfit details. Click any item to view purchase options.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-1">
          <Card>
            <div className="h-96 bg-slate-50 flex items-center justify-center overflow-hidden">
              <img src={'https://models.readyplayer.me/64e3055495439dfcf3f0b665.png?camera=fullbody'} alt="avatar" className="h-full object-cover" />
            </div>
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

          <Card className="mt-4 p-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <div className="mt-3 flex flex-col gap-2">
              <Button variant="outline">Share Outfit</Button>
              <Button variant="ghost">Compare Sizes</Button>
            </div>
          </Card>
        </section>

        <section className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_OUTFIT.map((item) => (
              <Card key={item.id} className="flex flex-col">
                <div className="h-44 bg-slate-50 flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="object-contain h-full" />
                  ) : (
                    <div className="text-muted-foreground">No image</div>
                  )}
                </div>
                <CardContent className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">{item.part}</div>
                    <div className="text-sm font-semibold">{item.price}</div>
                  </div>
                  <CardTitle className="mt-2 text-lg">{item.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">{item.description}</p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>Size: <span className="text-foreground">{item.size}</span></div>
                    <div>Occasion: <span className="text-foreground">{item.occasion}</span></div>
                    <div>Fabric: <span className="text-foreground">{item.fabric}</span></div>
                    <div>Link: <a href={item.purchaseLink} className="text-primary underline">Buy</a></div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="ghost" size="sm">Try On</Button>
                  </div>
                  <div className="text-xs text-muted-foreground">SKU: {item.id}</div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AvatarDetails;
