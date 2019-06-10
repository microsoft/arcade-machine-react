import * as React from 'react';
import { NavNode } from './tree';

export const Title: React.FC<{ node: NavNode<any> }> = ({ node }) =>
  React.createElement(`h${node.depth}`, { id: node.link }, [node.title]);
