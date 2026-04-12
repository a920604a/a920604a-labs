// components/AchievementBadge.js
import React from 'react';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Text,
} from '@chakra-ui/react';

function AchievementBadge({ isOpen, onClose, achievement }) {
    return (
        <AlertDialog isOpen={isOpen} leastDestructiveRef={undefined} onClose={onClose}>
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        🎉 成就達成！
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        <Text>{achievement}</Text>
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button colorScheme="blue" onClick={onClose}>
                            太棒了！
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
}

export default AchievementBadge;
