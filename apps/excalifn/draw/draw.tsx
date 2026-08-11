import { http } from "@/components/endpoints";
import axios from "axios";
import { RefObject } from "react";

export type shapes = {
    id: number,
    type: "rect",
    x: number,
    y: number,
    width: number,
    height: number
} | {
    id: number,
    type: "circle",
    x: number,
    y: number,
    raidus: number,
    startangle: number,
    endangle: number
} | {
    id: number,
    type: "pencil",
    points: { x: number, y: number }[]
};

type handles = {
    x: number,
    y: number,
    r: number,
    id: number,
    position: "topleft" | "topright" | "bottomleft" | "bottomright"
};

export interface ViewportTransform {
    x: number;
    y: number;
    scale: number;
}

interface ViewBounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

export default async function intindraw(
    canvas: HTMLCanvasElement,
    roomId: string,
    WebSocket: WebSocket,
    tool: RefObject<string>,
    viewportTransform: RefObject<ViewportTransform>,
    onZoomChange: (percent: number) => void
) {
    const existing: shapes[] = await getExistingshapes(roomId);
    let selectedShapeId: number | null = null;
    let circleshandles: handles[] = [];
    let handleposition: string | null = null;
    let pencilPoints: { x: number, y: number }[] = [];
    let isDrawingPencil = false;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    WebSocket.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            if (message.type === "chat") {
                const parsedmsg = JSON.parse(message.message);
                const last = existing.find(e => e.id === parsedmsg.shape.id);
                if (last) {
                    if (selectedShapeId === last.id) {
                        selectedShapeId = message.id;
                    }
                    last.id = message.id;
                } else {
                    existing.push(parsedmsg.shape);
                }
                clearcanvas(existing, canvas, ctx, circleshandles, viewportTransform.current, selectedShapeId);
            } else if (message.type === "move_shape") {
                const parsemsg = JSON.parse(message.message);
                const shape = existing.find(e => e.id === parsemsg.shape.id);
                if (shape) {
                    if (selectedShapeId === parsemsg.shape.id) {
                        selectedShapeId = parsemsg.shape.id;
                    }
                    Object.assign(shape, parsemsg.shape);
                }
                clearcanvas(existing, canvas, ctx, circleshandles, viewportTransform.current, selectedShapeId);
            } else if (message.type === "delete_shape") {
                const easeshapeid = message.id;
                const index = existing.findIndex(e => e.id === easeshapeid);
                if (index !== -1) {
                    existing.splice(index, 1);
                }
                if (selectedShapeId === easeshapeid) {
                    selectedShapeId = null;
                }
                clearcanvas(existing, canvas, ctx, circleshandles, viewportTransform.current, selectedShapeId);
            }
        } catch (e) {
            console.error("WS message parse error:", e);
        }
    };

    let clicked = false;
    let spaceHeld = false;
    let panStarted = false;
    let panStartX = 0;
    let panStartY = 0;
    let panStartViewportX = 0;
    let panStartViewportY = 0;
    let sizing = false;
    let moving = false;
    let initialwidth = 0;
    let initialheight = 0;
    let startx = 0;
    let starty = 0;
    let shapestartx = 0;
    let shapestarty = 0;
    let sizestartx = 0;
    let sizestarty = 0;
    let shapetoease = 0;
    let initialradius = 0;

    // Initial Render
    clearcanvas(existing, canvas, ctx, circleshandles, viewportTransform.current, selectedShapeId);

    const onMouseDown = (e: MouseEvent) => {
        clicked = true;
        const { x, y } = getCanvasCoords(canvas, e, viewportTransform.current);
        startx = x;
        starty = y;

        // Middle click (button === 1) or space + left click initiates panning
        if (spaceHeld || e.button === 1 || tool.current === "hand") {
            panStarted = true;
            panStartX = e.clientX;
            panStartY = e.clientY;
            panStartViewportX = viewportTransform.current.x;
            panStartViewportY = viewportTransform.current.y;
            canvas.style.cursor = 'grabbing';
            return;
        }

        if (tool.current === "select") {
            const handle = ishandleclicked(circleshandles, startx, starty);
            if (handle) {
                handleposition = handle;
                sizing = true;
            }
            const newselection = checkselection(existing, startx, starty);
            if (newselection) {
                if (newselection !== selectedShapeId) {
                    selectedShapeId = newselection;
                    circleshandles.length = 0;
                    clearcanvas(existing, canvas, ctx, circleshandles, viewportTransform.current, selectedShapeId);
                }
                const selectedshape = existing.find((e) => e.id === selectedShapeId);
                if (selectedshape) {
                    if (selectedshape.type === "rect") {
                        initialwidth = selectedshape.width;
                        initialheight = selectedshape.height;
                        shapestartx = selectedshape.x;
                        shapestarty = selectedshape.y;
                        sizestartx = selectedshape.x;
                        sizestarty = selectedshape.y;
                    }
                    if (selectedshape.type === "circle") {
                        initialradius = selectedshape.raidus;
                        shapestartx = selectedshape.x;
                        shapestarty = selectedshape.y;
                        sizestartx = selectedshape.x;
                        sizestarty = selectedshape.y;
                    }
                }
                clearcanvas(existing, canvas, ctx, circleshandles, viewportTransform.current, selectedShapeId);
            } else {
                moving = false;
            }
        }

        if (tool.current === "pencil") {
            isDrawingPencil = true;
            pencilPoints = [{ x, y }];
        }
    };

    const onMouseUp = (e: MouseEvent) => {
        clicked = false;

        if (panStarted) {
            panStarted = false;
            canvas.style.cursor = spaceHeld ? 'grab' : '';
            return;
        }

        const { x: mouseWorldX, y: mouseWorldY } = getCanvasCoords(canvas, e, viewportTransform.current);
        const width = mouseWorldX - startx;
        const height = mouseWorldY - starty;
        let shape: shapes | null = null;

        if (tool.current === "circle") {
            const radius = Math.abs(width / 2);
            shape = {
                id: (Date.now() + Math.floor(Math.random() * 1000)) % 2147483647,
                type: "circle",
                x: startx,
                y: starty,
                raidus: radius,
                startangle: 0,
                endangle: 6.28
            };
        } else if (tool.current === "rec") {
            shape = {
                id: (Date.now() + Math.floor(Math.random() * 1000)) % 2147483647,
                type: "rect",
                x: startx,
                y: starty,
                height,
                width
            };
        } else if (tool.current === "select") {
            if (sizing) {
                const isshape = existing.find((e) => e.id === selectedShapeId);
                if (isshape) {
                    if (isshape.type === "rect" && (sizestartx !== 0 || sizestarty !== 0)) {
                        const cx = sizestartx + initialwidth / 2;
                        const cy = sizestarty + initialheight / 2;
                        const scaleX = (mouseWorldX - cx) / (startx - cx || 1);
                        const scaleY = (mouseWorldY - cy) / (starty - cy || 1);
                        isshape.width = initialwidth * scaleX;
                        isshape.height = initialheight * scaleY;
                        isshape.x = cx - isshape.width / 2;
                        isshape.y = cy - isshape.height / 2;
                    } else if (isshape.type === "circle" && (sizestartx !== 0 || sizestarty !== 0)) {
                        const dx = mouseWorldX - isshape.x;
                        const dy = mouseWorldY - isshape.y;
                        isshape.raidus = Math.sqrt(dx * dx + dy * dy);
                    }
                    shape = isshape;
                }
                sizing = false;
            }

            if (!sizing) {
                const isshape = existing.find((e) => e.id === selectedShapeId);
                if (isshape && (shapestartx !== 0 || shapestarty !== 0)) {
                    if (isshape.type === "rect" || isshape.type === "circle") {
                        const dx = mouseWorldX - startx;
                        const dy = mouseWorldY - starty;
                        isshape.x = shapestartx + dx;
                        isshape.y = shapestarty + dy;
                        shapestartx = 0;
                        shapestarty = 0;
                        sizestartx = isshape.x;
                        sizestarty = isshape.y;
                        shape = isshape;
                    }
                }
            }
        } else if (tool.current === "pencil") {
            isDrawingPencil = false;
            if (pencilPoints.length > 1) {
                shape = {
                    id: (Date.now() + Math.floor(Math.random() * 1000)) % 2147483647,
                    type: "pencil",
                    points: pencilPoints
                };
            }
            pencilPoints = [];
        }

        if (shape) {
            if (tool.current === "rec" || tool.current === "circle" || tool.current === "pencil") {
                existing.push(shape);
                WebSocket.send(JSON.stringify({
                    type: "chat",
                    message: JSON.stringify({ shape }),
                    roomId,
                }));
            } else if (tool.current === "select") {
                WebSocket.send(JSON.stringify({
                    type: "move_shape",
                    message: JSON.stringify({ shape }),
                    roomId
                }));
                moving = false;
            }
        } else if (tool.current === "erase" && shapetoease !== 0) {
            const id = shapetoease;
            WebSocket.send(JSON.stringify({
                type: "delete_shape",
                id,
                roomId
            }));
            shapetoease = 0;
        }

        clearcanvas(existing, canvas, ctx, circleshandles, viewportTransform.current, selectedShapeId);
    };

    const onMouseMove = (e: MouseEvent) => {
        if (spaceHeld && clicked && !panStarted) {
            panStarted = true;
            panStartX = e.clientX;
            panStartY = e.clientY;
            panStartViewportX = viewportTransform.current.x;
            panStartViewportY = viewportTransform.current.y;
        }

        if (panStarted) {
            const dx = e.clientX - panStartX;
            const dy = e.clientY - panStartY;
            viewportTransform.current.x = panStartViewportX + dx;
            viewportTransform.current.y = panStartViewportY + dy;
            clearcanvas(existing, canvas, ctx, circleshandles, viewportTransform.current, selectedShapeId);
            return;
        }

        if (clicked) {
            const { x: mouseWorldX, y: mouseWorldY } = getCanvasCoords(canvas, e, viewportTransform.current);
            const width = mouseWorldX - startx;
            const height = mouseWorldY - starty;
            const radius = Math.abs(width / 2);

            if (tool.current === "pencil") {
                if (isDrawingPencil) {
                    pencilPoints.push({ x: mouseWorldX, y: mouseWorldY });
                    clearcanvas(existing, canvas, ctx, circleshandles, viewportTransform.current, selectedShapeId);
                    
                    // Render current pencil stroke in progress
                    ctx.save();
                    ctx.translate(viewportTransform.current.x, viewportTransform.current.y);
                    ctx.scale(viewportTransform.current.scale, viewportTransform.current.scale);
                    drawPencilPath(ctx, pencilPoints, "rgb(255,255,255)");
                    ctx.restore();
                }
            } else {
                clearcanvas(existing, canvas, ctx, circleshandles, viewportTransform.current, selectedShapeId);

                if (tool.current === "select") {
                    const shape = existing.find((e) => e.id === selectedShapeId);
                    if ((shapestartx !== 0 || shapestarty !== 0) && shape) {
                        if (shape.type === "rect" || shape.type === "circle") {
                            const dx = mouseWorldX - startx;
                            const dy = mouseWorldY - starty;
                            shape.x = shapestartx + dx;
                            shape.y = shapestarty + dy;
                        }
                    }
                }

                if (sizing) {
                    const isshape = existing.find((e) => e.id === selectedShapeId);
                    if (isshape) {
                        if (isshape.type === "rect" && (sizestartx !== 0 || sizestarty !== 0)) {
                            const cx = sizestartx + initialwidth / 2;
                            const cy = sizestarty + initialheight / 2;
                            const scaleX = (mouseWorldX - cx) / (startx - cx || 1);
                            const scaleY = (mouseWorldY - cy) / (starty - cy || 1);
                            isshape.width = initialwidth * scaleX;
                            isshape.height = initialheight * scaleY;
                            isshape.x = cx - isshape.width / 2;
                            isshape.y = cy - isshape.height / 2;
                        } else if (isshape.type === "circle" && (sizestartx !== 0 || sizestarty !== 0)) {
                            const dx = mouseWorldX - isshape.x;
                            const dy = mouseWorldY - isshape.y;
                            isshape.raidus = Math.sqrt(dx * dx + dy * dy);
                        }
                    }
                }

                // Preview current shape being drawn
                ctx.save();
                ctx.translate(viewportTransform.current.x, viewportTransform.current.y);
                ctx.scale(viewportTransform.current.scale, viewportTransform.current.scale);
                ctx.strokeStyle = "rgb(255,255,255)";
                ctx.lineWidth = 2;

                if (tool.current === "rec") {
                    ctx.strokeRect(startx, starty, width, height);
                } else if (tool.current === "circle") {
                    ctx.beginPath();
                    ctx.arc(startx, starty, radius, 0, 6.28);
                    ctx.stroke();
                }
                ctx.restore();
            }

            if (tool.current === "erase") {
                const eraseshape = checkselection(existing, mouseWorldX, mouseWorldY);
                if (eraseshape) {
                    shapetoease = eraseshape;
                }
            }
        }
    };

    const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const oldScale = viewportTransform.current.scale;
        const delta = e.deltaY < 0 ? 1.15 : 0.85;
        const newScale = Math.min(Math.max(0.1, oldScale * delta), 5);
        const ratio = newScale / oldScale;

        viewportTransform.current.x = mouseX - (mouseX - viewportTransform.current.x) * ratio;
        viewportTransform.current.y = mouseY - (mouseY - viewportTransform.current.y) * ratio;
        viewportTransform.current.scale = newScale;

        onZoomChange(Math.round(newScale * 100));
        clearcanvas(existing, canvas, ctx, circleshandles, viewportTransform.current, selectedShapeId);
    };

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            if (!spaceHeld) {
                spaceHeld = true;
                canvas.style.cursor = 'grab';
            }
        }
    };

    const onKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            spaceHeld = false;
            if (!panStarted) {
                canvas.style.cursor = '';
            }
        }
    };

    const onCanvasResetView = () => {
        clearcanvas(existing, canvas, ctx, circleshandles, viewportTransform.current, selectedShapeId);
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('canvas-view-reset', onCanvasResetView);

    return () => {
        canvas.removeEventListener("mousedown", onMouseDown);
        canvas.removeEventListener("mouseup", onMouseUp);
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("wheel", onWheel);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('canvas-view-reset', onCanvasResetView);
    };
}

function drawPencilPath(ctx: CanvasRenderingContext2D, points: { x: number, y: number }[], color: string) {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
}

/**
 * Calculates current visible world bounding box
 */
function getVisibleBounds(canvas: HTMLCanvasElement, viewport: ViewportTransform): ViewBounds {
    const minX = (0 - viewport.x) / viewport.scale;
    const minY = (0 - viewport.y) / viewport.scale;
    const maxX = (canvas.width - viewport.x) / viewport.scale;
    const maxY = (canvas.height - viewport.y) / viewport.scale;

    return { minX, minY, maxX, maxY };
}

/**
 * Spatial Viewport Culling Check
 * Returns true if the object's bounding box intersects the current visible viewport
 */
function isShapeInView(shape: shapes, bounds: ViewBounds): boolean {
    let minX = 0, minY = 0, maxX = 0, maxY = 0;

    if (shape.type === "rect") {
        minX = Math.min(shape.x, shape.x + shape.width);
        maxX = Math.max(shape.x, shape.x + shape.width);
        minY = Math.min(shape.y, shape.y + shape.height);
        maxY = Math.max(shape.y, shape.y + shape.height);
    } else if (shape.type === "circle") {
        const r = Math.abs(shape.raidus);
        minX = shape.x - r;
        maxX = shape.x + r;
        minY = shape.y - r;
        maxY = shape.y + r;
    } else if (shape.type === "pencil") {
        if (shape.points.length === 0) return false;
        minX = shape.points[0].x;
        maxX = shape.points[0].x;
        minY = shape.points[0].y;
        maxY = shape.points[0].y;
        for (let i = 1; i < shape.points.length; i++) {
            const p = shape.points[i];
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        }
    }

    // Add a safety buffer (e.g. 50px) so partially visible strokes render cleanly
    const buffer = 50;
    return !(
        maxX < bounds.minX - buffer ||
        minX > bounds.maxX + buffer ||
        maxY < bounds.minY - buffer ||
        minY > bounds.maxY + buffer
    );
}

/**
 * Clears canvas and renders only objects within visible viewport (Viewport Culling)
 */
function clearcanvas(
    exisitingshapes: shapes[],
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    circleshandles: handles[],
    viewport: ViewportTransform,
    selectedShapeId?: number | null
) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background fill
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate current visible world bounds for spatial culling
    const visibleBounds = getVisibleBounds(canvas, viewport);

    // Draw Excalidraw infinite background dot grid
    drawInfiniteGrid(ctx, canvas, viewport);

    // Apply Camera Transformation Matrix
    ctx.save();
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.scale, viewport.scale);

    circleshandles.length = 0;

    // Filter shapes: ONLY render objects inside the visible view!
    for (let i = 0; i < exisitingshapes.length; i++) {
        const shapes = exisitingshapes[i];
        
        // Viewport culling check
        if (!isShapeInView(shapes, visibleBounds)) {
            continue; // Skip rendering objects outside view!
        }

        if (shapes.type === "rect") {
            ctx.strokeStyle = "rgb(255,255,255)";
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.strokeRect(shapes.x, shapes.y, shapes.width, shapes.height);
        } else if (shapes.type === "circle") {
            ctx.strokeStyle = "rgb(255,255,255)";
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(shapes.x, shapes.y, Math.abs(shapes.raidus), 0, 6.28);
            ctx.stroke();
        } else if (shapes.type === "pencil") {
            ctx.setLineDash([]);
            drawPencilPath(ctx, shapes.points, "rgb(255,255,255)");
        }
    }

    // Draw selection handles if selected shape is visible
    const selectedshape: shapes | undefined = exisitingshapes.find((e) => e.id === selectedShapeId);
    if (selectedshape && selectedShapeId && isShapeInView(selectedshape, visibleBounds)) {
        if (selectedshape.type === "rect") {
            ctx.strokeStyle = "rgb(255,158,255)";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(
                selectedshape.x - 15 * Math.sign(selectedshape.width),
                selectedshape.y - 15 * Math.sign(selectedshape.height),
                selectedshape.width + 30 * Math.sign(selectedshape.width),
                selectedshape.height + 30 * Math.sign(selectedshape.height)
            );
            drawCircle(ctx, selectedshape.x - 15 * Math.sign(selectedshape.width), selectedshape.y - 15 * Math.sign(selectedshape.height), 7, circleshandles, selectedShapeId, "topleft");
            drawCircle(ctx, selectedshape.x + 15 * Math.sign(selectedshape.width) + selectedshape.width, selectedshape.y - 15 * Math.sign(selectedshape.height), 7, circleshandles, selectedShapeId, "topright");
            drawCircle(ctx, selectedshape.x - 15 * Math.sign(selectedshape.width), selectedshape.y + selectedshape.height + 15 * Math.sign(selectedshape.height), 7, circleshandles, selectedShapeId, "bottomleft");
            drawCircle(ctx, selectedshape.x + 15 * Math.sign(selectedshape.width) + selectedshape.width, selectedshape.y + 15 * Math.sign(selectedshape.height) + selectedshape.height, 7, circleshandles, selectedShapeId, "bottomright");
        } else if (selectedshape.type === "circle") {
            ctx.strokeStyle = "rgb(255,158,255)";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(selectedshape.x - selectedshape.raidus - 15, selectedshape.y - selectedshape.raidus - 15, selectedshape.raidus * 2 + 30, selectedshape.raidus * 2 + 30);

            drawCircle(ctx, selectedshape.x - 15 - selectedshape.raidus, selectedshape.y - 15 - selectedshape.raidus, 7, circleshandles, selectedShapeId, "topleft");
            drawCircle(ctx, selectedshape.x + 15 - selectedshape.raidus + selectedshape.raidus * 2, selectedshape.y - 15 - selectedshape.raidus, 7, circleshandles, selectedShapeId, "topright");
            drawCircle(ctx, selectedshape.x - 15 - selectedshape.raidus, selectedshape.y + 15 + selectedshape.raidus, 7, circleshandles, selectedShapeId, "bottomleft");
            drawCircle(ctx, selectedshape.x + 15 - selectedshape.raidus + selectedshape.raidus * 2, selectedshape.y + 15 + selectedshape.raidus, 7, circleshandles, selectedShapeId, "bottomright");
        }
    }

    ctx.restore();
}

/**
 * Draws infinite Excalidraw dot grid aligned with camera transform
 */
function drawInfiniteGrid(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, viewport: ViewportTransform) {
    const gridSize = 40 * viewport.scale;
    if (gridSize < 10) return; // Don't draw tiny dots when zoomed far out

    const startX = viewport.x % gridSize;
    const startY = viewport.y % gridSize;

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    for (let x = startX; x < canvas.width; x += gridSize) {
        for (let y = startY; y < canvas.height; y += gridSize) {
            ctx.fillRect(x, y, 1.5, 1.5);
        }
    }
}

async function getExistingshapes(roomId: string) {
    try {
        const res = await axios.get(`${http}/chats/${roomId}`);
        if (!res.data) return [];
        const messages = res.data;
        const shapes = messages.map((e: { id: number, message: string }) => {
            const parsedData = JSON.parse(e.message);
            parsedData.shape.id = e.id;
            return parsedData.shape;
        });
        return shapes;
    } catch (e) {
        console.error("Failed to load existing shapes:", e);
        return [];
    }
}

function checkselection(existing: shapes[], startx: number, starty: number) {
    for (let i = existing.length - 1; i >= 0; i--) {
        if (ispointinshape(existing[i], startx, starty)) {
            return existing[i].id;
        }
    }
    return null;
}

function ispointinshape(shape: shapes, startx: number, starty: number) {
    if (shape.type === 'rect') {
        const left = Math.min(shape.x, shape.x + shape.width);
        const right = Math.max(shape.x, shape.x + shape.width);
        const top = Math.min(shape.y, shape.y + shape.height);
        const bottom = Math.max(shape.y, shape.y + shape.height);
        return (
            startx >= left &&
            startx <= right &&
            starty >= top &&
            starty <= bottom
        );
    } else if (shape.type === 'circle') {
        const dx = startx - shape.x;
        const dy = starty - shape.y;
        return Math.sqrt(dx * dx + dy * dy) <= shape.raidus;
    } else if (shape.type === 'pencil') {
        return shape.points.some(p => {
            const dx = startx - p.x;
            const dy = starty - p.y;
            return Math.sqrt(dx * dx + dy * dy) <= 10;
        });
    }
    return false;
}

function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, circleshandles: handles[], selectedShapeId: number, position: handles["position"]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 6.28);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgb(255,158,255)";
    ctx.stroke();
    circleshandles.push({ x, y, r, id: selectedShapeId, position });
}

function ishandleclicked(circleshandles: handles[], startx: number, starty: number) {
    for (const h of circleshandles) {
        if (insidehandle(h, startx, starty)) {
            return h.position;
        }
    }
    return null;
}

function insidehandle(shape: handles, startx: number, starty: number) {
    if (shape) {
        const dx = startx - shape.x;
        const dy = starty - shape.y;
        return Math.sqrt(dx * dx + dy * dy) <= shape.r;
    }
    return false;
}

function getCanvasCoords(canvas: HTMLCanvasElement, e: MouseEvent, viewportTransform: ViewportTransform) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left - viewportTransform.x) / viewportTransform.scale,
        y: (e.clientY - rect.top - viewportTransform.y) / viewportTransform.scale
    };
}
