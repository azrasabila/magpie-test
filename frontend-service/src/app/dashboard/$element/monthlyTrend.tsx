"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Box, Text } from "@radix-ui/themes";
import Chart from "chart.js/auto";
import fetchMonthlyTrend from "@/app/api/getMonthlyTrend";

export default function MonthlyTrend() {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart<"line", number[], string> | null>(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["monthly-trend"],
        queryFn: async () => await fetchMonthlyTrend(),
    });

    useEffect(() => {
        if (!data || !chartRef.current) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        chartInstanceRef.current = new Chart(chartRef.current, {
            type: "line",
            data: {
                labels: data.map((item) => item.month),
                datasets: [
                    {
                        label: "Books Borrowed",
                        data: data.map((item) => item.count),
                        borderColor: "#007bff",
                        backgroundColor: "rgba(0, 123, 255, 0.5)",
                        borderWidth: 2,
                        tension: 0.3,
                        pointRadius: 5,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                    },
                    tooltip: {
                        enabled: true,
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Month",
                        },
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Books Borrowed",
                        },
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
                Monthly Trend of Books Borrowed
            </Text>
            <canvas ref={chartRef}></canvas>
        </Box>
    );
}
