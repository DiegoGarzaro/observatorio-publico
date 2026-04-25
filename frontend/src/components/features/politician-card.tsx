import Link from "next/link"
import { Avatar, Badge, Card } from "@/components/ui"
import type { PoliticianListItem } from "@/types"

interface PoliticianCardProps {
  politician: PoliticianListItem
}

export function PoliticianCard({ politician }: PoliticianCardProps) {
  return (
    <Link href={`/politicians/${politician.id}`} className="block group">
      <Card hover className="flex items-center gap-4 cursor-pointer">
        <Avatar
          src={politician.photo_url}
          name={politician.name}
          size="lg"
          className="shrink-0"
        />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
            {politician.name}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {politician.party && (
              <Badge variant="accent">{politician.party}</Badge>
            )}
            {politician.municipality ? (
              <Badge variant="default">{politician.municipality} · {politician.uf}</Badge>
            ) : politician.uf && (
              <Badge variant="default">{politician.uf}</Badge>
            )}
          </div>
        </div>

        <span className="text-text-muted group-hover:text-accent transition-colors shrink-0">
          →
        </span>
      </Card>
    </Link>
  )
}
