import { Flex, Box } from "@radix-ui/themes";
import MostBorrowedBook from "./dashboard/$element/mostBorrowedBook";
import CategoryDistribution from "./dashboard/$element/categoryDistribution";
import MonthlyTrend from "./dashboard/$element/monthlyTrend";

export default function Dashboard() {
  return (
    <Flex direction="column" gap="4">
      <Flex gap="4">
        <Box flexGrow="1">
          <MostBorrowedBook />
        </Box>
        <Box flexGrow="1">
          <CategoryDistribution />
        </Box>
      </Flex>

      {/* Bottom Row - Full Width */}
      <Box>
        <MonthlyTrend />
      </Box>
    </Flex>
  );
}
