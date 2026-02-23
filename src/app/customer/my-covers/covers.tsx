import React from 'react'

const Badge = ({ children, variant = 'default' }) => {
    const styles = {
        delivered: 'bg-green-100 text-green-700 border border-green-200',
        default: 'bg-gray-100 text-gray-700 border border-gray-200',
    }
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide ${styles[variant] || styles.default}`}>
            {children}
        </span>
    )
}

export const MyCovers = ({ cover }) => {
    return (
        <div className="flex items-start gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="w-20 h-20 shrink-0 bg-gray-50 rounded overflow-hidden border border-gray-100">
                <img
                    src={cover.img}
                    alt={cover.title}
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.style.background = '#f3f4f6' }}
                />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 leading-snug mb-1 line-clamp-2">{cover.title}</p>
                <p className="text-xs text-gray-500 mb-1">Cover {cover.id}</p>
                {cover.variation && (
                    <p className="text-xs text-gray-500 mb-2">
                        Variation: <span className="font-medium">{cover.variation}</span>
                    </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                    <Badge variant="delivered">{cover.status}</Badge>
                    <span className="text-xs text-gray-500">{cover.date}</span>
                </div>
            </div>
            <button className="text-sm text-red-500 hover:text-red-600 font-medium whitespace-nowrap shrink-0 transition-colors">
                See details
            </button>
        </div>
    )
}
