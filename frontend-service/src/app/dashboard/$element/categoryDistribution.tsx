"use client";

import { useQuery } from "@tanstack/react-query";
import { Box, Text } from "@radix-ui/themes";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import fetchCategoryDistribution from "@/app/api/getCategoryDistribution";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryDistribution() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["category-distribution"],
        queryFn: async () => await fetchCategoryDistribution(),
    });

    if (isLoading) return <Text className="text-center mt-4">Loading data...</Text>;
    if (isError) return <Text className="text-center text-red-500 mt-4">Failed to load data.</Text>;

    const chartData = {
        labels: data?.map((item) => item.categoryName),
        datasets: [
            {
                label: "Book Count",
                data: data?.map((item) => item.bookCount),
                backgroundColor: [
                    "#ff6384",
                    "#36a2eb",
                    "#ffce56",
                    "#4bc0c0",
                    "#9966ff",
                ],
                hoverOffset: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: "bottom" as const,
            },
            tooltip: {
                enabled: true,
            },
        },
    };

    return (
        <Box className="p-6">
            <Text size="6" weight="bold" className="mb-4">
                Category Distribution
            </Text>
            <Pie data={chartData} options={options} />
        </Box>
    );
}
