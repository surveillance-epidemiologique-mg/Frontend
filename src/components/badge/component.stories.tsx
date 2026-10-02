import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Badge } from './component';

const meta = {
  title: 'Components/badge',
  component: Badge,
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Confirmé', variant: 'confirmed', dot: true } };

export const Statuts: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="suspect">Suspect</Badge>
      <Badge variant="probable">Probable</Badge>
      <Badge variant="confirmed">Confirmé</Badge>
      <Badge variant="recovered">Rétabli</Badge>
      <Badge variant="deceased">Décédé</Badge>
    </div>
  ),
};
