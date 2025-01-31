"use client";

import { useQuery } from "@tanstack/react-query";
import { Box, Text } from "@radix-ui/themes";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import fetchCategoryDistribution from "@/app/api/getCategoryDistribution";

export default function CategoryDistribution() {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["category-distribution"],
        queryFn: async () => await fetchCategoryDistribution(),
    });

    useEffect(() => {
        if (!data || !chartRef.current) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        chartInstanceRef.current = new Chart(chartRef.current, {
            type: "pie",
            data: {
                labels: data.map((item) => item.categoryName),
                datasets: [
                    {
                        label: "Book Count",
                        data: data.map((item) => parseInt(item.bookCount)),
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
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: "bottom",
                    },
                    tooltip: {
                        enabled: true,
                    },
                },
            },
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [data]);

    if (isLoading) return <Text className="text-center mt-4">Loading data...</Text>;
    if (isError) return <Text className="text-center text-red-500 mt-4">Failed to load data.</Text>;

    return (
        <Box className="p-6">
            <Text size="6" weight="bold" className="mb-4">
                Category Distribution
            </Text>
            <canvas ref={chartRef}></canvas>
        </Box>
    );
}
