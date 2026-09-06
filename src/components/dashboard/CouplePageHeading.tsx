import { ReactNode } from 'react';

export default function CouplePageHeading({ title, detail, children }: { title: string; detail: string; children?: ReactNode }) {
  return <header className="fv-page-heading"><div><p>{detail}</p><h1>{title}</h1></div>{children}</header>;
}
