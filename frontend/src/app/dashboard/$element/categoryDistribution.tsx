"use client";

import { useQuery } from "@tanstack/react-query";
import { Box, Card, Flex, Text } from "@radix-ui/themes";
import fetchCategoryDistribution from "@/app/api/getCategoryDistribution";

export default function CategoryDistribution() {

    const { data, isLoading, isError } = useQuery({
        queryKey: ["category-distribution"],
        queryFn: async () => await fetchCategoryDistribution(),
    });

    if (isLoading)
        return <Text className="text-center mt-4">Loading data...</Text>;
    if (isError)
        return <Text className="text-center text-red-500 mt-4">Failed to load data.</Text>;

    return (
        <Box className="p-6">
            <Text size="6" weight="bold" className="mb-4">
                Category Distribution
            </Text>

            {data ?
                data.map((book) => {
                    return (
                        <Card >
                            <Flex gap="3" align="center">
                                <Text as="div" size="2" weight="bold">
                                    {book.categoryName}
                                </Text>
                                <Text as="div" size="2" color="gray">
                                    {book.bookCount}
                                </Text>
                            </Flex>
                        </Card>
                    )
                }) : null}
        </Box>
    );
}
