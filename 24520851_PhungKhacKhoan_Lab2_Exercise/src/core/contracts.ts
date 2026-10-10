export type Props = Record<string, unknown>;

export interface VNode {
  readonly type: string;
  readonly props: Readonly<
    Props & {
      children: readonly VNode[];
    }
  >;
}
export type Child =
  | VNode
  | string
  | number
  | boolean
  | null
  | undefined
  | Child[];
export function isVNode(value: unknown): value is VNode {
  if (!value || typeof value !== "object") {
    return false;
  }
  const node = value as VNode;
  return (
    typeof node.type === "string" &&
    !!node.props &&
    Array.isArray(node.props.children)
  );
}