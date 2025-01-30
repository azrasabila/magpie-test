"use client";

import { useQuery } from "@tanstack/react-query";
import { Box, Card, Flex, Heading, Text } from "@radix-ui/themes";
import fetchMostBorrowedBook from "@/app/api/getMostBorrowedBook";

export default function MostBorrowedBook() {

    const { data, isLoading, isError } = useQuery({
        queryKey: ["most-borrowed"],
        queryFn: async () => await fetchMostBorrowedBook(),
    });

    if (isLoading)
        return <Text className="text-center mt-4">Loading data...</Text>;
    if (isError)
        return <Text className="text-center text-red-500 mt-4">Failed to load data.</Text>;

    return (
        <Box className="p-6">
            <Text size="6" weight="bold" className="mb-4">
                Most Borrowed Book
            </Text>

            {data ?
                data.map((book) => {
                    return (
                            <Card>
                                <Flex gap="3" align="center">
                                    <Heading size="1">{book.borrowCount}</Heading>
                                    <Box>
                                        <Text as="div" size="2" weight="bold">
                                            {book.bookTitle}
                                        </Text>
                                        <Text as="div" size="2" color="gray">
                                            {book.bookAuthor}
                                        </Text>
                                    </Box>

                                </Flex>
                            </Card>
                    )
                }) : null}
        </Box>
    );
}
