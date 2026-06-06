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
    const nodeCount = Math.min(45, Math.floor((width * height) / 30000));
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
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.5 + 1,
        pulse: Math.random(),
        pulseDirection: Math.random() > 0.5 ? 0.008 : -0.008,
      });
    }

    // Binary code stream data
    const columns = Math.floor(width / 60);
    const streams: { x: number; y: number; speed: number; chars: string[] }[] = [];
    for (let i = 0; i < columns; i++) {
      const chars: string[] = [];
      const streamLen = Math.floor(Math.random() * 6) + 3;
      for (let j = 0; j < streamLen; j++) {
        chars.push(Math.random() > 0.5 ? "1" : "0");
      }
      streams.push({
        x: i * 60 + Math.random() * 15,
        y: Math.random() * height * -1,
        speed: Math.random() * 0.5 + 0.2,
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

      // 1. Draw Scrolling Code Streams (Subtle telemetry matrix effect in Mint)
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(0, 229, 195, 0.02)";
      streams.forEach((stream) => {
        stream.y += stream.speed;
        if (stream.y > height) {
          stream.y = Math.random() * -100 - 50;
        }
        stream.chars.forEach((char, idx) => {
          ctx.fillText(char, stream.x, stream.y + idx * 12);
        });

        // Randomly flip a bit
        if (Math.random() < 0.015) {
          const randIdx = Math.floor(Math.random() * stream.chars.length);
          stream.chars[randIdx] = stream.chars[randIdx] === "1" ? "0" : "1";
        }
      });

      // 2. Draw Network Nodes & Laser Connections (Mint theme)
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
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.04;
            ctx.strokeStyle = `rgba(0, 229, 195, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        // Mouse connection lasers (faint mint cyber laser line)
        const mouseDist = Math.hypot(node.x - mouse.x, node.y - mouse.y);
        if (mouseDist < 140) {
          const alpha = (1 - mouseDist / 140) * 0.08;
          ctx.strokeStyle = `rgba(0, 229, 195, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        // Draw node center
        ctx.fillStyle = `rgba(0, 229, 195, ${node.pulse * 0.12 + 0.1})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Node outer ring glow
        ctx.strokeStyle = `rgba(0, 229, 195, ${node.pulse * 0.05})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(0.1, node.radius * 2.5 * node.pulse), 0, Math.PI * 2);
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
      style={{ zIndex: -1, background: "transparent" }}
    />
  );
}
