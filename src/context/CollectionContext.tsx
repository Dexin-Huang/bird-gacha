// src/context/CollectionContext.tsx
"use client";
import React, { createContext, useState, useEffect, useContext } from 'react';

interface BirdEntry {
    id: string;
    species: string;
    tier: string;
    imageUrl: string;
    capturedAt: string;
}

interface CollectionContextType {
    collection: BirdEntry[];
    addToCollection: (bird: Omit<BirdEntry, 'id' | 'capturedAt'>) => void;
    getCollection: () => BirdEntry[];
}

const CollectionContext = createContext<CollectionContextType>({
    collection: [],
    addToCollection: () => {},
    getCollection: () => [],
});

export function useCollection() {
    return useContext(CollectionContext);
}

export default function CollectionProvider({ children }: { children: React.ReactNode }) {
    const [collection, setCollection] = useState<BirdEntry[]>([]);

    // Load collection from localStorage on mount
    useEffect(() => {
        try {
            const stored = window.localStorage.getItem('birdCollection');
            if (stored) {
                setCollection(JSON.parse(stored));
            }
        } catch (err) {
            console.error('Failed to load collection:', err);
        }
    }, []);

    // Save collection to localStorage when it changes
    useEffect(() => {
        window.localStorage.setItem('birdCollection', JSON.stringify(collection));
    }, [collection]);

    // Add a new bird to the collection
    const addToCollection = (bird: Omit<BirdEntry, 'id' | 'capturedAt'>) => {
        const newEntry: BirdEntry = {
            ...bird,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            capturedAt: new Date().toISOString()
        };

        setCollection(prev => [newEntry, ...prev]);
    };

    // Get the full collection
    const getCollection = () => collection;

    return (
        <CollectionContext.Provider value={{ collection, addToCollection, getCollection }}>
            {children}
        </CollectionContext.Provider>
    );
}
