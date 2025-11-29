"use client";

import { useState, useEffect } from 'react';

// Use a known public API endpoint for fetching Bible text
const BIBLE_API_BASE_URL = "https://bible-api.com/";

/**
 * Component to display the full text for a given scripture reference.
 * @param {string} book - The name of the book (e.g., 'Ruth').
 * @param {string} chapter - The chapter number (e.g., '4').
 * @param {number[]} markedVerse - Array of verse numbers to highlight (e.g., [1, 2]).
 */
export default function ScriptureViewer({ book, chapter, markedVerse = [] }) {
    const [scriptureText, setScriptureText] = useState("Loading scripture...");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Combine book and chapter for the API query
    const reference = `${book} ${chapter}`;

    // Ensure markedVerse is an array for reliable checking
    const versesToHighlight = Array.isArray(markedVerse) ? markedVerse : [];

    useEffect(() => {
        if (!book || !chapter) {
            setScriptureText("Select a Book and Chapter to view the scripture text.");
            setLoading(false);
            return;
        }

        const fetchScripture = async () => {
            setLoading(true);
            setError(null);
            setScriptureText("Loading scripture...");

            try {
                // Using KJV as confirmed working translation
                const res = await fetch(`${BIBLE_API_BASE_URL}${encodeURIComponent(reference)}?translation=kjv`);

                if (!res.ok) {
                    throw new Error(`API returned status ${res.status}`);
                }

                const data = await res.json();

                if (data.error) {
                    setError(data.error);
                    setScriptureText("Could not find scripture text for this reference.");
                } else {
                    // Combine all verses into a single string, applying conditional highlighting
                    const text = data.verses.map(v => {
                        const isHighlighted = versesToHighlight.includes(v.verse);

                        // Conditionally add the 'highlighted-verse' class
                        const className = isHighlighted ? 'highlighted-verse' : '';

                        return `<span class="${className}"><sup>${v.verse}</sup> ${v.text}</span>`;
                    }).join(' ');

                    setScriptureText(text);
                }

            } catch (err) {
                console.error("Fetch error:", err);
                setError("Failed to load scripture. Check console for details.");
                setScriptureText(null);
            } finally {
                setLoading(false);
            }
        };

        fetchScripture();
    }, [book, chapter, reference, versesToHighlight.join(',')]);
    // Re-run if book, chapter, or the array of verses to highlight changes

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2 text-gray-800">
                {book} {chapter} (KJV)
            </h3>

            {loading && <p className="text-gray-500">Loading...</p>}

            {error && (
                <p className="text-red-600 font-medium">Error: {error}</p>
            )}

            {scriptureText && (
                <div
                    className="text-gray-700 leading-relaxed text-left"
                    // Dangerously set inner HTML to render verse numbers (<sup>)
                    dangerouslySetInnerHTML={{ __html: scriptureText }}
                />
            )}

            <p className="text-xs text-gray-400 mt-4 pt-2 border-t">
                Text provided by Bible API (KJV Translation)
            </p>
        </div>
    );
}