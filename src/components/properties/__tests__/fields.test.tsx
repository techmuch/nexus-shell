import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  CheckboxField,
  ColorField,
  DateField,
  NumberField,
  SelectField,
  StaticField,
  TagField,
  TextAreaField,
  TextField,
} from '../fields';

/**
 * Each field is an ordinary controlled component, so the two things worth
 * testing are that it reports edits faithfully and that `mixed` never shows one
 * subject's value as if it were everyone's.
 */

afterEach(cleanup);

const OPTIONS = [
  { value: 'idea', label: 'Idea' },
  { value: 'question', label: 'Question' },
];

describe('TextField', () => {
  it('renders the value and reports edits', async () => {
    const onChange = vi.fn();
    render(<TextField label="Label" value="Hello" onChange={onChange} />);

    expect(screen.getByLabelText('Label')).toHaveValue('Hello');
    await userEvent.type(screen.getByLabelText('Label'), '!');
    expect(onChange).toHaveBeenCalledWith('Hello!');
  });

  it('renders undefined as empty rather than "undefined"', () => {
    render(<TextField label="Label" value={undefined} />);
    expect(screen.getByLabelText('Label')).toHaveValue('');
  });

  it('shows a placeholder, not a value, when mixed', () => {
    render(<TextField label="Label" value="One" mixed />);

    const input = screen.getByLabelText('Label');
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('placeholder', 'Mixed values');
    expect(screen.getByText('Mixed')).toBeInTheDocument();
  });

  it('still edits while mixed, so a selection can be set at once', async () => {
    const onChange = vi.fn();
    render(<TextField label="Label" value="One" mixed onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Label'), 'x');
    expect(onChange).toHaveBeenCalledWith('x');
  });

  it('shows an error in place of the description', () => {
    render(<TextField label="Label" value="" description="Helpful" error="Required" />);

    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.queryByText('Helpful')).not.toBeInTheDocument();
  });

  it('honours inputType', () => {
    render(<TextField label="Site" value="" inputType="url" />);
    expect(screen.getByLabelText('Site')).toHaveAttribute('type', 'url');
  });

  it('disables', () => {
    render(<TextField label="Label" value="x" disabled />);
    expect(screen.getByLabelText('Label')).toBeDisabled();
  });
});

describe('TextAreaField', () => {
  it('renders a textarea with the given rows', () => {
    render(<TextAreaField label="Notes" value="Body" rows={7} />);

    const area = screen.getByLabelText('Notes');
    expect(area.tagName).toBe('TEXTAREA');
    expect(area).toHaveAttribute('rows', '7');
    expect(area).toHaveValue('Body');
  });

  it('reports edits', async () => {
    const onChange = vi.fn();
    render(<TextAreaField label="Notes" value="" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Notes'), 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('empties when mixed', () => {
    render(<TextAreaField label="Notes" value="One" mixed />);
    expect(screen.getByLabelText('Notes')).toHaveValue('');
  });
});

describe('SelectField', () => {
  it('renders the options and reports a choice', async () => {
    const onChange = vi.fn();
    render(<SelectField label="Kind" value="idea" options={OPTIONS} onChange={onChange} />);

    expect(screen.getByLabelText('Kind')).toHaveValue('idea');
    await userEvent.selectOptions(screen.getByLabelText('Kind'), 'question');
    expect(onChange).toHaveBeenCalledWith('question');
  });

  it('offers a placeholder entry when asked', () => {
    render(
      <SelectField label="Kind" value={undefined} options={OPTIONS} placeholder="Choose…" />,
    );

    const empty = screen.getByRole('option', { name: 'Choose…' });
    expect(empty).toBeInTheDocument();
    // Selectable, since clearing back to nothing is a legitimate choice.
    expect(empty).not.toBeDisabled();
  });

  it('adds an unselectable blank when there is no value and no placeholder', () => {
    render(<SelectField label="Kind" value={undefined} options={OPTIONS} />);

    // Without this the browser would silently show the first option as chosen.
    expect(screen.getByRole('option', { name: '—' })).toBeDisabled();
  });

  it('shows Mixed values as the selected entry when mixed', () => {
    render(<SelectField label="Kind" value="idea" mixed options={OPTIONS} />);

    expect(screen.getByLabelText('Kind')).toHaveValue('');
    expect(screen.getByRole('option', { name: 'Mixed values' })).toBeInTheDocument();
  });

  it('renders a disabled option', () => {
    render(
      <SelectField
        label="Kind"
        value="idea"
        options={[...OPTIONS, { value: 'gone', label: 'Retired', disabled: true }]}
      />,
    );
    expect(screen.getByRole('option', { name: 'Retired' })).toBeDisabled();
  });
});

describe('CheckboxField', () => {
  it('reflects and toggles the value', async () => {
    const onChange = vi.fn();
    render(<CheckboxField label="Done" value={false} onChange={onChange} />);

    const box = screen.getByLabelText('Done');
    expect(box).not.toBeChecked();

    await userEvent.click(box);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('renders indeterminate when mixed', () => {
    render(<CheckboxField label="Done" value mixed />);
    const box = screen.getByLabelText('Done') as HTMLInputElement;

    expect(box.indeterminate).toBe(true);
    expect(box.checked).toBe(false);
  });

  it('resolves a mixed box to checked on click', async () => {
    const onChange = vi.fn();
    render(<CheckboxField label="Done" value mixed onChange={onChange} />);

    await userEvent.click(screen.getByLabelText('Done'));
    // Clicking an ambiguous box should decide it, and true is the useful decision.
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('puts the label beside the box, not above it', () => {
    render(<CheckboxField label="Done" value={false} />);
    const label = screen.getByText('Done');
    expect(label.parentElement).toHaveClass('items-center');
  });
});

describe('NumberField', () => {
  it('renders and reports a number, not a string', async () => {
    const onChange = vi.fn();
    render(<NumberField label="Size" value={12} onChange={onChange} />);

    expect(screen.getByLabelText('Size')).toHaveValue(12);
    await userEvent.type(screen.getByLabelText('Size'), '3');
    expect(onChange).toHaveBeenCalledWith(123);
  });

  it('reports nothing for an emptied field rather than coercing to zero', async () => {
    const onChange = vi.fn();
    render(<NumberField label="Size" value={12} onChange={onChange} />);

    await userEvent.clear(screen.getByLabelText('Size'));
    // Zero is a real value someone might mean; an empty box does not mean it.
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders undefined as empty', () => {
    render(<NumberField label="Size" value={undefined} />);
    expect(screen.getByLabelText('Size')).toHaveValue(null);
  });

  it('passes min, max and step through', () => {
    render(<NumberField label="Size" value={1} min={0} max={10} step={0.5} />);

    const input = screen.getByLabelText('Size');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '10');
    expect(input).toHaveAttribute('step', '0.5');
  });

  it('shows a unit', () => {
    render(<NumberField label="Width" value={4} unit="px" />);
    expect(screen.getByText('px')).toBeInTheDocument();
  });

  it('empties when mixed', () => {
    render(<NumberField label="Size" value={5} mixed />);
    expect(screen.getByLabelText('Size')).toHaveValue(null);
  });
});

describe('ColorField', () => {
  it('renders a swatch and a hex box that stay in step', async () => {
    const Harness = () => {
      const [colour, setColour] = useState('#ff0000');
      return <ColorField label="Colour" value={colour} onChange={setColour} />;
    };
    render(<Harness />);

    expect(screen.getByLabelText('Colour')).toHaveValue('#ff0000');
    expect(screen.getByLabelText('Colour value')).toHaveValue('#ff0000');

    await userEvent.clear(screen.getByLabelText('Colour value'));
    await userEvent.type(screen.getByLabelText('Colour value'), '#00ff00');

    // Editing either control moves both.
    expect(screen.getByLabelText('Colour value')).toHaveValue('#00ff00');
    expect(screen.getByLabelText('Colour')).toHaveValue('#00ff00');
  });

  it('can hide the hex box', () => {
    render(<ColorField label="Colour" value="#ff0000" showValue={false} />);
    expect(screen.queryByLabelText('Colour value')).not.toBeInTheDocument();
  });

  it('falls back to a neutral swatch when mixed', () => {
    render(<ColorField label="Colour" value="#ff0000" mixed />);

    // A native colour input has no empty state, so the Mixed marker carries it.
    expect(screen.getByLabelText('Colour')).toHaveValue('#888888');
    expect(screen.getByLabelText('Colour value')).toHaveValue('');
    expect(screen.getByText('Mixed')).toBeInTheDocument();
  });
});

describe('DateField', () => {
  it('renders an ISO string and reports one back', async () => {
    const onChange = vi.fn();
    render(<DateField label="Due" value="2026-03-01" onChange={onChange} />);

    const input = screen.getByLabelText('Due') as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'date');
    expect(input.value).toBe('2026-03-01');

    // A date picker commits a whole date at once, which is a change event.
    fireEvent.change(input, { target: { value: '2026-04-02' } });

    // A string, not a Date, so it round-trips through JSON unchanged.
    expect(onChange).toHaveBeenLastCalledWith('2026-04-02');
    const [last] = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(typeof last).toBe('string');
  });

  it('switches to datetime-local with withTime', () => {
    render(<DateField label="Due" value="" withTime />);
    expect(screen.getByLabelText('Due')).toHaveAttribute('type', 'datetime-local');
  });

  it('empties when mixed', () => {
    render(<DateField label="Due" value="2026-03-01" mixed />);
    expect(screen.getByLabelText('Due')).toHaveValue('');
  });
});

describe('TagField', () => {
  /** Tags need real state — the draft clears only once the value comes back. */
  const Harness = ({ initial = [] as string[] }) => {
    const [tags, setTags] = useState(initial);
    return <TagField label="Tags" value={tags} onChange={setTags} />;
  };

  it('renders existing tags', () => {
    render(<Harness initial={['alpha', 'beta']} />);
    expect(screen.getByText('alpha')).toBeInTheDocument();
    expect(screen.getByText('beta')).toBeInTheDocument();
  });

  it('adds a tag on Enter and clears the draft', async () => {
    render(<Harness />);

    await userEvent.type(screen.getByLabelText('Tags'), 'alpha{Enter}');
    expect(screen.getByText('alpha')).toBeInTheDocument();
    expect(screen.getByLabelText('Tags')).toHaveValue('');
  });

  it('adds a tag with the button', async () => {
    render(<Harness />);

    await userEvent.type(screen.getByLabelText('Tags'), 'alpha');
    await userEvent.click(screen.getByLabelText('Add Tags'));
    expect(screen.getByText('alpha')).toBeInTheDocument();
  });

  it('ignores blanks and whitespace', async () => {
    const onChange = vi.fn();
    render(<TagField label="Tags" value={[]} onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Tags'), '   {Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('trims what it does commit', async () => {
    const onChange = vi.fn();
    render(<TagField label="Tags" value={[]} onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Tags'), '  alpha  {Enter}');
    expect(onChange).toHaveBeenCalledWith(['alpha']);
  });

  it('rejects a duplicate silently, and clears the draft', async () => {
    const onChange = vi.fn();
    render(<TagField label="Tags" value={['alpha']} onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Tags'), 'alpha{Enter}');
    // Re-adding an existing tag is not a mistake worth interrupting for.
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Tags')).toHaveValue('');
  });

  it('removes a tag', async () => {
    render(<Harness initial={['alpha', 'beta']} />);

    await userEvent.click(screen.getByLabelText('Remove alpha'));
    expect(screen.queryByText('alpha')).not.toBeInTheDocument();
    expect(screen.getByText('beta')).toBeInTheDocument();
  });

  it('disables the add button until there is something to add', async () => {
    render(<Harness />);

    expect(screen.getByLabelText('Add Tags')).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Tags'), 'a');
    expect(screen.getByLabelText('Add Tags')).toBeEnabled();
  });

  it('hides remove buttons when disabled', () => {
    render(<TagField label="Tags" value={['alpha']} disabled />);
    expect(screen.queryByLabelText('Remove alpha')).not.toBeInTheDocument();
  });

  it('shows no tags when mixed', () => {
    render(<TagField label="Tags" value={['alpha']} mixed />);

    // Listing one subject's tags would read as the whole selection's.
    expect(screen.queryByText('alpha')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Tags')).toHaveAttribute('placeholder', 'Mixed values');
  });

  it('offers suggestions through a datalist', () => {
    const { container } = render(
      <TagField label="Tags" value={[]} suggestions={['alpha', 'beta']} />,
    );

    const list = screen.getByLabelText('Tags').getAttribute('list');
    expect(list).toBeTruthy();
    expect(container.querySelector(`datalist#${list}`)?.children).toHaveLength(2);
  });
});

describe('StaticField', () => {
  it('renders the value as text, with no control', () => {
    render(<StaticField label="Identifier" value="node-1" />);

    expect(screen.getByText('node-1')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders an em dash for nothing', () => {
    render(<StaticField label="Identifier" value={undefined} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('says Mixed values when subjects disagree', () => {
    render(<StaticField label="Identifier" value="node-1" mixed />);
    expect(screen.getByText('Mixed values')).toBeInTheDocument();
  });

  it('accepts a node, not just a string', () => {
    render(<StaticField label="Status" value={<em>Derived</em>} />);
    expect(screen.getByText('Derived').tagName).toBe('EM');
  });
});
