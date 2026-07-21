import type { FormEvent, ReactNode } from "react";

type EntityFormProps = {
  title: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  helper?: string;
  children: ReactNode;
};

export function EntityForm({ title, onSubmit, submitLabel, helper, children }: Readonly<EntityFormProps>) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {helper ? <p className="helper">{helper}</p> : null}
      <form className="page-grid" onSubmit={onSubmit}>
        <div className="form-grid">{children}</div>
        <button type="submit">{submitLabel}</button>
      </form>
    </section>
  );
}
