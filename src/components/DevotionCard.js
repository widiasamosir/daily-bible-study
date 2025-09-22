export default function DevotionCard({ title, content, date }) {
    return (
        <div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-6 my-4 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-sm text-gray-500 mb-4">{date}</p>
            <p className="text-gray-700 leading-relaxed">{content}</p>
        </div>
    );
}
