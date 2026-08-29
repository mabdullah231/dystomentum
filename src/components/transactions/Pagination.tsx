
interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  isLightTheme: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  isLightTheme,
}: PaginationProps) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)

  const buttonClass = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-sm transition ${active
      ? (isLightTheme ? 'bg-[#18181B] text-white' : 'bg-white text-[#18181B]')
      : (isLightTheme ? 'text-[#52525B] hover:bg-[#E4E4E7]' : 'text-[#A1A1AA] hover:bg-[#1E1E24]')
    }`

  return (
    <div className={`flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${isLightTheme ? 'border-[#E4E4E7] bg-[#F8F8F9]' : 'border-[#27272A] bg-[#101014]'}`}>
      <span className={`text-sm ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>
        Showing {start}-{end} of {totalItems} transactions
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={buttonClass(false)}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            type="button"
            className={buttonClass(page === currentPage)}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          className={buttonClass(false)}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}