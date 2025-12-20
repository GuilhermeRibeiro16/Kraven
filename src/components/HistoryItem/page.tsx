import { CheckCircle, Clock } from "lucide-react";

interface HistoryItemProps {
  value: string;
  date: string;
  status?: "pago" | "pendente";
}

export default function HistoryItem({ value, date, status = "pago" }: HistoryItemProps) {
  const isPago = status === "pago";

  return (
    <li className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/5">
      <div className="flex items-center gap-3">
        {isPago ? (
          <CheckCircle className="w-5 h-5 text-green-400" />
        ) : (
          <Clock className="w-5 h-5 text-yellow-400" />
        )}
        <div>
          <p className="text-white font-medium">{value}</p>
          <p className="text-gray-400 text-sm">{date}</p>
        </div>
      </div>
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          isPago
            ? "bg-green-500/20 text-green-400"
            : "bg-yellow-500/20 text-yellow-400"
        }`}
      >
        {isPago ? "Pago" : "Pendente"}
      </span>
    </li>
  );
}