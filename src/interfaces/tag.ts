export interface Tag {
  id: string;
  name: string;
  nested: 'clean' | 'fail';
  createdAt: string;
}
