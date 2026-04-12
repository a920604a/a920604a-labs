// components/TopBar.jsx
import React from "react";
import { Flex, Button } from "@chakra-ui/react";
import LogoutButton from "./LogoutButton";

const TopBar = ({ 
  backButtonText = "返回儀表板", 
  onBackClick = () => {} 
}) => {
  return (
    <Flex
      as="header"
      justify="space-between"
      align="center"
      padding="1rem 2rem"
      bg="gray.100"
      boxShadow="md"
    >
      <Button colorScheme="blue" onClick={onBackClick}>
        {backButtonText}
      </Button>
      <LogoutButton />
    </Flex>
  );
};

export default TopBar;
