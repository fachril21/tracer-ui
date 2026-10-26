import { useId } from "react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const INPUT_CLASS =
  "h-[34px] w-full rounded-md border border-border-control bg-canvas px-3 text-body text-ink placeholder:text-stone disabled:bg-surface-soft disabled:text-mute aria-[invalid=true]:border-danger-text";

type TextFieldProps = Omit<ComponentProps<"input">, "id"> & {
  label: string;
  hint?: string;
  // Teks galat menggantikan petunjuk dan menandai kolom tidak valid
  error?: string | null;
};

// Label selalu terlihat dan terhubung ke kolomnya. Petunjuk dan galat dibacakan lewat aria-describedby.
function TextField({ label, hint, error, className, ...props }: TextFieldProps) {
  const id = useId();
  const noteId = `${id}-note`;
  const note = error ?? hint;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-caption font-medium text-charcoal">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error === null || error === undefined ? undefined : true}
        aria-describedby={note === undefined ? undefined : noteId}
        className={cn(INPUT_CLASS, className)}
        {...props}
      />
      {note === undefined ? null : (
        <p id={noteId} className={cn("text-caption", error ? "text-danger-text" : "text-mute")}>
          {note}
        </p>
      )}
    </div>
  );
}

export { TextField };
