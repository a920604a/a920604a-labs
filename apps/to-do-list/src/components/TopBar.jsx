// components/TopBar.jsx
import React from "react";
import {
  Heading, Flex
} from '@chakra-ui/react';
import LogoutButton from "./LogoutButton";

const TopBar = () => {
  return (
    <Flex
      as="header"
      justify="space-between"
      align="center"
      padding="1rem 2rem"
      bg="gray.100"
      boxShadow="md"
    >
      <Heading mb={2}>代辦清單</Heading>
    
      <LogoutButton />

    </Flex>
  );
};

export default TopBar;
