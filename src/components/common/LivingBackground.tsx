"use client";

import { useEffect, useRef } from "react";

export default function LivingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Node count based on screen size
    const nodeCount = Math.min(60, Math.floor((width * height) / 25000));
    const nodes: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      pulse: number;
      pulseDirection: number;
    }[] = [];

    // Initialize network nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1,
        pulse: Math.random(),
        pulseDirection: Math.random() > 0.5 ? 0.01 : -0.01,
      });
    }

    // Binary code stream data
    const columns = Math.floor(width / 50);
    const streams: { x: number; y: number; speed: number; chars: string[] }[] = [];
    for (let i = 0; i < columns; i++) {
      const chars: string[] = [];
      const streamLen = Math.floor(Math.random() * 8) + 4;
      for (let j = 0; j < streamLen; j++) {
        chars.push(Math.random() > 0.5 ? "1" : "0");
      }
      streams.push({
        x: i * 50 + Math.random() * 20,
        y: Math.random() * height * -1,
        speed: Math.random() * 0.8 + 0.3,
        chars,
      });
    }

    // Mouse tracker
    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Subtle Tech Grid
      ctx.strokeStyle = "rgba(0, 217, 255, 0.015)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Scrolling Code Streams (Subtle telemetry matrix effect)
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(0, 255, 136, 0.02)";
      streams.forEach((stream) => {
        stream.y += stream.speed;
        if (stream.y > height) {
          stream.y = Math.random() * -100 - 50;
        }
        stream.chars.forEach((char, idx) => {
          ctx.fillText(char, stream.x, stream.y + idx * 12);
        });

        // Randomly flip a bit
        if (Math.random() < 0.02) {
          const randIdx = Math.floor(Math.random() * stream.chars.length);
          stream.chars[randIdx] = stream.chars[randIdx] === "1" ? "0" : "1";
        }
      });

      // 3. Draw Network Nodes & Laser Connections
      nodes.forEach((node, idx) => {
        // Move nodes
        node.x += node.vx;
        node.y += node.vy;

        // Bounce on edges
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Node Pulse
        node.pulse += node.pulseDirection;
        if (node.pulse > 1 || node.pulse < 0.2) node.pulseDirection *= -1;

        // Draw connections between nearby nodes
        for (let j = idx + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dist = Math.hypot(node.x - other.x, node.y - other.y);
          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.06;
            ctx.strokeStyle = `rgba(0, 217, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        // Mouse connection lasers (faint cyber cyan laser line)
        const mouseDist = Math.hypot(node.x - mouse.x, node.y - mouse.y);
        if (mouseDist < 150) {
          const alpha = (1 - mouseDist / 150) * 0.12;
          ctx.strokeStyle = `rgba(0, 217, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        // Draw node center
        ctx.fillStyle = `rgba(0, 255, 136, ${node.pulse * 0.15 + 0.15})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Node outer ring glow
        ctx.strokeStyle = `rgba(0, 217, 255, ${node.pulse * 0.08})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 3 * node.pulse, 0, Math.PI * 2);
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1, background: "#050505" }}
    />
  );
}
