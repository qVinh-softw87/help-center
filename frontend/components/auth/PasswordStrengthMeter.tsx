import React from 'react';
import { cn } from "../../lib/utils";

interface PasswordStrengthMeterProps {
  password?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password = "" }) => {
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.match(/[A-Z]/)) score += 1;
    if (pwd.match(/[0-9]/)) score += 1;
    if (pwd.match(/[^A-Za-z0-9]/)) score += 1;
    return score;
  };

  const score = calculateStrength(password);
  
  let strengthLabel = "Rất yếu";
  let color = "bg-red-500";
  let width = "w-1/4";

  if (score === 0) {
    strengthLabel = "Vui lòng nhập mật khẩu";
    color = "bg-slate-200 dark:bg-slate-700";
    width = "w-0";
  } else if (score === 1) {
    strengthLabel = "Yếu";
    color = "bg-red-500";
    width = "w-1/4";
  } else if (score === 2) {
    strengthLabel = "Trung bình";
    color = "bg-yellow-500";
    width = "w-2/4";
  } else if (score === 3) {
    strengthLabel = "Khá";
    color = "bg-blue-500";
    width = "w-3/4";
  } else if (score >= 4) {
    strengthLabel = "Mạnh";
    color = "bg-green-500";
    width = "w-full";
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>Độ mạnh mật khẩu</span>
        <span className={cn(
          "transition-colors",
          score >= 4 ? "text-green-500" : score >= 2 ? "text-yellow-600 dark:text-yellow-500" : "text-red-500"
        )}>{password ? strengthLabel : ''}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={cn("h-full transition-all duration-300 ease-in-out", color, width)}
        />
      </div>
    </div>
  );
};
