"use client";

import { useEffect, useState, useRef } from "react";
import DevotionCard from "../components/DevotionCard";
import * as htmlToImage from "html-to-image";

export default function Home() {
  const [devotions, setDevotions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const cardRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchDevotion = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/devotion");
        const data = await res.json();

        if (Array.isArray(data.results)) {
          setDevotions(data.results);
          setSelectedId(data.results[0]?.id); // default first devotion
          setIsLoading(false);
        } else {
          setDevotions([]);
        }
      } catch (err) {
        setDevotions([]);
      }
    };

    fetchDevotion();
  }, []);

  if (!devotions.length && !isLoading) {
    return <div className="text-center p-8">No devotion available</div>;
  }

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          {/* Spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>

          {/* Message */}
          <p className="text-gray-700 text-lg">Please Waiting ..... </p>
        </div>
    );
  }




  const selectedDevotion = devotions.find((d) => d.id === selectedId);

  const chapter =
      selectedDevotion?.properties?.Chapter?.rich_text?.[0]?.plain_text ||
      "Untitled";

  const content =
      selectedDevotion?.properties?.Devotion?.rich_text
          ?.map((r) => r.plain_text)
          .join("") || "No content";

  const date =
      selectedDevotion?.properties?.Date?.title?.[0]?.plain_text ||
      "Unknown date";

  const handleShare = async () => {
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "devotion.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Daily Devotion",
          text: "Hi all!! Check out today’s devotion 🙏 (https://daily-bible-study.vercel.app/)",
        });
      } else {
        // fallback to WhatsApp Web (just text)
        window.open(
            `https://wa.me/?text=${encodeURIComponent(
                `📖 ${chapter} (${date})\n\n${content}`
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
        {/* Title Section */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">안녕하세요!!!!</h1>
          <p className="text-lg text-gray-700">
            Welcome to Daily Bible Study Tracker
          </p>
        </div>

        {/* Scripture picker */}
        <select
            className="p-2 border rounded"
            value={selectedId || ""}
            onChange={(e) => setSelectedId(e.target.value)}
        >
          {devotions.map((d) => {
            const label =
                d.properties?.Chapter?.rich_text?.[0]?.plain_text || "Untitled";
            return (
                <option key={d.id} value={d.id}>
                  {label}
                </option>
            );
          })}
        </select>

        {/* Devotion card with ref */}
        <div ref={cardRef}>
          <DevotionCard title={chapter} content={content} date={date} />
        </div>

        {/* Share button */}
        <button
            onClick={handleShare}
            className="px-4 py-2 bg-gray-500 text-white rounded-full shadow hover:bg-gray-600"
        >
          📤 Share
        </button>
      </main>
  );
}
