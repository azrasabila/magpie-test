import { Flex, Box } from "@radix-ui/themes";
import MostBorrowedBook from "./dashboard/$element/mostBorrowedBook";
import CategoryDistribution from "./dashboard/$element/categoryDistribution";

export default function Dashboard() {
  return (
    <Flex gap="3">
      <Box>
        <MostBorrowedBook />
      </Box>
      <Box>
        <CategoryDistribution />
      </Box>
    </Flex>
  );
}
