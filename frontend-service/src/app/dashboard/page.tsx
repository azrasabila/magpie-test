import { Flex, Box } from "@radix-ui/themes";
import CategoryDistribution from "./$element/categoryDistribution";
import MonthlyTrend from "./$element/monthlyTrend";
import MostBorrowedBook from "./$element/mostBorrowedBook";

export default async function Dashboard() {
  return (
    <Flex direction="column" gap="4">
      <Flex gap="4">
        <Box>
          <MostBorrowedBook />
        </Box>
        <Box>
          <CategoryDistribution />
        </Box>
      </Flex>

      <Box>
        <MonthlyTrend />
      </Box>
    </Flex>
  );
}
