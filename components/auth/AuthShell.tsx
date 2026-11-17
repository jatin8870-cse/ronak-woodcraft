import { Check } from "lucide-react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface AuthShellProps {
  badge: string;
  BadgeIcon: LucideIcon;
  side: {
    title: string;
    text: string;
  };
  points: string[];
  children: ReactNode;
}

export default function AuthShell({
  badge,
  BadgeIcon,
  side,
  points,
  children,
}: AuthShellProps) {
  return (
    <div className="wrap auth-page">
      <div className="auth">
        <aside className="auth-side">
          <div>
            <span className="auth-badge">
              <BadgeIcon size={15} />
              {badge}
            </span>

            <h2>{side.title}</h2>
            <p>{side.text}</p>
          </div>

          <ul>
            {points.map((p) => (
              <li key={p}>
                <i>
                  <Check size={16} />
                </i>
                {p}
              </li>
            ))}
          </ul>
        </aside>

        <div className="auth-main">
          {children}
        </div>
      </div>
    </div>
  );
}
