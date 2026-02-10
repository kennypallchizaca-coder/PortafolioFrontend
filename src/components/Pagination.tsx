
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    if (totalPages <= 1) return null

    return (
        <div className="flex justify-center mt-8">
            <div className="join">
                <button
                    className="join-item btn btn-outline"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <FiChevronLeft />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        className={`join-item btn ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}

                <button
                    className="join-item btn btn-outline"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <FiChevronRight />
                </button>
            </div>
        </div>
    )
}

export default Pagination
