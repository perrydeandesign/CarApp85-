// Ambient type shim for react-native-vector-icons.
//
// v10 ships without bundled TypeScript declarations, and @types/react-native-vector-icons
// is not installed, so each `import Icon from 'react-native-vector-icons/<Set>'` triggers
// TS7016 (implicit any). This declares the icon-set entry points we actually import as a
// React component taking the common Icon props, giving us type-checked usage without the
// extra dependency.

declare module 'react-native-vector-icons/Ionicons' {
  import type { Component } from 'react';
  import type { TextProps } from 'react-native';

  export interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  export default class Icon extends Component<IconProps> {}
}

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import type { Component } from 'react';
  import type { TextProps } from 'react-native';

  export interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  export default class Icon extends Component<IconProps> {}
}
