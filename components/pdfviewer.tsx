import React, { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { Skeleton } from "./skeleton";
import Image from "next/image";

interface Geometry {
  [0]: number;
  [1]: number;
}

interface DocumentField {
  data_field: string;
  data_value: string;
  original_text: string;
  geometry: Geometry[][];
  page_idx: number | null;
}

interface PdfViewerProps {
  pages: string[] | null;
  hoveredField?: DocumentField | null;
  onSelectedPageIndex: (index: number) => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  pages,
  hoveredField,
  onSelectedPageIndex,
}) => {
  const [selectedPage, setSelectedPage] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [fitToScreenZoom, setFitToScreenZoom] = useState<number>(1);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isHoveringImage, setIsHoveringImage] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate fit-to-screen zoom when container or page changes
  const calculateFitToScreenZoom = useCallback(() => {
    if (!containerRef.current || !pages || !pages[selectedPage]) return;

    const container = containerRef.current;
    const img = new window.Image();
    img.src = `data:image/png;base64,${pages[selectedPage]}`;

    img.onload = () => {
      const containerAspect = container.clientWidth / container.clientHeight;
      const imageAspect = img.width / img.height;

      let newFitZoom: number;
      if (imageAspect > containerAspect) {
        // Width constrained
        newFitZoom = container.clientWidth / img.width;
      } else {
        // Height constrained
        newFitZoom = container.clientHeight / img.height;
      }

      // small buffer to ensure image fits
      newFitZoom = newFitZoom * 0.95;
      setFitToScreenZoom(newFitZoom);

      // Only set initial zoom to fit-to-screen if this is the first initialization
      if (!isInitialized) {
        setZoom(newFitZoom);
        setIsInitialized(true);
      }
    };
  }, [pages, selectedPage, isInitialized]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3));

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, fitToScreenZoom * 0.5));
  };

  const updateSelectedPage = useCallback(
    (newPage: number) => {
      setSelectedPage(newPage);
      onSelectedPageIndex(newPage);
    },
    [onSelectedPageIndex]
  );

  useEffect(() => {
    if (
      hoveredField &&
      hoveredField.page_idx !== null &&
      hoveredField.page_idx !== selectedPage
    ) {
      updateSelectedPage(hoveredField.page_idx);
    }
  }, [hoveredField, selectedPage, updateSelectedPage]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Calculate fit-to-screen zoom when container dimensions change
  useEffect(() => {
    calculateFitToScreenZoom();
  }, [containerDimensions, calculateFitToScreenZoom]);

  // Calculate fit-to-screen zoom when page changes
  useEffect(() => {
    calculateFitToScreenZoom();
  }, [selectedPage, calculateFitToScreenZoom]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX + scrollContainerRef.current.scrollLeft,
      y: e.clientY + scrollContainerRef.current.scrollTop,
    });
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !scrollContainerRef.current) return;

      const deltaX = dragStart.x - e.clientX;
      const deltaY = dragStart.y - e.clientY;

      scrollContainerRef.current.scrollLeft = deltaX;
      scrollContainerRef.current.scrollTop = deltaY;

      e.preventDefault();
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const renderPage = useCallback(() => {
    if (canvasRef.current && pages != null) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        const img = new window.Image();
        img.src = `data:image/png;base64,${pages[selectedPage]}`;

        const currentHoveredField = hoveredField;
        const currentSelectedPage = selectedPage;
        const currentZoom = zoom;

        img.onload = () => {
          // Get device pixel ratio for high-DPI displays
          const devicePixelRatio = window.devicePixelRatio || 1;

          // Set display size (CSS pixels)
          const displayWidth = img.width * currentZoom;
          const displayHeight = img.height * currentZoom;

          // Set actual canvas size in memory (scaled for high-DPI)
          canvas.width = displayWidth * devicePixelRatio;
          canvas.height = displayHeight * devicePixelRatio;

          // Scale the canvas back down using CSS
          canvas.style.width = displayWidth + "px";
          canvas.style.height = displayHeight + "px";

          context.scale(devicePixelRatio, devicePixelRatio);

          // Scale the drawing context so everything draws at the higher resolution
          context.imageSmoothingEnabled = true;
          context.imageSmoothingQuality = "high";

          context.clearRect(0, 0, displayWidth, displayHeight);
          context.drawImage(img, 0, 0, displayWidth, displayHeight);

          if (
            currentHoveredField &&
            currentHoveredField.page_idx === currentSelectedPage
          ) {
            if (
              currentHoveredField.geometry &&
              currentHoveredField.geometry.length > 0
            ) {
              const [start, end] = currentHoveredField.geometry;

              const start1: any = start && start.length !== 0 ? start[0] : 0;
              const start2: any = start && start.length !== 0 ? start[1] : 0;
              const end1: any = end && end.length !== 0 ? end[0] : 1;
              const end2: any = end && end.length !== 0 ? end[1] : 1;

              const x = start1 * displayWidth;
              const y = start2 * displayHeight;
              const width = (end1 - start1) * displayWidth;
              const height = (end2 - start2) * displayHeight;

              context.strokeStyle = "blue";
              context.lineWidth = 2;
              context.strokeRect(x, y, width, height);
            } else {
              console.log("No geometry or empty geometry array");
            }
          }
        };

        img.onerror = () => {
          console.error("Failed to load image");
        };
      }
    }
  }, [hoveredField, selectedPage, zoom, pages]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Determine if scrolling should be enabled
  const shouldEnableScroll = zoom > fitToScreenZoom;

  // Check if horizontal scrolling is needed (for centering logic)
  const [needsHorizontalScroll, setNeedsHorizontalScroll] =
    useState<boolean>(false);

  useEffect(() => {
    if (
      canvasRef.current &&
      containerRef.current &&
      pages &&
      pages[selectedPage]
    ) {
      const container = containerRef.current;
      const img = new window.Image();
      img.src = `data:image/png;base64,${pages[selectedPage]}`;
      img.onload = () => {
        const displayWidth = img.width * zoom;
        const containerWidth = container.clientWidth;
        setNeedsHorizontalScroll(displayWidth > containerWidth);
      };
    }
  }, [zoom, selectedPage, pages]);

  const isLoading = pages !== null && pages.length === 0;

  // Show loader while initializing or no image state
  if (isLoading || pages === null) {
    return (
      <div className="w-full flex flex-row h-[calc(100vh-4.5rem)]">
        <div className="w-28 overflow-y-auto border-r py-2 px-2">
          <div className="p-2">
            <Skeleton className="w-full aspect-[3/4] bg-gray-200" />
          </div>
        </div>
        <div className="p-4 w-full relative flex flex-col">
          <div className="relative overflow-hidden border border-gray-200 rounded-lg flex-1 flex flex-col items-center justify-center bg-gray-50">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping" />
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin relative" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-gray-400 text-sm">Loading Image...</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-gray-500">
                <p>No image available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-row h-[calc(100vh-4.5rem)]">
      <div className="w-28 overflow-y-auto border-r py-2 px-2">
        {pages &&
          pages != null &&
          pages.map((page, index) => (
            <div
              key={index}
              className={`mb-4 p-2 cursor-pointer ${
                selectedPage === index ? "bg-blue-200" : "bg-white"
              }`}
              onClick={() => setSelectedPage(index)}
            >
              <Image
                src={`data:image/png;base64,${page}`}
                alt={`Page ${index + 1}`}
                className="w-full h-auto border"
                width={100}
                height={100}
              />
              <div className="text-center">{index + 1}</div>
            </div>
          ))}
      </div>
      <div className="p-2 w-96 relative flex-1 flex flex-col">
        <div
          className="relative overflow-hidden border flex-1"
          ref={containerRef}
          onMouseEnter={() => setIsHoveringImage(true)}
          onMouseLeave={() => setIsHoveringImage(false)}
        >
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2  z-10 flex items-center bg-white/90 backdrop-blur-xs border border-gray-200 rounded-lg shadow-lg p-0 space-x-1 transition-opacity duration-200 ${
              isHoveringImage ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200 group"
              title="Zoom Out"
            >
              <ZoomOut className="h-5 w-5 text-gray-600 group-hover:text-gray-800" />
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <span className="px-2 text-sm font-medium text-gray-700 min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <div className="w-px h-6 bg-gray-300"></div>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200 group"
              title="Zoom In"
            >
              <ZoomIn className="h-5 w-5 text-gray-600 group-hover:text-gray-800" />
            </button>
          </div>

          <div
            className="h-full w-full overflow-auto"
            ref={scrollContainerRef}
            style={{
              cursor: isDragging
                ? "grabbing"
                : shouldEnableScroll
                ? "grab"
                : "default",
            }}
            onMouseDown={shouldEnableScroll ? handleMouseDown : undefined}
          >
            <div
              className="min-h-full min-w-full"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: needsHorizontalScroll ? "flex-start" : "center",
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  imageRendering: "-webkit-optimize-contrast",
                  display: "block",
                  margin: needsHorizontalScroll ? "auto 0" : "0",
                }}
              ></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
