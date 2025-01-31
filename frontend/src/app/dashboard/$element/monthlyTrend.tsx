"use client";

import { useQuery } from "@tanstack/react-query";
import { Box, Text } from "@radix-ui/themes";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions } from "chart.js";
import fetchMonthlyTrend from "@/app/api/getMonthlyTrend";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function MonthlyTrend() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["monthly-trend"],
        queryFn: async () => await fetchMonthlyTrend(),
    });

    if (isLoading) return <Text className="text-center mt-4">Loading data...</Text>;
    if (isError) return <Text className="text-center text-red-500 mt-4">Failed to load data.</Text>;

    // Prepare chart data
    const chartData = {
        labels: data?.map((item) => item.month), // X-axis labels
        datasets: [
            {
                label: "Books Borrowed",
                data: data?.map((item) => item.count), // Y-axis values
                borderColor: "#007bff",
                backgroundColor: "rgba(0, 123, 255, 0.5)",
                tension: 0.3, // Smooth line
            },
        ],
    };

    const chartOptions: ChartOptions<"line"> = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: "top" as const, // Ensure type safety
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
    };

    return (
        <Box className="p-6">
            <Text size="6" weight="bold" className="mb-4">
                Monthly Trend of Books Borrowed
            </Text>
            <Line data={chartData} options={chartOptions} />
        </Box>
    );
}
