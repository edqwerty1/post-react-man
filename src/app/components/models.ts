export type Request = {
  url: string;
  action: string;
  headers: Header[];
};
type Header = {
  key: string;
  value: string;
};
