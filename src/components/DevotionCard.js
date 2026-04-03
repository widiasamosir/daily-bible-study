"use client";
import { FaQuoteLeft, FaBook, FaHeart, FaSnowflake, FaGift } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

const getCardStyle = () => {
    const type = process.env.NEXT_PUBLIC_TYPE_BORDER || "commentary";

    switch (type) {
        case "commentary":
            return {
                container: "w-full bg-white p-8 mb-6 border-l-4 border-blue-900 shadow-sm relative text-left font-serif",
                title: "text-3xl font-bold text-blue-900 mb-2 flex items-center gap-3",
                date: "text-xs uppercase tracking-widest text-gray-400 mb-6 font-sans",
                content: "text-gray-800 leading-relaxed prose prose-blue max-w-none",
                icon: <FaQuoteLeft className="text-blue-900 opacity-20" />,
            };
        case "christmas":
            return {
                container: "max-w-md mx-auto bg-red-50 p-6 my-4 border-4 border-green-500 rounded-3xl shadow-lg relative",
                title: "text-2xl font-extrabold text-red-700 mb-2 flex items-center gap-2",
                date: "text-sm text-green-700 mb-4",
                content: "text-gray-800 leading-relaxed",
                icon: <FaSnowflake className="text-blue-400" />,
            };
        case "cute":
            return {
                container: "max-w-md mx-auto bg-pink-50 p-6 my-4 border-4 border-pink-300 rounded-2xl shadow-xl relative",
                title: "text-xl font-bold text-pink-700 mb-2 flex items-center gap-2",
                date: "text-sm text-pink-500 mb-4",
                content: "text-gray-700 leading-relaxed",
                icon: <FaHeart className="text-pink-500 animate-pulse" />,
            };
        default:
            return {
                container: "max-w-md mx-auto bg-white p-6 my-4 border border-gray-200 rounded-lg shadow relative",
                title: "text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2",
                date: "text-sm text-gray-500 mb-4",
                content: "text-gray-700 leading-relaxed",
                icon: <FaGift className="text-gray-400" />,
            };
    }
};

export default function DevotionCard({ title, content, date }) {
    return (
        <div className="w-full bg-white p-4 md:p-10 mb-6 border-l-8 border-blue-900 shadow-sm font-serif">
            <div className="mb-6">
                <h2 className="text-4xl font-bold text-blue-900 flex items-center gap-4 mb-2">
                    <FaQuoteLeft className="text-blue-900 opacity-10 text-2xl" />
                    {title}
                </h2>
                <div className="flex items-center gap-4 text-gray-400 font-sans text-xs uppercase tracking-widest">
                    <span>{date}</span>
                    <span className="h-px flex-1 bg-gray-100"></span>
                    <span>Daily Bible Reading</span>
                </div>
            </div>

            {/* The actual Devotion Content rendered as Markdown */}
            <div className="prose prose-blue prose-lg max-w-none text-gray-800 leading-relaxed">
                <ReactMarkdown>
                    {content}
                </ReactMarkdown>
            </div>

            <div className="mt-12 pt-6 border-t border-gray-50 text-right">
                <p className="text-xs italic text-gray-400 font-sans tracking-tighter">
                   — W.A.S
                </p>
            </div>
        </div>
    );
}