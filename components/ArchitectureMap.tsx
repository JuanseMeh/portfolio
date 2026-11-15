"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { links, nodes, VIEWBOX, type ServiceNode } from "@/lib/content";
import styles from "./ArchitectureMap.module.css";

const BUS_X = 520;
const SPINE_X = 716;

const fan = [
  { id: "gateway-auth", from: "gateway", to: "auth-gateway" },
  { id: "auth-token", from: "auth-gateway", to: "token-signer" },
  { id: "auth-identity", from: "auth-gateway", to: "identity" },
  { id: "auth-email", from: "auth-gateway", to: "email-verification" },
  { id: "auth-twofactor", from: "auth-gateway", to: "two-factor" },
];

const byId = new Map(nodes.map((node) => [node.id, node]));

const fanEdges = fan.map((edge) => {
  const from = byId.get(edge.from) as ServiceNode;
  const to = byId.get(edge.to) as ServiceNode;
  return {
    ...edge,
    x1: from.x + from.w,
    y1: from.y + from.h / 2,
    x2: to.x,
    y2: to.y + to.h / 2,
  };
});

const domainNodes = nodes.filter((node) => node.layer === "domain");

const layers = [
  { label: "EDGE", x: 56, y: 46 },
  { label: "IDENTITY", x: 196, y: 46 },
  { label: "DOMAIN", x: 576, y: 46 },
  { label: "OPS", x: 56, y: 334 },
  { label: "DATA", x: 690, y: 46 },
];

const ambientEdges: Record<string, number> = {
  "gateway-auth": 0,
  "auth-token": 420,
  "auth-identity": 840,
  "auth-email": 1260,
};

export default function ArchitectureMap() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);

  const active = hovered ?? pinned;
  const activeNode = useMemo(
    () => nodes.find((node) => node.id === active) ?? null,
    [active],
  );

  const clearHover = () => setHovered(null);

  const togglePin = (id: string) => {
    setPinned((current) => (current === id ? null : id));
  };

  const onKeyDown = (event: KeyboardEvent, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      togglePin(id);
    }
    if (event.key === "Escape") {
      setPinned(null);
      setHovered(null);
    }
  };

  return (
    <section className={styles.panel} aria-label="Ágora architecture map">
      <header className={styles.head}>
        <span className={styles.tag}>
          <span className={styles.live} aria-hidden="true" />
          AGORA / SYSTEM MAP
        </span>
        <a
          className={styles.repo}
          href={links.agora}
          target="_blank"
          rel="noreferrer"
        >
          PUBLIC CORE <span aria-hidden="true">↗</span>
        </a>
      </header>

      <div className={styles.canvas}>
        <div className={styles.halo} aria-hidden="true" />
        <div className={styles.ring} aria-hidden="true" />

        <svg
          className={styles.svg}
          viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
          role="group"
          aria-label="Service map. Use tab to inspect a node."
        >
          <title>Ágora service architecture</title>
          <desc>
            Gateway, identity services, domain services and the data layer. Each
            rectangle is a deployable service.
          </desc>

          {layers.map((layer) => (
            <text
              key={layer.label}
              x={layer.x}
              y={layer.y}
              className={styles.layerLabel}
            >
              {layer.label}
            </text>
          ))}

          <line
            x1={SPINE_X}
            y1={76}
            x2={SPINE_X}
            y2={470}
            className={styles.spine}
          />
          <line
            x1={SPINE_X}
            y1={76}
            x2={SPINE_X + 8}
            y2={76}
            className={styles.spineTick}
          />
          <line
            x1={SPINE_X}
            y1={470}
            x2={SPINE_X + 8}
            y2={470}
            className={styles.spineTick}
          />
          <text
            x={736}
            y={273}
            className={styles.spineText}
            transform="rotate(90 736 273)"
          >
            POSTGRESQL / SCHEMA PER SERVICE
          </text>

          {domainNodes.map((node) => {
            const cy = node.y + node.h / 2;
            const dataActive = active === node.id;
            return (
              <g key={`data-${node.id}`}>
                <line
                  x1={node.x + node.w}
                  y1={cy}
                  x2={SPINE_X}
                  y2={cy}
                  className={`${styles.dataTick} ${dataActive ? styles.edgeActive : ""}`}
                />
                <line
                  x1={BUS_X}
                  y1={cy}
                  x2={node.x}
                  y2={cy}
                  className={`${styles.busTick} ${dataActive ? styles.edgeActive : ""}`}
                />
              </g>
            );
          })}

          <line
            x1={BUS_X}
            y1={76}
            x2={BUS_X}
            y2={470}
            className={styles.bus}
          />
          <text
            x={BUS_X}
            y={66}
            className={styles.busLabel}
            textAnchor="middle"
          >
            gRPC
          </text>

          {fanEdges.map((edge) => {
            const isActive =
              active === edge.from || active === edge.to || active === null;
            const highlighted =
              active !== null &&
              (active === edge.from || active === edge.to);

            return (
              <g key={edge.id}>
                <line
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  className={`${styles.edge} ${highlighted ? styles.edgeActive : ""}`}
                />
                <line
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  pathLength={100}
                  className={`${styles.pulse} ${isActive ? "" : styles.pulseDim}`}
                  style={{ animationDelay: `${ambientEdges[edge.id] ?? 0}ms` }}
                />
              </g>
            );
          })}

          {nodes.map((node) => {
            const isActive = active === node.id;
            return (
              <g
                key={node.id}
                className={`${styles.node} ${isActive ? styles.nodeActive : ""}`}
                tabIndex={0}
                role="button"
                aria-pressed={pinned === node.id}
                aria-label={`${node.label}, ${node.runtime}, port ${node.port}`}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={clearHover}
                onFocus={() => setHovered(node.id)}
                onBlur={clearHover}
                onClick={() => togglePin(node.id)}
                onKeyDown={(event) => onKeyDown(event, node.id)}
              >
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.w}
                  height={node.h}
                  rx={2}
                  className={styles.nodeBox}
                />
                <text
                  x={node.x + 12}
                  y={node.y + 18}
                  className={styles.nodeLabel}
                >
                  {node.label}
                </text>
                <circle
                  cx={node.x + node.w - 9}
                  cy={node.y + 9}
                  r={1.5}
                  className={styles.nodeDot}
                />
              </g>
            );
          })}
        </svg>

        <ul className={styles.mobileMap}>
          {nodes.map((node) => (
            <li key={node.id}>
              <button
                type="button"
                className={`${styles.mobileNode} ${active === node.id ? styles.mobileNodeActive : ""}`}
                onClick={() => togglePin(node.id)}
                aria-pressed={pinned === node.id}
              >
                <span>{node.label}</span>
                <span className={styles.mobileMeta}>
                  {node.runtime} · {node.port}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.readout} aria-live="polite">
        <div className={styles.readoutTop}>
          <span className={styles.readoutName}>
            {activeNode ? activeNode.label : "system"}
          </span>
          <span className={styles.readoutMeta}>
            {activeNode
              ? `${activeNode.runtime} · gRPC · :${activeNode.port}`
              : "Go · Rust · gRPC · PostgreSQL"}
          </span>
        </div>
        <p className={styles.readoutRole}>
          {activeNode
            ? activeNode.role
            : "Hover, tab or tap a node to inspect a real service. Every rectangle ships in the public core."}
        </p>
      </div>

      <div className={styles.stats}>
        <span>14 GO SERVICES</span>
        <span>3 RUST CRATES</span>
        <span>1 PROTOBUF SOURCE</span>
      </div>
    </section>
  );
}
