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

const extractRichText = (property) => property?.rich_text?.[0]?.plain_text || "";
const extractTitleText = (property) => property?.title?.[0]?.plain_text || "";

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

const parseMarkedVerses = (property) => {
  const jsonString = extractRichText(property);
  if (!jsonString) return [];
  try {
    const parsedArray = JSON.parse(jsonString);
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
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [markedVerse, setMarkedVerse] = useState([]);
  const cardRef = useRef(null);

  useEffect(() => {
    const fetchDevotion = async () => {
      try {
        const res = await fetch("/api/devotion");
        const data = await res.json();
        if (Array.isArray(data.results)) setDevotions(data.results);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchDevotion();
  }, []);

  // --- LOGIC HELPERS ---

  const uniqueBooks = useMemo(() => {
    const books = devotions.map(d => parseScripture(extractRichText(d.properties?.Chapter)).book).filter(Boolean);
    return [...new Set(books)].sort((a, b) => BIBLE_ORDER_LIST.indexOf(a) - BIBLE_ORDER_LIST.indexOf(b));
  }, [devotions]);

  const devotionsForBook = useMemo(() => {
    return devotions.filter(d => parseScripture(extractRichText(d.properties?.Chapter)).book === selectedBook);
  }, [devotions, selectedBook]);

  const uniqueChapterNumbers = useMemo(() => {
    const chapterNums = devotionsForBook.map(d => parseScripture(extractRichText(d.properties?.Chapter)).chapterNum).filter(Boolean);
    return [...new Set(chapterNums)].sort((a, b) => parseInt(a) - parseInt(b));
  }, [devotionsForBook]);

  // 1. Initial Load: Set defaults
  // 1. Initial Load: Set defaults to the LATEST scripture available
  useEffect(() => {
    if (devotions.length > 0 && !selectedId && uniqueBooks.length > 0) {
      // 1. Get the last book in the Bible order list that we have data for
      const latestBook = uniqueBooks[uniqueBooks.length - 1];

      // 2. Get all devotions for that specific book
      const bookDevs = devotions.filter(
          d => parseScripture(extractRichText(d.properties?.Chapter)).book === latestBook
      );

      // 3. Sort them numerically by chapter number so the highest is at the end
      const sortedDevs = [...bookDevs].sort((a, b) => {
        const chA = parseInt(parseScripture(extractRichText(a.properties?.Chapter)).chapterNum) || 0;
        const chB = parseInt(parseScripture(extractRichText(b.properties?.Chapter)).chapterNum) || 0;
        return chA - chB;
      });

      // 4. Pick the absolute latest chapter
      const latestDev = sortedDevs[sortedDevs.length - 1];

      if (latestDev) {
        setSelectedBook(latestBook);
        setSelectedChapter(parseScripture(extractRichText(latestDev.properties?.Chapter)).chapterNum);
        setSelectedId(latestDev.id);
      }
    }
  }, [devotions, uniqueBooks, selectedId]);

  // 2. Update marked verses whenever selectedId changes
  useEffect(() => {
    const current = devotions.find(d => d.id === selectedId);
    if (current) {
      setMarkedVerse(parseMarkedVerses(current.properties?.MarkedVerses));
    }
  }, [selectedId, devotions]);

  // --- HANDLERS ---

  const handleBookChange = (e) => {
    const newBook = e.target.value;
    setSelectedBook(newBook);

    // When book changes, find the first available chapter in that book
    const firstDevInBook = devotions.find(d => parseScripture(extractRichText(d.properties?.Chapter)).book === newBook);
    if (firstDevInBook) {
      const newChapter = parseScripture(extractRichText(firstDevInBook.properties?.Chapter)).chapterNum;
      setSelectedChapter(newChapter);
      setSelectedId(firstDevInBook.id);
    }
  };

  const handleChapterChange = (e) => {
    const newChapter = e.target.value;
    setSelectedChapter(newChapter);

    // Find the specific devotion ID for this book + chapter
    const match = devotions.find(d => {
      const parsed = parseScripture(extractRichText(d.properties?.Chapter));
      return parsed.book === selectedBook && parsed.chapterNum === newChapter;
    });
    if (match) setSelectedId(match.id);
  };

  // --- DATA FOR RENDERING ---
  const selectedDevotion = devotions.find((d) => d.id === selectedId);
  const chapterText = selectedDevotion ? extractRichText(selectedDevotion.properties?.Chapter) : "";
  const verse = extractRichText(selectedDevotion?.properties?.VerseReference) || "";
  const content = selectedDevotion?.properties?.Devotion?.rich_text?.map((r) => r.plain_text).join("") || "";
  const date = extractTitleText(selectedDevotion?.properties?.Date) || "";
  const handleShare = async () => {

    const dataUrl = await htmlToImage.toPng(cardRef.current);

    const blob = await (await fetch(dataUrl)).blob();

    const file = new File([blob], "bible-reading.png", { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {

      await navigator.share({ files: [file], title: "Bible Study" });

    }

  };
  if (loading) return <div className="flex h-screen items-center justify-center font-serif text-xl italic text-gray-500">Loading...</div>;

  return (
      <main className="min-h-screen bg-[#fdfbf7] p-4 md:p-12">
        <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-gray-900 tracking-tight">Self Bible Study</h1>
            <p className="text-gray-500 font-serif italic">&quot;Thy word is a lamp unto my feet&quot;</p>
          </div>

          <div className="flex items-center gap-0 mt-6 md:mt-0 bg-white shadow-md border-2 border-gray-400 rounded-lg overflow-hidden">
            {/* Book Selector - High Contrast Dark Mode Style */}
            <div className="relative flex items-center bg-blue-900">
              <select
                  className="appearance-none bg-transparent text-white font-serif py-2 pl-4 pr-10 outline-none font-black cursor-pointer hover:bg-gray-800 transition-colors"
                  value={selectedBook || ""}
                  onChange={handleBookChange}
              >
                {uniqueBooks.map(b => (
                    <option key={b} value={b} className="text-black bg-white">{b}</option>
                ))}
              </select>
              {/* Custom Arrow for visibility */}
              <div className="pointer-events-none absolute right-3 text-white text-xs">▼</div>
            </div>

            {/* Chapter Selector - Bright Contrast */}
            <div className="relative flex items-center bg-white">
              <select
                  className="appearance-none bg-transparent text-slate-900 font-serif py-2 pl-4 pr-10 outline-none font-bold cursor-pointer hover:bg-gray-50 transition-colors"
                  value={selectedChapter || ""}
                  onChange={handleChapterChange}
              >
                {uniqueChapterNumbers.map(c => (
                    <option key={c} value={c} className="text-black bg-white">Chapter {c}</option>
                ))}
              </select>
              {/* Custom Arrow for visibility */}
              <div className="pointer-events-none absolute right-3 text-slate-500 text-xs">▼</div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-start">
          <aside className="w-full lg:w-5/12 lg:sticky lg:top-8">
            <div className="border-t-4 border-blue-900 bg-white p-2 shadow-sm">
              <ScriptureViewer book={selectedBook} chapter={selectedChapter} markedVerse={markedVerse} />
            </div>
          </aside>

          <article className="w-full lg:w-7/12">
            <div ref={cardRef}>
              {/* The title and content now update because selectedId updates */}
              <DevotionCard title={`${chapterText} ${verse}`} content={content} date={date} />
            </div>
            <button onClick={handleShare} className="mt-4 px-6 py-2 border border-blue-900 text-blue-900 font-serif hover:bg-blue-900 hover:text-white transition-all uppercase text-sm tracking-widest">
              Export as Image
            </button>
          </article>
        </div>
      </main>
  );
}