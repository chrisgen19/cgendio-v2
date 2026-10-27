import {type ComponentProps, type ReactNode, useState} from 'react';
import {useFormStatus} from 'react-dom';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Switch} from '@/components/ui/switch';
import {Textarea} from '@/components/ui/textarea';
import {useUploadStatus} from './upload-status';

type FieldErrors = Record<string, string[]> | undefined;

type FieldShellProps = {
  name: string;
  label: string;
  hint?: string;
  errors: FieldErrors;
  children: (aria: {id: string; 'aria-invalid'?: true; 'aria-describedby'?: string}) => ReactNode;
};

/**
 * Label, control, hint and the field's server error, with the error wired to aria-describedby.
 * Only used inside the admin's client forms (SubmitButton uses React hooks).
 */
export function FieldShell({name, label, hint, errors, children}: FieldShellProps) {
  const id = `field-${name}`;
  const error = errors?.[name]?.[0];
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children({id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy})}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type TextFieldProps = Omit<ComponentProps<typeof Input>, 'name'> & {name: string; label: string; hint?: string; errors: FieldErrors};

export function TextField({name, label, hint, errors, ...props}: TextFieldProps) {
  return (
    <FieldShell name={name} label={label} hint={hint} errors={errors}>
      {(aria) => <Input name={name} {...aria} {...props} />}
    </FieldShell>
  );
}

type ColorFieldProps = {name: string; label: string; hint?: string; defaultValue?: string | null; errors: FieldErrors};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/**
 * A `#rrggbb` text field with a swatch of the colour typed so far. A text input rather than `type="color"`, which always
 * posts a colour and so can't be left empty. No maxLength: it would cut a pasted ` #E31836 ` before the server trims it.
 */
export function ColorField({name, label, hint, defaultValue, errors}: ColorFieldProps) {
  const [value, setValue] = useState(defaultValue ?? '');
  const valid = HEX_COLOR.test(value.trim());
  return (
    <FieldShell name={name} label={label} hint={hint} errors={errors}>
      {(aria) => (
        <div className="flex items-center gap-2">
          <Input
            name={name}
            {...aria}
            defaultValue={defaultValue ?? ''}
            onChange={(event) => setValue(event.target.value)}
            placeholder="#e31836"
            spellCheck={false}
            autoComplete="off"
            className="font-mono"
          />
          <span aria-hidden="true" className="size-9 shrink-0 rounded-md border" style={valid ? {backgroundColor: value.trim()} : undefined} />
        </div>
      )}
    </FieldShell>
  );
}

type TextAreaFieldProps = Omit<ComponentProps<typeof Textarea>, 'name'> & {name: string; label: string; hint?: string; errors: FieldErrors};

export function TextAreaField({name, label, hint, errors, ...props}: TextAreaFieldProps) {
  return (
    <FieldShell name={name} label={label} hint={hint} errors={errors}>
      {(aria) => <Textarea name={name} {...aria} {...props} />}
    </FieldShell>
  );
}

type SelectFieldProps = {
  name: string;
  label: string;
  options: ReadonlyArray<{value: string; label: string}>;
  defaultValue?: string;
  errors: FieldErrors;
};

export function SelectField({name, label, options, defaultValue, errors}: SelectFieldProps) {
  return (
    <FieldShell name={name} label={label} errors={errors}>
      {(aria) => (
        <Select name={name} defaultValue={defaultValue}>
          <SelectTrigger {...aria} className="w-full">
            <SelectValue placeholder="Choose…" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FieldShell>
  );
}

type SwitchFieldProps = {name: string; label: string; hint?: string; defaultChecked?: boolean};

/** Posts "on" when checked (Radix renders a hidden input for named switches inside a form). */
export function SwitchField({name, label, hint, defaultChecked}: SwitchFieldProps) {
  const id = `field-${name}`;
  return (
    <div className="flex items-start gap-3">
      <Switch id={id} name={name} defaultChecked={defaultChecked} aria-describedby={hint ? `${id}-hint` : undefined} className="mt-0.5" />
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id}>{label}</Label>
        {hint ? (
          <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

type SubmitButtonProps = {
  children: ReactNode;
  /** From useAdminForm; falls back to useFormStatus, which only sees <form action> submissions */
  pending?: boolean;
};

export function SubmitButton({children, pending: pendingProp}: SubmitButtonProps) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  // Also disabled while an UploadField is uploading, so a save can't race the upload (see upload-status.tsx)
  const {uploading} = useUploadStatus();
  return (
    <Button type="submit" size="lg" disabled={pending || uploading}>
      {pending ? 'Saving…' : uploading ? 'Uploading…' : children}
    </Button>
  );
}
