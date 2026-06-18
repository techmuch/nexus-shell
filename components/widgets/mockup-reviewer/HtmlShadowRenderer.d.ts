import { default as React } from '../../../../node_modules/react';

interface HtmlShadowRendererProps {
    htmlContent: string;
    onElementClick?: (selector: string, clientX: number, clientY: number) => void;
    shadowHostRef: React.RefObject<HTMLDivElement | null>;
}
export declare const HtmlShadowRenderer: React.FC<HtmlShadowRendererProps>;
export {};
