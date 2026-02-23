import { StatusBadge } from '@/components/shared/status-badge'

interface CoverData {
    id: string
    title: string
    variation?: string | null
    status: string
    date: string
    img: string
}

interface CoverCardProps {
    cover: CoverData
}

export const CoverCard = ({ cover }: CoverCardProps) => {
    return (
        <div className="flex items-start gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="w-20 h-20 shrink-0 bg-gray-50 rounded overflow-hidden border border-gray-100">
                <img
                    src={cover?.img}
                    alt={cover?.title}
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.background = '#f3f4f6' }}
                />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 leading-snug mb-1 line-clamp-2">{cover?.title}</p>
                <p className="text-xs text-gray-500 mb-1">Cover {cover?.id}</p>
                {cover.variation && (
                    <p className="text-xs text-gray-500 mb-2">
                        Variation: <span className="font-medium">{cover?.variation}</span>
                    </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={cover.status.toLowerCase()} />
                    <span className="text-xs text-gray-500">{cover?.date}</span>
                </div>
            </div>
            <button className="text-sm text-red-500 hover:text-red-600 font-medium whitespace-nowrap shrink-0 transition-colors">
                See details
            </button>
        </div>
    )
}
