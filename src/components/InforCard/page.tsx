interface InfoCardProps {
  label: string;
  value: string;
}

export default function InfoCard({ label, value }: InfoCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 group">
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <p className="text-white text-2xl font-bold group-hover:text-purple-400 transition-colors">
        {value}
      </p>
    </div>
  );
}