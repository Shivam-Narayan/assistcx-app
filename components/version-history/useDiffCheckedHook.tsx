interface DiffItem {
  path: string;
  value?: unknown;
  oldValue?: unknown;
  newValue?: unknown;
}

interface DiffResult {
  added: DiffItem[];
  removed: DiffItem[];
  changed: DiffItem[];
}

type EntityType = "agent" | "data_template" | "class_group" | "generic";

// Identifier fields used for matching array items
const IDENTIFIER_FIELDS = [
  "name",
  "step_name",
  "label",
  "action",
  "class_name",
] as const;

// Fields to skip during comparison
const SKIP_FIELDS = new Set(["id", "index", "key"]);

// Helper functions moved outside to avoid recreation on each call
function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  return (
    obj !== null &&
    typeof obj === "object" &&
    !Array.isArray(obj) &&
    Object.prototype.toString.call(obj) === "[object Object]"
  );
}

function getValueByPath(obj: unknown, path: string): unknown {
  const parts = path.match(/([^.\[\]]+)|\[(\d+)\]/g);
  if (!parts) return undefined;

  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    const key = part.startsWith("[") ? parseInt(part.slice(1, -1)) : part;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function getIdentifier(obj: Record<string, unknown>): unknown {
  for (const field of IDENTIFIER_FIELDS) {
    if (obj[field] !== undefined) return obj[field];
  }
  return undefined;
}

function getNameFromArray(
  arr1: unknown,
  arr2: unknown,
  index: number,
  nameField: string
): string | undefined {
  const idx = index;
  for (const arr of [arr2, arr1]) {
    if (Array.isArray(arr)) {
      const item = arr[idx];
      if (isPlainObject(item)) {
        const name = item[nameField];
        if (typeof name === "string") return name;
      }
    }
  }
  return undefined;
}

function mergeKeys(...objects: Record<string, unknown>[]): Set<string> {
  const keys = new Set<string>();
  for (const obj of objects) {
    for (const key of Object.keys(obj)) {
      keys.add(key);
    }
  }
  return keys;
}

// Flatten object/array into path-value pairs
function flattenToPaths(
  value: unknown,
  basePath: string,
  enhancePathFn: (path: string) => string
): DiffItem[] {
  const items: DiffItem[] = [];

  function recurse(val: unknown, path: string): void {
    if (val == null) {
      items.push({ path: enhancePathFn(path), value: val });
      return;
    }

    if (Array.isArray(val)) {
      if (val.length === 0) {
        items.push({ path: enhancePathFn(path), value: val });
        return;
      }

      // Check if array of primitives only
      const hasPrimitiveOnly = val.every(
        (item) => !isPlainObject(item) && !Array.isArray(item)
      );
      if (hasPrimitiveOnly) {
        items.push({ path: enhancePathFn(path), value: val });
        return;
      }

      for (let i = 0; i < val.length; i++) {
        recurse(val[i], `${path}[${i}]`);
      }
      return;
    }

    if (isPlainObject(val)) {
      const keys = Object.keys(val);
      if (keys.length === 0) {
        items.push({ path: enhancePathFn(path), value: val });
        return;
      }

      for (const key of keys) {
        if (SKIP_FIELDS.has(key)) continue;
        recurse(val[key], path ? `${path}.${key}` : key);
      }
      return;
    }

    // Primitive value
    items.push({ path: enhancePathFn(path), value: val });
  }

  recurse(value, basePath);
  return items;
}

// Path enhancement strategies
const pathEnhancers: Record<
  EntityType,
  (path: string, obj1: unknown, obj2: unknown) => string
> = {
  agent: (path, obj1, obj2) => {
    const regex = /([^\[\]]+)\[(\d+)\]/g;
    let enhancedPath = path;
    let match;

    while ((match = regex.exec(path)) !== null) {
      const [, arrayPath, index] = match;
      const fullPath = path.substring(0, match.index + arrayPath.length);
      const arr1 = getValueByPath(obj1, fullPath);
      const arr2 = getValueByPath(obj2, fullPath);
      const name = getNameFromArray(arr1, arr2, parseInt(index), "name");

      if (name) {
        enhancedPath = enhancedPath.replace(`[${index}]`, `[${name}]`);
      }
    }
    return enhancedPath;
  },

  data_template: (path, obj1, obj2) => {
    let enhancedPath = path;

    // Handle data_schema
    const dataSchemaPattern = /data_schema\[(\d+)\](?:\.(\w+))?/g;
    let match;

    while ((match = dataSchemaPattern.exec(path)) !== null) {
      const [, index, hasNestedProperty] = match;
      if (hasNestedProperty) {
        const arr1 = getValueByPath(obj1, "data_schema");
        const arr2 = getValueByPath(obj2, "data_schema");
        const name = getNameFromArray(arr1, arr2, parseInt(index), "name");

        if (name) {
          enhancedPath = enhancedPath.replace(`data_schema[${index}]`, name);
        }
      }
    }

    // Handle field_schema
    for (const match of path.matchAll(/field_schema\[(\d+)\]/g)) {
      const fieldIndex = match[1];
      const beforeFieldSchema = path.substring(0, match.index);
      const dataSchemaMatch = beforeFieldSchema.match(/data_schema\[(\d+)\]/);

      if (dataSchemaMatch) {
        const fieldSchemaPath = `data_schema[${dataSchemaMatch[1]}].field_schema`;
        const arr1 = getValueByPath(obj1, fieldSchemaPath);
        const arr2 = getValueByPath(obj2, fieldSchemaPath);
        const name = getNameFromArray(arr1, arr2, parseInt(fieldIndex), "name");

        if (name) {
          enhancedPath = enhancedPath.replace(
            `field_schema[${fieldIndex}]`,
            `[${name}]`
          );
        }
      }
    }
    return enhancedPath;
  },

  generic: (path) => path,

  class_group: (path, obj1, obj2) => {
    let enhancedPath = path;
    const classSchemaPattern = /class_schema\[(\d+)\](?:\.(\w+))?/g;
    let match;

    while ((match = classSchemaPattern.exec(path)) !== null) {
      const [, index, hasNestedProperty] = match;
      if (hasNestedProperty) {
        const arr1 = getValueByPath(obj1, "class_schema");
        const arr2 = getValueByPath(obj2, "class_schema");
        const name = getNameFromArray(
          arr1,
          arr2,
          parseInt(index),
          "class_name"
        );

        if (name) {
          enhancedPath = enhancedPath.replace(`class_schema[${index}]`, name);
        }
      }
    }
    return enhancedPath;
  },
};

export const compareJSONSummary = (
  json1: string | object,
  json2: string | object,
  entityType: EntityType
): { summary: string; diff: DiffResult } => {
  const obj1: unknown = typeof json1 === "string" ? JSON.parse(json1) : json1;
  const obj2: unknown = typeof json2 === "string" ? JSON.parse(json2) : json2;

  const enhancePath = (path: string): string =>
    pathEnhancers[entityType](path, obj1, obj2);

  function compareObjectKeys(
    obj1Record: Record<string, unknown>,
    obj2Record: Record<string, unknown>,
    basePath: string,
    result: DiffResult
  ): void {
    const allKeys = mergeKeys(obj1Record, obj2Record);

    for (const key of allKeys) {
      if (SKIP_FIELDS.has(key)) continue;

      const propPath = `${basePath}.${key}`;
      const nested = deepCompare(obj1Record[key], obj2Record[key], propPath);
      result.added.push(...nested.added);
      result.removed.push(...nested.removed);
      result.changed.push(...nested.changed);
    }
  }

  function deepCompare(o1: unknown, o2: unknown, path = ""): DiffResult {
    const result: DiffResult = { added: [], removed: [], changed: [] };

    // Handle null/undefined or type changes
    if (o1 == null || o2 == null || typeof o1 !== typeof o2) {
      if (o1 !== o2) {
        result.changed.push({
          path: enhancePath(path),
          oldValue: o1,
          newValue: o2,
        });
      }
      return result;
    }

    // Arrays
    if (Array.isArray(o1) && Array.isArray(o2)) {
      return compareArrays(o1, o2, path, result);
    }

    // Primitives
    if (!isPlainObject(o1) || !isPlainObject(o2)) {
      if (o1 !== o2) {
        result.changed.push({
          path: enhancePath(path),
          oldValue: o1,
          newValue: o2,
        });
      }
      return result;
    }

    // Objects
    const allKeys = mergeKeys(o1, o2);
    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;

      if (!(key in o1)) {
        // Flatten the added value to show individual keys
        const addedItems = flattenToPaths(o2[key], currentPath, enhancePath);
        result.added.push(...addedItems);
      } else if (!(key in o2)) {
        // Flatten the removed value to show individual keys
        const removedItems = flattenToPaths(o1[key], currentPath, enhancePath);
        result.removed.push(...removedItems);
      } else {
        const nested = deepCompare(o1[key], o2[key], currentPath);
        result.added.push(...nested.added);
        result.removed.push(...nested.removed);
        result.changed.push(...nested.changed);
      }
    }
    return result;
  }

  function compareArrays(
    o1: unknown[],
    o2: unknown[],
    path: string,
    result: DiffResult
  ): DiffResult {
    // Primitive arrays - exact comparison
    const hasPrimitiveOnly =
      o1.every((item) => !isPlainObject(item)) &&
      o2.every((item) => !isPlainObject(item));

    if (hasPrimitiveOnly) {
      if (o1.length !== o2.length) {
        result.changed.push({
          path: enhancePath(path),
          oldValue: o1,
          newValue: o2,
        });
        return result;
      }

      for (let i = 0; i < o1.length; i++) {
        if (o1[i] !== o2[i]) {
          result.changed.push({
            path: enhancePath(`${path}[${i}]`),
            oldValue: o1[i],
            newValue: o2[i],
          });
        }
      }
      return result;
    }

    // Object arrays - match by identifier then position
    const matched1 = new Set<number>();
    const matched2 = new Set<number>();

    // First pass: match by identifier
    for (let i = 0; i < o1.length; i++) {
      if (!isPlainObject(o1[i])) continue;

      const identifier = getIdentifier(o1[i] as Record<string, unknown>);
      if (identifier === undefined) continue;

      for (let j = 0; j < o2.length; j++) {
        if (matched2.has(j) || !isPlainObject(o2[j])) continue;

        if (identifier === getIdentifier(o2[j] as Record<string, unknown>)) {
          matched1.add(i);
          matched2.add(j);
          compareObjectKeys(
            o1[i] as Record<string, unknown>,
            o2[j] as Record<string, unknown>,
            `${path}[${i}]`,
            result
          );
          break;
        }
      }
    }

    // Second pass: match by position (same length arrays)
    if (o1.length === o2.length) {
      for (let i = 0; i < o1.length; i++) {
        if (matched1.has(i) || matched2.has(i)) continue;
        if (!isPlainObject(o1[i]) || !isPlainObject(o2[i])) continue;

        matched1.add(i);
        matched2.add(i);
        compareObjectKeys(
          o1[i] as Record<string, unknown>,
          o2[i] as Record<string, unknown>,
          `${path}[${i}]`,
          result
        );
      }
    }

    // Unmatched items: removed from o1, added to o2
    for (let i = 0; i < o1.length; i++) {
      if (!matched1.has(i)) {
        // Flatten the removed array item to show individual keys
        const removedItems = flattenToPaths(
          o1[i],
          `${path}[${i}]`,
          enhancePath
        );
        result.removed.push(...removedItems);
      }
    }

    for (let j = 0; j < o2.length; j++) {
      if (!matched2.has(j)) {
        const addedItems = flattenToPaths(o2[j], `${path}[${j}]`, enhancePath);
        result.added.push(...addedItems);
      }
    }

    return result;
  }

  const diff = deepCompare(obj1, obj2);
  const { added, removed, changed } = diff;
  const totalChanges = added.length + removed.length + changed.length;

  return {
    summary: `Found ${totalChanges} difference(s): ${added.length} added, ${removed.length} removed, ${changed.length} changed`,
    diff,
  };
};
