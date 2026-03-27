import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { TrendingUp } from 'lucide-react';

type Gender = 'male' | 'female' | 'unisex';
type Size = 'XS' | 'S' | 'M' | 'L' | 'XL';

const MEASUREMENTS = [
  { key: "height_cm", label: "Height" },
  { key: "shoulder_width_cm", label: "Shoulder" },
  { key: "chest_circumference_cm", label: "Chest" },
  { key: "waist_circumference_cm", label: "Waist" },
  { key: "hip_circumference_cm", label: "Hip" },
  { key: "inseam_cm", label: "Inseam" },
  { key: "torso_length_cm", label: "Torso" },
  { key: "arm_length_cm", label: "Arm Length" },
  { key: "neck_circumference_cm", label: "Neck" },
  { key: "thigh_circumference_cm", label: "Thigh" },
];

const ImageAiSearch: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [height, setHeight] = useState<string>('170');
    const [gender, setGender] = useState<string>('');
    const [prompt, setPrompt] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [detectingGender, setDetectingGender] = useState<boolean>(false);
    const [measurements, setMeasurements] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [error, setError] = useState<string>('');

    const [isAnnotatedImageOpen, setIsAnnotatedImageOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedSubscription, setSelectedSubscription] = useState<string>('');

    const fileRef = useRef<HTMLInputElement>(null);

    const detectGender = useCallback(async (file: File) => {
        setDetectingGender(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('http://localhost:8000/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error(`Gender detection API failed: ${res.status}`);
            const data = await res.json();

            const face = data?.faces?.[0];
            const detected = face?.gender?.toLowerCase?.();

            if (detected) {
                // Normalize to the values expected by the backend sizing API
                if (detected.includes('woman')) {
                    setGender('female');
                } else if (detected.includes('man')) {
                    setGender('male');
                } else {
                    setGender('unisex');
                }
            } else {
                throw new Error('No face detected in the image.');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to detect gender from image.');
            setGender('');
        } finally {
            setDetectingGender(false);
        }
    }, []);

    const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        setFile(f);
        const url = URL.createObjectURL(f);
        setPreview(url);
        setMeasurements(null);
        setProducts([]);
        setError('');
        setGender('');

        detectGender(f);
    }, [detectGender]);

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
        setHeight('170');
        setGender('female');
        setPrompt('');
        setMeasurements(null);
        setProducts([]);
        setError('');
        setIsAnnotatedImageOpen(false);
        setIsProductDialogOpen(false);
        setSelectedProduct(null);
    }, []);

    const generate = useCallback(async () => {
        if (!file || !height) return;
        setLoading(true);
        setError('');
        setMeasurements(null);
        setProducts([]);

        try {
            // Call API 1: Measure
            const formData = new FormData();
            formData.append('file', file);
            formData.append('height_cm', height);
            formData.append('gender', gender);
            formData.append('complexity', '2');

            const measureRes = await fetch('http://localhost:5001/api/measure', {
                method: 'POST',
                body: formData,
            });

            if (!measureRes.ok) throw new Error(`Measurement API failed: ${measureRes.status}`);
            const measureData = await measureRes.json();

            setMeasurements(measureData);

            // Get recommended size
            const size = measureData.sizing?.recommended_size || 'M';

            // Call API 2: Search products
            const searchRes = await fetch('http://localhost:5000/api/list/products/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    size,
                    gender,
                    prompt,
                }),
            });

            if (!searchRes.ok) throw new Error(`Product search API failed: ${searchRes.status}`);
            const searchData = await searchRes.json();

            setProducts(searchData.products || []);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [file, height, gender, prompt]);

    const openProductDialog = useCallback((product: any) => {
        setSelectedProduct(product);
        setIsProductDialogOpen(true);
    }, []);

    const closeProductDialog = useCallback(() => {
        setIsProductDialogOpen(false);
        setSelectedProduct(null);
    }, []);

    useEffect(() => {
        if (!selectedProduct) return;
        const types = selectedProduct.types ?? ['Powder', 'Whole Bean', 'Ground'];
        const subs = selectedProduct.subscriptions ?? ['4 Months', '8 Months', '12 Months'];
        setSelectedType(types[0]);
        setSelectedSubscription(subs[1] ?? subs[0]);
    }, [selectedProduct]);

    const cmToInch = (cm: number) => (cm * 0.393701).toFixed(2);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Image AI Outfit Finder</h1>
                <p className="text-muted-foreground mt-1">Upload a full-body image, provide details, and find suitable products.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <aside className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Image</CardTitle>
                            <CardDescription>Choose a clear full-body photo.</CardDescription>
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
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={onFileChange}
                                        className="sr-only"
                                    />
                                </label>
                                <div className="w-full flex gap-2">
                                    <Button onClick={() => fileRef.current?.click()}>Choose Image</Button>
                                    <Button variant="ghost" onClick={reset}>Reset</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                            <CardDescription>Provide your height, gender, and occasion prompt.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Label htmlFor="height">Height (cm)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    placeholder="e.g. 170"
                                />
                            </div>
                            <div>
                                <Label>Gender</Label>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {detectingGender
                                        ? 'Detecting gender from image...'
                                        : gender
                                        ? `Detected: ${gender}`
                                        : 'Upload an image to detect gender.'}
                                </p>
                            </div>
                            <div>
                                <Label htmlFor="prompt">Occasion/Prompt</Label>
                                <Input
                                    id="prompt"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g. evening party, beach wedding"
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={generate}
                                disabled={
                                    loading || detectingGender || !file || !height || !gender
                                }
                                className="w-full"
                            >
                                {loading ? 'Processing...' : 'Find Outfits'}
                            </Button>
                        </CardFooter>
                    </Card>
                </aside>

                <main className="lg:col-span-2 space-y-6">
                    {error && (
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-red-500">{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {measurements && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Measurements</CardTitle>
                                <CardDescription>Recommended Size: {measurements.sizing?.recommended_size}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {measurements.annotated_image_b64 && (
                                    <div className="mb-4">
                                        <div
                                            className="relative group overflow-hidden rounded-lg border border-input bg-background shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => setIsAnnotatedImageOpen(true)}
                                        >
                                            <img
                                                src={`data:image/jpeg;base64,${measurements.annotated_image_b64}`}
                                                alt="Annotated"
                                                className="h-64 w-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-900">
                                                    View full image
                                                </span>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Click the image to view a larger version and see measured points.
                                        </p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                    {MEASUREMENTS.map(({ key, label }) => {
                                        const cm = measurements.measurements?.[key];
                                        const inch = cm ? cmToInch(cm) : null;
                                        return (
                                            <div key={key} className="rounded-lg border border-input bg-muted/50 p-3 text-center">
                                                <div className="text-sm font-semibold text-muted-foreground">{label}</div>
                                                <div className="mt-1 text-lg font-medium">{cm ? `${cm} cm` : 'N/A'}</div>
                                                <div className="text-xs text-muted-foreground">{inch ? `${inch} in` : ''}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Recommended Products</CardTitle>
                            <CardDescription>Products matching your size, gender, and prompt.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="p-4 rounded-lg border bg-card">
                                            <div className="h-40 bg-muted animate-pulse" />
                                            <div className="mt-3 h-4 bg-muted rounded w-3/4 animate-pulse" />
                                            <div className="mt-2 h-3 bg-muted rounded w-1/2 animate-pulse" />
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!loading && products.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="relative m-4 flex w-full max-w-xs flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => openProductDialog(product)}
                                                className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl"
                                            >
                                                <img
                                                    className="object-cover"
                                                    src={product?.images?.[0] ?? ''}
                                                    alt={product?.name}
                                                />
                                                {true && (
                                                    <span className="absolute top-0 left-0 m-2 rounded-full bg-black px-2 text-center text-sm font-medium text-white">
                                                        46% OFF
                                                    </span>
                                                )}
                                            </button>

                                            <div className="mt-4 px-5 pb-5">
                                                <button type="button" onClick={() => openProductDialog(product)} className="text-left">
                                                    <h5 className="text-xl tracking-tight text-slate-900">{product.name}</h5>
                                                </button>

                                                <div className="mt-2 mb-5 flex items-center justify-between">
                                                    <p>
                                                        <span className="text-2xl font-bold text-slate-900">PKR {product.price}</span>
                                                        {product.originalPrice && (
                                                            <span className="text-sm text-slate-900 line-through">{product.originalPrice}</span>
                                                        )}
                                                    </p>
                                                    <div className="flex items-center">
                                                        {Array.from({ length: 5 }).map((_, index) => (
                                                            <svg
                                                                key={index}
                                                                aria-hidden="true"
                                                                className="h-5 w-5 text-yellow-300"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                        <span className="mr-2 ml-3 rounded bg-yellow-200 px-2.5 py-0.5 text-xs font-semibold">
                                                            {product.rating ?? '5.0'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => openProductDialog(product)}
                                                    className="flex w-full items-center justify-center rounded-md bg-slate-900 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="mr-2 h-6 w-6"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                                        />
                                                    </svg>
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!loading && products.length === 0 && measurements && (
                                <div className="text-center text-sm text-muted-foreground">No products found matching your criteria.</div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>

            <Dialog open={isAnnotatedImageOpen} onOpenChange={setIsAnnotatedImageOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Annotated Image</DialogTitle>
                        <DialogDescription>Full view of your image with measured points.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        {measurements?.annotated_image_b64 ? (
                            <img
                                src={`data:image/jpeg;base64,${measurements.annotated_image_b64}`}
                                alt="Annotated full"
                                className="w-full max-h-[70vh] object-contain rounded-md"
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground">No annotated image available.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsAnnotatedImageOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog  open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-6">
                    <div className="py-12 sm:py-16">
                        <div className="container mx-auto px-4">
                            <nav className="flex">
                                <ol role="list" className="flex items-center">
                                    <li className="text-left">
                                        <div className="-m-1">
                                            <button
                                                type="button"
                                                onClick={closeProductDialog}
                                                className="rounded-md p-1 text-sm font-medium text-gray-600 focus:text-gray-900 focus:shadow hover:text-gray-800"
                                            >
                                                Home
                                            </button>
                                        </div>
                                    </li>

                                    <li className="text-left">
                                        <div className="flex items-center">
                                            <span className="mx-2 text-gray-400">/</span>
                                            <div className="-m-1">
                                                <button
                                                    type="button"
                                                    onClick={closeProductDialog}
                                                    className="rounded-md p-1 text-sm font-medium text-gray-600 focus:text-gray-900 focus:shadow hover:text-gray-800"
                                                >
                                                    Products
                                                </button>
                                            </div>
                                        </div>
                                    </li>

                                    <li className="text-left">
                                        <div className="flex items-center">
                                            <span className="mx-2 text-gray-400">/</span>
                                            <div className="-m-1">
                                                <span
                                                    className="rounded-md p-1 text-sm font-medium text-gray-600 focus:text-gray-900 focus:shadow hover:text-gray-800"
                                                    aria-current="page"
                                                >
                                                    {selectedProduct?.name ?? 'Product'}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                </ol>
                            </nav>

                            <div className="lg:col-gap-12 xl:col-gap-16 mt-8 grid grid-cols-1 gap-12 lg:mt-12 lg:grid-cols-5 lg:gap-16">
                                <div className="lg:col-span-3 lg:row-end-1">
                                    <div className="lg:flex lg:items-start">
                                        <div className="lg:order-2 lg:ml-5">
                                            <div className="max-w-xl overflow-hidden rounded-lg">
                                                <img
                                                    className="h-full w-full max-w-full object-cover"
                                                    src={selectedProduct?.images?.[0] ?? ''}
                                                    alt={selectedProduct?.name ?? 'Product image'}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-2 w-full lg:order-1 lg:w-32 lg:flex-shrink-0">
                                            <div className="flex flex-row items-start lg:flex-col">
                                                {Array.from({ length: 3 }).map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        className="flex-0 aspect-square mb-3 h-20 overflow-hidden rounded-lg border-2 border-transparent text-center"
                                                    >
                                                        <img
                                                            className="h-full w-full object-cover"
                                                                src={selectedProduct?.images?.[0] ?? ''}
                                                            alt={selectedProduct?.name ?? 'Product thumbnail'}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-2 lg:row-span-2 lg:row-end-2">
                                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                        {selectedProduct?.name ?? 'Product'}
                                    </h1>

                                    <div className="mt-5 flex items-center">
                                        <div className="flex items-center">
                                            {Array.from({ length: 5 }).map((_, index) => (
                                                <svg
                                                    key={index}
                                                    className="block h-4 w-4 align-middle text-yellow-500"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                            <p className="ml-2 text-sm font-medium text-gray-500">
                                                {selectedProduct?.reviewsCount ?? 1209} Reviews
                                            </p>
                                        </div>
                                    </div>

                                    <h2 className="mt-8 text-base text-gray-900">Occasion</h2>
                                    <div className="mt-3 flex select-none flex-wrap items-center gap-1">
                                        {selectedProduct?.occasions.map((type: string) => (
                                            <label key={type} className="">
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value={type}
                                                    checked={selectedType === type}
                                                    onChange={() => setSelectedType(type)}
                                                    className="peer sr-only"
                                                />
                                                <p className="peer-checked:bg-black peer-checked:text-white rounded-lg border border-black px-6 py-2 font-bold">
                                                    {type}
                                                </p>
                                            </label>
                                        ))}
                                    </div>

                                    <h2 className="mt-8 text-base text-gray-900">Size</h2>
                                    <div className="mt-3 flex select-none flex-wrap items-center gap-1">
                                        {selectedProduct?.sizes?.map((sub: string) => (
                                            <label key={sub} className="">
                                                <input
                                                    type="radio"
                                                    name="subscription"
                                                    value={sub}
                                                    checked={selectedSubscription === sub}
                                                    onChange={() => setSelectedSubscription(sub)}
                                                    className="peer sr-only"
                                                />
                                                <p className="peer-checked:bg-black peer-checked:text-white rounded-lg border border-black px-6 py-2 font-bold">
                                                    {sub}
                                                </p>
                                                <span className="mt-1 block text-center text-xs">
                                                    {/* {selectedProduct?.subscriptionPricing?.[sub] ?? '$60/mo'} */}
                                                </span>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="mt-10 flex flex-col items-center justify-between space-y-4 border-t border-b py-4 sm:flex-row sm:space-y-0">
                                        <div className="flex items-end">
                                            <h1 className="text-3xl font-bold">PKR {selectedProduct?.price ?? '0.00'}</h1>
                                            <span className="text-base"></span>
                                        </div>

                                        <button
                                            type="button"
                                            className="inline-flex items-center justify-center rounded-md border-2 border-transparent bg-gray-900 bg-none px-12 py-3 text-center text-base font-bold text-white transition-all duration-200 ease-in-out focus:shadow hover:bg-gray-800"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="shrink-0 mr-3 h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                                />
                                            </svg>
                                            Add to cart
                                        </button>
                                    </div>

                                    <ul className="mt-8 space-y-2">
                                        <li className="flex items-center text-left text-sm font-medium text-gray-600">
                                            <svg
                                                className="mr-2 block h-5 w-5 align-middle text-gray-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            Free shipping worldwide
                                        </li>

                                        <li className="flex items-center text-left text-sm font-medium text-gray-600">
                                            <svg
                                                className="mr-2 block h-5 w-5 align-middle text-gray-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                                />
                                            </svg>
                                            Cancel Anytime
                                        </li>
                                    </ul>
                                </div>

                                <div className="lg:col-span-3">
                                    <div className="border-b border-gray-300">
                                        <nav className="flex gap-4">
                                            <button
                                                type="button"
                                                className="border-b-2 border-gray-900 py-4 text-sm font-medium text-gray-900 hover:border-gray-400 hover:text-gray-800"
                                            >
                                                Description
                                            </button>

                                            <button
                                                type="button"
                                                className="inline-flex items-center border-b-2 border-transparent py-4 text-sm font-medium text-gray-600"
                                            >
                                                Reviews
                                                <span className="ml-2 block rounded-full bg-gray-500 px-2 py-px text-xs font-bold text-gray-100">
                                                    {selectedProduct?.reviewsCount ?? 1209}
                                                </span>
                                            </button>
                                        </nav>
                                    </div>

                                    <div className="mt-8 flow-root sm:mt-12">
                                        <h1 className="text-3xl font-bold">Delivered To Your Door</h1>
                                        <p className="mt-4">
                                            {selectedProduct?.shortDescription ??
                                                'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia accusantium nesciunt fuga.'}
                                        </p>
                                        <h1 className="mt-8 text-3xl font-bold">From the Fine Farms of Brazil</h1>
                                        <p className="mt-4">
                                            {selectedProduct?.longDescription ??
                                                'Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio numquam enim facere.'}
                                        </p>
                                        <p className="mt-4">
                                            {selectedProduct?.extraDescription ??
                                                'Amet consectetur adipisicing elit. Optio numquam enim facere. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolore rerum nostrum eius facere, ad neque.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="secondary" onClick={closeProductDialog}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default ImageAiSearch;