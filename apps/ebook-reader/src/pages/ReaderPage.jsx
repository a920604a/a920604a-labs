import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Button, Center, Flex, Progress,
  Spinner, Text, useColorModeValue, useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";

import { getBookFile, getBooksFromAPI } from "../api/ebookApi";
import { getReadingProgress, saveReadingProgress } from "../components/BookManager";
import { useAuth } from "@a920604a/auth";
import { openDB } from "../components/IndexedDB";

// Worker URL must exactly match the pdfjs-dist version @react-pdf-viewer depends on.
// Run: node -e "console.log(require('@react-pdf-viewer/core/package.json').peerDependencies['pdfjs-dist'])"
// to verify when upgrading.
const PDFJS_WORKER_URL =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

// Try IndexedDB first (fast), fall back to API if not cached
async function getBookMeta(bookId, userId) {
  try {
    const db = await openDB();
    const result = await new Promise((resolve, reject) => {
      const tx = db.transaction(["books"], "readonly");
      const req = tx.objectStore("books").get(bookId);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = (e) => reject(e.target.error);
    });
    if (result) return result;
  } catch { /* fall through */ }

  // Fallback: fetch book list from API and find by id
  const books = await getBooksFromAPI(userId);
  return books.find((b) => b.id === bookId) ?? null;
}

export default function ReaderPage() {
  const { bookId } = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const toast      = useToast();

  const [bookMeta,     setBookMeta]     = useState(null);
  const [fileUrl,      setFileUrl]      = useState(null);   // blob URL
  const [pageNumber,   setPageNumber]   = useState(1);
  const [totalPages,   setTotalPages]   = useState(0);
  const [lastReadPage, setLastReadPage] = useState(null);
  const [loadingMeta,  setLoadingMeta]  = useState(true);
  const [loadingFile,  setLoadingFile]  = useState(true);
  const [error,        setError]        = useState(null);

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const bgColor    = useColorModeValue("gray.50",   "gray.900");
  const barBg      = useColorModeValue("white",     "gray.800");
  const borderCol  = useColorModeValue("gray.100",  "gray.700");
  const titleCol   = useColorModeValue("gray.900",  "gray.50");
  const subCol     = useColorModeValue("gray.500",  "gray.400");
  const progressBg = useColorModeValue("gray.100",  "gray.700");

  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const pageNavPluginInstance       = pageNavigationPlugin();
  const { jumpToPage }              = pageNavPluginInstance;

  const userId = user?.uid;

  // ── Load book meta + reading progress ────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoadingMeta(true);
      setError(null);
      try {
        const meta = await getBookMeta(bookId, userId);
        if (!meta) throw new Error("找不到書籍，請回書庫重新開啟");
        setBookMeta(meta);

        const progress = await getReadingProgress(bookId, userId);
        if (progress.page_number > 0) {
          setLastReadPage(progress.page_number);
          setPageNumber(progress.page_number);
        }
      } catch (err) {
        setError(err.message ?? "書籍資訊載入失敗");
      } finally {
        setLoadingMeta(false);
      }
    })();
  }, [bookId, userId]);

  // ── Fetch PDF binary from R2 via Worker ───────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    setLoadingFile(true);
    getBookFile(bookId)
      .then(setFileUrl)
      .catch((err) => setError(`PDF 下載失敗：${err.message}`))
      .finally(() => setLoadingFile(false));
  }, [bookId, userId]);

  // ── Revoke blob URL on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (fileUrl?.startsWith("blob:")) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handlePageChange = ({ currentPage }) => {
    const page = currentPage + 1;  // 0-based → 1-based
    setPageNumber(page);
    if (userId) saveReadingProgress(userId, bookId, page, totalPages);
  };

  const handleDocumentLoad = (e) => {
    const numPages = e.doc.numPages;
    setTotalPages(numPages);
    if (typeof jumpToPage === "function" && lastReadPage !== null) {
      jumpToPage(lastReadPage - 1);  // jumpToPage is 0-based
    }
  };

  const handleError = (err) => {
    console.error("PDF viewer error:", err);
    toast({ title: "PDF 顯示錯誤", description: String(err.message ?? err), status: "error", duration: 4000, isClosable: true });
  };

  const pct = totalPages > 0 ? Math.round((pageNumber / totalPages) * 100) : 0;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loadingMeta || loadingFile) {
    return (
      <Center minH="60vh" flexDirection="column" gap={4}>
        <Spinner size="lg" color="purple.400" thickness="3px" />
        <Text fontSize="sm" color={subCol}>
          {loadingFile ? "下載 PDF 中…" : "載入書籍資訊…"}
        </Text>
      </Center>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !fileUrl) {
    return (
      <Center minH="60vh" flexDirection="column" gap={4}>
        <Text color="red.400" fontSize="sm" textAlign="center" maxW="320px">
          {error ?? "PDF 無法載入"}
        </Text>
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<ArrowBackIcon />}
          onClick={() => navigate("/ebook-reader/dashboard")}
        >
          返回書庫
        </Button>
      </Center>
    );
  }

  // ── Reader ────────────────────────────────────────────────────────────────
  return (
    <Box minH="100vh" bg={bgColor}>

      {/* ── Slim top bar ───────────────────────────────────────────────── */}
      <Flex
        bg={barBg}
        borderBottom="1px solid"
        borderColor={borderCol}
        px={{ base: 3, md: 5 }}
        py="10px"
        align="center"
        gap={3}
      >
        <Button
          leftIcon={<ArrowBackIcon />}
          variant="ghost"
          size="sm"
          onClick={() => navigate("/ebook-reader/dashboard")}
          flexShrink={0}
          color={subCol}
          _hover={{ color: titleCol }}
        >
          書庫
        </Button>

        {/* Title + page info */}
        <Box flex={1} minW={0}>
          <Text fontWeight={600} fontSize="sm" color={titleCol} noOfLines={1}>
            {bookMeta?.name ?? ""}
          </Text>
          {totalPages > 0 && (
            <Text fontSize="xs" color={subCol}>
              第 {pageNumber} / {totalPages} 頁
            </Text>
          )}
        </Box>

        {/* Percentage badge */}
        {totalPages > 0 && (
          <Text
            fontSize="xs"
            fontWeight={700}
            color="purple.400"
            flexShrink={0}
          >
            {pct}%
          </Text>
        )}
      </Flex>

      {/* ── Thin progress bar ──────────────────────────────────────────── */}
      <Progress
        value={pct}
        colorScheme="purple"
        size="xs"
        borderRadius={0}
        bg={progressBg}
      />

      {/* ── PDF Viewer (fills remaining viewport height) ────────────────── */}
      <Box
        h="calc(100vh - 120px)"
        sx={{
          // Override @react-pdf-viewer default background to match app theme
          ".rpv-core__viewer": { background: "transparent" },
        }}
      >
        <Worker workerUrl={PDFJS_WORKER_URL}>
          <Viewer
            fileUrl={fileUrl}
            plugins={[defaultLayoutPluginInstance, pageNavPluginInstance]}
            onPageChange={handlePageChange}
            onDocumentLoad={handleDocumentLoad}
            onError={handleError}
          />
        </Worker>
      </Box>
    </Box>
  );
}
