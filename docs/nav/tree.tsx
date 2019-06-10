import * as React from 'react';

export interface NavTree {}

export type NavNode<T extends { [key: string]: NavNode<any> }> = {
  title: string;
  link: string;
  depth: number;
} & T;

function increaseDepth<T extends { [key: string]: NavNode<any> }>(node: NavNode<T>): NavNode<T> {
  const { title, link, depth, ...children } = node;
  const out: any = { title, link, depth: depth + 1 };
  for (const key of Object.keys(children)) {
    out[key] = increaseDepth(children[key]);
  }

  return out;
}

/**
 * Flattens the nav tree.
 */
export const flatten = (node: NavNode<any>): NavNode<{}>[] => {
  const out: NavNode<{}>[] = [];

  const queue = [node];
  let next: NavNode<any> | null;
  while ((next = queue.pop())) {
    const { title, link, depth, ...children } = next;
    out.push({ title, link, depth });

    for (const key of Object.keys(children)) {
      queue.push(children[key]);
    }
  }

  return out;
};

/**
 * Creates a new navigation node.
 */
export const nav = <T extends { [key: string]: NavNode<any> }>(
  title: string,
  children?: T,
): NavNode<T> =>
  increaseDepth<T>({
    title,
    link: title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/^-+|-+$/g, ''),
    depth: 0,
    ...children,
  } as NavNode<T>);

export const Reference: React.FC<{ node: NavNode<any>; className?: string }> = ({
  node,
  className,
  children,
}) => (
  <a className={className} href={`#${node.link}`}>
    {children || node.title}
  </a>
);
