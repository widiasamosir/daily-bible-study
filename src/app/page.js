"use client";

import { useEffect, useState } from "react";
import DevotionCard from "../components/DevotionCard";

export default function Home() {
  const [devotions, setDevotions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const fetchDevotions = async () => {
      try {
        const res = await fetch("/api/devotion");
        const data = await res.json();

        if (Array.isArray(data.results)) {
          setDevotions(data.results);
          console.log(data.results);
          setSelectedId(data.results[0]?.id); // pick first devotion by default
        } else {
          setDevotions([]);
        }
      } catch (err) {
        console.error("Error fetching devotions:", err);
      }
    };

    fetchDevotions();
  }, []);

  if (!devotions.length)
    return <div className="text-center p-8">No devotion available</div>;

  const selected = devotions.find((d) => d.id === selectedId);

  const chapter =
      selected?.properties?.Chapter?.rich_text?.[0]?.plain_text || "Untitled";

  const content =
      selected?.properties?.Devotion?.rich_text
          ?.map((r) => r.plain_text)
          .join("") || "No content";

  const date =
      selected?.properties?.Date?.title?.[0]?.plain_text || "Unknown date";

  return (
      <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">안녕하세요!!!!</h1>
          <p className="text-lg text-gray-700">
            Welcome to Daily Bible Study Tracker
          </p>
        </div>
        <select
            className="p-2 border rounded-md"
            value={selectedId || ""}
            onChange={(e) => setSelectedId(e.target.value)}
        >
          {devotions.map((d) => {
            const ch =
                d.properties?.Chapter?.rich_text?.[0]?.plain_text || "Untitled";
            return (
                <option key={d.id} value={d.id}>
                  {ch}
                </option>
            );
          })}
        </select>

        {/* Devotion Card */}
        <DevotionCard title={chapter} content={content} date={date} />
      </main>
  );
}
