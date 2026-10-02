import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from './component';

const meta = {
  title: 'Components/button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Enregistrer', variant: 'primary' } };

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button>Primaire</Button>
      <Button variant="secondary">Secondaire</Button>
      <Button variant="outline">Contour</Button>
      <Button variant="danger">Supprimer</Button>
      <Button variant="ghost">Discret</Button>
    </div>
  ),
};
