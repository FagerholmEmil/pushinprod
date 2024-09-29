export type KnowledgeTree = Record<
  string,
  {
    source: string;
    dependencies: string[];
  }
>;
