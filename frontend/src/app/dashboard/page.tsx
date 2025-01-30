import { Flex, Box } from "@radix-ui/themes";
import MostBorrowedBook from "./$element/mostBorrowedBook";

export default async function Dashboard() {
  return (
    <Flex gap="3">
      <Box width="64px" height="64px">
        <MostBorrowedBook />
      </Box>
    </Flex>

  );
}
