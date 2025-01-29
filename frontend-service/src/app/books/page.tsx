"use client"
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface I_Book {
  id: number;
  title: string;
  author: string;
}

export default function BooksPage() {

const { data, isLoading, error } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
        const res = await axios.get<I_Book[]>('/books');
        return res.data;
    }
})

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Something went wrong!</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Books</h1>
      {data && data.length > 0 ? (
        <ul>
          {data.map((book) => (
            <li key={book.id}>
              <strong>{book.title}</strong> by {book.author}
            </li>
          ))}
        </ul>
      ) : (
        <p>No books found.</p>
      )}
    </div>
  );
}
