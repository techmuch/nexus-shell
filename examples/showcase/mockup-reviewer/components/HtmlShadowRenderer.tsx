import React, { useEffect } from 'react';

interface HtmlShadowRendererProps {
  htmlContent: string;
  onElementClick?: (selector: string, clientX: number, clientY: number) => void;
  shadowHostRef: React.RefObject<HTMLDivElement | null>;
}

export const HtmlShadowRenderer: React.FC<HtmlShadowRendererProps> = ({
  htmlContent,
  onElementClick,
  shadowHostRef,
}) => {
  useEffect(() => {
    const host = shadowHostRef.current;
    if (!host) return;

    let shadowRoot = host.shadowRoot;
    if (!shadowRoot) {
      shadowRoot = host.attachShadow({ mode: 'open' });
    }

    // 1. Parse & Sanitize HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Remove potential XSS tags
    doc.querySelectorAll('script, iframe, object, embed, applet').forEach((el) => el.remove());

    // Strip inline event listeners
    const sanitizeEvents = (node: ChildNode) => {
      if (node.nodeType === 1) { // ELEMENT_NODE
        const el = node as HTMLElement;
        const attrs = Array.from(el.attributes);
        for (const attr of attrs) {
          if (attr.name.startsWith('on')) {
            el.removeAttribute(attr.name);
          }
          if (attr.name === 'href' && attr.value.trim().toLowerCase().startsWith('javascript:')) {
            el.removeAttribute(attr.name);
          }
        }
      }
      node.childNodes.forEach((child) => sanitizeEvents(child));
    };
    doc.childNodes.forEach((child) => sanitizeEvents(child));

    // 2. Insert sanitized HTML
    shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          min-height: 400px;
          overflow: auto;
          box-sizing: border-box;
        }
      </style>
      ${doc.body.innerHTML}
    `;

    // 3. Setup event intercepting for element tethering clicks
    const handleMouseUp = (e: MouseEvent) => {
      if (!onElementClick || !shadowRoot) return;
      const target = e.target as HTMLElement;
      if (!target || target === doc.body || target.tagName === 'BODY') return;

      // Build unique selector
      const getSelector = (element: HTMLElement): string => {
        if (element.id) return `#${element.id}`;
        const path: string[] = [];
        let current: HTMLElement | null = element;
        while (current && current.nodeType === 1 && current.tagName !== 'BODY') {
          let selector = current.tagName.toLowerCase();
          if (current.id) {
            selector += `#${current.id}`;
            path.unshift(selector);
            break;
          } else {
            let sibling = current.previousElementSibling;
            let index = 1;
            while (sibling) {
              if (sibling.tagName === current.tagName) index++;
              sibling = sibling.previousElementSibling;
            }
            selector += `:nth-of-type(${index})`;
          }
          path.unshift(selector);
          current = current.parentElement;
        }
        return path.join(' > ');
      };

      const selector = getSelector(target);
      onElementClick(selector, e.clientX, e.clientY);
    };

    shadowRoot.addEventListener('mouseup', handleMouseUp as EventListener);
    return () => {
      shadowRoot?.removeEventListener('mouseup', handleMouseUp as EventListener);
    };
  }, [htmlContent, onElementClick, shadowHostRef]);

  return <div ref={shadowHostRef} className="w-full h-full min-h-[400px] bg-background text-foreground rounded-lg overflow-hidden border border-border/40" />;
};
