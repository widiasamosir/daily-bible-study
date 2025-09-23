import {FaSnowflake, FaGift, FaHeart, FaBook} from "react-icons/fa";

const getCardStyle = () => {
    const type = process.env.NEXT_PUBLIC_TYPE_BORDER || "plain";

    switch (type) {
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
                container: "max-w-md mx-auto bg-pink-50 p-6 my-4 border-4 border-pink-300 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 relative",
                title: "text-xl font-bold text-pink-700 mb-2 flex items-center gap-2",
                date: "text-sm text-pink-500 mb-4",
                content: "text-gray-700 leading-relaxed",
                icon: <FaHeart className="text-pink-500 animate-pulse" />,
            };
        case "old-testament":
            return {
                container: "max-w-md mx-auto bg-yellow-50 p-6 my-4 border-4 border-yellow-400 rounded-2xl shadow-lg relative",
                title: "text-xl font-bold text-yellow-800 mb-2 flex items-center gap-2",
                date: "text-sm text-yellow-700 mb-4",
                content: "text-gray-800 leading-relaxed",
                icon: <FaBook className="text-yellow-600" />,
            };

        case "new-testament":
            return {
                container: "max-w-md mx-auto bg-blue-50 p-6 my-4 border-4 border-blue-400 rounded-2xl shadow-lg relative",
                title: "text-xl font-bold text-blue-800 mb-2 flex items-center gap-2",
                date: "text-sm text-blue-700 mb-4",
                content: "text-gray-800 leading-relaxed",
                icon: <FaBook className="text-blue-600" />,
            };
        case "plain":
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
    const styles = getCardStyle();

    return (
        <div className={styles.container}>
            {/* Icon next to title */}
            <h2 className={styles.title}>
                {styles.icon}
                {title}
            </h2>
            <p className={styles.date}>{date}</p>
            <p className={styles.content}>{content}</p>

            {/* Optional: small corner decoration */}
            {process.env.NEXT_PUBLIC_TYPE_BORDER === "christmas" && (
                <div className="absolute top-2 right-2 text-green-500 text-xl">🎄</div>
            )}
            {process.env.NEXT_PUBLIC_TYPE_BORDER === "cute" && (
                <div className="absolute top-2 right-2 text-pink-400 text-xl">💖</div>
            )}

            {/* Footnote */}
            <p className="mt-4 text-right text-xs text-gray-400">- W.A.S</p>
        </div>
    );
}
