"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import DevotionCard from "../components/DevotionCard";
import * as htmlToImage from "html-to-image";
import ScriptureViewer from "@/components/ScriptureViewer";

const BIBLE_ORDER_LIST = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
  "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John",
  "3 John", "Jude", "Revelation",
];

const extractRichText = (property) =>
    property?.rich_text?.[0]?.plain_text || "";

const extractTitleText = (property) =>
    property?.title?.[0]?.plain_text || "";

const parseScripture = (chapterText) => {
  if (!chapterText) return { book: null, chapterNum: null };
  const parts = chapterText.trim().split(/\s+/);
  if (parts.length > 1) {
    const chapterNum = parts.pop();
    const book = parts.join(" ");
    return { book, chapterNum };
  }
  return { book: chapterText, chapterNum: null };
};

// ------------------------------------------------------------------
// ✅ NEW HELPER FUNCTION: Safely parse Notion Rich Text containing JSON array
// Converts "[1,2]" to the array [1, 2]
// ------------------------------------------------------------------
const parseMarkedVerses = (property) => {
  const jsonString = extractRichText(property);
  if (!jsonString) return [];

  try {
    // Attempt to parse the string "[1,2]" into an array [1, 2]
    const parsedArray = JSON.parse(jsonString);
    // Ensure the result is an array of numbers
    if (Array.isArray(parsedArray) && parsedArray.every(item => typeof item === 'number')) {
      return parsedArray;
    }
  } catch (e) {
    console.error("Error parsing marked verses JSON:", e);
  }
  return [];
};


export default function Home() {
  const [devotions, setDevotions] = useState([]);
  const [loading, setLoading] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [markedVerse, setMarkedVerse] = useState([]); // Initialized as empty array
  const cardRef = useRef(null);

  useEffect(() => {
    const fetchDevotion = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/devotion");
        const data = await res.json();

        if (Array.isArray(data.results) && data.results.length > 0) {
          setDevotions(data.results);
        } else {
          setDevotions([]);
        }
      } catch (err) {
        console.error("Error fetching devotions:", err);
        setDevotions([]);
      }
    };

    fetchDevotion();
  }, []);

  const uniqueBooks = useMemo(() => {
    const books = devotions.map(d => parseScripture(extractRichText(d.properties?.Chapter)).book)
        .filter(Boolean);

    const unique = [...new Set(books)];

    return unique.sort((a, b) => {
      const indexA = BIBLE_ORDER_LIST.indexOf(a);
      const indexB = BIBLE_ORDER_LIST.indexOf(b);

      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });
  }, [devotions]);

  const devotionsForBook = useMemo(() => {
    return devotions.filter(d =>
        parseScripture(extractRichText(d.properties?.Chapter)).book === selectedBook
    );
  }, [devotions, selectedBook]);

  const uniqueChapterNumbers = useMemo(() => {
    const chapterNums = devotionsForBook.map(d => parseScripture(extractRichText(d.properties?.Chapter)).chapterNum)
        .filter(Boolean);
    return [...new Set(chapterNums)].sort((a, b) => parseInt(a) - parseInt(b));
  }, [devotionsForBook]);

  const filteredDevotions = useMemo(() => {
    return devotionsForBook.filter(d =>
        parseScripture(extractRichText(d.properties?.Chapter)).chapterNum === selectedChapter
    );
  }, [devotionsForBook, selectedChapter]);

  // Find the currently selected devotion based on ID
  const selectedDevotion = devotions.find((d) => d.id === selectedId);

  // --------------------------------------------------------
  // ✅ NEW/MODIFIED useEffect: Logic to set defaults and marked verses
  // --------------------------------------------------------
  useEffect(() => {
    if (devotions.length > 0 && uniqueBooks.length > 0) {
      if (selectedId) {
        // If an ID is already selected (e.g., from handleVerseChange), update only marked verses
        const currentDevotion = devotions.find((d) => d.id === selectedId);
        if (currentDevotion) {
          const verses = parseMarkedVerses(currentDevotion.properties?.MarkedVerses);
          setMarkedVerse(verses);
        }
      } else {
        // Default selection logic (run only once on load or if data changes)
        const latestBook = uniqueBooks[uniqueBooks.length - 1];
        setSelectedBook(latestBook);

        const devotionsForLatestBook = devotions.filter(d =>
            parseScripture(extractRichText(d.properties?.Chapter)).book === latestBook
        );

        const chapterNums = devotionsForLatestBook
            .map(d => parseScripture(extractRichText(d.properties?.Chapter)).chapterNum)
            .filter(Boolean);

        const latestChapterNum = [...new Set(chapterNums)].sort((a, b) => parseInt(a) - parseInt(b)).pop();
        setSelectedChapter(latestChapterNum);

        const latestDevotion = devotionsForLatestBook.find(d =>
            parseScripture(extractRichText(d.properties?.Chapter)).chapterNum === latestChapterNum
        );
        const latestId = latestDevotion?.id || null;
        setSelectedId(latestId);

        if (latestDevotion) {
          const verses = parseMarkedVerses(latestDevotion.properties?.MarkedVerses);
          setMarkedVerse(verses);
        }
      }
    }
    setLoading(false);

  }, [devotions.length, uniqueBooks.length, selectedId]); // selectedId is dependency for re-checking marked verses


  const chapterText = selectedDevotion ? extractRichText(selectedDevotion.properties?.Chapter) : "Untitled Scripture";

  const verse = extractRichText(selectedDevotion?.properties?.VerseReference) || "";

  const content =
      selectedDevotion?.properties?.Devotion?.rich_text
          ?.map((r) => r.plain_text)
          .join("") || "No content";

  const date = extractTitleText(selectedDevotion?.properties?.Date) || "Unknown date";
  //
  // if (!devotions.length && !loading) {
  //   return <div className="text-center p-8">No devotion available</div>;
  // }

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="flex flex-col items-center space-y-4">
            {/* Animated Spinner */}
            <div
                className="w-12 h-12 border-4 border-gray-400 border-t-blue-500 rounded-full animate-spin"
                role="status"
            >
              {/* SR-only text for accessibility */}
              <span className="sr-only">Loading...</span>
            </div>

            {/* Loading Text */}
            <p className="text-lg text-gray-700">Loading...</p>
          </div>
        </div>
    );
  }

  const handleBookChange = (e) => {
    const newBook = e.target.value;
    setSelectedBook(newBook);

    const newBookDevotions = devotions.filter(d =>
        parseScripture(extractRichText(d.properties?.Chapter)).book === newBook
    );
    const firstDevotion = newBookDevotions[0];
    const newChapterNum = parseScripture(extractRichText(firstDevotion?.properties?.Chapter)).chapterNum;

    setSelectedChapter(newChapterNum);
    setSelectedId(firstDevotion?.id || null); // ID change will trigger the useEffect to set markedVerse
  };

  const handleChapterChange = (e) => {
    const newChapterNum = e.target.value;
    setSelectedChapter(newChapterNum);

    const firstDevotion = devotionsForBook.find(d =>
        parseScripture(extractRichText(d.properties?.Chapter)).chapterNum === newChapterNum
    );
    setSelectedId(firstDevotion?.id || null); // ID change will trigger the useEffect to set markedVerse
  };

  const handleVerseChange = (e) => {
    const newId = e.target.value;
    setSelectedId(newId); // ID change will trigger the useEffect to set markedVerse
  };

  const handleShare = async () => {
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "devotion.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Daily Devotion",
          text: `Hi all!! Check out today’s devotion 🙏 (${window.location.href})`,
        });
      } else {
        window.open(
            `https://wa.me/?text=${encodeURIComponent(
                `📖 ${chapterText}${verse ? ` (${verse})` : ''} (${date})\n\n${content}`
            )}`,
            "_blank"
        );
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
      <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">안녕하세요!!!!</h1>
          <p className="text-lg text-gray-700">
            Welcome to Daily Bible Study Tracker
          </p>
        </div>

        <div className="flex space-x-2">

          <select
              className="p-2 border rounded"
              value={selectedBook || ""}
              onChange={handleBookChange}
          >
            <option value="" disabled>Select Book</option>
            {uniqueBooks.map((book) => (
                <option key={book} value={book}>
                  {book}
                </option>
            ))}
          </select>

          <select
              className="p-2 border rounded"
              value={selectedChapter || ""}
              onChange={handleChapterChange}
              disabled={!selectedBook}
          >
            <option value="" disabled>Select Chapter</option>
            {uniqueChapterNumbers.map((chapterNum) => (
                <option key={chapterNum} value={chapterNum}>
                  {chapterNum}
                </option>
            ))}
          </select>

        </div>

        <div className="flex flex-col md:flex-row w-full max-w-6xl md:justify-center space-y-6 md:space-x-6 md:space-y-0">

          {/* LEFT SIDE (Mobile: TOP) - Devotion Card and Share Button */}
          <div className="flex-1 min-w-0 flex flex-col items-center space-y-4">
            <div ref={cardRef}>
              <DevotionCard title={`${chapterText} ${verse}`} content={content} date={date} />
            </div>
            <button
                onClick={handleShare}
                className="px-4 py-2 bg-gray-500 text-white rounded-full shadow hover:bg-gray-600"
            >
              📤 Share
            </button>
          </div>

          {/* RIGHT SIDE (Mobile: BOTTOM) - Scripture Viewer */}
          <div className="flex-1 min-w-0">
            <ScriptureViewer
                book={selectedBook}
                chapter={selectedChapter}
                markedVerse={markedVerse}
            />
          </div>
        </div>


      </main>
  );
}