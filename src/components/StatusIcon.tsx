import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T } from '../constants/theme';

type Props = {
  status?: 'sent' | 'delivered' | 'read' | 'failed' | string;
  size?: number;
};

/** Tiny status indicator for message states. */
export function StatusIcon({ status, size = 12 }: Props) {
  switch (status) {
    case 'read':
      return <Ionicons name="checkmark-done" size={size} color={T.accent} />;
    case 'delivered':
      return <Ionicons name="checkmark-done" size={size} color={T.mu} />;
    case 'failed':
      return <Ionicons name="alert-circle" size={size} color={T.danger} />;
    default:
      return <Ionicons name="checkmark" size={size} color={T.mu} />;
  }
}
