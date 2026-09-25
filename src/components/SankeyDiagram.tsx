import React, { useState, useMemo, useRef } from 'react';
import { IncomeItem, ExpenseItem, SelectedNodeDetail } from '../types/finance';
import { formatBRL, formatPercent } from '../utils/formatters';
import { Sparkles, Info, Eye, Layers, MousePointerClick, ChevronRight, Activity } from 'lucide-react';

interface SankeyDiagramProps {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  onSelectNode: (detail: SelectedNodeDetail) => void;
}

interface ComputedNode {
  id: string;
  itemId?: string;
  label: string;
  value: number;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  column: 'left' | 'center' | 'right';
  percentage: number;
  isDeficit?: boolean;
  isSurplus?: boolean;
  rawItem?: IncomeItem | ExpenseItem;
}

interface ComputedLink {
  id: string;
  sourceId: string;
  targetId: string;
  sourceLabel: string;
  targetLabel: string;
  value: number;
  sourceColor: string;
  targetColor: string;
  path: string;
  percentageOfTotal: number;
  rawSourceItem?: IncomeItem | ExpenseItem;
  rawTargetItem?: IncomeItem | ExpenseItem;
}

export const SankeyDiagram: React.FC<SankeyDiagramProps> = ({
  incomes,
  expenses,
  onSelectNode,
}) => {
  const [hoveredLink, setHoveredLink] = useState<ComputedLink | null>(null);
  const [hoveredNode, setHoveredNode] = useState<ComputedNode | null>(null);
  const [clickedNodeId, setClickedNodeId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Active items
  const activeIncomes = useMemo(() => incomes.filter((i) => i.amount > 0), [incomes]);
  const activeExpenses = useMemo(() => expenses.filter((e) => e.amount > 0), [expenses]);

  const totalIncome = useMemo(
    () => activeIncomes.reduce((acc, curr) => acc + curr.amount, 0),
    [activeIncomes]
  );
  const totalExpense = useMemo(
    () => activeExpenses.reduce((acc, curr) => acc + curr.amount, 0),
    [activeExpenses]
  );
  const balance = totalIncome - totalExpense;
  const isDeficit = balance < 0;
  const deficitAmount = isDeficit ? Math.abs(balance) : 0;
  const surplusAmount = balance > 0 ? balance : 0;

  // Layout parameters for SVG
  const width = 1040;
  const height = 480;
  const topPadding = 50;
  const bottomPadding = 42;
  const usableHeight = height - topPadding - bottomPadding;

  const leftX = 35;
  const nodeWidth = 16;
  const centerX = 505;
  const rightX = 915;

  const { nodes, links } = useMemo(() => {
    const computedNodes: ComputedNode[] = [];
    const computedLinks: ComputedLink[] = [];

    const flowTotal = Math.max(1, Math.max(totalIncome, totalExpense));

    // 1. LEFT NODES (Inflows: Incomes + Deficit)
    type InflowItem = {
      id: string;
      itemId?: string;
      label: string;
      amount: number;
      color: string;
      isDeficit?: boolean;
      rawItem?: IncomeItem;
    };

    const leftItems: InflowItem[] = [
      ...activeIncomes.map((inc) => ({
        id: inc.id,
        itemId: inc.id,
        label: inc.name,
        amount: inc.amount,
        color: inc.color,
        rawItem: inc,
      })),
    ];

    if (isDeficit && deficitAmount > 0) {
      leftItems.push({
        id: 'node-deficit',
        label: 'Déficit (Falta Cobrir)',
        amount: deficitAmount,
        color: '#F43F5E',
        isDeficit: true,
      });
    }

    const totalLeftValue = leftItems.reduce((acc, i) => acc + i.amount, 0) || 1;
    const leftGap = leftItems.length > 1 ? Math.min(24, (usableHeight * 0.32) / (leftItems.length - 1)) : 0;
    const totalLeftGaps = leftGap * (leftItems.length - 1);
    const availableLeftHeight = Math.max(80, usableHeight - totalLeftGaps);

    let currentLeftY = topPadding;
    const leftNodeMap = new Map<string, ComputedNode>();

    leftItems.forEach((item) => {
      const nodeH = Math.max(18, (item.amount / totalLeftValue) * availableLeftHeight);
      const node: ComputedNode = {
        id: item.id,
        itemId: item.itemId,
        label: item.label,
        value: item.amount,
        color: item.color,
        x: leftX,
        y: currentLeftY,
        width: nodeWidth,
        height: nodeH,
        column: 'left',
        percentage: (item.amount / flowTotal) * 100,
        isDeficit: item.isDeficit,
        rawItem: item.rawItem,
      };
      computedNodes.push(node);
      leftNodeMap.set(item.id, node);
      currentLeftY += nodeH + leftGap;
    });

    // 2. CENTER NODE (Central Budget / Caixa)
    const centerNodeH = Math.min(usableHeight * 0.9, Math.max(170, usableHeight * 0.8));
    const centerY = topPadding + (usableHeight - centerNodeH) / 2;
    const centerNode: ComputedNode = {
      id: 'node-center',
      label: isDeficit ? 'Orçamento Comprometido' : 'Caixa / Orçamento Total',
      value: flowTotal,
      color: isDeficit ? '#F59E0B' : '#38BDF8',
      x: centerX,
      y: centerY,
      width: 24,
      height: centerNodeH,
      column: 'center',
      percentage: 100,
    };
    computedNodes.push(centerNode);

    // 3. RIGHT NODES (Outflows: Expenses + Surplus)
    type OutflowItem = {
      id: string;
      itemId?: string;
      label: string;
      amount: number;
      color: string;
      isSurplus?: boolean;
      rawItem?: ExpenseItem;
    };

    const rightItems: OutflowItem[] = [
      ...activeExpenses.map((exp) => ({
        id: exp.id,
        itemId: exp.id,
        label: exp.name,
        amount: exp.amount,
        color: exp.color,
        rawItem: exp,
      })),
    ];

    if (!isDeficit && surplusAmount > 0) {
      rightItems.push({
        id: 'node-surplus',
        label: 'Sobra / Economias',
        amount: surplusAmount,
        color: '#10B981',
        isSurplus: true,
      });
    }

    const totalRightValue = rightItems.reduce((acc, i) => acc + i.amount, 0) || 1;
    const rightGap = rightItems.length > 1 ? Math.min(18, (usableHeight * 0.35) / (rightItems.length - 1)) : 0;
    const totalRightGaps = rightGap * (rightItems.length - 1);
    const availableRightHeight = Math.max(80, usableHeight - totalRightGaps);

    let currentRightY = topPadding;
    const rightNodeMap = new Map<string, ComputedNode>();

    rightItems.forEach((item) => {
      const nodeH = Math.max(16, (item.amount / totalRightValue) * availableRightHeight);
      const node: ComputedNode = {
        id: item.id,
        itemId: item.itemId,
        label: item.label,
        value: item.amount,
        color: item.color,
        x: rightX,
        y: currentRightY,
        width: nodeWidth,
        height: nodeH,
        column: 'right',
        percentage: (item.amount / flowTotal) * 100,
        isSurplus: item.isSurplus,
        rawItem: item.rawItem,
      };
      computedNodes.push(node);
      rightNodeMap.set(item.id, node);
      currentRightY += nodeH + rightGap;
    });

    // 4. LINKS (Left -> Center)
    let leftCenterOffset = centerNode.y;
    leftItems.forEach((item) => {
      const sourceNode = leftNodeMap.get(item.id);
      if (!sourceNode) return;

      const linkPortion = item.amount / totalLeftValue;
      const linkThicknessOnCenter = linkPortion * centerNode.height;

      const x0 = sourceNode.x + sourceNode.width;
      const y0Top = sourceNode.y;
      const y0Bottom = sourceNode.y + sourceNode.height;

      const x1 = centerNode.x;
      const y1Top = leftCenterOffset;
      const y1Bottom = leftCenterOffset + linkThicknessOnCenter;

      const dx = (x1 - x0) * 0.45;
      const path = `
        M ${x0} ${y0Top}
        C ${x0 + dx} ${y0Top}, ${x1 - dx} ${y1Top}, ${x1} ${y1Top}
        L ${x1} ${y1Bottom}
        C ${x1 - dx} ${y1Bottom}, ${x0 + dx} ${y0Bottom}, ${x0} ${y0Bottom}
        Z
      `;

      computedLinks.push({
        id: `link-${sourceNode.id}-center`,
        sourceId: sourceNode.id,
        targetId: centerNode.id,
        sourceLabel: sourceNode.label,
        targetLabel: centerNode.label,
        value: item.amount,
        sourceColor: sourceNode.color,
        targetColor: centerNode.color,
        path,
        percentageOfTotal: (item.amount / flowTotal) * 100,
        rawSourceItem: item.rawItem,
      });

      leftCenterOffset += linkThicknessOnCenter;
    });

    // 5. LINKS (Center -> Right)
    let rightCenterOffset = centerNode.y;
    rightItems.forEach((item) => {
      const targetNode = rightNodeMap.get(item.id);
      if (!targetNode) return;

      const linkPortion = item.amount / totalRightValue;
      const linkThicknessOnCenter = linkPortion * centerNode.height;

      const x0 = centerNode.x + centerNode.width;
      const y0Top = rightCenterOffset;
      const y0Bottom = rightCenterOffset + linkThicknessOnCenter;

      const x1 = targetNode.x;
      const y1Top = targetNode.y;
      const y1Bottom = targetNode.y + targetNode.height;

      const dx = (x1 - x0) * 0.45;
      const path = `
        M ${x0} ${y0Top}
        C ${x0 + dx} ${y0Top}, ${x1 - dx} ${y1Top}, ${x1} ${y1Top}
        L ${x1} ${y1Bottom}
        C ${x1 - dx} ${y1Bottom}, ${x0 + dx} ${y0Bottom}, ${x0} ${y0Bottom}
        Z
      `;

      computedLinks.push({
        id: `link-center-${targetNode.id}`,
        sourceId: centerNode.id,
        targetId: targetNode.id,
        sourceLabel: centerNode.label,
        targetLabel: targetNode.label,
        value: item.amount,
        sourceColor: centerNode.color,
        targetColor: targetNode.color,
        path,
        percentageOfTotal: (item.amount / flowTotal) * 100,
        rawTargetItem: item.rawItem,
      });

      rightCenterOffset += linkThicknessOnCenter;
    });

    return { nodes: computedNodes, links: computedLinks };
  }, [
    activeIncomes,
    activeExpenses,
    totalIncome,
    totalExpense,
    isDeficit,
    deficitAmount,
    surplusAmount,
    usableHeight,
    topPadding,
  ]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleNodeClick = (node: ComputedNode) => {
    // 3D Pulse effect
    setClickedNodeId(node.id);
    setTimeout(() => setClickedNodeId(null), 600);

    if (node.isDeficit) {
      onSelectNode({
        type: 'deficit',
        name: 'Déficit no Orçamento',
        amount: node.value,
        color: node.color,
        percentageOfFlow: node.percentage,
      });
      return;
    }

    if (node.isSurplus) {
      onSelectNode({
        type: 'surplus',
        name: 'Sobra / Economias Livres',
        amount: node.value,
        color: node.color,
        percentageOfFlow: node.percentage,
      });
      return;
    }

    if (node.column === 'center') {
      onSelectNode({
        type: 'center',
        name: 'Caixa / Orçamento Central',
        amount: node.value,
        color: node.color,
        percentageOfFlow: 100,
      });
      return;
    }

    if (node.rawItem && 'isRecurring' in node.rawItem) {
      const rawInc = node.rawItem as IncomeItem;
      onSelectNode({
        type: 'income',
        itemId: rawInc.id,
        name: rawInc.name,
        amount: rawInc.amount,
        color: rawInc.color,
        category: rawInc.category,
        percentageOfFlow: node.percentage,
        notes: rawInc.notes,
      });
    } else if (node.rawItem) {
      const rawExp = node.rawItem as ExpenseItem;
      onSelectNode({
        type: 'expense',
        itemId: rawExp.id,
        name: rawExp.name,
        amount: rawExp.amount,
        color: rawExp.color,
        category: rawExp.category,
        percentageOfFlow: node.percentage,
        paymentType: rawExp.paymentType,
        priority: rawExp.priority,
        dueDateDay: rawExp.dueDateDay,
        monthlyStatus: rawExp.monthlyStatus,
        debtStatus: rawExp.debtStatus,
        isPostponed: rawExp.isPostponed,
        totalInstallments: rawExp.totalInstallments,
        currentInstallment: rawExp.currentInstallment,
        installmentNote: rawExp.installmentNote,
        totalDebt: rawExp.totalDebt,
        principalDebt: rawExp.principalDebt,
        totalWithInterest: rawExp.totalWithInterest,
        totalInterestCost: rawExp.totalInterestCost,
        interestConfig: rawExp.interestConfig,
        finalAdjustment: rawExp.finalAdjustment,
        notes: rawExp.notes,
        installmentHistory: rawExp.installmentHistory,
      });
    }
  };

  const handleLinkClick = (link: ComputedLink) => {
    if (link.rawSourceItem) {
      const rawInc = link.rawSourceItem as IncomeItem;
      onSelectNode({
        type: 'income',
        itemId: rawInc.id,
        name: rawInc.name,
        amount: rawInc.amount,
        color: rawInc.color,
        category: rawInc.category,
        percentageOfFlow: link.percentageOfTotal,
        notes: rawInc.notes,
      });
    } else if (link.rawTargetItem) {
      const rawExp = link.rawTargetItem as ExpenseItem;
      onSelectNode({
        type: 'expense',
        itemId: rawExp.id,
        name: rawExp.name,
        amount: rawExp.amount,
        color: rawExp.color,
        category: rawExp.category,
        percentageOfFlow: link.percentageOfTotal,
        paymentType: rawExp.paymentType,
        priority: rawExp.priority,
        dueDateDay: rawExp.dueDateDay,
        monthlyStatus: rawExp.monthlyStatus,
        debtStatus: rawExp.debtStatus,
        isPostponed: rawExp.isPostponed,
        totalInstallments: rawExp.totalInstallments,
        currentInstallment: rawExp.currentInstallment,
        installmentNote: rawExp.installmentNote,
        totalDebt: rawExp.totalDebt,
        principalDebt: rawExp.principalDebt,
        totalWithInterest: rawExp.totalWithInterest,
        totalInterestCost: rawExp.totalInterestCost,
        interestConfig: rawExp.interestConfig,
        finalAdjustment: rawExp.finalAdjustment,
        notes: rawExp.notes,
        installmentHistory: rawExp.installmentHistory,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full glass-surface specular-top-light rounded-2xl shadow-2xl p-5 sm:p-7 overflow-hidden transition-all duration-300"
    >
      {/* Top Header of Diagram */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-2 border-b border-white/[0.08] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 shadow-lg shadow-sky-500/10">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Diagrama de Fluxo de Caixa (Sankey 3D & Glow)
              </h2>
              {isDeficit ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 animate-pulse">
                  Déficit Ativo
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  Superávit / Estável
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 text-sky-400" />
              <span>Clique em qualquer nó ou conexão para zoom e abrir o micro-detalhamento</span>
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] shadow-sm shadow-[#38BDF8]/60" />
            <span>Entradas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-sm shadow-[#F59E0B]/60" />
            <span>Caixa Central</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F472B6] shadow-sm shadow-[#F472B6]/60" />
            <span>Despesas</span>
          </div>
          {surplusAmount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-sm shadow-[#10B981]/80" />
              <span className="text-emerald-400 font-bold">Sobra Néon</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas Container with Responsive Scaling and Touch Handling */}
      <div className="relative w-full aspect-[2.15/1] min-h-[360px] max-h-[550px] overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            setHoveredLink(null);
            setHoveredNode(null);
          }}
        >
          <defs>
            {/* Gradients for each link with specular brightness */}
            {links.map((link) => (
              <linearGradient
                key={`grad-${link.id}`}
                id={`grad-${link.id}`}
                gradientUnits="userSpaceOnUse"
                x1={link.sourceId === 'node-center' ? centerX + 24 : leftX + nodeWidth}
                y1="0"
                x2={link.targetId === 'node-center' ? centerX : rightX}
                y2="0"
              >
                <stop offset="0%" stopColor={link.sourceColor} stopOpacity={0.65} />
                <stop offset="50%" stopColor={link.targetColor} stopOpacity={0.55} />
                <stop offset="100%" stopColor={link.targetColor} stopOpacity={0.7} />
              </linearGradient>
            ))}

            {/* Glowing filter for nodes */}
            <filter id="node-glow-filter" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Specular link glow */}
            <filter id="link-hover-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Column Indicators Header */}
          <text
            x={leftX}
            y={24}
            className="fill-neutral-400 text-[11px] font-bold tracking-wider uppercase font-mono"
          >
            Fontes de Entrada (Receitas)
          </text>
          <text
            x={centerX + 12}
            y={24}
            textAnchor="middle"
            className="fill-neutral-400 text-[11px] font-bold tracking-wider uppercase font-mono"
          >
            Caixa / Orçamento Total
          </text>
          <text
            x={rightX + nodeWidth}
            y={24}
            textAnchor="end"
            className="fill-neutral-400 text-[11px] font-bold tracking-wider uppercase font-mono"
          >
            Despesas & Sobra
          </text>

          {/* Links / Ribbons Layer with Smooth Curves */}
          <g className="links-layer">
            {links.map((link) => {
              const isHovered = hoveredLink?.id === link.id;
              const isRelated =
                hoveredNode &&
                (hoveredNode.id === link.sourceId || hoveredNode.id === link.targetId);
              const opacity = isHovered ? 0.95 : isRelated ? 0.85 : hoveredLink || hoveredNode ? 0.18 : 0.52;

              return (
                <path
                  key={link.id}
                  d={link.path}
                  fill={`url(#grad-${link.id})`}
                  opacity={opacity}
                  filter={isHovered ? 'url(#link-hover-glow)' : undefined}
                  className="transition-all duration-200 cursor-pointer hover:filter hover:brightness-125"
                  onMouseEnter={() => {
                    setHoveredLink(link);
                    setHoveredNode(null);
                  }}
                  onMouseLeave={() => setHoveredLink(null)}
                  onClick={() => handleLinkClick(link)}
                />
              );
            })}
          </g>

          {/* Nodes Layer */}
          <g className="nodes-layer">
            {nodes.map((node) => {
              const isHovered = hoveredNode?.id === node.id;
              const isClicked = clickedNodeId === node.id;
              const isCenter = node.column === 'center';
              const isLeft = node.column === 'left';
              const isRight = node.column === 'right';

              return (
                <g
                  key={node.id}
                  className="cursor-pointer group"
                  onMouseEnter={() => {
                    setHoveredNode(node);
                    setHoveredLink(null);
                  }}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => handleNodeClick(node)}
                >
                  {/* Node Rect with 3D Depth */}
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    rx={6}
                    fill={node.color}
                    className={`transition-all duration-200 ${isClicked ? 'scale-110' : ''}`}
                    filter={isHovered || isClicked ? 'url(#node-glow-filter)' : undefined}
                    stroke={isHovered || isClicked ? '#FFFFFF' : 'rgba(255,255,255,0.3)'}
                    strokeWidth={isHovered || isClicked ? 2.5 : 1}
                  />

                  {/* Left Column Labels */}
                  {isLeft && (
                    <g transform={`translate(${node.x + node.width + 12}, ${node.y + node.height / 2})`}>
                      <text
                        y={-3}
                        className="fill-white text-[12px] font-semibold leading-none select-none tracking-tight group-hover:fill-sky-400 transition-colors"
                        dominantBaseline="central"
                      >
                        {node.label}
                      </text>
                      <text
                        y={13}
                        className="fill-neutral-400 text-[11px] font-mono tabular-nums leading-none select-none"
                        dominantBaseline="central"
                      >
                        {formatBRL(node.value)} · {formatPercent(node.percentage)}
                      </text>
                    </g>
                  )}

                  {/* Center Column Label */}
                  {isCenter && (
                    <g transform={`translate(${node.x + node.width / 2}, ${node.y - 12})`}>
                      <text
                        textAnchor="middle"
                        className="fill-white text-[13px] font-black font-mono tracking-tight select-none"
                      >
                        {formatBRL(node.value)}
                      </text>
                    </g>
                  )}

                  {/* Right Column Labels */}
                  {isRight && (
                    <g transform={`translate(${node.x - 12}, ${node.y + node.height / 2})`}>
                      <text
                        textAnchor="end"
                        y={-3}
                        className={`text-[12px] font-semibold leading-none select-none tracking-tight group-hover:fill-sky-400 transition-colors ${
                          node.isSurplus ? 'fill-emerald-400 font-bold' : 'fill-white'
                        }`}
                        dominantBaseline="central"
                      >
                        {node.label}
                      </text>
                      <text
                        textAnchor="end"
                        y={13}
                        className={`text-[11px] font-mono tabular-nums leading-none select-none ${
                          node.isSurplus ? 'fill-emerald-400 font-semibold' : 'fill-neutral-400'
                        }`}
                        dominantBaseline="central"
                      >
                        {formatBRL(node.value)} · {formatPercent(node.percentage)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Tooltip with Smooth Positioning */}
        {(hoveredLink || hoveredNode) && (
          <div
            className="absolute z-30 pointer-events-none transition-all duration-75 px-3.5 py-2.5 rounded-xl bg-[#0F1115]/95 backdrop-blur-md border border-white/10 shadow-2xl text-xs max-w-xs"
            style={{
              left: `${Math.min(mousePos.x + 15, (containerRef.current?.clientWidth || 900) - 230)}px`,
              top: `${Math.max(10, mousePos.y - 45)}px`,
            }}
          >
            {hoveredLink && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-neutral-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: hoveredLink.sourceColor }}
                  />
                  <span className="truncate max-w-[95px]">{hoveredLink.sourceLabel}</span>
                  <span className="text-neutral-500">➔</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: hoveredLink.targetColor }}
                  />
                  <span className="truncate max-w-[95px]">{hoveredLink.targetLabel}</span>
                </div>
                <div className="text-sm font-bold font-mono text-white flex items-center justify-between gap-3 pt-0.5">
                  <span>{formatBRL(hoveredLink.value)}</span>
                  <span className="text-sky-400 text-xs font-normal">
                    {formatPercent(hoveredLink.percentageOfTotal)} do fluxo
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 flex items-center gap-1 pt-0.5">
                  <MousePointerClick className="w-3 h-3 text-sky-400" />
                  <span>Clique para micro-detalhamento</span>
                </div>
              </div>
            )}

            {hoveredNode && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-md shrink-0 shadow-sm"
                    style={{ backgroundColor: hoveredNode.color }}
                  />
                  <span className="font-bold text-white">{hoveredNode.label}</span>
                </div>
                <div className="text-sm font-bold font-mono text-white flex items-center justify-between gap-3 pt-0.5">
                  <span>{formatBRL(hoveredNode.value)}</span>
                  <span className="text-neutral-400 text-xs font-normal">
                    {formatPercent(hoveredNode.percentage)} do total
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 flex items-center gap-1 pt-0.5">
                  <MousePointerClick className="w-3 h-3 text-sky-400" />
                  <span>Clique para configurar parcelas e juros</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info of Diagram */}
      <div className="mt-3 pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-400 shrink-0" />
          <span>
            {isDeficit ? (
              <span className="text-rose-400 font-semibold">
                Alerta de Caixa: As saídas ultrapassam as entradas em {formatBRL(deficitAmount)}.
              </span>
            ) : surplusAmount > 0 ? (
              <span className="text-emerald-400 font-medium">
                Fluxo Saudável: Saldo positivo livre de {formatBRL(surplusAmount)} para aportes ou investimentos.
              </span>
            ) : (
              <span className="text-neutral-300">
                Orçamento equilibrado: 100% das receitas comprometidas com os compromissos.
              </span>
            )}
          </span>
        </div>
        <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-2">
          <span>60 FPS Vetorial</span>
          <span>·</span>
          <span>Fluxos Reativos</span>
        </div>
      </div>
    </div>
  );
};
