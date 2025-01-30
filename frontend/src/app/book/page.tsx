"use client";

import { useState } from "react";
import { useBooks } from "./$action/getBookList";

export default function BookListPage() {
    const [page, setPage] = useState(1);
    const { data, isLoading, error } = useBooks({ page, pageSize: 2 });

    if (isLoading) return <p>Loading books...</p>;
    if (error) return <p>Error loading books: {error.message}</p>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Book List</h1>
            <ul className="mt-4 space-y-2">
                {data ? data.data?.map((book) => (
                    <li key={book.id} className="p-4 border rounded shadow">
                        <h2 className="text-lg font-semibold">{book.title}</h2>
                        <p>Author: {book.author}</p>
                        <p>ISBN: {book.isbn}</p>
                        <p>Published: {book.category.name}</p>
                        {book.bookStatus ? <p>Quantity: {book.bookStatus.availableQty}</p> : null}
                    </li>
                )) : null}
            </ul>
            <div className="mt-4">
                <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                    className="px-4 py-2 mr-2 bg-gray-300 rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    onClick={() => setPage((prev) => prev + 1)}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    disabled={data?.pagination.totalPages === data?.pagination.currentPage}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
