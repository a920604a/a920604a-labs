import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  VStack,
  RadioGroup,
  Radio,
  HStack,
  FormControl,
  FormLabel,
  Box,
  Icon,
  Badge,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { FiCalendar, FiBold, FiItalic, FiLink, FiX } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';

const possibleTags = ['工作', '學習', '個人', '其他'];

const tagColorMap = {
  工作: 'red',
  學習: 'green',
  個人: 'blue',
  其他: 'gray',
};

export default function TodoForm({
  onAdd,
  initialValues,
  onUpdate,
  onCancel,
  tags = possibleTags,
  readOnly = false,
}) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [content, setContent] = useState(initialValues?.content || '');
  const [tag, setTag] = useState(initialValues?.tag || tags[0]);
  const [deadline, setDeadline] = useState(
    initialValues?.deadline
      ? new Date(initialValues.deadline).toISOString().slice(0, 10)
      : ''
  );

  const [linkUrl, setLinkUrl] = useState('');
  const [isLinkOpen, setIsLinkOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        linkOnPaste: false,
        autolink: false,
      }),
    ],
    content: content || '',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  const handleSubmit = () => {
    if (readOnly || !title.trim()) return;

    const todoData = {
      id: initialValues?.id || uuidv4(),
      title,
      content,
      tag,
      complete: initialValues?.complete || false,
      created_at: initialValues?.created_at ? new Date(initialValues.created_at) : new Date(),
      updated_at: new Date(),
      deadline:
        deadline && !isNaN(new Date(deadline))
          ? new Date(deadline)
          : new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
    };

    if (onAdd && !initialValues) {
      onAdd(todoData);
      setTitle('');
      setContent('');
      setTag(tags[0]);
      setDeadline('');
      editor.commands.clearContent();
    }

    if (onUpdate && initialValues) {
      onUpdate(todoData);
    }
  };

  const insertLink = () => {
    if (!linkUrl) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setIsLinkOpen(false);
    setLinkUrl('');
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      p={6}
      borderRadius="xl"
      boxShadow="md"
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      transition="all 0.3s"
    >
      {readOnly && (
        <Badge colorScheme="yellow" mb={2}>
          檢視模式
        </Badge>
      )}

      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>標題</FormLabel>
          <Input
            placeholder="輸入標題"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            isReadOnly={readOnly}
          />
        </FormControl>

        <FormControl>
          <FormLabel>內容</FormLabel>

          {/* Toolbar */}
          {!readOnly && (
            <HStack spacing={2} mb={2}>
              <Button
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                colorScheme={editor?.isActive('bold') ? 'teal' : 'gray'}
                aria-label="粗體"
              >
                <FiBold />
              </Button>
              <Button
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                colorScheme={editor?.isActive('italic') ? 'teal' : 'gray'}
                aria-label="斜體"
              >
                <FiItalic />
              </Button>

              <Popover
                isOpen={isLinkOpen}
                onClose={() => setIsLinkOpen(false)}
                placement="bottom-start"
                closeOnBlur={true}
              >
                <PopoverTrigger>
                  <Button
                    size="sm"
                    onClick={() => {
                      const previousUrl = editor?.getAttributes('link').href || '';
                      setLinkUrl(previousUrl);
                      setIsLinkOpen(!isLinkOpen);
                    }}
                    colorScheme={editor?.isActive('link') ? 'teal' : 'gray'}
                    aria-label="超連結"
                  >
                    <FiLink />
                  </Button>
                </PopoverTrigger>
                <PopoverContent w="auto" p={3}>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverBody>
                    <InputGroup>
                      <Input
                        placeholder="輸入連結 URL"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        size="sm"
                      />
                      <InputRightElement>
                        <Button
                          size="sm"
                          onClick={() => {
                            setLinkUrl('');
                          }}
                          aria-label="清除連結"
                        >
                          <FiX />
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <Button
                      size="sm"
                      mt={2}
                      colorScheme="teal"
                      w="full"
                      onClick={insertLink}
                    >
                      確定
                    </Button>
                  </PopoverBody>
                </PopoverContent>
              </Popover>

              {/* 文字顏色選擇 */}
              <ColorPicker editor={editor} readOnly={readOnly} />
            </HStack>
          )}

          <Box
            border="1px solid"
            borderColor="gray.300"
            borderRadius="md"
            minH="100px"
            maxH="300px"
            overflowY="auto"
            p={3}
            bg={readOnly ? 'gray.50' : 'white'}
          >
            <EditorContent editor={editor} />
          </Box>
        </FormControl>

        <FormControl>
          <FormLabel>分類標籤</FormLabel>
          <RadioGroup value={tag} onChange={readOnly ? undefined : setTag}>
            <HStack spacing={4}>
              {tags.map((t) => (
                <Radio
                  key={t}
                  value={t}
                  colorScheme={tagColorMap[t]}
                  isDisabled={readOnly}
                >
                  {t}
                </Radio>
              ))}
            </HStack>
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel>
            <HStack spacing={2}>
              <Icon as={FiCalendar} />
              <span>截止日期</span>
            </HStack>
          </FormLabel>
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            isReadOnly={readOnly}
            pointerEvents={readOnly ? 'none' : 'auto'}
          />
        </FormControl>

        {!readOnly && (
          <HStack justify="flex-end" pt={2}>
            {onUpdate && initialValues ? (
              <>
                <Button colorScheme="blue" onClick={handleSubmit}>
                  更新
                </Button>
                <Button variant="outline" onClick={onCancel}>
                  取消
                </Button>
              </>
            ) : (
              <Button colorScheme="teal" onClick={handleSubmit}>
                新增
              </Button>
            )}
          </HStack>
        )}
      </VStack>
    </Box>
  );
}

function ColorPicker({ editor, readOnly }) {
  const colors = ['#000000', '#FF0000', '#00AA00', '#0000FF', '#FFA500', '#800080'];

  if (readOnly) return null;

  return (
    <HStack spacing={1}>
      {colors.map((color) => (
        <Button
          key={color}
          size="sm"
          minW="24px"
          h="24px"
          p={0}
          borderRadius="full"
          bg={color}
          _hover={{ opacity: 0.8 }}
          aria-label={`文字顏色 ${color}`}
          onClick={() => {
            editor.chain().focus().setColor(color).run();
          }}
        />
      ))}
      <Button
        size="sm"
        aria-label="清除顏色"
        onClick={() => {
          editor.chain().focus().unsetColor().run();
        }}
      >
        X
      </Button>
    </HStack>
  );
}
