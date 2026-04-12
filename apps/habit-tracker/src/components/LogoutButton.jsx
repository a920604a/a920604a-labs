import React from "react";
import { Button } from "@chakra-ui/react";
import { useAuth } from "@a920604a/auth";

const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <Button onClick={logout} colorScheme="red" variant="outline">
      登出
    </Button>
  );
};

export default LogoutButton;
