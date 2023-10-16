---
title: 'typescript笔记'
date: '2023-10-16'
---

- Partial
```ts
type Partial<T> = {
  [P in keyof T]?: T[P];
};
```

- Required
```ts
type Required<T> = {
  [P in keyof T]-?: T[P];
};
```

- Readonly
```ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

- Record
```ts
type Record<K extends keyof any, T> = {
    [P in K]: T;
};
```

- Pick
```ts
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

- Exclude
```ts
type Exclude<T, U> = T extends U ? never : T;
- Omit
```

```ts
type Omit<T,K> = Pick<T,Exclude<keyof T, K>>
```

- Extract
```ts
Type Extract<T, U> = T extends U ? T : never;
```

- NonNullable
```ts
type NonNullable<T> = T extends null | undefined ? never : T;
```

- Parameters
```ts
type Parameters<T extends (...args: any[]) => any> = T extends (...args: infer P) => any ? P : never;
```

- Mutable
```ts
type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}
```