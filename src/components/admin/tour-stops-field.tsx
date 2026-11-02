'use client';

import {ArrowDown, ArrowUp, Plus, Trash2} from 'lucide-react';
import {useId, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import type {TourStop} from '@/server/content-schema';
import {type UploadedImage, UploadField} from './upload-field';

/** A stop as the form holds it: the positions stay as the admin's text until the server parses them on save. */
type Draft = Omit<TourStop, 'positions'> & {positions: string};
type Device = 'desktop' | 'mobile';

const STARTER_VIEW = {y: 0, box: {x: 0, y: 0, w: 100, h: 100}};
const NO_CAPTURE = {url: '', width: 0, height: 0};

const toDraft = ({positions, ...stop}: TourStop): Draft => ({...stop, positions: JSON.stringify(positions, null, 2)});

const newDraft = (): Draft => ({
  key: crypto.randomUUID(),
  heading: '',
  note: '',
  emphasis: null,
  selected: '',
  onScreen: '',
  path: '/',
  alt: '',
  captures: {desktop: NO_CAPTURE, mobile: NO_CAPTURE},
  positions: JSON.stringify({desktop: STARTER_VIEW, mobile: STARTER_VIEW}, null, 2),
});

type TextInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  rows?: number;
  mono?: boolean;
};

/** One labelled field of a stop. These repeat per stop, so unlike the form's other fields they have no name and post nothing of their own. */
function StopField({label, value, onChange, hint, rows, mono = false}: TextInputProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {rows ? (
        <Textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={mono ? 'font-mono text-xs' : undefined}
        />
      ) : (
        <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

type StopCardProps = {
  stop: Draft;
  number: number;
  total: number;
  onChange: (patch: Partial<Draft>) => void;
  onMove: (by: -1 | 1) => void;
  onRemove: () => void;
};

function StopCard({stop, number, total, onChange, onMove, onRemove}: StopCardProps) {
  const setCapture = (device: Device, image: UploadedImage | null) => onChange({captures: {...stop.captures, [device]: image ?? NO_CAPTURE}});
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-4 rounded-lg border p-4">
      <legend className="px-1 text-sm font-medium">Stop {number}</legend>
      <div className="flex flex-wrap justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 min-w-11"
          disabled={number === 1}
          aria-label={`Move stop ${number} up`}
          onClick={() => onMove(-1)}
        >
          <ArrowUp />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 min-w-11"
          disabled={number === total}
          aria-label={`Move stop ${number} down`}
          onClick={() => onMove(1)}
        >
          <ArrowDown />
        </Button>
        <Button type="button" variant="ghost" className="min-h-11 min-w-11" aria-label={`Remove stop ${number}`} onClick={onRemove}>
          <Trash2 />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <StopField label="Heading" value={stop.heading} onChange={(heading) => onChange({heading})} />
        <StopField
          label="Page path"
          hint="The path on the live site, such as /category/scissor-lift"
          value={stop.path}
          onChange={(path) => onChange({path})}
        />
        <StopField label="Selected label" hint="The label on the selection box" value={stop.selected} onChange={(selected) => onChange({selected})} />
        <StopField label="On screen" hint="One line on what the capture shows" value={stop.onScreen} onChange={(onScreen) => onChange({onScreen})} />
      </div>
      <StopField
        label="Note"
        hint="Leave empty on the first stop to use it only as the opening frame."
        rows={3}
        value={stop.note}
        onChange={(note) => onChange({note})}
      />
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <StopField
          label="Emphasis"
          hint="Words from the note to pick out. Optional."
          value={stop.emphasis ?? ''}
          onChange={(emphasis) => onChange({emphasis})}
        />
        <StopField label="Alt text" hint="Describes this stop's captures for screen readers" value={stop.alt} onChange={(alt) => onChange({alt})} />
      </div>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <UploadField
          name={`tourCapture-${stop.key}-desktop`}
          label="Desktop capture"
          kind="image"
          defaultValue={stop.captures.desktop.url}
          onUploaded={(image) => setCapture('desktop', image)}
        />
        <UploadField
          name={`tourCapture-${stop.key}-mobile`}
          label="Mobile capture"
          kind="image"
          defaultValue={stop.captures.mobile.url}
          onUploaded={(image) => setCapture('mobile', image)}
        />
      </div>
      <StopField
        label="Positions JSON"
        hint="Desktop and mobile, each with y and box (x, y, w, h), in the capture's own pixels. Optional: startY, x, zoom, labelAt."
        rows={8}
        mono
        value={stop.positions}
        onChange={(positions) => onChange({positions})}
      />
    </fieldset>
  );
}

type TourStopsFieldProps = {
  defaultStops: TourStop[];
  errors: Record<string, string[]> | undefined;
};

/** The tour editor. Stops live in state and post as one JSON field, so an error on save leaves every edit in place. */
export function TourStopsField({defaultStops, errors}: TourStopsFieldProps) {
  const [stops, setStops] = useState<Draft[]>(() => defaultStops.map(toDraft));
  const error = errors?.tourStops?.[0];

  const update = (key: string, patch: Partial<Draft>) =>
    setStops((current) => current.map((stop) => (stop.key === key ? {...stop, ...patch} : stop)));
  const move = (index: number, by: -1 | 1) =>
    setStops((current) => {
      const next = [...current];
      const [stop] = next.splice(index, 1);
      next.splice(index + by, 0, stop);
      return next;
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="m-0 text-base font-medium">Tour stops</h2>
        <p className="m-0 text-xs text-muted-foreground">
          A project shows The Walkthrough once a stop has a note. Without one it keeps the standard layout.
        </p>
      </div>
      <input type="hidden" name="tourStops" value={JSON.stringify(stops)} />
      {stops.map((stop, index) => (
        <StopCard
          key={stop.key}
          stop={stop}
          number={index + 1}
          total={stops.length}
          onChange={(patch) => update(stop.key, patch)}
          onMove={(by) => move(index, by)}
          onRemove={() => setStops((current) => current.filter(({key}) => key !== stop.key))}
        />
      ))}
      {error ? (
        <p role="alert" className="m-0 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div>
        <Button type="button" variant="outline" onClick={() => setStops((current) => [...current, newDraft()])}>
          <Plus />
          Add stop
        </Button>
      </div>
    </div>
  );
}
